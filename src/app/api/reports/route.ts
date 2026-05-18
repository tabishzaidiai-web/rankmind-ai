import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/agents/core';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { websiteId, type = 'email' } = await req.json();

    // Gather data
    const [websiteRes, auditRes, geoRes, kwRes, kw10Res, contentRes, blRes] = await Promise.all([
      supabase.from('websites').select('domain, url, niche').eq('id', websiteId).single(),
      supabase.from('audits').select('score, grade, issues, created_at').eq('website_id', websiteId).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('geo_scores').select('visibility_score, created_at').eq('website_id', websiteId).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('website_id', websiteId),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('website_id', websiteId).lte('ranking_position', 10).not('ranking_position', 'is', null),
      supabase.from('content_queue').select('*', { count: 'exact', head: true }).eq('website_id', websiteId).eq('status', 'published'),
      supabase.from('backlink_opportunities').select('*', { count: 'exact', head: true }).eq('website_id', websiteId).eq('status', 'published'),
    ]);

    const website = websiteRes.data;
    const audit = auditRes.data;
    const geo = geoRes.data;
    const period = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const reportData = {
      domain: website?.domain || 'your website',
      period,
      seoScore: audit?.score ?? null,
      seoGrade: audit?.grade ?? null,
      geoScore: geo?.visibility_score ?? null,
      keywords: kwRes.count ?? 0,
      top10: kw10Res.count ?? 0,
      content: contentRes.count ?? 0,
      backlinks: blRes.count ?? 0,
    };

    if (type === 'email') {
      if (!user.email) return NextResponse.json({ error: 'No email on account' }, { status: 400 });

      const scoreColor = (s: number | null) => s === null ? '#888' : s >= 80 ? '#22c55e' : s >= 60 ? '#f59e0b' : '#ef4444';

      await sendEmail({
        to: user.email,
        subject: `RankMind AI — ${period} SEO Report for ${reportData.domain}`,
        html: `<!DOCTYPE html><html><head><style>
body{font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#0a0a0f;color:#e0e0e0}
.header{background:linear-gradient(135deg,#7c3aed,#06b6d4);padding:32px;text-align:center;border-radius:12px 12px 0 0}
.card{background:#111;border:1px solid #222;border-radius:12px;padding:20px;margin:12px 0}
.stat{display:inline-block;text-align:center;padding:16px 24px;background:#1a1a2e;border-radius:8px;margin:6px}
.score{font-size:32px;font-weight:bold}
.label{font-size:12px;color:#888;margin-top:4px}
</style></head><body>
<div class="header">
  <h1 style="color:white;margin:0;font-size:24px">Monthly SEO Report</h1>
  <p style="color:rgba(255,255,255,0.7);margin:8px 0 0">${reportData.period} · ${reportData.domain}</p>
</div>
<div style="padding:20px">
  <div class="card">
    <h2 style="color:#a78bfa;margin:0 0 16px">Performance Overview</h2>
    <div style="text-align:center">
      <div class="stat">
        <div class="score" style="color:${scoreColor(reportData.seoScore)}">${reportData.seoScore ?? '—'}</div>
        <div class="label">SEO Health Score</div>
      </div>
      <div class="stat">
        <div class="score" style="color:${scoreColor(reportData.geoScore)}">${reportData.geoScore ? reportData.geoScore + '%' : '—'}</div>
        <div class="label">GEO Visibility</div>
      </div>
      <div class="stat">
        <div class="score" style="color:#22c55e">${reportData.keywords}</div>
        <div class="label">Keywords Tracked</div>
      </div>
      <div class="stat">
        <div class="score" style="color:#22c55e">${reportData.top10}</div>
        <div class="label">In Top 10</div>
      </div>
    </div>
  </div>
  <div class="card">
    <h2 style="color:#a78bfa;margin:0 0 12px">Content & Links</h2>
    <p style="color:#aaa"><strong style="color:#e0e0e0">${reportData.content}</strong> articles published this month</p>
    <p style="color:#aaa"><strong style="color:#e0e0e0">${reportData.backlinks}</strong> live backlinks acquired</p>
  </div>
  <div style="text-align:center;padding:20px;color:#555">
    <p>Powered by <strong style="color:#7c3aed">RankMind AI</strong></p>
    <a href="https://www.rank-mind.com/dashboard" style="color:#7c3aed">View Full Dashboard →</a>
  </div>
</div>
</body></html>`,
      });

      return NextResponse.json({ success: true, message: 'Report emailed successfully' });
    }

    // PDF type — return JSON for now (PDF generation requires additional setup)
    return NextResponse.json(reportData, {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[Reports API]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
