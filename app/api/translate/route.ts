import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/translations'

// MyMemory language codes
const langCodes: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
  de: 'de-DE',
}

/**
 * Translate a single text using MyMemory free API (no auth required)
 */
async function translateOne(text: string, from: string, to: string): Promise<string> {
  if (!text.trim()) return text

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`MyMemory error: ${res.status}`)

  const data = await res.json()
  if (data.responseStatus === 200 && data.responseData?.translatedText) {
    return data.responseData.translatedText
  }
  return text // fallback to original
}

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = await request.json()

    if (!texts || !targetLanguage) {
      return NextResponse.json({ error: 'Missing texts or targetLanguage' }, { status: 400 })
    }

    if (targetLanguage === 'en') {
      return NextResponse.json({ translatedTexts: texts })
    }

    const fromCode = langCodes[sourceLanguage as Language] ?? 'en-US'
    const toCode = langCodes[targetLanguage as Language]

    if (!toCode) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 })
    }

    // Translate all texts in parallel
    const translatedTexts = await Promise.all(
      (texts as string[]).map((text) => translateOne(text, fromCode, toCode))
    )

    return NextResponse.json({ translatedTexts })
  } catch (error) {
    console.error('[v0] Translation API error:', error)
    return NextResponse.json({ error: 'Translation failed' }, { status: 500 })
  }
}
