import type { Language } from './translations'

/**
 * Traductor de contenido client-side usando un servicio de traducción
 * Nota: Para producción, se debería integrar con una API de traducción real
 */

const translationCache: Record<string, Record<string, string>> = {}

/**
 * Traduce texto usando una llamada a servidor (Server Action)
 * El contenido se traduce de forma independiente del idioma de entrada
 */
export async function translateContent(
  text: string,
  targetLanguage: Language
): Promise<string> {
  if (!text || text.length === 0) return ''

  // Crear clave de cache
  const cacheKey = `${text}:${targetLanguage}`
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey][targetLanguage] || text
  }

  try {
    // Hacer llamada a API de traducción en servidor
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLanguage,
      }),
    })

    if (!response.ok) {
      console.warn('[v0] Translation API error:', response.status)
      return text
    }

    const data = await response.json()
    const translatedText = data.translatedText || text

    // Guardar en cache
    if (!translationCache[cacheKey]) {
      translationCache[cacheKey] = {}
    }
    translationCache[cacheKey][targetLanguage] = translatedText

    return translatedText
  } catch (error) {
    console.warn('[v0] Content translation failed:', error)
    return text
  }
}

/**
 * Detecta el idioma probable del texto
 */
export function detectLanguage(text: string): 'en' | 'es' | 'de' {
  const spanishWords = ['el', 'la', 'de', 'que', 'y', 'los', 'es', 'en']
  const germanWords = ['der', 'die', 'und', 'in', 'den', 'von', 'das', 'zu']
  const lowerText = text.toLowerCase()

  let spanishScore = 0
  let germanScore = 0

  spanishWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    spanishScore += (lowerText.match(regex) || []).length
  })

  germanWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'g')
    germanScore += (lowerText.match(regex) || []).length
  })

  if (spanishScore > germanScore && spanishScore > 0) return 'es'
  if (germanScore > 0) return 'de'
  return 'en'
}
