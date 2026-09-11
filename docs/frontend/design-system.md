# MOBEX Auto Parts — Storefront Design System (Phase M5)

## 1. Design Philosophy & Aesthetic Principles

The MOBEX Storefront Design System is engineered to deliver a **technical, authoritative, trustworthy, and modern automotive experience**. It deliberately rejects cheap marketplace cliches, decorative noise, and fake social proof in favor of clean OEM engineering precision.

```
┌─────────────────────────────────────────────────────────────┐
│                       DESIGN PILLARS                        │
├─────────────────┬───────────────────┬───────────────────────┤
│  TECHNICAL &    │   DETERMINISTIC   │    RESPONSIVE-FIRST   │
│  AUTHORITATIVE  │    COMPATIBILITY  │      ACCESSIBILITY    │
│  Noto Sans Thai │  Emerald / Rose   │  Mobile to 4K Ultra   │
│  + Inter Mono   │  Reason Codes     │  WCAG 2.1 AA Compliant│
└─────────────────┴───────────────────┴───────────────────────┘
```

---

## 2. Typography Scale

The storefront is **Thai-First** with precision English, SKU, and technical number formatting.

| Style Role | Font Family | Weight | Size (Desktop / Mobile) | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `Noto Sans Thai`, `Inter` | Black (900) | 48px / 30px | Homepage hero value proposition |
| **Heading 1 (H1)** | `Noto Sans Thai`, `Inter` | ExtraBold (800) | 30px / 22px | Product titles, major section headers |
| **Heading 2 (H2)** | `Noto Sans Thai`, `Inter` | Bold (700) | 24px / 18px | Category sections, detail headings |
| **Heading 3 (H3)** | `Noto Sans Thai`, `Inter` | Bold (700) | 18px / 15px | Card titles, modal headers |
| **Body Default** | `Noto Sans Thai`, `Inter` | Regular (400) | 14px / 13px | Paragraphs, product descriptions |
| **Body Small** | `Noto Sans Thai`, `Inter` | Medium (500) | 12px / 11px | Meta captions, helper texts |
| **Technical / SKU** | `Inter`, monospace | Bold (700) | 12px / 11px | SKUs, OEM part numbers, chassis codes |
| **Price Hero** | `Inter`, `Noto Sans Thai` | ExtraBold (800) | 28px / 20px | Authoritative server price in THB |

---

## 3. Color Palette & Semantic Tokens

### 3.1 Neutral Foundation (Carbon & Slate)
- `slate-950` (`#020617`): Deep carbon header, footer, and hero background.
- `slate-900` (`#0f172a`): High-contrast card surfaces, primary vehicle selector.
- `slate-800` (`#1e293b`): Subtle dark borders, interactive dark hover states.
- `slate-700` (`#334155`): Secondary text on dark backgrounds.
- `slate-500` / `slate-400` (`#64748b` / `#94a3b8`): Metadata, breadcrumbs, unselected states.
- `slate-200` (`#e2e8f0`): Card borders, dividers, subtle outlines.
- `slate-50` (`#f8fafc`): Main storefront page background.

### 3.2 Brand Accent (Racing Cobalt)
- `brand-600` (`#2563eb`): Primary CTA buttons, active category pills, brand focus rings.
- `brand-500` (`#3b82f6`): Hover highlights, glowing vehicle selector indicators.
- `brand-50` (`#eff6ff`): Subtle background tint for selected filter rows.

### 3.3 Semantic Fitment States
- **Compatible** (`fitment-compatible`):
  - Text/Icon: `#059669` (Emerald 600)
  - Surface: `#ecfdf5` (Emerald 50)
  - Border: `#a7f3d0` (Emerald 200)
- **Incompatible** (`fitment-incompatible`):
  - Text/Icon: `#dc2626` (Rose 600)
  - Surface: `#fef2f2` (Rose 50)
  - Border: `#fecaca` (Rose 200)
- **Insufficient / Information** (`fitment-warning`):
  - Text/Icon: `#d97706` (Amber 600)
  - Surface: `#fffbeb` (Amber 50)
  - Border: `#fde68a` (Amber 200)

---

## 4. Reusable Component Matrix

| Component | Path | Functionality |
| :--- | :--- | :--- |
| `Navbar` | `src/components/layout/Navbar.jsx` | Global header, search bar, active vehicle badge, user session menu |
| `Footer` | `src/components/layout/Footer.jsx` | Trust statements, OEM brand links, technical hotline contact |
| `VehicleSelector` | `src/components/vehicle/VehicleSelector.jsx` | 5-level cascading guided vehicle selector with loading states |
| `VehicleContextBar` | `src/components/vehicle/VehicleContextBar.jsx` | Persistent context bar showing active vehicle and quick reset |
| `VehicleBadge` | `src/components/vehicle/VehicleBadge.jsx` | Compact active vehicle tag for header and mobile drawers |
| `ProductCard` | `src/components/product/ProductCard.jsx` | Technical product card with image, brand, fitment badge, and price |
| `ProductGrid` | `src/components/product/ProductGrid.jsx` | Responsive 2-col (mobile) / 4-col (desktop) grid with skeletons |
| `CompatibilityBadge` | `src/components/product/CompatibilityBadge.jsx` | Deterministic compatibility indicator with human-readable Thai text |
| `PriceDisplay` | `src/components/product/PriceDisplay.jsx` | Server-authoritative THB price renderer with compare-at support |
| `CategoryNav` | `src/components/category/CategoryNav.jsx` | Horizontal scrollable category tree loaded from API |
| `ProductFilters` | `src/components/filters/ProductFilters.jsx` | Desktop sidebar & mobile bottom sheet with category, brand, and sort |
| `Skeleton` | `src/components/ui/Skeleton.jsx` | Shimmer loading placeholders for cards, filters, and selectors |
| `EmptyState` | `src/components/ui/EmptyState.jsx` | Custom empty views for no compatible parts, search empty, or no vehicle |
| `ErrorState` | `src/components/ui/ErrorState.jsx` | Graceful error banner with retry trigger |

---

## 5. Accessibility & Motion Guidelines
- **WCAG 2.1 AA Contrast**: All text elements meet a minimum 4.5:1 contrast ratio against their respective surfaces.
- **Keyboard Navigation**: All interactive elements (product cards, vehicle selects, category pills) have visible focus rings (`focus:ring-2 focus:ring-brand-500`).
- **Motion Reduction**: All animations and shimmers respect `prefers-reduced-motion: reduce`.
