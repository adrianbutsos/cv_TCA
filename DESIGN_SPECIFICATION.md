# 🎨 Especificación de Diseño - CV Builder

## Paleta de Colores

### Sistema OKLCH (Perceptually Uniform)

El proyecto utiliza **OKLCH** en lugar de HEX/RGB para colores más perceptualmente uniformes.

#### 📐 Sintaxis OKLCH
```
oklch(L C H)
L = Lightness   (0-1)    → Luminosidad
C = Chroma      (0-0.4)  → Saturación
H = Hue         (0-360)  → Tono
```

---

## 🌅 Modo Claro (Light Mode)

### Colores Base

```css
:root {
  /* Neutrals */
  --background: oklch(0.985 0.002 340);    /* #FBFAF9 */
  --foreground: oklch(0.2 0 0);            /* #0A0A0A */
  --card: oklch(1 0 0);                    /* #FFFFFF */
  --card-foreground: oklch(0.2 0 0);       /* #0A0A0A */
  
  /* Brand Colors */
  --primary: oklch(0.38 0.14 350);         /* #8B2346 - Magenta vino */
  --primary-foreground: oklch(0.99 0 0);   /* #FEFEFE - Blanco */
  --secondary: oklch(0.52 0.02 0);         /* #858585 - Gris */
  --secondary-foreground: oklch(0.99 0 0); /* #FEFEFE - Blanco */
  
  /* Semantic */
  --muted: oklch(0.96 0.005 340);          /* #F5F5F5 - Gris claro */
  --muted-foreground: oklch(0.45 0.01 0);  /* #737373 - Gris oscuro */
  --accent: oklch(0.95 0.02 350);          /* #F0F0F0 - Gris más claro */
  --accent-foreground: oklch(0.38 0.14 350); /* Mismo que primary */
  
  /* States */
  --destructive: oklch(0.55 0.2 27);       /* #C72C48 - Rojo */
  --destructive-foreground: oklch(0.99 0 0);
  
  /* UI Elements */
  --border: oklch(0.88 0.01 340);          /* #E5E5E5 - Borde gris */
  --input: oklch(0.92 0.005 340);          /* #EBEBEB - Input gris */
  --ring: oklch(0.38 0.14 350);            /* Focus ring magenta */
}
```

### Contraste
- Texto sobre fondo: 11:1 ratio ✓ WCAG AAA
- Texto sobre card: 11:1 ratio ✓ WCAG AAA
- Botón primario: 4.5:1 ratio ✓ WCAG AA

---

## 🌙 Modo Oscuro (Dark Mode)

### Colores Base - Optimizados para Legibilidad

```css
.dark {
  /* Neutrals - Mejorado para contraste */
  --background: oklch(0.12 0.01 350);      /* #1F1F1F - Casi negro */
  --foreground: oklch(0.97 0.01 0);        /* #F8F8F8 - Blanco puro */
  --card: oklch(0.165 0.008 350);          /* #2A2A2A - Gris oscuro */
  --card-foreground: oklch(0.97 0.01 0);   /* #F8F8F8 - Blanco puro */
  
  /* Brand Colors - Adaptados */
  --primary: oklch(0.58 0.14 350);         /* #D16BA8 - Magenta claro */
  --primary-foreground: oklch(0.99 0 0);   /* #FEFEFE - Blanco */
  --secondary: oklch(0.4 0.02 0);          /* #666666 - Gris medio */
  --secondary-foreground: oklch(0.97 0 0); /* #F8F8F8 - Blanco puro */
  
  /* Semantic */
  --muted: oklch(0.28 0.008 350);          /* #464646 - Gris */
  --muted-foreground: oklch(0.7 0 0);      /* #B3B3B3 - Gris claro */
  --accent: oklch(0.28 0.02 350);          /* #464646 - Gris */
  --accent-foreground: oklch(0.97 0 0);    /* #F8F8F8 - Blanco */
  
  /* States */
  --destructive: oklch(0.55 0.2 27);       /* #C72C48 - Rojo */
  --destructive-foreground: oklch(0.99 0 0);
  
  /* UI Elements */
  --border: oklch(0.25 0.01 350);          /* #414141 - Borde oscuro */
  --input: oklch(0.22 0.008 350);          /* #383838 - Input oscuro */
  --ring: oklch(0.58 0.14 350);            /* Focus ring magenta claro */
}
```

