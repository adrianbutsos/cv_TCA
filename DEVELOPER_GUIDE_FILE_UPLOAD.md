# Guía para Desarrolladores - Sistema de Carga de Archivos

## Índice
1. [Arquitectura](#arquitectura)
2. [API Reference](#api-reference)
3. [Ejemplos de Uso](#ejemplos-de-uso)
4. [Extender Funcionalidad](#extender-funcionalidad)
5. [Testing](#testing)

## Arquitectura

### Componentes del Sistema

```
┌─────────────────────────────────────┐
│   FileUploadSection (Componente)    │
│   ├─ Drag & Drop Handler            │
│   ├─ File Input Handler             │
│   └─ Preview Dialog                 │
└──────────────────┬──────────────────┘
                   │
                   ↓
┌─────────────────────────────────────┐
│   file-parser.ts (Parser)           │
│   ├─ parseFile()                    │
│   ├─ parsePdfFile()                 │
│   ├─ parseDocxFile()                │
│   ├─ parseImageFile()               │
│   └─ parseTextFile()                │
└──────────────────┬──────────────────┘
                   │
                   ↓
┌─────────────────────────────────────┐
│   text-extractors.ts (Extractor)    │
│   ├─ extractAllData()               │
│   ├─ extractEmail()                 │
│   ├─ extractPhone()                 │
│   ├─ ... (más funciones)            │
│   └─ getConfidenceScore()           │
└──────────────────┬──────────────────┘
                   │
                   ↓
         ExtractedData Output
```

## API Reference

### FileUploadSection Component

```tsx
import { FileUploadSection } from '@/components/cv-builder/file-upload-section'

<FileUploadSection 
  onDataExtracted={(data: ExtractedData) => {
    // Manejar datos extraídos
  }}
/>
```

**Props:**
- `onDataExtracted: (data: ExtractedData) => void` - Callback cuando se extraen datos

**Tipos:**
```tsx
interface ExtractedData {
  name?: string           // Nombre completo
  email?: string         // Correo electrónico
  phone?: string         // Número de teléfono
  location?: string      // Ubicación (Ciudad, País)
  linkedIn?: string      // URL de LinkedIn
  website?: string       // Sitio web/Portfolio
  title?: string         // Puesto laboral
  bio?: string           // Resumen profesional
  rawText?: string       // Texto completo extraído
}
```

### file-parser.ts

#### parseFile(file: File): Promise<string>
Función principal que detecta el tipo de archivo y lo parsea.

```tsx
import { parseFile } from '@/lib/file-parser'

try {
  const text = await parseFile(myFile)
  console.log('Texto extraído:', text)
} catch (error) {
  console.error('Error al parsear:', error)
}
```

#### parsePdfFile(file: File): Promise<string>
Parsea archivos PDF usando pdfjs-dist.

```tsx
const text = await parsePdfFile(pdfFile)
```

#### parseDocxFile(file: File): Promise<string>
Parsea archivos DOCX usando mammoth.

```tsx
const text = await parseDocxFile(docxFile)
```

#### parseImageFile(file: File): Promise<string>
Extrae texto de imágenes usando OCR (tesseract.js).

```tsx
const text = await parseImageFile(imageFile)
```

#### parseTextFile(file: File): Promise<string>
Lee archivos de texto plano.

```tsx
const text = await parseTextFile(txtFile)
```

#### getSupportedFileTypes(): string
Retorna string con extensiones soportadas.

```tsx
const types = getSupportedFileTypes()
// Returns: ".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.gif,.bmp"
```

### text-extractors.ts

#### extractAllData(text: string): ExtractedData
Extrae todos los datos disponibles del texto.

```tsx
import { extractAllData } from '@/lib/text-extractors'

const data = extractAllData(rawText)
console.log({
  name: data.name,
  email: data.email,
  phone: data.phone,
  // ... más campos
})
```

#### Funciones Individuales

```tsx
import { 
  extractEmail,
  extractPhone,
  extractName,
  extractLocation,
  extractTitle,
  extractLinkedIn,
  extractWebsite,
  extractBio,
  getConfidenceScore
} from '@/lib/text-extractors'

// Uso individual
const email = extractEmail(text)
const phone = extractPhone(text)
const name = extractName(text)

// Calcular confianza
const data = extractAllData(text)
const score = getConfidenceScore(data)
console.log(`Confianza: ${score}%`)
```

## Ejemplos de Uso

### Ejemplo 1: Uso Básico en un Componente

```tsx
import { FileUploadSection } from '@/components/cv-builder/file-upload-section'
import type { ExtractedData } from '@/lib/text-extractors'

export function MyComponent() {
  const handleDataExtracted = (data: ExtractedData) => {
    console.log('Datos extraídos:', data)
    // Hacer algo con los datos
    updateUserProfile(data)
  }

  return (
    <div>
      <h1>Importar Información</h1>
      <FileUploadSection onDataExtracted={handleDataExtracted} />
    </div>
  )
}
```

### Ejemplo 2: Procesamiento Manual de Archivo

```tsx
import { parseFile } from '@/lib/file-parser'
import { extractAllData, getConfidenceScore } from '@/lib/text-extractors'

async function processUserFile(file: File) {
  try {
    // Parsear archivo
    const text = await parseFile(file)
    
    // Extraer datos
    const data = extractAllData(text)
    
    // Calcular confianza
    const confidence = getConfidenceScore(data)
    
    // Validar confianza mínima
    if (confidence < 30) {
      console.warn('Baja confianza en los datos extraídos')
    }
    
    return { data, confidence }
  } catch (error) {
    console.error('Error al procesar archivo:', error)
    throw error
  }
}
```

### Ejemplo 3: Integración con Formulario

```tsx
import { FileUploadSection } from '@/components/cv-builder/file-upload-section'
import type { ExtractedData } from '@/lib/text-extractors'
import { useState } from 'react'

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const handleDataExtracted = (data: ExtractedData) => {
    // Actualizar solo campos no vacíos
    setFormData(prev => ({
      name: data.name || prev.name,
      email: data.email || prev.email,
      phone: data.phone || prev.phone,
    }))
  }

  return (
    <div className="space-y-6">
      <FileUploadSection onDataExtracted={handleDataExtracted} />
      
      <input 
        value={formData.name} 
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Nombre"
      />
      <input 
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
      />
      <input 
        value={formData.phone}
        onChange={(e) => setFormData({...formData, phone: e.target.value})}
        placeholder="Teléfono"
      />
    </div>
  )
}
```

### Ejemplo 4: Validación de Datos Extraídos

```tsx
import { extractAllData, getConfidenceScore } from '@/lib/text-extractors'
import { parseFile } from '@/lib/file-parser'

async function validateAndProcess(file: File) {
  const text = await parseFile(file)
  const data = extractAllData(text)
  const confidence = getConfidenceScore(data)

  // Definir requisitos
  const hasRequiredFields = data.name && data.email && data.phone
  const hasHighConfidence = confidence > 70

  if (!hasRequiredFields) {
    throw new Error('Campos obligatorios faltantes: nombre, email, teléfono')
  }

  if (!hasHighConfidence) {
    console.warn(`Confianza baja (${confidence}%). Revisa los datos antes de proceder.`)
  }

  return data
}
```

## Extender Funcionalidad

### Agregar Nuevo Patrón de Extracción

```tsx
// En text-extractors.ts

// 1. Agregar regex al objeto patterns
const patterns = {
  // ... patrones existentes
  companyName: /(?:Company|Corp|Inc|Ltd|LLC)[\s\w]*/gi,
}

// 2. Crear función extractora
export function extractCompanyName(text: string): string | undefined {
  const matches = text.match(patterns.companyName)
  return matches ? matches[0] : undefined
}

// 3. Agregar a ExtractedData interface
export interface ExtractedData {
  // ... campos existentes
  companyName?: string
}

// 4. Actualizar extractAllData()
export function extractAllData(text: string): ExtractedData {
  return {
    // ... datos existentes
    companyName: extractCompanyName(text),
  }
}

// 5. Actualizar getConfidenceScore()
export function getConfidenceScore(data: ExtractedData): number {
  // ... puntuación existente
  if (data.companyName) {
    score += 10
    fields++
  }
  // ...
}
```

### Agregar Nuevo Parser de Formato

```tsx
// En file-parser.ts

// 1. Crear función parser
export async function parseXmlFile(file: File): Promise<string> {
  const text = await parseTextFile(file)
  // Extraer contenido relevante del XML
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(text, 'text/xml')
  return xmlDoc.documentElement.textContent || ''
}

// 2. Actualizar parseFile()
export async function parseFile(file: File): Promise<string> {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  // ... parsers existentes

  // XML files
  if (
    fileType.includes('xml') ||
    fileName.endsWith('.xml')
  ) {
    return await parseXmlFile(file)
  }

  // ... fallback
}

// 3. Actualizar getSupportedFileTypes()
export function getSupportedFileTypes(): string {
  return '.pdf,.docx,.doc,.txt,.md,.xml,.png,.jpg,.jpeg,.gif,.bmp'
}
```

### Mejorar Extracción con IA

```tsx
// Usar AI SDK para mejorar extracción
import { generateText } from 'ai'

export async function enhanceDataExtraction(
  rawData: ExtractedData, 
  rawText: string
): Promise<ExtractedData> {
  const prompt = `
    Texto extraído: "${rawText.substring(0, 500)}"
    
    Datos extraídos:
    - Nombre: ${rawData.name || 'No encontrado'}
    - Email: ${rawData.email || 'No encontrado'}
    - Teléfono: ${rawData.phone || 'No encontrado'}
    
    Por favor, corrije o completa estos datos basándote en el texto.
    Responde en JSON.
  `

  const { text } = await generateText({
    model: 'gpt-4',
    prompt,
  })

  return JSON.parse(text)
}
```

## Testing

### Test Unitario (usando Jest)

```tsx
import { extractEmail, extractPhone, extractAllData } from '@/lib/text-extractors'

describe('text-extractors', () => {
  describe('extractEmail', () => {
    it('should extract valid email', () => {
      const text = 'Contact me at john@example.com'
      const email = extractEmail(text)
      expect(email).toBe('john@example.com')
    })

    it('should handle multiple emails', () => {
      const text = 'Email: john@example.com or jane@example.com'
      const email = extractEmail(text)
      expect(email).toBe('john@example.com')
    })
  })

  describe('extractPhone', () => {
    it('should extract phone number', () => {
      const text = 'Call me at +591 7 1234567'
      const phone = extractPhone(text)
      expect(phone).toBeTruthy()
    })
  })

  describe('extractAllData', () => {
    it('should extract all available data', () => {
      const text = `
        Juan Perez
        juan@example.com
        +591 71234567
        La Paz, Bolivia
        Software Engineer
        linkedin.com/in/juanperez
      `
      const data = extractAllData(text)
      expect(data.name).toBeDefined()
      expect(data.email).toBeDefined()
      expect(data.phone).toBeDefined()
      expect(data.location).toBeDefined()
      expect(data.title).toBeDefined()
    })
  })
})
```

### Test de Integración

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FileUploadSection } from '@/components/cv-builder/file-upload-section'

describe('FileUploadSection', () => {
  it('should handle file upload', async () => {
    const onDataExtracted = jest.fn()
    render(<FileUploadSection onDataExtracted={onDataExtracted} />)

    const file = new File(
      ['Contact: john@example.com'],
      'test.txt',
      { type: 'text/plain' }
    )

    const input = screen.getByRole('button', { name: /seleccionar/i })
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => {
      expect(onDataExtracted).toHaveBeenCalled()
    })
  })
})
```

## Debugging

### Logs Disponibles

```tsx
// En file-parser.ts
console.log('[v0] Parsing file:', fileName, 'Type:', fileType)
console.log('[v0] File parsed successfully')

// En text-extractors.ts
console.log('[v0] Extracted data:', data)

// En FileUploadSection
console.log('[v0] Starting file parsing:', file.name)
console.log('[v0] Data extracted:', data)
```

### Debugging de Extracción

```tsx
import { extractAllData } from '@/lib/text-extractors'

// Función helper para debugging
function debugExtraction(text: string) {
  const data = extractAllData(text)
  
  console.group('Extracción de Datos')
  console.log('Texto original:', text.substring(0, 100) + '...')
  console.log('Datos extraídos:', data)
  console.log('Confianza:', getConfidenceScore(data) + '%')
  console.groupEnd()
  
  return data
}
```

## Performance Optimization

### Memoization

```tsx
import { useMemo } from 'react'

export function OptimizedComponent({ text }: { text: string }) {
  const extractedData = useMemo(
    () => extractAllData(text),
    [text]
  )

  return <div>{/* Usar extractedData */}</div>
}
```

### Lazy Loading de Librerías

Las librerías grandes se cargan dinámicamente:
- pdfjs-dist (solo cuando se parsea PDF)
- mammoth (solo cuando se parsea DOCX)
- tesseract.js (solo cuando se parsea imagen)

## Troubleshooting

### Problema: OCR muy lento
**Solución**: Reducir tamaño de imagen o usar PDF en lugar de imagen

### Problema: No extrae datos esperados
**Solución**: 
1. Verificar formato del documento
2. Actualizar patrones regex
3. Usar extractor mejorado con IA

### Problema: Error de módulo no encontrado
**Solución**: Instalar dependencias con `npm install` o `pnpm install`

## Referencias

- [pdfjs-dist Documentation](https://mozilla.github.io/pdf.js/)
- [Mammoth Documentation](https://github.com/mwilson/mammoth.js)
- [Tesseract.js Documentation](https://tesseract.projectnaptha.com/)
- [MDN FileReader API](https://developer.mozilla.org/en-US/docs/Web/API/FileReader)
