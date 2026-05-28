#!/usr/bin/env python3
"""
RankMind AI — PDF Report Generator
Reads JSON from stdin, writes a professional branded PDF to argv[1].

Sections:
  1. Cover page (score gauge, grade, URL, date)
  2. Executive Summary
  3. On-Page SEO Analysis
  4. Technical SEO
  5. Content Quality & E-E-A-T
  6. GEO / AI Search Readiness
  7. Keyword Opportunities
  8. Action Plan (prioritised)
  9. AI Search Recommendations
 10. 30-Day Roadmap + CTA footer
"""

import sys
import json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak
)
from reportlab.graphics.shapes import Drawing, Rect, Circle, String, Line
from reportlab.graphics import renderPDF
from reportlab.graphics.charts.piecharts import Pie
from reportlab.pdfgen import canvas as pdfcanvas

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# BRAND COLOURS
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VIOLET      = colors.HexColor('#7c3aed')
VIOLET_DARK = colors.HexColor('#5b21b6')
CYAN        = colors.HexColor('#06b6d4')
EMERALD     = colors.HexColor('#10b981')
AMBER       = colors.HexColor('#f59e0b')
RED         = colors.HexColor('#ef4444')
SLATE_BG    = colors.HexColor('#0f0f1a')
SLATE_CARD  = colors.HexColor('#1a1a2e')
SLATE_BORDER= colors.HexColor('#2d2d4a')
WHITE       = colors.white
MUTED       = colors.HexColor('#94a3b8')
TEXT_DARK   = colors.HexColor('#1e293b')
TEXT_MID    = colors.HexColor('#475569')
LIGHT_BG    = colors.HexColor('#f8fafc')
LIGHT_CARD  = colors.HexColor('#f1f5f9')
LIGHT_BORDER= colors.HexColor('#e2e8f0')

# Page dimensions
W, H = A4
LM, RM, TM, BM = 2*cm, 2*cm, 2.5*cm, 2*cm


def score_color(score):
    """Return a colour based on score 0-100."""
    if score >= 80: return EMERALD
    if score >= 60: return AMBER
    return RED


def grade_color(grade):
    """Return a colour based on letter grade."""
    return {
        'A': EMERALD, 'B': colors.HexColor('#22c55e'),
        'C': AMBER,   'D': colors.HexColor('#f97316'),
        'F': RED,
    }.get(grade, MUTED)


def impact_color(impact):
    return {'high': RED, 'medium': AMBER, 'low': EMERALD}.get(str(impact).lower(), MUTED)


