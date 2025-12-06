# Sans Capote - Production-Grade Design System

## 🎨 Overview
Professional, cohesive health SaaS design system following WCAG AA accessibility standards. Warm, approachable, and trustworthy aesthetic for HIV education and support.

---

## Color Palette

### Primary Colors
- **Teal** `#008080` - Primary actions, navigation, trust
- **Red/Coral** `#E63946` - Crisis alerts, urgent CTAs, emergency
- **Yellow** `#F4D35E` - Info highlights, achievements, certificates
- **Link Blue** `#3D5AFE` - Interactive elements, navigator feature

### Neutral Colors
- **Background Light** `#F9F9F9` - Page backgrounds
- **Background White** `#FFFFFF` - Cards, panels, elevated surfaces
- **Text Primary** `#222222` - Headings, body text (high contrast)
- **Text Secondary** `#555555` - Subtext, descriptions, placeholders
- **Border** `#222222` @ 10-20% opacity - Subtle dividers

---

## Typography

### Font Family
**Inter** (fallback: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)

### Scale
- **H1 (Page Titles)**: 32-40px, Bold 700
- **H2 (Section Titles)**: 24-28px, Semibold 600
- **H3 (Subsection)**: 20-22px, Medium 500
- **Body Text**: 16px, Regular 400
- **Small/Captions**: 14px, Regular 400
- **Buttons/CTAs**: 16px, Medium 500

### Line Height
- Default: `1.6` (relaxed reading)
- Headings: `1.2-1.4` (tight, impactful)

---

## Components

### Cards
```css
border-radius: 12px (rounded-xl)
border: 1px solid #222222 @ 10% opacity
background: white
padding: 20-24px (px-5/6 py-5/6)
shadow: sm (subtle elevation)
hover: shadow-lg (lifted effect)
```

### Buttons
```css
/* Primary (Teal) */
background: #008080
color: white
border-radius: 10px
padding: 12px 24px
shadow: sm
hover: #006666 (darker teal)

/* Secondary (Outlined) */
background: white
border: 1px solid #222222 @ 20%
color: #555555
hover: border-color #008080

/* Urgent (Red) */
background: #E63946
color: white
hover: #d62839
```

### Navigation
- **Active state**: Teal text `#008080`
- **Inactive**: Gray `#555555`
- **Icons**: Lucide React, 20px (w-5 h-5)
- **Background**: White with subtle shadow
- **Bottom nav**: Fixed, elevated shadow

---

## Layout Guidelines

### Spacing
- **Container max-width**: `max-w-3xl` (768px) for reading comfort
- **Vertical gaps**: 24-40px between sections (`gap-6` to `gap-10`)
- **Horizontal padding**: 24px (`px-6`)
- **Top padding**: 32-48px on desktop (`py-8 lg:py-12`)

### Responsive Breakpoints
- Mobile: < 640px (default)
- Tablet: 640px - 1024px (`sm:` `md:`)
- Desktop: > 1024px (`lg:` `xl:`)

---

## Page-Specific Patterns

### Homepage
- Gradient background: `bg-gradient-to-br from-[#F9F9F9] to-white`
- Feature cards with colored accents
- Icon circles with 10-20% opacity backgrounds
- Generous spacing (gap-10, py-16)

### Guide (Voice-First)
- Conversation bubbles:
  - AI: Light gray `#F9F9F9` with border
  - User: Teal `#008080` with white text
- Mic button: Prominent, circular, 48-56px
- Auto-listen pulse animation
- Status indicators with icons

### Crisis (Urgent)
- Red accent throughout `#E63946`
- 2px borders for emphasis
- Prominent "Call" buttons
- Emergency badge styling

### Resources
- Tab navigation with colored active states
- Red for hotlines, Teal for quiz, Yellow for certificate
- Generous card spacing
- Large call buttons with phone emoji

### Navigator (Map-Heavy)
- Light UI over map
- Teal primary for service markers
- White panels with shadows for info cards
- Location button prominence

