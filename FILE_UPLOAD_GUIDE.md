# Guía de Carga de Archivos - CV Builder

## Descripción General

La nueva funcionalidad de carga de archivos permite a los usuarios importar información desde varios tipos de documentos directamente en el paso de "Información Personal". Los archivos se procesan completamente en el navegador del usuario (client-side), sin ser enviados a servidores.

## Características

### Formatos Soportados
- **PDF** (.pdf) - Documentos PDF
- **Word** (.docx, .doc) - Documentos de Microsoft Word
- **Texto** (.txt, .md) - Archivos de texto plano
- **Imágenes** (.png, .jpg, .jpeg, .gif, .bmp) - Con extracción de texto OCR

### Tipos de Datos Extraídos
1. **Nombre Completo** - Del inicio del documento
2. **Email** - Patrón de correo electrónico
3. **Teléfono** - Números de teléfono en varios formatos
4. **Ubicación** - Ciudad/País o Ciudad/Estado
5. **Puesto/Título** - Posición laboral actual o pasada
6. **LinkedIn** - URL de perfil LinkedIn
7. **Sitio Web** - Portfolio o sitio web personal
8. **Resumen Profesional** - Bio o descripción profesional

## Cómo Funciona

### 1. Carga del Archivo
El usuario puede:
- **Arrastrar y soltar** archivos en el área designada
- **Hacer clic** para seleccionar archivos del sistema

### 2. Procesamiento
- El archivo se lee en el navegador
- Se extrae el texto del formato específico
- Se aplican patrones regex para encontrar datos estructurados
- Se calcula una puntuación de confianza

### 3. Vista Previa
- Se muestran los datos extraídos en un diálogo
- El usuario puede revisar la información antes de aplicarla
- Muestra una puntuación de confianza (0-100%)

### 4. Aplicación
- El usuario hace clic en "Aplicar Datos"
- Los campos se llenan automáticamente
- El usuario puede ajustar manualmente cualquier valor

## Detalles Técnicos

### Librerías Utilizadas

```json
{
  "pdfjs-dist": "^4.11.0",      // Extracción de texto desde PDFs
  "mammoth": "^1.8.0",           // Extracción de texto desde DOCX
  "tesseract.js": "^5.0.5"       // OCR para imágenes
}
```

### Archivos del Componente

#### 1. `/lib/text-extractors.ts`
Funciones de extracción de datos estructurados mediante regex:
- `extractEmail()` - Extrae email
- `extractPhone()` - Extrae teléfono
- `extractLinkedIn()` - Extrae URL LinkedIn
- `extractWebsite()` - Extrae sitio web
- `extractLocation()` - Extrae ubicación
- `extractTitle()` - Extrae puesto laboral
- `extractName()` - Extrae nombre completo
- `extractBio()` - Extrae resumen profesional
- `extractAllData()` - Extrae todos los datos
- `getConfidenceScore()` - Calcula puntuación de confianza

#### 2. `/lib/file-parser.ts`
Funciones para parsear diferentes formatos de archivo:
- `parseTextFile()` - Lee archivos de texto
- `parsePdfFile()` - Extrae texto de PDFs
- `parseDocxFile()` - Extrae texto de DOCX
- `parseImageFile()` - OCR en imágenes
- `parseFile()` - Función principal que detecta tipo y parsea

#### 3. `/components/cv-builder/file-upload-section.tsx`
Componente React con interfaz de usuario:
- Zona de drag & drop
- Manejo de carga de archivos
- Vista previa de datos extraídos
- Diálogo de confirmación
- Manejo de errores

### Flujo de Datos

```
Usuario carga archivo
    ↓
parseFile() detecta tipo y extrae texto
    ↓
extractAllData() aplica patrones regex
    ↓
getConfidenceScore() calcula confianza
    ↓
FileUploadSection muestra vista previa
    ↓
Usuario revisa y confirma
    ↓
handleDataExtracted() mapea a PersonalInfo
    ↓
Campos se llenan automáticamente
```

## Casos de Uso

### 1. CV Anterior
Carga un CV anterior para llenar rápidamente todos los campos de información personal y profesional.

### 2. Certificados
Carga un certificado o diploma para extraer información de educación.

### 3. Diplomas
Carga un diploma para obtener información educativa.

### 4. Documentos Mixtos
Soporta cualquier documento que contenga información de contacto estructurada.

## Puntuación de Confianza

La puntuación se calcula basándose en qué campos se encontraron:
- **Nombre**: +20 puntos
- **Email**: +20 puntos
- **Teléfono**: +15 puntos
- **Ubicación**: +15 puntos
- **LinkedIn/Website**: +15 puntos
- **Puesto**: +15 puntos

**Interpretación**:
- 70-100%: Alta confianza ✓
- 40-69%: Confianza media ⚠️
- 0-39%: Baja confianza ✗

## Privacidad y Seguridad

**Importante**: 
- ✓ Todos los archivos se procesan en el navegador del usuario
- ✓ Los datos NO se envían a servidores
- ✓ Los archivos NO se guardan
- ✓ No hay seguimiento de datos personales
- ✓ Cumplimiento con GDPR/Privacidad

## Limitaciones

1. **Imágenes de baja calidad**: OCR puede no extraer texto correctamente
2. **Documentos complejos**: Layouts complejos pueden confundir los patrones
3. **Idiomas**: El OCR está optimizado para inglés
4. **Tamaño de archivo**: Archivos muy grandes (>100MB) pueden ralentizar
5. **Navegadores antiguos**: Se requiere un navegador moderno con soporte para FileReader

## Mejoras Futuras

1. Soporte para múltiples idiomas en OCR
2. Mejor extracción de secciones educativas
3. Extracción de experiencia laboral
4. Validación mejorada de datos
5. Caché de datos extraídos
6. Historial de cargas recientes

## Solución de Problemas

### Error: "Failed to parse PDF"
- Verifica que el PDF no esté corrompido
- Intenta con un PDF diferente
- El PDF puede estar protegido con contraseña

### Error: "Failed to extract text from image"
- La imagen puede estar muy borrosa
- Intenta con una imagen de mayor resolución
- Asegúrate de que el texto sea legible

### No se extrae el email
- El email puede estar en un formato no estándar
- Intenta agregarlo manualmente

### OCR muy lento
- Las imágenes grandes tardan más
- Intenta con archivos más pequeños
- Usa PDFs en lugar de imágenes si es posible

## API de Desarrollo

Para integrar en otros componentes:

```tsx
import { FileUploadSection } from '@/components/cv-builder/file-upload-section'
import type { ExtractedData } from '@/lib/text-extractors'

// En tu componente:
<FileUploadSection 
  onDataExtracted={(data: ExtractedData) => {
    // Manejar datos extraídos
    console.log('Datos extraídos:', data)
  }}
/>

// Tipos disponibles:
interface ExtractedData {
  name?: string
  email?: string
  phone?: string
  location?: string
  linkedIn?: string
  website?: string
  title?: string
  bio?: string
  rawText?: string
}
```

## Performance

- **PDF pequeño (< 2MB)**: ~500ms
- **DOCX pequeño (< 1MB)**: ~200ms
- **TXT pequeño (< 100KB)**: ~100ms
- **Imagen pequeña (< 1MB)**: ~2-5s (OCR es más lento)

## Ejemplos de Patrones Regex

```typescript
// Email
/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g

// Teléfono
/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g

// LinkedIn
/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-]+)/gi

// Ubicación
/([A-Z][a-zA-Z]+),\s*([A-Z]{2}|[A-Z][a-zA-Z]+)/g
```
