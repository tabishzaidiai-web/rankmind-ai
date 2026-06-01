/**
 * RankMind AI — PDF Report Generation API Route
 * POST /api/reports/generate
 *
 * Flow:
 *  1. Verify Supabase auth + subscription tier
 *  2. Validate request body
 *  3. Spawn Python ReportLab generator via child_process
 *  4. Stream PDF back as download
 *  5. (Best-effort) Save metadata to Supabase reports table
 *  6. (Best-effort) Upload PDF to Supabase Storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { readFile, mkdir, unlink } from 'fs/promises';
import { createClient } from '@/lib/supabase/server';
import type { ReportRequest } from '@/types/report';

export const maxDuration = 55; // stay under Vercel's 60s limit

export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth check ────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Subscription tier check ───────────────────────────────────────────
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier, subscription_status, current_period_end, full_name')
      .eq('id', user.id)
      .single();

    const isActive = userData?.subscription_status === 'active' ||
      (userData?.current_period_end && new Date(userData.current_period_end) > new Date());
    const tier = (isActive ? (userData?.subscription_tier || 'starter') : 'free') as string;

    if (tier === 'free') {
      return NextResponse.json({
        success: false,
        error: 'PDF reports are available on paid plans. Upgrade to Starter ($5/mo) to download reports.',
        upgradeRequired: true,
      }, { status: 403 });
    }

    // ── 3. Parse + validate request body ────────────────────────────────────
    const body: ReportRequest = await request.json();

    if (!body.auditData || !body.websiteUrl) {
      return NextResponse.json({ success: false, error: 'Missing auditData or websiteUrl' }, { status: 400 });
    }

    console.log('[ReportGen] Generating PDF for:', body.websiteUrl, '| tier:', tier, '| user:', user.id);

    // ── 4. Prepare temp paths ────────────────────────────────────────────────
    const tmpDir = '/tmp/rankmind-reports';
    await mkdir(tmpDir, { recursive: true });
    const reportId = `${user.id.slice(0, 8)}-${Date.now()}`;
    const outputPath = `${tmpDir}/${reportId}.pdf`;

    // ── 5. Build input JSON for Python ───────────────────────────────────────
    const inputData = {
      ...body.auditData,
      report_id: reportId,
      user_name: userData?.full_name || user.email?.split('@')[0] || 'User',
      user_email: user.email,
      tier,
      generated_at: new Date().toISOString(),
    };

    // ── 6. Spawn Python ReportLab generator ──────────────────────────────────
    const pythonResult = await callPythonGenerator(JSON.stringify(inputData), outputPath);

    if (!pythonResult.success) {
      console.error('[ReportGen] Python error:', pythonResult.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to generate PDF. Please try again.',
      }, { status: 500 });
    }

    // ── 7. Read PDF from disk ─────────────────────────────────────────────────
    const pdfBuffer = await readFile(outputPath);

    // ── 8. Best-effort: save metadata to Supabase reports table ──────────────
    try {
      await supabase.from('reports').insert({
        user_id: user.id,
        website_url: body.websiteUrl,
        report_type: body.reportType || 'seo-audit',
        overall_score: body.auditData.overall_score,
        grade: body.auditData.grade,
        storage_path: null, // updated below if upload succeeds
      });
    } catch (dbErr) {
      console.warn('[ReportGen] DB insert failed (non-critical):', dbErr);
    }

    // ── 9. Best-effort: upload to Supabase Storage ────────────────────────────
    try {
      const storagePath = `${user.id}/${reportId}.pdf`;
      await supabase.storage
        .from('reports')
        .upload(storagePath, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false,
        });
    } catch (storageErr) {
      console.warn('[ReportGen] Storage upload failed (non-critical):', storageErr);
    }

    // ── 10. Clean up temp file ────────────────────────────────────────────────
    try { await unlink(outputPath); } catch { /* ignore */ }

    // ── 11. Stream PDF to browser ─────────────────────────────────────────────
    const safeFilename = body.websiteUrl
      .replace(/^https?:\/\//, '')
      .replace(/[^a-zA-Z0-9.-]/g, '-')
      .slice(0, 60);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `RankMind-SEO-Report-${safeFilename}-${dateStr}.pdf`;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-Report-Id': reportId,
      },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('[ReportGen] Unhandled error:', msg);
    return NextResponse.json({ success: false, error: msg || 'Failed to generate report' }, { status: 500 });
  }
}

/**
 * Spawn the Python ReportLab generator.
 * Input JSON is sent via stdin; output PDF is written to outputPath.
 */
async function callPythonGenerator(
  inputJson: string,
  outputPath: string
): Promise<{ success: boolean; error?: string }> {
  return new Promise((resolve) => {
    const pythonPath = process.env.PYTHON_PATH || 'python3';
    const scriptPath = join(process.cwd(), 'lib', 'report-generator.py');

    const python = spawn(pythonPath, [scriptPath, outputPath], {
      timeout: 45000, // 45s hard limit
    });

    let stderr = '';
    python.stderr.on('data', (data) => { stderr += data.toString(); });

    python.stdin.write(inputJson);
    python.stdin.end();

    python.on('close', (code) => {
      if (code === 0) {
        resolve({ success: true });
      } else {
        resolve({ success: false, error: stderr || `Python exited with code ${code}` });
      }
    });

    python.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}