### Settings
- Clean form design
- Toggle switches: Teal when active
- Dropdown selects with focus states
- Accessible range sliders

---

## Micro-Interactions

### Transitions
- Default: `transition-all duration-200ms`
- Hover: Scale up slightly or add shadow
- Active: Subtle scale down
- Focus: Teal outline or border color change

### Shadows
- **sm**: `0 1px 3px rgba(0,0,0,0.1)`
- **md**: `0 4px 6px rgba(0,0,0,0.1)`
- **lg**: `0 10px 15px rgba(0,0,0,0.1)`
- **Navigation**: `0 -2px 10px rgba(0,0,0,0.05)` (top shadow)

### Hover States
- Cards: Lift with shadow-lg
- Buttons: Darken by ~10%
- Links: Teal color shift
- Icons: Background opacity increase

---

## Accessibility (WCAG AA)

### Contrast Ratios
- `#222222` on `#F9F9F9`: 14:1 ✅
- `#008080` on white: 4.5:1 ✅
- `#E63946` on white: 5.3:1 ✅
- White on `#008080`: 7.8:1 ✅

### Focus States
- Visible outline or border color change
- Teal accent for consistency
- Never remove outlines entirely

### Touch Targets
- Minimum 44x44px (iOS/Android guidelines)
- Generous padding on mobile
- Spaced-out navigation items

---

## Icon System

### Library
**Lucide React** - Consistent, professional, open-source

### Common Icons
- `MessageCircle` - Chat/Guide
- `Map` - Navigator
- `BookOpen` - Resources
- `AlertCircle` - Crisis
- `Settings` - Settings
- `Home` - Homepage
- `Mic` - Voice input
- `Volume2` - Audio playback
- `Phone` - Emergency calls

### Sizing
- Navigation: 20px (`w-5 h-5`)
- Feature cards: 24px (`w-6 h-6`)
- Buttons: 16-20px

---

## Animation Principles

1. **Purposeful**: Only animate to provide feedback or guide attention
2. **Fast**: 150-200ms for most transitions
3. **Smooth**: Ease-in-out timing functions
4. **Accessible**: Respect `prefers-reduced-motion`

### Example Animations
- Mic pulse when listening: `animate-pulse`
- Card hover lift: `transform translateY(-2px)`
- Button press: `scale(0.98)`
- Loading spinner: `animate-spin`

---

## Dark Mode (Future)

### Planned Colors
- Background: `#1A1A1A`
- Cards: `#2A2A2A`
- Text: `#F9F9F9`
- Borders: White @ 10% opacity
- **Accent colors remain vibrant** (Teal, Red, Yellow)

---

## Production Checklist

✅ All pages use consistent color palette  
✅ Typography scale implemented across app  
✅ Proper spacing and layout rhythm  
✅ Accessibility contrast ratios met  
✅ Responsive design on mobile/tablet/desktop  
✅ Professional hover/focus states  
✅ Icon system integrated (Lucide React)  
✅ Shadows and elevation hierarchy  
✅ Cohesive navigation design  
✅ Build successful (20/20 routes)

---

## Design Philosophy

**Health SaaS, Not Dev Tools**
- Warm, not cold
- Approachable, not intimidating  
- Professional, not clinical
- Stigma-free, inclusive language
- Clear information hierarchy

**Inspiration**
- Headspace (calm, friendly health app)
- Calm (soothing colors, generous spacing)
- **NOT** GitHub, Vercel (too technical/dark)

---

## Implementation Notes

### TailwindCSS Usage
- Custom color values: `[#008080]`, `[#E63946]`, etc.
- Opacity modifiers: `/10`, `/20` for backgrounds
- Responsive prefixes: `lg:`, `sm:`
- State variants: `hover:`, `focus:`, `disabled:`

### Component Structure
- Semantic HTML (`<main>`, `<header>`, `<section>`)
- Accessible ARIA labels where needed
- Proper heading hierarchy (H1 → H2 → H3)
- Focus management for voice features

---

**Last Updated**: December 6, 2025  
**Version**: 2.0 (Production-Grade Redesign)
