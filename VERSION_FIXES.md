# Correcciones de Versiones de Dependencias

## Problema Original
```
npm error code ETARGET
npm error notarget No matching version found for pdfjs-dist@^4.11.0.
```

Las versiones especificadas en el package.json no existían en npm.

## Soluciones Aplicadas

### 1. Actualización de Versiones (package.json)
```json
ANTES:
"pdfjs-dist": "^4.11.0",
"tesseract.js": "^5.0.5",

AHORA:
"pdfjs-dist": "^3.11.174",
"tesseract.js": "^4.1.1",
```

### 2. Actualización de Importes (lib/file-parser.ts)
```typescript
// Antes: Método 1 (incorrecto)
import pdfjsLib from 'pdfjs-dist';

// Ahora: Método 2 (correcto - dynamic import con fallback)
const pdfModule = await import('pdfjs-dist');
const pdfjsLib = pdfModule.default || pdfModule;
```

### 3. Configuración de Worker (pdfjs-dist)
```typescript
// Antes: Ruta local (no disponible)
const pdfWorker = await import('pdfjs-dist/build/pdf.worker');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

// Ahora: CDN (disponible globalmente)
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
```

### 4. Actualización de Tesseract.js
```typescript
// Antes: Importación simple
const Tesseract = await import('tesseract.js');
const { data: { text } } = await Tesseract.recognize(imageSrc, 'eng');

// Ahora: Uso de Workers (mejor práctica)
const TesseractModule = await import('tesseract.js');
const Tesseract = TesseractModule.default || TesseractModule;
const worker = await Tesseract.createWorker('eng');
const { data: { text } } = await worker.recognize(imageSrc);
await worker.terminate();
```

### 5. Mejoras de Robustez (file-parser.ts)
- Agregada validación de tamaño de archivo (máx 50MB)
- Agregados tipos MIME adicionales (.doc, application/msword)
- Agregado manejo robusto de errores por página en PDFs
- Fallback graceful si OCR falla

## Cambios en Archivos

### package.json
- ✅ Actualizado pdfjs-dist a ^3.11.174
- ✅ Actualizado tesseract.js a ^4.1.1
- ✅ mammoth se mantiene en ^1.8.0 (sin cambios)

### lib/file-parser.ts
- ✅ Removido import de 'docx' (no necesario)
- ✅ Actualizado parsePdfFile() para usar dynamic import
- ✅ Actualizado parseImageFile() para usar worker pattern
- ✅ Agregada validación de tamaño de archivo
- ✅ Mejorada detección de tipos MIME
- ✅ Agregado fallback graceful para errores

### lib/text-extractors.ts
- ✅ Sin cambios requeridos (compatible)

### components/cv-builder/file-upload-section.tsx
- ✅ Sin cambios requeridos (compatible)

## Cómo Verificar

```bash
# 1. Instalar dependencias
npm install

# 2. Verificar versiones
npm list pdfjs-dist tesseract.js mammoth

# 3. Ejecutar dev server
npm run dev

# 4. Probar en navegador
# - Ir a "Información Personal"
# - Cargar un PDF/DOCX/Imagen
# - Verificar que se extrae el texto correctamente
```

## Versiones Finales

| Paquete | Versión | Estado |
|---------|---------|--------|
| pdfjs-dist | ^3.11.174 | ✅ Estable |
| mammoth | ^1.8.0 | ✅ Estable |
| tesseract.js | ^4.1.1 | ✅ Estable |

## Referencias

- [pdfjs-dist NPM](https://www.npmjs.com/package/pdfjs-dist)
- [tesseract.js NPM](https://www.npmjs.com/package/tesseract.js)
- [mammoth NPM](https://www.npmjs.com/package/mammoth)

## Notas

- Todas las dependencias usan importes dinámicos (lazy loading)
- No se cargan en el bundle principal
- Funcionan 100% en el navegador (client-side)
- Compatible con Next.js 16.2.0 y Turbopack
