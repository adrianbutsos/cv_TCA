import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/translations'

/**
 * API route para traducir contenido usando el Vercel AI Gateway
 * Soporta traducción automática de cualquier idioma a EN, ES o DE
 */

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Missing text or targetLanguage' },
        { status: 400 }
      )
    }

    if (!['en', 'es', 'de'].includes(targetLanguage)) {
      return NextResponse.json(
        { error: 'Invalid target language' },
        { status: 400 }
      )
    }

    // Usar Vercel AI Gateway para traducción
    // Por ahora, retornamos el texto sin cambios (para demostración)
    // En producción, se integraría con un servicio de traducción real
    
    const prompt = `Translate the following text to ${languageNames[targetLanguage]}. 
Only return the translated text, nothing else. Do not include explanations or quotes.

Text: "${text}"`

    try {
      // Intentar usar Vercel AI Gateway si está configurado
      const response = await fetch('https://api.vercel.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.AI_GATEWAY_API_KEY || ''}`,
        },
        body: JSON.stringify({
          model: 'openai/gpt-4-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator. Translate text accurately while maintaining formatting and style.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      })

      if (!response.ok) {
        console.log('[v0] AI Gateway not available, returning original text')
        // Si no hay IA disponible, retornar el texto original
        return NextResponse.json({
          translatedText: text,
          translatedWithAI: false,
        })
      }

      const data = await response.json()
      const translatedText =
        data.choices?.[0]?.message?.content || text

      return NextResponse.json({
        translatedText: translatedText.trim(),
        translatedWithAI: true,
      })
    } catch (error) {
      console.warn('[v0] Translation failed:', error)
      // Fallback: retornar texto original si IA no está disponible
      return NextResponse.json({
        translatedText: text,
        translatedWithAI: false,
      })
    }
  } catch (error) {
    console.error('[v0] API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
