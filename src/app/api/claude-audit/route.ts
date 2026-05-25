import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runClaudeDeepAudit } from '@/lib/claude-agents/auditor'

export const maxDuration = 60
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    // ── Auth check ────────────────────────────────────────────────────────────
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Plan gating — Growth and Enterprise only (plus admin) ─────────────────
    const { data: userData } = await supabase
      .from('users')
      .select('plan_name, subscription_status')
      .eq('id', user.id)
      .single()

    const plan = userData?.plan_name || 'starter'
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
    const hasAccess = ['growth', 'enterprise'].includes(plan.toLowerCase()) ||
                      adminEmails.includes(user.email || '')

    if (!hasAccess) {
      return NextResponse.json({
        error: 'upgrade_required',
        message: 'Deep Audit requires Growth or Enterprise plan',
        upgradeUrl: '/#pricing'
      }, { status: 403 })
    }

    // ── Validate URL ──────────────────────────────────────────────────────────
    const body = await request.json()
    const { url } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Valid URL is required' }, { status: 400 })
    }

    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`

    console.log('[ClaudeAudit] Starting deep audit for:', normalizedUrl)

    // ── Run the Claude deep audit ─────────────────────────────────────────────
    const auditResult = await runClaudeDeepAudit(normalizedUrl)

    // ── Save result to Supabase ───────────────────────────────────────────────
    const { error: saveError } = await supabase
      .from('seo_audits')
      .insert({
        user_id: user.id,
        url: normalizedUrl,
        score: auditResult.overall_score,
        grade: auditResult.grade,
        action_plan: {
          summary: auditResult.summary,
          quick_wins: auditResult.quick_wins,
          wins: auditResult.wins,
          scores: auditResult.scores,
          audit_type: 'claude_deep'
        },
        technical_issues: auditResult.issues
      })

    if (saveError) {
      console.error('[ClaudeAudit] Save error:', saveError.message)
    }

    // ── Log timeline event ────────────────────────────────────────────────────
    await supabase.from('timeline_events').insert({
      user_id: user.id,
      agent: 'ClaudeAuditor',
      action: 'Deep Site Audit Complete',
      outcome: `Score: ${auditResult.overall_score}/100 — ${auditResult.issues.length} issues found`
    })

    console.log('[ClaudeAudit] Complete. Score:', auditResult.overall_score)

    return NextResponse.json({
      success: true,
      ...auditResult
    })

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[ClaudeAudit] Fatal error:', msg)
    return NextResponse.json(
      { error: 'Audit failed', detail: msg },
      { status: 500 }
    )
  }
}
