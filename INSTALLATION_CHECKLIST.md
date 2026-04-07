# Checklist de Instalación y Verificación

## Pre-Instalación

- [ ] Verifica que tienes Node.js 18+ instalado
  ```bash
  node --version  # v18.0.0 o superior
  ```

- [ ] Verifica que tienes npm 8+ instalado
  ```bash
  npm --version   # 8.0.0 o superior
  ```

- [ ] Verifica que estás en el directorio correcto
  ```bash
  pwd  # debería terminar en /cv_TCA
  ```

## Instalación de Dependencias

- [ ] Limpia npm cache (si hay problemas previos)
  ```bash
  npm cache clean --force
  ```

- [ ] Elimina node_modules y lock files (si hay conflictos)
  ```bash
  rm -rf node_modules package-lock.json
  ```

- [ ] Instala todas las dependencias
  ```bash
  npm install
  ```

- [ ] Verifica que se instalaron correctamente
  ```bash
  npm list pdfjs-dist mammoth tesseract.js
  ```

  Resultado esperado:
  ```
  ├── mammoth@1.8.0
  ├── pdfjs-dist@3.11.174
  └── tesseract.js@4.1.1
  ```

## Verificación de Código

- [ ] Verifica que el package.json tiene las versiones correctas
  ```bash
  grep -E '"pdfjs-dist"|"mammoth"|"tesseract.js"' package.json
  ```

  Resultado esperado:
  ```
  "mammoth": "^1.8.0",
  "pdfjs-dist": "^3.11.174",
  "tesseract.js": "^4.1.1",
  ```

- [ ] Verifica que lib/file-parser.ts no tiene imports incorrecto de 'docx'
  ```bash
  grep "from 'docx'" lib/file-parser.ts
  ```

  Resultado esperado: (sin salida, es decir, no existe)

- [ ] Verifica que el personal-info-step importa FileUploadSection
  ```bash
  grep "FileUploadSection" components/cv-builder/steps/personal-info-step.tsx
  ```

  Resultado esperado: (línea con importación)

## Inicio del Servidor

- [ ] Inicia el servidor de desarrollo
  ```bash
  npm run dev
  ```

- [ ] Verifica que no hay errores de compilación
  ```
  ✓ Compiled successfully
  ✓ Ready in X.XXs
  ```

- [ ] Abre el navegador en `http://localhost:3000`

- [ ] Espera a que cargue (puede tomar 5-10 segundos con Turbopack)

## Pruebas Funcionales

### 1. Carga de Interfaz
- [ ] La página se carga sin errores
- [ ] Ves el logo de TCA
- [ ] Ves el tema toggle (🌙☀️) en la esquina superior derecha
- [ ] Ves el botón "Live Preview" (si aplica)

### 2. Dark Mode
- [ ] Haz clic en el theme toggle
- [ ] Verifica que cambia a dark mode correctamente
- [ ] Los colores son visibles (contraste adecuado)
- [ ] Haz clic nuevamente para volver a light mode

### 3. Navegación hasta Personal Info
- [ ] Haz clic en "Comenzar"
- [ ] Llegas a Step 1: "Información Personal"
- [ ] Ves la sección "Importar Información" (cards con título)

### 4. Prueba de Carga de Archivos

#### 4a. Prueba de Drag & Drop
- [ ] La zona de carga está visible
- [ ] Puedes hacer clic en "haz clic para seleccionar"
- [ ] Se abre el selector de archivos
- [ ] Puedes seleccionar archivos .pdf, .docx, .txt

#### 4b. Prueba con Archivo de Texto
- [ ] Crea un archivo test.txt con contenido:
  ```
  Juan Pérez García
  juan.perez@example.com
  +34 600 123 456
  LinkedIn: linkedin.com/in/juanperez
  Website: www.juanperez.dev
  ```
- [ ] Arrastra o carga el archivo
- [ ] Ves un spinner "Procesando archivo..."
- [ ] Se muestra mensaje de éxito "Archivo procesado correctamente"

#### 4c. Prueba Preview y Datos
- [ ] Se abre un dialog "Vista previa de datos extraídos"
- [ ] Ves la barra de confianza (confidence score)
- [ ] El porcentaje es > 70% (en verde)
- [ ] Se muestran los campos extraídos:
  - [ ] Nombre: Juan Pérez García (o similar)
  - [ ] Email: juan.perez@example.com
  - [ ] Teléfono: +34 600 123 456
  - [ ] LinkedIn: linkedin.com/in/juanperez
  - [ ] Sitio Web: www.juanperez.dev

