import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { agentWrite, agentReason, fetchPageContent, sendEmail } from '@/lib/agents/core';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { url, topic, keyword, contentType = 'blog_post', wordCount = 1000 } = body;

    if (!url && !topic) {
      return NextResponse.json({ error: 'URL or topic is required' }, { status: 400 });
    }

    // Step 1: Gather context from the website if URL is provided
    let siteContext = '';
    let siteName = '';
    if (url) {
      let targetUrl = url;
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      try {
        const pageData = await fetchPageContent(targetUrl);
        siteContext = `Website: ${targetUrl}\nTitle: ${pageData.title}\nMeta: ${pageData.metaDescription}\nH1: ${pageData.h1}\nContent: ${pageData.bodyText.slice(0, 1000)}`;
        siteName = pageData.title || new URL(targetUrl).hostname;
      } catch {
        siteContext = `Website: ${url}`;
        siteName = url;
      }
    }

    // Step 2: Generate content outline + metadata
    const outline = await agentReason<{
      title: string;
      meta_description: string;
      target_keyword: string;
      sections: string[];
      word_count: number;
      content_type: string;
    }>(
      'You are an expert SEO content strategist. Create a detailed content outline. Return ONLY valid JSON.',
      `${siteContext}
Topic: ${topic || keyword || 'general SEO'}
Keyword: ${keyword || topic || 'SEO'}
Content Type: ${contentType}
Target Word Count: ${wordCount}

Return JSON:
{
  "title": "compelling SEO-optimized title (60-70 chars)",
  "meta_description": "meta description 150-160 chars with keyword",
  "target_keyword": "primary keyword",
  "sections": ["H2 section 1", "H2 section 2", "H2 section 3", "H2 section 4", "H2 section 5"],
  "word_count": ${wordCount},
  "content_type": "${contentType}"
}`
    );

    // Step 3: Write the full article
    const content = await agentWrite(
      `You are an expert SEO and GEO content writer. Write a high-quality article that:
1. Answers questions directly and clearly (AI search engines prefer direct answers)
2. Uses structured H2/H3 headings throughout
3. Includes specific statistics, facts, and examples
4. Has a clear FAQ section at the end (5 Q&As for AI search visibility)
5. Is optimized for the target keyword naturally (not stuffed)
6. Demonstrates E-E-A-T (Experience, Expertise, Authoritativeness, Trust)
7. Ends with a clear conclusion and call-to-action
8. Is formatted in clean Markdown`,
      `Title: ${outline.title}
Target Keyword: ${outline.target_keyword}
Sections: ${outline.sections.join(', ')}
Target Word Count: ${outline.word_count}
${siteContext ? `\nSite Context:\n${siteContext}` : ''}

Write the complete article now in Markdown format.`,
      Math.min(wordCount * 2, 3000)
    );

    // Step 4: Generate JSON-LD schema markup
    const schemaType = contentType === 'how_to' ? 'HowTo' : contentType === 'faq' ? 'FAQPage' : 'Article';
    const schema = {
      '@context': 'https://schema.org',
      '@type': schemaType,
      headline: outline.title,
      description: outline.meta_description,
      keywords: outline.target_keyword,
      author: { '@type': 'Organization', name: siteName || 'RankMind AI' },
      datePublished: new Date().toISOString(),
    };

    const result = {
      title: outline.title,
      meta_description: outline.meta_description,
      target_keyword: outline.target_keyword,
      content_type: contentType,
      word_count: content.split(/\s+/).length,
      content,
      schema_markup: JSON.stringify(schema, null, 2),
      generated_at: new Date().toISOString(),
      site_url: url || '',
    };

    // Step 5: Email the content to the user
    if (user.email) {
      await sendEmail({
        to: user.email,
        subject: `Content Ready: "${outline.title}" — ${result.word_count} words`,
        html: generateContentEmailHTML(result),
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Content agent error:', error);
    return NextResponse.json(
      { error: 'Failed to generate content. Please try again.' },
      { status: 500 }
    );
  }
}

function generateContentEmailHTML(result: {
  title: string;
  meta_description: string;
  target_keyword: string;
  word_count: number;
  content: string;
  schema_markup: string;
  site_url: string;
}): string {
  // Convert basic markdown to HTML for email
  const htmlContent = result.content
    .replace(/^## (.+)$/gm, '<h2 style="color:#d97706">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#f59e0b">$1</h3>')
    .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>');

  return `<!DOCTYPE html><html><head><style>
body{font-family:Arial,sans-serif;max-width:700px;margin:0 auto;background:#0f0f0f;color:#e0e0e0}
.header{background:linear-gradient(135deg,#d97706,#f59e0b);padding:30px;text-align:center;border-radius:8px 8px 0 0}
.meta{background:#1a1a1a;padding:16px;margin:10px 0;border-radius:8px;border:1px solid #333;font-size:13px}
.content{background:#1a1a1a;padding:24px;margin:10px 0;border-radius:8px;border:1px solid #333;line-height:1.7}
.schema{background:#0d0d0d;padding:16px;margin:10px 0;border-radius:8px;border:1px solid #333;font-family:monospace;font-size:12px;color:#10b981;overflow-x:auto}
h2{color:#d97706}a{color:#d97706}
</style></head><body>
<div class="header">
  <h1 style="color:white;margin:0;font-size:22px">${result.title}</h1>
  <p style="color:rgba(255,255,255,0.8);margin:8px 0 0">Content Ready — ${result.word_count} words</p>
</div>
<div class="meta">
  <strong>Keyword:</strong> ${result.target_keyword}<br>
  <strong>Meta Description:</strong> ${result.meta_description}<br>
  <strong>Word Count:</strong> ${result.word_count}<br>
  ${result.site_url ? `<strong>Site:</strong> ${result.site_url}` : ''}
</div>
<div class="content">${htmlContent}</div>
<div class="schema">
  <strong style="color:#f59e0b">JSON-LD Schema Markup:</strong><br><br>
  <pre>${result.schema_markup}</pre>
</div>
<div style="text-align:center;padding:20px;color:#666">
  <p>Powered by <strong>RankMind AI</strong></p>
  <a href="https://www.rank-mind.com/dashboard/content">View Dashboard</a>
</div>
</body></html>`;
}