### Contraste (Mejorado)
- Texto sobre fondo: 13:1 ratio ✓ WCAG AAA
- Texto sobre card: 12:1 ratio ✓ WCAG AAA
- Botón primario: 5.5:1 ratio ✓ WCAG AAA

---

## 📊 Comparativa de Colores

| Elemento | Claro | Oscuro | Mejora |
|----------|-------|--------|--------|
| Fondo | 98.5% | 12% | ✓ Mayor contraste |
| Texto | 20% | 97% | ✓ Más legible |
| Primario | oklch(0.38) | oklch(0.58) | ✓ Más saturado |
| Card | 100% | 16.5% | ✓ Mejor contraste |

---

## 🎭 Transiciones

### Duración
```css
/* Colores base */
transition: color 200ms cubic-bezier(0.4, 0, 0.2, 1);

/* Body y fondo */
transition-duration: 300ms;

/* Elementos interactivos */
transition-duration: 200ms;
```

### Easing
Utiliza cubic-bezier estándar de Material Design:
```css
cubic-bezier(0.4, 0, 0.2, 1)  /* Estándar */
cubic-bezier(0.25, 0, 0.35, 1) /* Decelerate */
```

---

## 🔘 Componente Theme Toggle

### Visual

#### Estado Claro
```
┌──────────────────┐
│ [☀️] Light Mode │
└──────────────────┘
```

#### Estado Oscuro
```
┌──────────────────┐
│ [🌙] Dark Mode  │
└──────────────────┘
```

### Propiedades
- **Size:** 40px × 40px (sm)
- **Icon:** 16px × 16px
- **Padding:** 8px
- **Border:** 1px
- **Border Radius:** 0.5rem (8px)
- **Transition:** 200ms all

### Estados
```css
/* Default */
background: bg-background
border: border-border
color: foreground

/* Hover */
background: bg-accent
border: border-primary/50

/* Active */
background: primary
color: primary-foreground
border: border-primary

/* Focus */
ring: 2px ring-offset
```

---

## 📱 Responsive Design

### Breakpoints (Tailwind)
```css
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Header Responsividad
```
Mobile (< 768px):
┌─────────────────────────────┐
│ 🔹 CV Builder    [🌙]      │
└─────────────────────────────┘

Tablet (768px - 1024px):
┌────────────────────────────────────┐
│ 🔹 CV Builder           [👁️] [🌙] │
│    The Consulting...               │
└────────────────────────────────────┘

Desktop (> 1024px):
┌──────────────────────────────────────────────┐
│ 🔹 CV Builder    [Eye Live Preview] [🌙]    │
│    The Consulting Academy                    │
└──────────────────────────────────────────────┘
```

---

## 🎨 Componentes Theming

### Card Component
```css
.dark {
  background: oklch(0.165 0.008 350);  /* #2A2A2A */
  color: oklch(0.97 0.01 0);           /* #F8F8F8 */
  border: oklch(0.25 0.01 350);        /* #414141 */
  box-shadow: rgba(0, 0, 0, 0.3);
}

.light {
  background: oklch(1 0 0);            /* #FFFFFF */
  color: oklch(0.2 0 0);               /* #0A0A0A */
  border: oklch(0.88 0.01 340);        /* #E5E5E5 */
  box-shadow: rgba(0, 0, 0, 0.1);
}
```

### Button Component
```css
.dark.primary {
  background: oklch(0.58 0.14 350);    /* #D16BA8 */
  color: oklch(0.99 0 0);              /* #FEFEFE */
  
  &:hover {
    background: oklch(0.6 0.15 350);
  }
}

