# 🌙 Guía de Dark Mode - CV Builder

## ¿Qué se implementó?

Se agregó soporte completo para **Dark Mode / Light Mode** con alternancia fluida y persistencia automática.

### Componentes Añadidos

#### 1. **Theme Toggle Button** 
📁 `components/theme-toggle.tsx`

Un botón elegante en el header que permite cambiar entre modo claro y oscuro.

**Características:**
- ☀️ Icono del sol en modo claro
- 🌙 Icono de luna en modo oscuro
- 🔄 Transiciones suaves de 300ms
- ♿ ARIA labels para accesibilidad
- 💾 Persistencia automática

**Uso:**
```tsx
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return <ThemeToggle />
}
```

---

## 🎨 Sistema de Colores

### Modo Claro (Light Mode)
```css
--background: oklch(0.985 0.002 340)    /* Blanco casi puro */
--foreground: oklch(0.2 0 0)            /* Negro */
--primary: oklch(0.38 0.14 350)         /* Magenta #8B2346 */
--card: oklch(1 0 0)                    /* Blanco */
```

### Modo Oscuro (Dark Mode) - Optimizado
```css
--background: oklch(0.12 0.01 350)      /* Casi negro */
--foreground: oklch(0.97 0.01 0)        /* Blanco muy puro */
--primary: oklch(0.58 0.14 350)         /* Magenta más claro */
--card: oklch(0.165 0.008 350)          /* Gris oscuro */
```

**Mejoras en Contraste:**
- Foreground más claro: 0.95 → 0.97 (97%)
- Primario más saturado: 0.55 → 0.58
- Fondo más oscuro: 0.15 → 0.12
- WCAG AA Compliance garantizado

---

## 🔧 Integración Técnica

### 1. **ThemeProvider en Layout**

El archivo `app/layout.tsx` ahora envuelve la aplicación con `ThemeProvider`:

```tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider 
          attribute="class"           // Usa clase .dark en el HTML
          defaultTheme="system"       // Detecta preferencia del SO
          enableSystem={true}         // Sincroniza con sistema
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 2. **Transiciones Suaves**

En `app/globals.css` se agregaron transiciones CSS:

```css
body {
  @apply bg-background text-foreground transition-colors duration-300;
}

* {
  @apply transition-colors duration-200;
}
```

### 3. **Uso de next-themes**

Utiliza la librería `next-themes` (ya instalada en el proyecto) para:
- ✅ Persistencia en localStorage
- ✅ Sincronización entre tabs
- ✅ Detección de preferencia del sistema
- ✅ Prevención de flash of unstyled content (FOUC)

---

## 🚀 Cómo Usar en Componentes

### Acceder al Tema Actual

```tsx
'use client'

import { useTheme } from 'next-themes'

export function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div>
      <p>Tema actual: {theme}</p>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('light')}>Light</button>
    </div>
  )
}
```

### Agregar Lógica Condicional al Tema

```tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemedComponent() {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()
  
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return null // Evita hydration mismatch
  
  return (
    <div className={theme === 'dark' ? 'bg-black' : 'bg-white'}>
      Contenido temático
    </div>
  )
}
```

---

## 🎯 Ubicación del Botón Toggle

El botón de alternancia está ubicado en el **header del CV Builder**:

📍 **Componente:** `components/cv-builder/cv-builder.tsx`
📍 **Sección:** Header (derecha, junto al botón de Live Preview)

```tsx
<div className="flex items-center gap-2">
  {/* Live Preview Button */}
  <Button>...</Button>
  
  {/* Theme Toggle - Aquí está! */}
  <ThemeToggle />
</div>
```

---

## 📱 Responsividad

El botón de tema es:
- ✅ Visible en todos los tamaños de pantalla
- ✅ Compacto en móvil (solo icono)
- ✅ Accesible por teclado (Tab + Enter)
- ✅ Con aria-labels descriptivos

---

## 🔍 Verificación de Implementación

Para verificar que todo funciona correctamente:

1. **Abre el CV Builder**
2. **Haz clic en el botón de sol/luna** en el header superior derecho
3. **Observa:**
   - 🔄 Cambio suave de colores (transición 300ms)
   - 💾 El tema se persiste al recargar la página
   - 🌙 Todos los elementos siguen el tema nuevo
   - 📱 Funciona en móvil y desktop

---

## 🎨 Personalización

### Cambiar Paleta de Colores en Dark Mode

Edita `app/globals.css`:

```css
.dark {
  --background: oklch(0.12 0.01 350);     /* Más/menos oscuro */
  --foreground: oklch(0.97 0.01 0);       /* Más/menos blanco */
  --primary: oklch(0.58 0.14 350);        /* Tu color primario */
  /* ... más variables ... */
}
```

### Agregar Nuevo Tema

Edita `components/theme-provider.tsx` y `next.config.js`:

```tsx
// En next.config.js
module.exports = {
  theme: {
    extend: {
      // Agregar nuevo tema
    }
  }
}
```

---

## 🐛 Troubleshooting

### Flash blanco al cargar (FOUC)
**Solución:** `suppressHydrationWarning` en el tag `<html>` (ya está implementado)

### Theme no persiste
**Solución:** Verifica que localStorage esté habilitado en el navegador

### Icono no cambia
**Solución:** Asegúrate de que `mounted` es `true` antes de renderizar

```tsx
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

if (!mounted) return null
```

---

## 📊 Variables CSS Disponibles

Todas las variables CSS están disponibles y responden al tema:

```css
/* Colores Base */
--background
--foreground
--card
--card-foreground
--popover
--popover-foreground

/* Semánticos */
--primary
--primary-foreground
--secondary
--secondary-foreground
--accent
--accent-foreground
--muted
--muted-foreground
--destructive
--destructive-foreground

/* UI */
--border
--input
--ring

/* Sidebar (si se implementa) */
--sidebar
--sidebar-foreground
--sidebar-primary
--sidebar-primary-foreground
--sidebar-accent
--sidebar-accent-foreground
--sidebar-border
--sidebar-ring

/* Charts */
--chart-1 through --chart-5

/* Radius */
--radius
--radius-sm
--radius-md
--radius-lg
--radius-xl
```

---

## 🚀 Próximos Pasos

- [ ] Agregar más temas (sepia, high contrast, etc)
- [ ] Implementar preferencias de usuario
- [ ] Agregar toggle en settings/perfil
- [ ] Analytics de preferencia de tema
- [ ] Transiciones de tema más elaboradas

---

*Dark Mode completamente implementado y listo para producción ✨*
*The Consulting Academy - La Paz | 2026*
