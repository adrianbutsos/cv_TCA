import type { CVData } from '@/lib/cv-types'
import type { Language } from '@/lib/translations'
import { translateDate } from '@/lib/translations'

/**
 * Send all texts at once to the translation API and return the translated array.
 * If any error occurs, returns the original texts unchanged.
 */
async function batchTranslate(texts: string[], targetLanguage: Language): Promise<string[]> {
  // Filter out empty strings but keep track of indices
  const nonEmptyIndices: number[] = []
  const nonEmptyTexts: string[] = []

  texts.forEach((t, i) => {
    if (t && t.trim()) {
      nonEmptyIndices.push(i)
      nonEmptyTexts.push(t)
    }
  })

  if (nonEmptyTexts.length === 0) return texts

  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts: nonEmptyTexts, targetLanguage }),
    })

    if (!response.ok) return texts

    const data = await response.json()
    const translated = data.translatedTexts as string[]

    if (!translated || translated.length !== nonEmptyTexts.length) return texts

    // Rebuild the full array, inserting translations at the right positions
    const result = [...texts]
    nonEmptyIndices.forEach((originalIdx, translatedIdx) => {
      result[originalIdx] = translated[translatedIdx]
    })
    return result
  } catch (error) {
    console.error('[v0] Batch translation failed:', error)
    return texts
  }
}

/**
 * Translates an entire CVData object into the target language.
 * Dates are translated locally, all text content is sent to the AI API.
 * Returns a new CVData object with all fields translated.
 */
export async function translateCVData(
  cvData: CVData,
  targetLanguage: Language
): Promise<CVData> {
  if (targetLanguage === 'en') return cvData

  // Collect ALL text fields into one flat array for a single API call
  const textsToTranslate: string[] = []
  const indices = {
    eduAchievements: [] as number[],
    expDescriptions: [] as number[],
    expAchievements: [] as number[],
    leadDescriptions: [] as number[],
    leadAchievements: [] as number[],
    skillNames: [] as number[],
  }

  cvData.education.forEach((edu) => {
    indices.eduAchievements.push(textsToTranslate.length)
    textsToTranslate.push(edu.achievements || '')
  })

  cvData.experience.forEach((exp) => {
    indices.expDescriptions.push(textsToTranslate.length)
    textsToTranslate.push(exp.description || '')
    indices.expAchievements.push(textsToTranslate.length)
    textsToTranslate.push(exp.achievements || '')
  })

  cvData.leadership.forEach((lead) => {
    indices.leadDescriptions.push(textsToTranslate.length)
    textsToTranslate.push(lead.description || '')
    indices.leadAchievements.push(textsToTranslate.length)
    textsToTranslate.push(lead.achievements || '')
  })

  cvData.skills.forEach((skill) => {
    indices.skillNames.push(textsToTranslate.length)
    textsToTranslate.push(skill.name || '')
  })

  // One single API call for ALL text content
  const translated = await batchTranslate(textsToTranslate, targetLanguage)

  // Reassemble the CVData with translated content and translated dates
  return {
    ...cvData,

    education: cvData.education.map((edu, i) => ({
      ...edu,
      startDate: translateDate(edu.startDate, targetLanguage),
      endDate: translateDate(edu.endDate, targetLanguage),
      achievements: translated[indices.eduAchievements[i]] ?? edu.achievements,
    })),

    experience: cvData.experience.map((exp, i) => ({
      ...exp,
      startDate: translateDate(exp.startDate, targetLanguage),
      endDate: translateDate(exp.endDate, targetLanguage),
      description: translated[indices.expDescriptions[i]] ?? exp.description,
      achievements: translated[indices.expAchievements[i]] ?? exp.achievements,
    })),

    leadership: cvData.leadership.map((lead, i) => ({
      ...lead,
      startDate: translateDate(lead.startDate, targetLanguage),
      endDate: translateDate(lead.endDate, targetLanguage),
      description: translated[indices.leadDescriptions[i]] ?? lead.description,
      achievements: translated[indices.leadAchievements[i]] ?? lead.achievements,
    })),

    skills: cvData.skills.map((skill, i) => ({
      ...skill,
      name: translated[indices.skillNames[i]] ?? skill.name,
    })),
  }
}
