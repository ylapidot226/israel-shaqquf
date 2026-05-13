import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { question, sessionId } = await request.json()
    if (!question?.trim()) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    // Embed the question
    const embRes = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: question,
    })
    const queryEmbedding = embRes.data[0].embedding

    // Vector search in Supabase
    const { data: matches } = await supabase.rpc('match_embeddings', {
      query_embedding: queryEmbedding,
      match_threshold: 0.5,
      match_count: 10,
    })

    const sources = matches ?? []

    // Build context
    const contextText = sources
      .map((m: { source_table: string; source_id: string; content_text: string; similarity: number }) =>
        `[${m.source_table} #${m.source_id}] ${m.content_text}`
      )
      .join('\n\n')

    const systemPrompt = `אתה עוזר AI לפלטפורמת "ישראל שקופה" - מידע על הכנסת והממשלה הישראלית.
ענה בשפה שבה נשאלת (עברית או אנגלית).
התבסס על הנתונים הבאים מהמאגר:

${contextText || 'לא נמצאו נתונים רלוונטיים. השתמש בידע הכללי שלך על הממשל הישראלי.'}

כאשר אתה מציין מידע ספציפי, ציין את מקורו. ענה בצורה ברורה, מדויקת ומועילה.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: question,
        },
      ],
      system: systemPrompt,
    })

    const answer = message.content[0].type === 'text' ? message.content[0].text : ''

    // Save to history if user is logged in
    if (user) {
      await supabase.from('ai_chat_history').insert({
        user_id: user.id,
        session_id: sessionId,
        question,
        answer,
        sources: sources.map((s: { source_table: string; source_id: string; content_text: string; similarity: number }) => ({
          source_table: s.source_table,
          source_id: s.source_id,
          content_text: s.content_text.slice(0, 200),
          similarity: s.similarity,
        })),
      })
    }

    return NextResponse.json({
      answer,
      sources: sources.map((s: { source_table: string; source_id: string; content_text: string; similarity: number }) => ({
        source_table: s.source_table,
        source_id: s.source_id,
        content_text: s.content_text.slice(0, 300),
        similarity: s.similarity,
      })),
    })
  } catch (err) {
    console.error('AI chat error:', err)
    return NextResponse.json({ error: 'שגיאה בעיבוד השאלה' }, { status: 500 })
  }
}