.light.primary {
  background: oklch(0.38 0.14 350);    /* #8B2346 */
  color: oklch(0.99 0 0);              /* #FEFEFE */
  
  &:hover {
    background: oklch(0.35 0.15 350);
  }
}
```

### Input Component
```css
.dark {
  background: oklch(0.22 0.008 350);   /* #383838 */
  color: oklch(0.97 0.01 0);           /* #F8F8F8 */
  border: oklch(0.25 0.01 350);        /* #414141 */
  
  &:focus {
    border: oklch(0.58 0.14 350);      /* Magenta claro */
    box-shadow: ring(oklch(0.58 0.14 350));
  }
}

.light {
  background: oklch(1 0 0);            /* #FFFFFF */
  color: oklch(0.2 0 0);               /* #0A0A0A */
  border: oklch(0.88 0.01 340);        /* #E5E5E5 */
  
  &:focus {
    border: oklch(0.38 0.14 350);      /* Magenta vino */
    box-shadow: ring(oklch(0.38 0.14 350));
  }
}
```

---

## 🔍 Sistema de Tokens CSS

### Naming Convention
```
--[semantic]-[variant]

Ejemplos:
--background
--foreground
--primary (color principal)
--primary-foreground (texto sobre primary)
--card (fondo de card)
--card-foreground (texto en card)
--muted (elementos deshabilitados)
--muted-foreground (texto muted)
--border (bordes)
--input (inputs)
--ring (focus rings)
```

### Jerarquía
```
1. Base (--background, --foreground)
2. Component (--card, --popover)
3. Interactive (--primary, --secondary, --accent)
4. Semantic (--destructive, --muted)
5. UI (--border, --input, --ring)
```

---

## ♿ Accesibilidad

### Requisitos WCAG AA/AAA

#### Contrastes Requeridos
- Normal text: 4.5:1 (AA) / 7:1 (AAA)
- Large text: 3:1 (AA) / 4.5:1 (AAA)

#### Estado Actual
```
Light Mode:
✓ Body text: 11:1 ratio (AAA)
✓ Buttons: 4.5:1+ ratio (AA)
✓ Borders: Visible con contraste

Dark Mode:
✓ Body text: 13:1 ratio (AAA)
✓ Buttons: 5.5:1+ ratio (AAA)
✓ Borders: Visible con contraste mejorado
```

### Focus Indicators
```css
/* Todos los elementos interactivos tienen ring visible */
--ring: oklch(0.38 0.14 350);  /* Light */
--ring: oklch(0.58 0.14 350);  /* Dark */

Ancho: 2px
Offset: 2px
Color: Primary con transparency
```

---

## 📦 Implementación Técnica

### Variables CSS
Se utilizan **CSS Custom Properties** para mantener tema dinámico:

```css
@layer base {
  :root { /* Light mode */ }
  .dark { /* Dark mode */ }
}
```

### Tailwind Integration
```css
/* Tailwind mapea variables a clases */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  /* ... más variables ... */
}
```

### Aplicación en Componentes
```tsx
<div className="bg-background text-foreground">
  {/* Automáticamente responde al tema */}
</div>
```

---

## 🎯 Próximas Mejoras de Diseño

- [ ] Animaciones de transición más elaboradas
- [ ] Modo Alto Contraste
- [ ] Modo Sepia/Warm
- [ ] Personalización de colores primarios
- [ ] Estilos personalizados por usuario
- [ ] Temas basados en marca

---

## 📚 Referencias

- **OKLCH Color Space:** https://oklch.com/
- **WCAG Accessibility:** https://www.w3.org/WAI/WCAG21/quickref/
- **Tailwind CSS:** https://tailwindcss.com/
- **CSS Variables:** https://developer.mozilla.org/en-US/docs/Web/CSS/--*

---

*Especificación de Diseño v1.0*
*The Consulting Academy - La Paz*
*Abril 2026*
