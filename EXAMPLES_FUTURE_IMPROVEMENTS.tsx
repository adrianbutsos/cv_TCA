/**
 * EJEMPLOS DE FUTURAS MEJORAS - CV BUILDER
 * 
 * Este archivo contiene ejemplos de código para implementar
 * las mejoras de UX/UI recomendadas.
 */

// ============================================
// 1. GUARDADO AUTOMÁTICO
// ============================================

/**
 * Hook para sincronización automática con backend
 * Ubicación: hooks/use-auto-save.ts
 */
import { useCallback, useEffect, useRef } from 'react'

export function useAutoSave<T>(
  data: T,
  onSave: (data: T) => Promise<void>,
  delayMs = 3000
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const lastSavedRef = useRef<T>(data)

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(lastSavedRef.current)) {
      return
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        await onSave(data)
        lastSavedRef.current = data
      } catch (error) {
        console.error('Auto-save failed:', error)
      }
    }, delayMs)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [data, onSave])
}

// Uso en CV Builder:
/*
const { status, lastSaved } = useAutoSave(cvData, async (data) => {
  const response = await fetch('/api/cv/save', {
    method: 'POST',
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to save')
})

return <AutoSaveIndicator status={status} lastSaved={lastSaved} />
*/

// ============================================
// 2. VALIDACIÓN EN TIEMPO REAL
// ============================================

/**
 * Componente mejorado de input con validación
 * Ubicación: components/ui/validated-input.tsx
 */
'use client'

import { useState, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { AlertCircle, CheckCircle } from 'lucide-react'

interface ValidatedInputProps {
  placeholder?: string
  validate?: (value: string) => { valid: boolean; message?: string }
  onChange?: (value: string) => void
}

export function ValidatedInput({
  placeholder,
  validate,
  onChange,
}: ValidatedInputProps) {
  const [value, setValue] = useState('')
  const [validation, setValidation] = useState<{
    valid: boolean
    message?: string
  } | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      if (validate && newValue.length > 0) {
        const result = validate(newValue)
        setValidation(result)
      } else {
        setValidation(null)
      }

      onChange?.(newValue)
    },
    [validate, onChange]
  )

  return (
    <div className="space-y-1">
      <div className="relative">
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className={
            validation
              ? validation.valid
                ? 'border-green-500'
                : 'border-red-500'
              : ''
          }
        />
        {validation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {validation.valid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500" />
            )}
          </div>
        )}
      </div>
      {validation?.message && (
        <p
          className={
            validation.valid
              ? 'text-sm text-green-600'
              : 'text-sm text-red-600'
          }
        >
          {validation.message}
        </p>
      )}
    </div>
  )
}

// Uso:
/*
<ValidatedInput
  placeholder="Email"
  validate={(value) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    return {
      valid: isValid,
      message: isValid ? '✓ Email válido' : '✗ Email inválido'
    }
  }}
/>
*/

// ============================================
// 3. MÚLTIPLES TEMPLATES DE CV
// ============================================

/**
 * Componente selector de templates
 * Ubicación: components/cv-builder/template-selector.tsx
 */
export interface CVTemplate {
  id: string
  name: string
  description: string
  preview: string
  className: string
}

export const CV_TEMPLATES: CVTemplate[] = [
  {
    id: 'harvard',
    name: 'Harvard',
    description: 'Clásico y profesional',
    preview: '/templates/harvard.png',
    className: 'template-harvard',
  },
  {
    id: 'modern',
    name: 'Moderno',
    description: 'Diseño contemporáneo',
    preview: '/templates/modern.png',
    className: 'template-modern',
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    description: 'Limpio y directo',
    preview: '/templates/minimal.png',
    className: 'template-minimal',
  },
  {
    id: 'creative',
    name: 'Creativo',
    description: 'Para perfiles creativos',
    preview: '/templates/creative.png',
    className: 'template-creative',
  },
]

// ============================================
// 4. EXPORTACIÓN A PDF
// ============================================

/**
 * Función para exportar CV a PDF
 * Ubicación: lib/pdf-export.ts
 */
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

export async function exportToPDF(
  elementId: string,
  filename: string
) {
  try {
    const element = document.getElementById(elementId)
    if (!element) throw new Error('Element not found')

    // Convertir HTML a canvas
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    })

    // Crear PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const imgData = canvas.toDataURL('image/png')
    const imgWidth = 210
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(filename)
  } catch (error) {
    console.error('PDF export failed:', error)
    throw error
  }
}