#### 4d. Aplicar Datos
- [ ] Haz clic en "Aplicar Datos"
- [ ] El dialog se cierra
- [ ] Los campos del formulario se auto-rellenan:
  - [ ] Full Name: Juan Pérez García
  - [ ] Email: juan.perez@example.com
  - [ ] Phone: +34 600 123 456
  - [ ] LinkedIn: linkedin.com/in/juanperez
  - [ ] Website: www.juanperez.dev

#### 4e. Prueba con PDF
- [ ] Descarga un PDF de CV real (o usa uno tuyo)
- [ ] Carga el PDF
- [ ] Verifica que extrae el texto correctamente
- [ ] Confidence score es > 50%
- [ ] Al menos nombre y email se extraen

#### 4f. Prueba con DOCX
- [ ] Crea un documento Word (.docx) con información personal
- [ ] Carga el archivo
- [ ] Verifica que extrae el texto
- [ ] Los campos se rellenan correctamente

### 5. Prueba de Errores
- [ ] Intenta cargar un archivo > 50MB
- [ ] Verifica que ves error "File is too large"
- [ ] Intenta cargar un archivo corrupto
- [ ] Verifica que ves error apropiado

### 6. Navegación Continua
- [ ] Después de llenar "Información Personal"
- [ ] Haz clic en "Siguiente"
- [ ] Puedes avanzar a Step 2 sin errores
- [ ] Los datos se mantienen correctamente

## Pruebas en Dark Mode

- [ ] Repite pruebas 4a-4f pero en dark mode
- [ ] Verifica que:
  - [ ] La interfaz es visible
  - [ ] El contraste es adecuado
  - [ ] Los colores son distinguibles
  - [ ] No hay elementos oscuros sobre fondo oscuro

## Verificación de Consola

- [ ] Abre DevTools (F12)
- [ ] Ve a la pestaña "Console"
- [ ] No hay errores de JavaScript (rojo)
- [ ] Los logs muestran:
  - [ ] "[v0] Parsing file: ..." (cuando carga archivo)
  - [ ] "[v0] File parsed successfully..." (cuando se parsea)
  - [ ] "[v0] Data extracted: {...}" (cuando extrae datos)

## Verificación de Network

- [ ] En DevTools, ve a "Network"
- [ ] Carga un archivo
- [ ] Verifica que:
  - [ ] No hay requests POST/PUT a servidores externos
  - [ ] Todo se procesa localmente
  - [ ] Posible request a CDN para pdf.worker.js (normal)

## Build para Producción

- [ ] Detén el servidor (Ctrl+C)
- [ ] Ejecuta:
  ```bash
  npm run build
  ```
- [ ] Verifica que no hay errores
- [ ] Resultado esperado:
  ```
  ✓ Compiled successfully
  ✓ Linting and type checking passed
  ```

- [ ] Inicia servidor de producción:
  ```bash
  npm start
  ```
- [ ] Repite pruebas funcionales (4a-4f)

## Checklist Final

- [ ] Todas las pruebas pasaron ✅
- [ ] No hay errores en consola ✅
- [ ] Dark mode funciona ✅
- [ ] File upload funciona ✅
- [ ] Datos se rellenan correctamente ✅
- [ ] Build de producción funciona ✅

## Notas de Solución de Problemas

### Error: "pdfjs-dist not found"
```bash
npm install pdfjs-dist@^3.11.174
```

### Error: "Worker not found" en console
- Normal - se intenta cargar desde CDN
- Verifica conexión a internet
- Si persiste, verifica proxy/firewall

### OCR muy lento (tesseract.js)
- Normal para imágenes grandes
- Tesseract puede tomar 1-5 segundos
- Considera imágenes de menor resolución

### Build lento
- Normal con pdfjs-dist y tesseract.js
- Se cargan bajo demanda, no en bundle principal
- Verificar que no hay archivos temporales grandes

## Documentación de Referencia

- [FILE_UPLOAD_README.md](FILE_UPLOAD_README.md) - Overview
- [QUICK_REFERENCE.txt](QUICK_REFERENCE.txt) - Referencia rápida
- [DEPENDENCIES_GUIDE.md](DEPENDENCIES_GUIDE.md) - Dependencias
- [VERSION_FIXES.md](VERSION_FIXES.md) - Cambios realizados
- [FILE_UPLOAD_GUIDE.md](FILE_UPLOAD_GUIDE.md) - Guía de usuario

## ¿Todo Funciona?

Si todo pasó el checklist, ¡está listo para producción! 🎉

Si tienes problemas, consulta:
1. La consola del navegador (F12)
2. Los logs de npm (terminal)
3. La documentación de referencia arriba
4. Los archivos de troubleshooting en DEPENDENCIES_GUIDE.md
