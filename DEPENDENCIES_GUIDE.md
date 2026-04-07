# Guía de Dependencias de File Upload

## Dependencias Agregadas

Las siguientes dependencias fueron agregadas para soportar la funcionalidad de carga de archivos:

### 1. **pdfjs-dist** (v3.11.174)
- **Propósito**: Parsear y extraer texto de archivos PDF
- **Instalación**: `npm install pdfjs-dist`
- **Uso**: 
  ```typescript
  const pdfjsLib = await import('pdfjs-dist');
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  ```
- **Documentación**: [pdfjs.org](https://mozilla.github.io/pdf.js/)

### 2. **mammoth** (v1.8.0)
- **Propósito**: Extraer texto y metadatos de archivos Word (.docx, .doc)
- **Instalación**: `npm install mammoth`
- **Uso**:
  ```typescript
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ arrayBuffer });
  ```
- **Documentación**: [github.com/mwilson/mammoth.js](https://github.com/mwilson/mammoth.js)

### 3. **tesseract.js** (v4.1.1)
- **Propósito**: OCR (Optical Character Recognition) para extraer texto de imágenes
- **Instalación**: `npm install tesseract.js`
- **Uso**:
  ```typescript
  const TesseractModule = await import('tesseract.js');
  const Tesseract = TesseractModule.default || TesseractModule;
  const worker = await Tesseract.createWorker('eng');
  const { data: { text } } = await worker.recognize(imageSrc);
  ```
- **Documentación**: [tesseract.js](https://github.com/naptha/tesseract.js)
- **Nota**: El OCR puede ser lento en imágenes grandes. Se recomienda para documentos escanados.

## Versiones

| Dependencia | Versión | Razón |
|---|---|---|
| pdfjs-dist | ^3.11.174 | v4.x aún en desarrollo, v3 es estable |
| mammoth | ^1.8.0 | Última versión estable |
| tesseract.js | ^4.1.1 | v5.x requiere más configuración |

## Notas de Compatibilidad

### Next.js 16.2.0
- Las dependencias están optimizadas para Next.js 16.2.0
- Soporta tanto App Router como renderizado client-side
- Funciona correctamente con Turbopack (next.config.mjs actualizado)

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Las dependencias utilizan APIs web modernas y requieren soporte para:
- FileReader API
- Blob/ArrayBuffer
- Web Workers (para pdfjs-dist)

## Cómo Instalar

### Instalación Automática
Las dependencias se instalarán automáticamente cuando ejecutes:
```bash
npm install
```

### Instalación Manual
Si necesitas instalar una específica:
```bash
npm install pdfjs-dist@^3.11.174
npm install mammoth@^1.8.0
npm install tesseract.js@^4.1.1
```

## Performance

### Tamaños de Archivo
- **pdfjs-dist**: ~1.5MB (incluye worker)
- **mammoth**: ~100KB
- **tesseract.js**: ~5MB (incluye modelos)
- **Total**: ~6.6MB (se cargan bajo demanda)

### Recomendaciones
1. Los archivos se cargan bajo demanda (dynamic imports)
2. No se cargan en el bundle principal
3. OCR con tesseract.js puede ser lento (1-5 segundos por imagen)
4. PDFs grandes (>30MB) pueden causar problemas de memoria

## Alternativas Consideradas

### pdfjs-dist
- ✅ Mejor opción: Mantiene Mozilla, amplio soporte
- ❌ Alternativa: pdf-parse (menos soporte para navegador)

### mammoth
- ✅ Mejor opción: Específicamente diseñado para DOCX
- ❌ Alternativa: docx (más pesado)

### tesseract.js
- ✅ Mejor opción: 100% JavaScript, funciona en navegador
- ❌ Alternativa: APIs cloud (requiere servidor)

## Troubleshooting

### Error: "pdfjs-dist not found"
Solución: `npm install pdfjs-dist@^3.11.174`

### Error: "Worker not found"
Solución: El worker se carga desde CDN, verifica conexión a internet

### OCR muy lento
Solución: Normal para tesseract.js, considera:
- Imágenes de menor resolución
- Usar tesseract-worker en background
- O usar solo PDF/DOCX si es posible

### Archivo no se parsea
Verificar:
1. Formato correcto (.pdf, .docx, .txt, .png/.jpg)
2. Archivo no corrompido
3. Permisos de lectura correctos