// Uso:
/*
<button onClick={() => exportToPDF('cv-preview', 'mi-cv.pdf')}>
  Descargar como PDF
</button>
*/

// ============================================
// 5. BREADCRUMBS DINÁMICOS
// ============================================

/**
 * Componente de breadcrumbs
 * Ubicación: components/cv-builder/breadcrumbs.tsx
 */
import { ChevronRight } from 'lucide-react'

interface Breadcrumb {
  label: string
  href?: string
  active?: boolean
}

export function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-primary hover:underline"
            >
              {item.label}
            </a>
          ) : (
            <span
              className={
                item.active
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground'
              }
            >
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  )
}

// ============================================
// 6. INDICADOR DE CAMPOS COMPLETADOS
// ============================================

/**
 * Hook para calcular progreso de formulario
 * Ubicación: hooks/use-form-progress.ts
 */
export function useFormProgress(data: Record<string, any>) {
  const calculateProgress = () => {
    const fields = Object.values(data).flat()
    const completed = fields.filter(
      (field) => field && field.toString().trim() !== ''
    ).length
    const total = fields.length

    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100),
    }
  }

  return calculateProgress()
}

// ============================================
// 7. NOTIFICACIONES TOAST MEJORADAS
// ============================================

/**
 * Hook para notificaciones
 * Ubicación: hooks/use-notifications.ts
 */
import { useCallback } from 'react'
import { toast } from 'sonner'

export function useNotifications() {
  return {
    success: useCallback((message: string) => {
      toast.success(message, {
        duration: 3000,
        position: 'top-right',
      })
    }, []),

    error: useCallback((message: string) => {
      toast.error(message, {
        duration: 4000,
        position: 'top-right',
      })
    }, []),

    info: useCallback((message: string) => {
      toast.info(message, {
        duration: 3000,
        position: 'top-right',
      })
    }, []),

    loading: useCallback((message: string) => {
      return toast.loading(message, {
        position: 'top-right',
      })
    }, []),
  }
}

// ============================================
// 8. SKELETON LOADERS
// ============================================

/**
 * Componente skeleton para loading
 * Ubicación: components/ui/skeleton-card.tsx
 */
export function SkeletonCard() {
  return (
    <div className="bg-card rounded-lg p-6 space-y-4">
      <div className="h-8 bg-muted rounded-md animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded-md animate-pulse w-3/4" />
        <div className="h-4 bg-muted rounded-md animate-pulse w-1/2" />
      </div>
    </div>
  )
}

// ============================================
// 9. INTERNACIONALIZACIÓN (i18n)
// ============================================

/**
 * Configuración de i18n
 * Ubicación: lib/i18n.ts
 */
export const translations = {
  es: {
    'cv.title': 'Mi CV',
    'cv.personalInfo': 'Información Personal',
    'cv.education': 'Educación',
    'cv.experience': 'Experiencia',
    'cv.skills': 'Habilidades',
    'cv.download': 'Descargar CV',
    'cv.preview': 'Vista Previa',
    'validation.required': 'Este campo es requerido',
    'validation.email': 'Email inválido',
    'autosave.saving': 'Guardando...',
    'autosave.saved': 'Guardado correctamente',
    'autosave.error': 'Error al guardar',
  },
  en: {
    'cv.title': 'My CV',
    'cv.personalInfo': 'Personal Information',
    'cv.education': 'Education',
    'cv.experience': 'Experience',
    'cv.skills': 'Skills',
    'cv.download': 'Download CV',
    'cv.preview': 'Preview',
    'validation.required': 'This field is required',
    'validation.email': 'Invalid email',
    'autosave.saving': 'Saving...',
    'autosave.saved': 'Saved successfully',
    'autosave.error': 'Error saving',
  },
}

export function useTranslation(lang: 'es' | 'en' = 'es') {
  return (key: string) => {
    const text = translations[lang][key as keyof typeof translations['es']]
    return text || key
  }
}

export default {
  useAutoSave,
  ValidatedInput,
  CV_TEMPLATES,
  exportToPDF,
  Breadcrumbs,
  useFormProgress,
  useNotifications,
  SkeletonCard,
  useTranslation,
}
