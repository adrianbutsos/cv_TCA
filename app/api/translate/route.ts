import { NextRequest, NextResponse } from 'next/server'
import type { Language } from '@/lib/translations'

/**
 * Simple translation API route
 * Uses pattern matching and predefined translations
 */

const languageNames: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  de: 'German',
}

// Simple translation patterns for common CV terms
const translationPatterns: Record<Language, Record<string, string>> = {
  en: {},
  es: {
    // Common English → Spanish translations for CV
    'built': 'construí',
    'optimized': 'optimicé',
    'improved': 'mejoré',
    'implemented': 'implementé',
    'developed': 'desarrollé',
    'created': 'creé',
    'managed': 'administré',
    'led': 'lideré',
    'presented': 'presenté',
    'designed': 'diseñé',
    'testing framework': 'marco de pruebas',
    'code coverage': 'cobertura de código',
    'page load times': 'tiempos de carga de página',
    'database queries': 'consultas de base de datos',
    'faster': 'más rápido',
    'from': 'de',
    'to': 'a',
    'resulting in': 'resultando en',
    'that': 'que',
  },
  de: {
    // Common English → German translations for CV
    'built': 'gebaut',
    'optimized': 'optimiert',
    'improved': 'verbessert',
    'implemented': 'implementiert',
    'developed': 'entwickelt',
    'created': 'erstellt',
    'managed': 'verwaltet',
    'led': 'geleitet',
    'presented': 'präsentiert',
    'designed': 'entworfen',
    'testing framework': 'Test-Framework',
    'code coverage': 'Code-Abdeckung',
    'page load times': 'Seitenladezeiten',
    'database queries': 'Datenbankabfragen',
    'faster': 'schneller',
    'from': 'von',
    'to': 'zu',
    'resulting in': 'was zu führt',
    'that': 'das',
  },
}

function simpleTranslate(text: string, targetLanguage: Language): string {
  if (targetLanguage === 'en') return text
  if (!text) return text

  let result = text
  const patterns = translationPatterns[targetLanguage]

  // Replace patterns case-insensitively
  for (const [source, target] of Object.entries(patterns)) {
    const regex = new RegExp(`\\b${source}\\b`, 'gi')
    result = result.replace(regex, target)
  }

  return result
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

    // Use simple pattern-based translation
    const translatedText = simpleTranslate(text, targetLanguage)

    return NextResponse.json({
      translatedText,
      originalText: text,
      targetLanguage,
    })
  } catch (error) {
    console.error('[v0] Translation API error:', error)
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    )
  }
}
