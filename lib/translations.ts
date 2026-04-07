export type Language = 'en' | 'es' | 'de'

const months: Record<Language, Record<string, string>> = {
  en: {
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
  },
  es: {
    january: 'Enero',
    february: 'Febrero',
    march: 'Marzo',
    april: 'Abril',
    may: 'Mayo',
    june: 'Junio',
    july: 'Julio',
    august: 'Agosto',
    september: 'Septiembre',
    october: 'Octubre',
    november: 'Noviembre',
    december: 'Diciembre',
  },
  de: {
    january: 'Januar',
    february: 'Februar',
    march: 'März',
    april: 'April',
    may: 'Mai',
    june: 'Juni',
    july: 'Juli',
    august: 'August',
    september: 'September',
    october: 'Oktober',
    november: 'November',
    december: 'Dezember',
  },
}

export const translations: Record<Language, Record<string, string>> = {
  en: {
    education: 'Education',
    experience: 'Experience',
    leadership: 'Leadership & Activities',
    skills: 'Skills',
    startDate: 'Start Date',
    endDate: 'End Date',
    location: 'Location',
    degree: 'Degree',
    field: 'Field of Study',
    institution: 'Institution',
    position: 'Position',
    company: 'Company',
    description: 'Description',
    achievement: 'Achievement',
    skillsLabel: 'Skills',
    phone: 'Phone',
    email: 'Email',
    address: 'Address',
    linkedin: 'LinkedIn',
    website: 'Website',
    present: 'Present',
  },
  es: {
    education: 'Educación',
    experience: 'Experiencia',
    leadership: 'Liderazgo y Actividades',
    skills: 'Habilidades',
    startDate: 'Fecha de Inicio',
    endDate: 'Fecha de Fin',
    location: 'Ubicación',
    degree: 'Título',
    field: 'Campo de Estudio',
    institution: 'Institución',
    position: 'Posición',
    company: 'Empresa',
    description: 'Descripción',
    achievement: 'Logro',
    skillsLabel: 'Habilidades',
    phone: 'Teléfono',
    email: 'Correo Electrónico',
    address: 'Dirección',
    linkedin: 'LinkedIn',
    website: 'Sitio Web',
    present: 'Presente',
  },
  de: {
    education: 'Bildung',
    experience: 'Berufserfahrung',
    leadership: 'Führung und Aktivitäten',
    skills: 'Fähigkeiten',
    startDate: 'Startdatum',
    endDate: 'Enddatum',
    location: 'Standort',
    degree: 'Abschluss',
    field: 'Studienbereich',
    institution: 'Institution',
    position: 'Position',
    company: 'Unternehmen',
    description: 'Beschreibung',
    achievement: 'Errungenschaft',
    skillsLabel: 'Fähigkeiten',
    phone: 'Telefon',
    email: 'E-Mail',
    address: 'Adresse',
    linkedin: 'LinkedIn',
    website: 'Website',
    present: 'Aktuell',
  },
}

export function getTranslation(language: Language, key: string): string {
  return translations[language][key] || key
}

/**
 * Translate a date string like "Sep 2021" to the target language
 */
export function translateDate(dateString: string, language: Language): string {
  if (!dateString) return ''

  // Handle "Present" / "Presente" / "Aktuell"
  if (dateString.toLowerCase() === 'present' || dateString === 'Presente') {
    return getTranslation(language, 'present')
  }

  const parts = dateString.trim().split(/\s+/)
  if (parts.length < 1) return dateString

  const monthName = parts[0]
  const year = parts[1] || ''

  // Find the month key (e.g., "Sep" -> "september")
  const monthKey = Object.keys(months.en).find(
    (key) => months.en[key].substring(0, 3).toLowerCase() === monthName.toLowerCase()
  ) || Object.keys(months.en).find(
    (key) => months.en[key].toLowerCase() === monthName.toLowerCase()
  )

  if (monthKey && months[language] && months[language][monthKey]) {
    const translatedMonth = months[language][monthKey].substring(0, 3)
    return year ? `${translatedMonth} ${year}` : translatedMonth
  }

  return dateString
}
