import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import type { Language } from '@/lib/translations'

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
}

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLanguage } = await request.json()

    if (!texts || !targetLanguage) {
      return NextResponse.json({ error: 'Missing texts or targetLanguage' }, { status: 400 })
    }

    if (!['en', 'es', 'de'].includes(targetLanguage)) {
      return NextResponse.json({ error: 'Invalid target language' }, { status: 400 })
    }

    if (targetLanguage === 'en') {
      return NextResponse.json({ translatedTexts: texts })
    }

    const targetLangName = languageNames[targetLanguage as Language]

    // Build a numbered list of texts to translate in one request
    const numbered = (texts as string[])
      .map((t: string, i: number) => `${i + 1}. ${t}`)
      .join('\n')

    const { text } = await generateText({
      model: 'openai/gpt-4o-mini',
      system: `You are a professional CV/resume translator. 
Translate the provided numbered list of texts into ${targetLangName}.
Rules:
- Keep the same numbering format (1. 2. 3. etc.)
- Preserve proper nouns, company names, tool names, and technical terms as-is
- Keep percentages and numbers unchanged
- Translate in a professional tone appropriate for a CV/resume
- Return ONLY the numbered translated lines, nothing else`,
      prompt: numbered,
    })

    // Parse the numbered response back into an array
    const translatedTexts = text
      .split('\n')
      .filter((line) => /^\d+\./.test(line.trim()))
      .map((line) => line.replace(/^\d+\.\s*/, '').trim())

    // Safety: if parsing fails, return originals
    if (translatedTexts.length !== texts.length) {
      console.error('[v0] Translation count mismatch, returning originals')
      return NextResponse.json({ translatedTexts: texts })
    }

    return NextResponse.json({ translatedTexts })
  } catch (error) {
    console.error('[v0] Translation API error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
