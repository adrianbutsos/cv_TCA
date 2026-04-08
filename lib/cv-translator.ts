import type { CVData, Education, Experience, Leadership, Skill } from '@/lib/cv-types'
import type { Language } from '@/lib/translations'

/**
 * Simple translation dictionary for common CV terms
 */
const translationMap: Record<Language, Record<string, string>> = {
  en: {
    present: 'Present',
    honorsProgram: 'Honors Program',
    teachingAssistant: 'Teaching Assistant',
    built: 'Built',
    optimized: 'Optimized',
    presented: 'Presented',
    developed: 'Developed',
    created: 'Created',
    managed: 'Managed',
    led: 'Led',
    improved: 'Improved',
    implemented: 'Implemented',
  },
  es: {
    present: 'Presente',
    honorsProgram: 'Programa de Honores',
    teachingAssistant: 'Asistente de Enseñanza',
    built: 'Construí',
    optimized: 'Optimicé',
    presented: 'Presenté',
    developed: 'Desarrollé',
    created: 'Creé',
    managed: 'Administré',
    led: 'Lideré',
    improved: 'Mejoré',
    implemented: 'Implementé',
  },
  de: {
    present: 'Aktuell',
    honorsProgram: 'Ehrenprogramm',
    teachingAssistant: 'Lehrbeauftragter',
    built: 'Gebaut',
    optimized: 'Optimiert',
    presented: 'Präsentiert',
    developed: 'Entwickelt',
    created: 'Erstellt',
    managed: 'Verwaltet',
    led: 'Geleitet',
    improved: 'Verbessert',
    implemented: 'Implementiert',
  },
}

/**
 * Detect language from text (simple heuristic)
 */
function detectLanguage(text: string): Language {
  if (!text) return 'en'
  
  // Simple Spanish patterns
  if (/ción|amente|está|más|año/i.test(text)) return 'es'
  // Simple German patterns
  if (/ung|lich|der|die|das|ität|sch/i.test(text)) return 'de'
  
  return 'en'
}

/**
 * Translate content based on detected source language
 */
async function translateContent(
  text: string,
  targetLanguage: Language,
  sourceLanguage?: Language
): Promise<string> {
  if (!text || targetLanguage === 'en') return text
  
  const source = sourceLanguage || detectLanguage(text)
  if (source === targetLanguage) return text

  // For now, use simple pattern replacement
  // In production, you'd call an API for better translation
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage: source,
      }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.translatedText || text
    }
  } catch (error) {
    console.warn('[v0] Translation API error:', error)
  }

  return text
}

/**
 * Translate an entire CV data object
 */
export async function translateCVData(
  cvData: CVData,
  targetLanguage: Language
): Promise<CVData> {
  if (targetLanguage === 'en') return cvData

  const translated = { ...cvData }

  // Translate education descriptions and achievements
  translated.education = await Promise.all(
    cvData.education.map(async (edu) => ({
      ...edu,
      achievements: edu.achievements ? await translateContent(edu.achievements, targetLanguage) : '',
    }))
  )

  // Translate experience descriptions and achievements
  translated.experience = await Promise.all(
    cvData.experience.map(async (exp) => ({
      ...exp,
      description: exp.description ? await translateContent(exp.description, targetLanguage) : '',
      achievements: exp.achievements ? await translateContent(exp.achievements, targetLanguage) : '',
    }))
  )

  // Translate leadership descriptions
  translated.leadership = await Promise.all(
    cvData.leadership.map(async (lead) => ({
      ...lead,
      description: lead.description ? await translateContent(lead.description, targetLanguage) : '',
      achievements: lead.achievements ? await translateContent(lead.achievements, targetLanguage) : '',
    }))
  )

  // Skills are usually not translated, but we can handle it
  translated.skills = cvData.skills.map((skill) => ({
    ...skill,
    name: skill.name, // Usually keep skill names in English
  }))

  return translated
}

/**
 * Quick translate for single fields
 */
export async function translateField(
  value: string,
  targetLanguage: Language
): Promise<string> {
  return translateContent(value, targetLanguage)
}