def effort_label(effort):
    return {'quick-win': '⚡ Quick Win', 'moderate': '⏱ Moderate', 'advanced': '🔧 Advanced'}.get(
        str(effort).lower(), effort)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# STYLES
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def build_styles():
    base = getSampleStyleSheet()
    s = {}

    s['H1'] = ParagraphStyle('H1', parent=base['Heading1'],
        fontSize=22, textColor=TEXT_DARK, spaceAfter=6, spaceBefore=12,
        fontName='Helvetica-Bold')

    s['H2'] = ParagraphStyle('H2', parent=base['Heading2'],
        fontSize=14, textColor=VIOLET, spaceAfter=4, spaceBefore=10,
        fontName='Helvetica-Bold')

    s['H3'] = ParagraphStyle('H3', parent=base['Heading3'],
        fontSize=11, textColor=TEXT_DARK, spaceAfter=3, spaceBefore=6,
        fontName='Helvetica-Bold')

    s['Body'] = ParagraphStyle('Body', parent=base['Normal'],
        fontSize=9.5, textColor=TEXT_MID, spaceAfter=4, leading=14,
        fontName='Helvetica')

    s['BodySmall'] = ParagraphStyle('BodySmall', parent=base['Normal'],
        fontSize=8.5, textColor=TEXT_MID, spaceAfter=3, leading=12,
        fontName='Helvetica')

    s['Caption'] = ParagraphStyle('Caption', parent=base['Normal'],
        fontSize=8, textColor=MUTED, spaceAfter=2, alignment=TA_CENTER,
        fontName='Helvetica')

    s['CaptionLeft'] = ParagraphStyle('CaptionLeft', parent=base['Normal'],
        fontSize=8, textColor=MUTED, spaceAfter=2, alignment=TA_LEFT,
        fontName='Helvetica')

    s['Bullet'] = ParagraphStyle('Bullet', parent=base['Normal'],
        fontSize=9, textColor=TEXT_MID, spaceAfter=3, leading=13,
        leftIndent=12, firstLineIndent=-12, fontName='Helvetica')

    s['Label'] = ParagraphStyle('Label', parent=base['Normal'],
        fontSize=8, textColor=MUTED, spaceAfter=1, fontName='Helvetica-Bold',
        textTransform='uppercase')

    s['ScoreNumber'] = ParagraphStyle('ScoreNumber', parent=base['Normal'],
        fontSize=36, textColor=VIOLET, spaceAfter=0, alignment=TA_CENTER,
        fontName='Helvetica-Bold')

    s['GradeLetter'] = ParagraphStyle('GradeLetter', parent=base['Normal'],
        fontSize=48, spaceAfter=0, alignment=TA_CENTER, fontName='Helvetica-Bold')

    s['SectionHeader'] = ParagraphStyle('SectionHeader', parent=base['Normal'],
        fontSize=12, textColor=WHITE, spaceAfter=0, fontName='Helvetica-Bold',
        backColor=VIOLET, leftIndent=-8, rightIndent=-8)

    s['Recommendation'] = ParagraphStyle('Recommendation', parent=base['Normal'],
        fontSize=9, textColor=TEXT_MID, spaceAfter=2, leading=13,
        leftIndent=8, fontName='Helvetica', backColor=LIGHT_CARD,
        borderPadding=(4, 6, 4, 6))

    return s


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SCORE GAUGE (SVG-style using ReportLab Drawing)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def score_gauge(score, size=120):
    """Draw a circular score gauge."""
    d = Drawing(size, size)
    cx, cy, r = size / 2, size / 2, size * 0.42
    stroke_w = size * 0.08

    # Background ring
    bg = Circle(cx, cy, r)
    bg.fillColor = None
    bg.strokeColor = LIGHT_BORDER
    bg.strokeWidth = stroke_w
    d.add(bg)

    # Score arc (approximate with a filled circle overlay — ReportLab doesn't
    # natively support arc stroke, so we use a coloured ring segment via a
    # thick arc approximation using many small lines)
    import math
    start_angle = 225  # degrees, bottom-left
    sweep = 270        # degrees total sweep
    filled = sweep * (score / 100)
    arc_color = score_color(score)
    n_steps = max(int(filled * 2), 1)
    for i in range(n_steps):
        angle_deg = start_angle - (i / n_steps) * filled
        angle_rad = math.radians(angle_deg)
        x1 = cx + (r - stroke_w / 2) * math.cos(angle_rad)
        y1 = cy + (r - stroke_w / 2) * math.sin(angle_rad)
        x2 = cx + (r + stroke_w / 2) * math.cos(angle_rad)
        y2 = cy + (r + stroke_w / 2) * math.sin(angle_rad)
        ln = Line(x1, y1, x2, y2)
        ln.strokeColor = arc_color
        ln.strokeWidth = stroke_w / n_steps * filled * 0.8 + 1.5
        d.add(ln)

    # Score text
    score_str = String(cx, cy + 4, str(score),
        fontName='Helvetica-Bold', fontSize=size * 0.22,
        fillColor=TEXT_DARK, textAnchor='middle')
    d.add(score_str)

    label_str = String(cx, cy - size * 0.16, '/100',
        fontName='Helvetica', fontSize=size * 0.1,
        fillColor=MUTED, textAnchor='middle')
    d.add(label_str)

    return d


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SECTION HEADER BAR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def section_header(title, icon='', styles=None):
    """Return a styled section header as a Table (coloured bar)."""
    text = f'{icon}  {title}' if icon else title
    cell = Paragraph(f'<b>{text}</b>', ParagraphStyle(
        'SH', fontSize=11, textColor=WHITE, fontName='Helvetica-Bold',
        leading=16))
    tbl = Table([[cell]], colWidths=[W - LM - RM])
    tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), VIOLET),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('ROUNDEDCORNERS', [4, 4, 4, 4]),
    ]))
    return tbl


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# SCORE ROW (label | score bar | value)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def score_row(label, score, max_score=100, styles=None):
    """Return a Table row with a mini progress bar."""
    bar_w = 120
    bar_h = 8
    filled_w = max(2, int(bar_w * score / max_score))
    bar_color = score_color(int(score * 100 / max_score) if max_score != 100 else score)

    d = Drawing(bar_w, bar_h + 4)
    bg = Rect(0, 2, bar_w, bar_h, fillColor=LIGHT_BORDER, strokeColor=None)
    fg = Rect(0, 2, filled_w, bar_h, fillColor=bar_color, strokeColor=None)
    d.add(bg)
    d.add(fg)

    label_p = Paragraph(label, ParagraphStyle('RL', fontSize=9, textColor=TEXT_MID,
        fontName='Helvetica', leading=12))
    score_p = Paragraph(f'<b>{score}/{max_score}</b>', ParagraphStyle('RS', fontSize=9,
        textColor=TEXT_DARK, fontName='Helvetica-Bold', leading=12, alignment=TA_RIGHT))

    row = Table([[label_p, d, score_p]],
        colWidths=[W - LM - RM - bar_w - 60 - 10, bar_w, 60])
    row.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    return row


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CHECK ITEM
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def check_item(label, ok, styles):
    icon = '✓' if ok else '✗'
    color = '#10b981' if ok else '#ef4444'
    return Paragraph(
        f'<font color="{color}"><b>{icon}</b></font>  {label}',
        styles['Body'])


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MAIN REPORT GENERATOR
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
def generate_report(data: dict, output_path: str):
    styles = build_styles()
    story = []

    url             = data.get('url', 'Unknown URL')
    score           = int(data.get('overall_score', 0))
    grade           = data.get('grade', 'N/A')
    generated_at    = data.get('generated_at', datetime.utcnow().isoformat())
    report_id       = data.get('report_id', 'N/A')
    user_name       = data.get('user_name', 'User')
    tier            = data.get('tier', 'starter')
    on_page         = data.get('on_page', {})
    technical       = data.get('technical', {})
    content_quality = data.get('content_quality', {})
    geo_readiness   = data.get('geo_readiness', {})
    keywords        = data.get('keywords', [])
    action_plan     = data.get('action_plan', [])
    llm_recs        = data.get('llm_recommendations', [])
    ai_score        = data.get('ai_citation_readiness_score')
    eeat_score      = data.get('eeat_score')
    eeat_bd         = data.get('eeat_breakdown', {})
    topical_score   = data.get('topical_authority_score')
    topical_gaps    = data.get('topical_authority_gaps', [])

    date_str = datetime.fromisoformat(generated_at).strftime('%B %d, %Y')

    # ── COVER PAGE ─────────────────────────────────────────────────────────────
    story.append(Spacer(1, 1.5 * cm))

    # Brand header
    brand_tbl = Table([[
        Paragraph('<b>RankMind AI</b>', ParagraphStyle('Brand', fontSize=20,
            textColor=VIOLET, fontName='Helvetica-Bold')),
        Paragraph('Autonomous SEO &amp; GEO Agents', ParagraphStyle('BrandSub',
            fontSize=10, textColor=MUTED, fontName='Helvetica', alignment=TA_RIGHT))
    ]], colWidths=[(W - LM - RM) * 0.55, (W - LM - RM) * 0.45])
    brand_tbl.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(brand_tbl)
    story.append(HRFlowable(width='100%', thickness=2, color=VIOLET, spaceAfter=16, spaceBefore=8))

    # Report title
    story.append(Paragraph('SEO Audit Report', ParagraphStyle('Title', fontSize=28,
        textColor=TEXT_DARK, fontName='Helvetica-Bold', spaceAfter=4, alignment=TA_CENTER)))
    story.append(Paragraph(url, ParagraphStyle('URL', fontSize=11,
        textColor=VIOLET, fontName='Helvetica', spaceAfter=4, alignment=TA_CENTER)))
    story.append(Paragraph(f'Generated for <b>{user_name}</b> &bull; {date_str}',
        ParagraphStyle('Meta', fontSize=9, textColor=MUTED, fontName='Helvetica',
        spaceAfter=20, alignment=TA_CENTER)))

    # Score + Grade block
    gauge = score_gauge(score, size=140)
    grade_p = Paragraph(f'<b>{grade}</b>', ParagraphStyle('Grade', fontSize=52,
        textColor=grade_color(grade), fontName='Helvetica-Bold',
        alignment=TA_CENTER, spaceAfter=0))
    grade_label = Paragraph('Overall Grade', ParagraphStyle('GL', fontSize=9,
        textColor=MUTED, fontName='Helvetica', alignment=TA_CENTER))

    score_tbl = Table([[gauge, Spacer(1, 1), Table([[grade_p], [grade_label]])]],
        colWidths=[160, 20, W - LM - RM - 180])
    score_tbl.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_CARD),
        ('ROUNDEDCORNERS', [8, 8, 8, 8]),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(score_tbl)
    story.append(Spacer(1, 16))

    # Quick stats row
    on_page_score   = int((
        on_page.get('title_tag', {}).get('score', 0) +
        on_page.get('meta_description', {}).get('score', 0) +
        on_page.get('headings', {}).get('score', 0) +
        on_page.get('content_length', {}).get('score', 0)
    ) / 4)
    tech_score = int((
        technical.get('load_time_score', 0) +
        (100 if technical.get('https') else 0) +
        (80 if technical.get('robots_txt') else 30) +
        (80 if technical.get('sitemap') else 30)
    ) / 4)
    cq_score = int(content_quality.get('score', 0))
    geo_score = int(geo_readiness.get('score', 0))

    def stat_cell(label, val, color=VIOLET):
        return Table([[
            Paragraph(f'<b>{val}</b>', ParagraphStyle('SV', fontSize=20,
                textColor=color, fontName='Helvetica-Bold', alignment=TA_CENTER)),
            Paragraph(label, ParagraphStyle('SL', fontSize=8,
                textColor=MUTED, fontName='Helvetica', alignment=TA_CENTER))
        ]])

    stats_tbl = Table([[
        stat_cell('On-Page', f'{on_page_score}/100', score_color(on_page_score)),
        stat_cell('Technical', f'{tech_score}/100', score_color(tech_score)),
        stat_cell('Content', f'{cq_score}/100', score_color(cq_score)),
        stat_cell('GEO/AI', f'{geo_score}/100', score_color(geo_score)),
        stat_cell('Keywords', str(len(keywords)), CYAN),
        stat_cell('Action Items', str(len(action_plan)), AMBER),
    ]], colWidths=[(W - LM - RM) / 6] * 6)
    stats_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_CARD),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(stats_tbl)
    story.append(Spacer(1, 20))

    # ── EXECUTIVE SUMMARY ──────────────────────────────────────────────────────
    story.append(section_header('Executive Summary', '📋'))
    story.append(Spacer(1, 8))

    high_items = [a for a in action_plan if str(a.get('impact', '')).lower() == 'high']
    med_items  = [a for a in action_plan if str(a.get('impact', '')).lower() == 'medium']

    summary_text = (
        f'This report covers a full SEO audit of <b>{url}</b> conducted on {date_str}. '
        f'The site scored <b>{score}/100</b> (Grade <b>{grade}</b>), with '
        f'<b>{len(high_items)} high-priority</b> and <b>{len(med_items)} medium-priority</b> issues identified. '
        f'Resolving the high-priority items first will have the greatest impact on search visibility.'
    )
    story.append(Paragraph(summary_text, styles['Body']))
    story.append(Spacer(1, 6))

    if ai_score is not None:
        ai_summary = data.get('ai_citation_readiness_summary', '')
        story.append(Paragraph(
            f'<b>AI Citation Readiness:</b> {ai_score}/100. {ai_summary}',
            styles['Body']))
    story.append(Spacer(1, 12))

    # ── ON-PAGE SEO ────────────────────────────────────────────────────────────
    story.append(section_header('On-Page SEO Analysis', '📄'))
    story.append(Spacer(1, 8))

    op = on_page
    tt = op.get('title_tag', {})
    md = op.get('meta_description', {})
    hd = op.get('headings', {})
    cl = op.get('content_length', {})
    il = op.get('internal_links', {})
    ia = op.get('images_alt', {})

    story.append(score_row('Title Tag', tt.get('score', 0)))
    story.append(score_row('Meta Description', md.get('score', 0)))
    story.append(score_row('Headings (H1/H2)', hd.get('score', 0)))
    story.append(score_row('Content Length', cl.get('score', 0)))
    story.append(score_row('Internal Links', il.get('score', 0)))
    story.append(score_row('Image Alt Text', ia.get('score', 0)))
    story.append(Spacer(1, 8))

    # Details table
    details_data = [
        [Paragraph('<b>Element</b>', styles['Label']),
         Paragraph('<b>Current Value</b>', styles['Label']),
         Paragraph('<b>Recommendation</b>', styles['Label'])],
    ]
    if tt.get('value'):
        details_data.append([
            Paragraph('Title Tag', styles['BodySmall']),
            Paragraph(f'{tt.get("value", "")[:60]}... ({tt.get("length", 0)} chars)',
                styles['BodySmall']),
            Paragraph(tt.get('recommendation', ''), styles['BodySmall']),
        ])
    if md.get('value'):
        details_data.append([
            Paragraph('Meta Description', styles['BodySmall']),
            Paragraph(f'{md.get("value", "")[:80]}... ({md.get("length", 0)} chars)',
                styles['BodySmall']),
            Paragraph(md.get('recommendation', ''), styles['BodySmall']),
        ])
    details_data.append([
        Paragraph('Headings', styles['BodySmall']),
        Paragraph(f'H1: {hd.get("h1_count", 0)}, H2: {hd.get("h2_count", 0)}',
            styles['BodySmall']),
        Paragraph(hd.get('recommendation', ''), styles['BodySmall']),
    ])
    details_data.append([
        Paragraph('Content', styles['BodySmall']),
        Paragraph(f'{cl.get("word_count", 0):,} words', styles['BodySmall']),
        Paragraph(cl.get('recommendation', ''), styles['BodySmall']),
    ])

    col_w = (W - LM - RM)
    details_tbl = Table(details_data, colWidths=[col_w * 0.18, col_w * 0.32, col_w * 0.5])
    details_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), LIGHT_CARD),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_CARD]),
    ]))
    story.append(details_tbl)
    story.append(Spacer(1, 14))

    # ── TECHNICAL SEO ──────────────────────────────────────────────────────────
    story.append(section_header('Technical SEO', '⚙️'))
    story.append(Spacer(1, 8))

    tech = technical
    load_ms = tech.get('load_time_ms', 0)
    load_label = f'{load_ms:,}ms — {"Fast ✓" if load_ms < 2000 else "Slow ✗" if load_ms > 4000 else "Moderate"}'

    checks = [
        ('HTTPS / SSL', tech.get('https', False)),
        ('robots.txt', tech.get('robots_txt', False)),
        ('XML Sitemap', tech.get('sitemap', False)),
        ('Structured Data / Schema', tech.get('structured_data', False)),
        ('Canonical Tag', tech.get('canonical_tag', False)),
        ('Mobile Friendly', tech.get('mobile_friendly', True)),
    ]

    check_rows = [[check_item(label, ok, styles) for label, ok in checks[i:i+2]]
                  for i in range(0, len(checks), 2)]
    check_tbl = Table(check_rows, colWidths=[(W - LM - RM) / 2] * 2)
    check_tbl.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_CARD),
        ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
    ]))
    story.append(check_tbl)
    story.append(Spacer(1, 6))
    story.append(Paragraph(f'<b>Page Load Time:</b> {load_label}', styles['Body']))
    story.append(Spacer(1, 14))

    # ── CONTENT QUALITY & E-E-A-T ─────────────────────────────────────────────
    story.append(section_header('Content Quality & E-E-A-T', '✍️'))
    story.append(Spacer(1, 8))

    cq = content_quality
    story.append(score_row('Content Quality', int(cq.get('score', 0))))
    story.append(score_row('Readability', int(cq.get('readability_score', 0))))
    story.append(score_row('Fact Density', int(cq.get('fact_density', 0))))
    if eeat_score is not None:
        story.append(score_row('E-E-A-T Score', int(eeat_score)))
    story.append(Spacer(1, 6))

    if eeat_bd:
        eeat_rows = [[
            Paragraph('<b>Experience</b>', styles['Label']),
            Paragraph('<b>Expertise</b>', styles['Label']),
            Paragraph('<b>Authoritativeness</b>', styles['Label']),
            Paragraph('<b>Trustworthiness</b>', styles['Label']),
        ], [
            Paragraph(f'{eeat_bd.get("experience", 0)}/100', styles['Body']),
            Paragraph(f'{eeat_bd.get("expertise", 0)}/100', styles['Body']),
            Paragraph(f'{eeat_bd.get("authoritativeness", 0)}/100', styles['Body']),
            Paragraph(f'{eeat_bd.get("trustworthiness", 0)}/100', styles['Body']),
        ]]
        eeat_tbl = Table(eeat_rows, colWidths=[(W - LM - RM) / 4] * 4)
        eeat_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), LIGHT_CARD),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ]))
        story.append(eeat_tbl)
        story.append(Spacer(1, 6))

    eeat_signals = cq.get('eeat_signals', [])
    if eeat_signals:
        story.append(Paragraph('<b>E-E-A-T Signals Found:</b>', styles['H3']))
        for sig in eeat_signals[:6]:
            story.append(Paragraph(f'• {sig}', styles['Bullet']))
    story.append(Spacer(1, 14))

    # ── GEO / AI SEARCH READINESS ─────────────────────────────────────────────
    story.append(section_header('GEO / AI Search Readiness', '🤖'))
    story.append(Spacer(1, 8))

    geo = geo_readiness
    story.append(score_row('GEO Readiness', int(geo.get('score', 0))))
    if ai_score is not None:
        story.append(score_row('AI Citation Readiness', int(ai_score)))
    if topical_score is not None:
        story.append(score_row('Topical Authority', int(topical_score)))
    story.append(Spacer(1, 6))

    geo_checks = [
        ('AI Search Optimised', bool(geo.get('ai_search_optimized', False))),
        ('Schema Markup', bool(geo.get('schema_markup', False))),
        ('FAQ Section', bool(geo.get('faq_section', False))),
        ('Clear Direct Answers', bool(geo.get('clear_answers', False))),
    ]
    for label, ok in geo_checks:
        story.append(check_item(label, ok, styles))

    story.append(Spacer(1, 6))
    geo_recs = geo.get('recommendations', [])
    if geo_recs:
        story.append(Paragraph('<b>GEO Recommendations:</b>', styles['H3']))
        for rec in geo_recs[:5]:
            story.append(Paragraph(f'• {rec}', styles['Bullet']))

    if topical_gaps:
        story.append(Spacer(1, 6))
        story.append(Paragraph('<b>Topical Authority Gaps:</b>', styles['H3']))
        for gap in topical_gaps[:3]:
            story.append(Paragraph(f'• {gap}', styles['Bullet']))
    story.append(Spacer(1, 14))

    # ── KEYWORD OPPORTUNITIES ─────────────────────────────────────────────────
    if keywords:
        story.append(section_header('Keyword Opportunities', '🔑'))
        story.append(Spacer(1, 8))

        kw_data = [[
            Paragraph('<b>Keyword</b>', styles['Label']),
            Paragraph('<b>Type</b>', styles['Label']),
            Paragraph('<b>Est. Volume</b>', styles['Label']),
            Paragraph('<b>Difficulty</b>', styles['Label']),
            Paragraph('<b>Relevance</b>', styles['Label']),
        ]]
        for kw in keywords[:10]:
            diff = int(kw.get('difficulty', 0))
            rel  = int(kw.get('relevance', 0))
            diff_color = '#10b981' if diff < 30 else '#f59e0b' if diff < 60 else '#ef4444'
            kw_data.append([
                Paragraph(kw.get('keyword', ''), styles['BodySmall']),
                Paragraph(kw.get('type', '').capitalize(), styles['BodySmall']),
                Paragraph(f'{kw.get("estimated_volume", 0):,}/mo', styles['BodySmall']),
                Paragraph(f'<font color="{diff_color}"><b>{diff}</b></font>', styles['BodySmall']),
                Paragraph(f'{rel}%', styles['BodySmall']),
            ])

        col_w = W - LM - RM
        kw_tbl = Table(kw_data, colWidths=[col_w * 0.35, col_w * 0.13, col_w * 0.17, col_w * 0.17, col_w * 0.18])
        kw_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), LIGHT_CARD),
            ('GRID', (0, 0), (-1, -1), 0.5, LIGHT_BORDER),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('LEFTPADDING', (0, 0), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_CARD]),
        ]))
        story.append(kw_tbl)
        story.append(Spacer(1, 14))

    # ── ACTION PLAN ────────────────────────────────────────────────────────────
    if action_plan:
        story.append(section_header('Prioritised Action Plan', '🎯'))
        story.append(Spacer(1, 8))

        for i, item in enumerate(action_plan[:10]):
            impact = str(item.get('impact', 'medium')).lower()
            imp_color = impact_color(impact)
            effort = effort_label(item.get('effort', ''))
            timeline = item.get('timeline', '')
            action_title = item.get('action') or item.get('task', f'Action {i+1}')
            why = item.get('whyItMatters', '')
            rec = item.get('recommendation', '')
            example = item.get('exampleFix', '')

            header_row = Table([[
                Paragraph(f'<b>#{i+1}</b>', ParagraphStyle('AN', fontSize=9,
                    textColor=WHITE, fontName='Helvetica-Bold', alignment=TA_CENTER)),
                Paragraph(f'<b>{action_title}</b>', ParagraphStyle('AT', fontSize=10,
                    textColor=TEXT_DARK, fontName='Helvetica-Bold')),
                Paragraph(f'<font color="{imp_color.hexval()}">'
                    f'<b>{impact.upper()}</b></font>',
                    ParagraphStyle('IMP', fontSize=8, fontName='Helvetica-Bold',
                    alignment=TA_RIGHT)),
            ]], colWidths=[28, (W - LM - RM) - 28 - 60, 60])
            header_row.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, 0), imp_color),
                ('BACKGROUND', (1, 0), (-1, 0), LIGHT_CARD),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(header_row)

            body_items = []
            if why:
                body_items.append(Paragraph(f'<b>Why it matters:</b> {why}', styles['BodySmall']))
            if rec:
                body_items.append(Paragraph(f'<b>Fix:</b> {rec}', styles['BodySmall']))
            if example:
                body_items.append(Paragraph(f'<b>Example:</b> <i>{example}</i>', styles['BodySmall']))
            meta_str = f'{effort}  •  {timeline}' if timeline else effort
            body_items.append(Paragraph(meta_str, styles['CaptionLeft']))

            body_tbl = Table([[item] for item in body_items],
                colWidths=[W - LM - RM])
            body_tbl.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, -1), WHITE),
                ('LEFTPADDING', (0, 0), (-1, -1), 10),
                ('RIGHTPADDING', (0, 0), (-1, -1), 10),
                ('TOPPADDING', (0, 0), (-1, -1), 3),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
                ('LINEBELOW', (0, -1), (-1, -1), 0.5, LIGHT_BORDER),
            ]))
            story.append(body_tbl)
            story.append(Spacer(1, 4))

        story.append(Spacer(1, 10))

    # ── AI SEARCH RECOMMENDATIONS ─────────────────────────────────────────────
    if llm_recs:
        story.append(section_header('AI Search Engine Recommendations', '🧠'))
        story.append(Spacer(1, 8))
        story.append(Paragraph(
            'The following recommendations are specifically for ranking in AI-powered search engines '
            '(Google AI Mode, ChatGPT, Perplexity, Google SGE):',
            styles['Body']))
        story.append(Spacer(1, 6))
        for rec in llm_recs[:7]:
            story.append(Paragraph(f'• {rec}', styles['Bullet']))
        story.append(Spacer(1, 14))

    # ── 30-DAY ROADMAP ────────────────────────────────────────────────────────
    story.append(section_header('Your 30-Day SEO Roadmap', '🗓️'))
    story.append(Spacer(1, 8))

    roadmap = [
        ('Week 1', 'Address all HIGH priority issues from the action plan above. '
            'These have the largest immediate impact on your SEO score and search visibility.'),
        ('Week 2', 'Resolve all MEDIUM priority warnings. These improve your score incrementally '
            'and prevent future issues from compounding.'),
        ('Week 3', 'Publish 2 SEO-optimised blog posts targeting the keyword opportunities '
            'identified in this report. Use ContentAI to generate and optimise them automatically.'),
        ('Week 4', 'Build 5–10 high-authority backlinks using LinkBot, and optimise for '
            'AI search visibility (GEO) using the recommendations above.'),
        ('Ongoing', 'Use RankBot for weekly SEO monitoring, LinkBot for backlink building, '
            'and ContentAI for a steady stream of optimised content.'),
    ]

    for week, action in roadmap:
        row = Table([[
            Paragraph(f'<b>{week}</b>', ParagraphStyle('WK', fontSize=9,
                textColor=WHITE, fontName='Helvetica-Bold', alignment=TA_CENTER)),
            Paragraph(action, styles['BodySmall']),
        ]], colWidths=[60, W - LM - RM - 60])
        row.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), VIOLET),
            ('BACKGROUND', (1, 0), (1, 0), LIGHT_CARD),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LINEBELOW', (0, 0), (-1, 0), 0.5, LIGHT_BORDER),
        ]))
        story.append(row)

    story.append(Spacer(1, 20))

    # ── FOOTER / CTA ──────────────────────────────────────────────────────────
    story.append(HRFlowable(width='100%', thickness=1.5, color=VIOLET, spaceAfter=10))

    cta_tbl = Table([[
        Paragraph(
            'Generated by <b>RankMind AI</b> | www.rank-mind.com | '
            'Autonomous SEO &amp; GEO Agents',
            styles['Caption']),
        Paragraph(
            f'Report ID: {report_id} | {date_str}',
            ParagraphStyle('FooterR', fontSize=8, textColor=MUTED,
                fontName='Helvetica', alignment=TA_RIGHT)),
    ]], colWidths=[(W - LM - RM) * 0.6, (W - LM - RM) * 0.4])
    cta_tbl.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(cta_tbl)

    # ── BUILD PDF ─────────────────────────────────────────────────────────────
    def add_page_number(canvas_obj, doc_obj):
        canvas_obj.saveState()
        canvas_obj.setFont('Helvetica', 7)
        canvas_obj.setFillColor(MUTED)
        canvas_obj.drawCentredString(W / 2, 1.2 * cm,
            f'RankMind AI SEO Report  |  {url}  |  Page {doc_obj.page}')
        canvas_obj.setStrokeColor(VIOLET)
        canvas_obj.setLineWidth(1.5)
        canvas_obj.line(LM, H - 1.8 * cm, W - RM, H - 1.8 * cm)
        canvas_obj.setStrokeColor(LIGHT_BORDER)
        canvas_obj.setLineWidth(0.5)
        canvas_obj.line(LM, 1.6 * cm, W - RM, 1.6 * cm)
        canvas_obj.restoreState()

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=LM, rightMargin=RM,
        topMargin=TM, bottomMargin=BM,
        title=f'RankMind AI SEO Report - {url}',
        author='RankMind AI',
        subject=f'SEO Audit Report for {url}',
        creator='RankMind AI — www.rank-mind.com',
    )
    doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(f'[ReportGen] PDF written to {output_path}', file=sys.stderr)


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENTRY POINT
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if __name__ == '__main__':
    try:
        output_path = sys.argv[1]
    except IndexError:
        print('Usage: python3 report-generator.py <output_path>', file=sys.stderr)
        sys.exit(1)

    try:
        input_json = sys.stdin.read()
        data = json.loads(input_json)
        generate_report(data, output_path)
    except json.JSONDecodeError as e:
        print(f'Invalid JSON input: {e}', file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f'Report generation failed: {e}', file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)
