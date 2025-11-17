# Mobile-First Responsive CSS Patterns Guide
## Quick Reference for Bloem Platform Developers

### Responsive Breakpoints
```typescript
// Updated Tailwind screens config
screens: {
  'xs': '375px',    // iPhone 13 (mobile first)
  'sm': '640px',    // Tablet portrait
  'md': '768px',    // iPad Mini / tablet landscape
  'lg': '1024px',   // iPad landscape / small laptops
  'xl': '1280px',   // Desktop
  '2xl': '1440px',  // Laptop standard
}
```

---

## Component Sizing

### Buttons
```tsx
// Default sizes by use case:
<Button size="default">Standard Button</Button>      // h-10 (40px)
<Button size="lg">Primary CTA on Mobile</Button>    // h-12 (48px) ✅ SAFE
<Button size="icon">Icon Button</Button>             // h-11 w-11 (44px) ✅ SAFE
<Button size="icon-sm">Subtle Icon</Button>         // h-10 w-10 (40px)

// Applied to mobile:
<Button size="lg" className="h-11 md:h-12">
  Responsive button
</Button>
```

### Input Fields
```tsx
// Mobile-first heights:
<input className="h-11 md:h-10" />
// Explanation: 44px on mobile (safe), 40px on desktop (comfortable)

// Full example:
className={cn(
  "flex h-11 md:h-10 w-full rounded-md border border-input",
  className,
)}
```

### Navigation & Interactive Elements
```tsx
// Ensure 44px minimum spacing for touch:
<button className="h-11 w-11 p-0 flex items-center justify-center">
  <Icon className="h-5 w-5" />
</button>

// Spacing around touch targets:
<div className="flex items-center gap-3 sm:gap-4 md:gap-6">
  {/* Gaps scale up as screen size increases */}
</div>
```

---

## Responsive Padding & Margins

### Container Padding Pattern
```tsx
// Mobile-first approach:
className="px-4 sm:px-6 lg:px-8"
// 16px (mobile) → 24px (tablet) → 32px (desktop)

// Vertical spacing:
className="py-6 sm:py-8 md:py-12 lg:py-16"
// Increases spacing as screens get larger
```

### Section Spacing
```tsx
// Hero sections, main containers:
<section className="py-12 sm:py-16 md:py-20 lg:py-24">
  {/* Content gets more breathing room on larger screens */}
</section>
```

### Grid Gap Scaling
```tsx
// Browse page grid example:
<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
  {/* Gap: 12px → 16px → 20px → 24px */}
</div>
```

---

## Responsive Grid Patterns

### Basic Responsive Grid
```tsx
// Mobile-first grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 col → 2 cols → 3 cols */}
</div>

// With gap scaling
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
  {/* Fewer items per row on small screens, more on large */}
</div>
```

### Product Grid (Like Bloem)
```tsx
<div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Breakdowns:
// 375px (xs):   1 column, 12px gap
// 640px (sm):   2 columns, 16px gap
// 768px (md):   2 columns, 20px gap
// 1024px (lg):  3 columns, 24px gap
```

---

## Responsive Hiding/Showing

### Hide on Mobile, Show on Desktop
```tsx
// Desktop only content
<div className="hidden lg:block">
  {/* Large filter sidebar, only on laptops */}
</div>

// Mobile only content
<div className="lg:hidden">
  {/* Mobile filter drawer, hidden on desktop */}
</div>
```

### Conditional Rendering by Breakpoint
```tsx
// Show mobile navigation, hide on desktop
className="md:hidden"      // Show mobile version

// Show desktop navigation, hide on mobile
className="hidden md:flex" // Show desktop, hide mobile

// Typical pattern:
{/* Mobile Menu */}
<Sheet className="md:hidden">
  {/* Mobile drawer content */}
</Sheet>

{/* Desktop Menu */}
<nav className="hidden md:flex">
  {/* Desktop navigation */}
</nav>
```

---

## Typography Scaling

### Responsive Font Sizes
```tsx
// Standard pattern:
className="text-sm sm:text-base md:text-lg lg:text-xl"

// Headings:
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Large Heading
</h1>

// Body text:
<p className="text-xs sm:text-sm md:text-base">
  Regular paragraph
</p>
```

### Responsive Line Height
```tsx
// Improves readability on different screens
className="text-base leading-relaxed sm:leading-loose"
```

---

## Responsive Images

### Lazy Loading Pattern
```tsx
// All product images should lazy-load:
<img 
  src={imageUrl}
  alt={description}
  loading="lazy"           // Lazy load
  decoding="async"         // Non-blocking render
  className="w-full h-full object-cover"
/>

// For images above the fold (hero, featured):
<img 
  src={heroImage}
  alt="Hero"
  loading="eager"          // Prioritize load
  decoding="async"
  className="w-full"
/>
```

### Responsive Image Containers
```tsx
// Card image (4:5 aspect for fashion):
<div className="aspect-[4/5] bg-muted overflow-hidden">
  <img 
    src={image} 
    alt={title}
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>

// Hero image (16:9 aspect):
<div className="aspect-video bg-muted overflow-hidden">
  <img 
    src={image}
    alt={title}
    className="w-full h-full object-cover"
    loading="eager"
  />
</div>

// Thumbnail (square):
<div className="aspect-square bg-muted overflow-hidden">
  <img 
    src={image}
    alt={title}
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>
```

---

## Forms - Mobile-Optimized

### Input Group
```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email Address</Label>
  <Input
    id="email"
    type="email"
    placeholder="your@email.com"
    className="h-11 md:h-10"  // Responsive height
  />
  <p className="text-xs text-muted-foreground">
    We'll never share your email
  </p>
</div>
```

### Form Layout
```tsx
// Stack on mobile, grid on desktop:
<form className="space-y-4">
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <Input placeholder="First Name" className="h-11 md:h-10" />
    <Input placeholder="Last Name" className="h-11 md:h-10" />
  </div>
  <Input placeholder="Email" className="h-11 md:h-10" />
  <Button className="w-full h-12">Submit</Button>
</form>
```

### Checkbox/Radio Accessibility
```tsx
// Ensure checkboxes have 44px touch targets:
<div className="flex items-center h-11 space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms" className="cursor-pointer">
    I agree to terms
  </Label>
</div>
```

---

## Navigation Patterns

### Mobile Menu Drawer
```tsx
// Use Sheet component for mobile drawer:
<Sheet>
  <SheetTrigger asChild className="md:hidden">
    <Button variant="ghost" size="icon" className="h-11 w-11">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-64">
    <nav className="flex flex-col space-y-4 mt-8">
      {/* Menu items - use h-11 for touch targets */}
      <Link to="/browse">
        <button className="w-full text-left py-2 h-11 flex items-center">
          Browse
        </button>
      </Link>
    </nav>
  </SheetContent>
</Sheet>
```

### Sticky Header
```tsx
<header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur">
  <div className="container flex h-16 md:h-16 items-center justify-between">
    {/* Header content */}
  </div>
</header>
```

---

## Animation Patterns

### Motion Accessibility
```css
/* Respect user's motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Recommended Animation Durations
```tsx
// Fast feedback (150ms):
className="transition-colors duration-150 hover:bg-accent"

// Standard transition (200ms):
className="transition-all duration-200 hover:shadow-lg"

// Slower animation (300ms):
className="transition-transform duration-300 ease-out"

// Avoid on mobile:
// - Long animations (>300ms)
// - Complex choreography
// - Auto-playing video/animation
```

---

## Layout Patterns

### Two-Column Layout (Sidebar)
```tsx
<div className="flex flex-col lg:flex-row gap-6">
  {/* Mobile: stacked vertical, Desktop: side-by-side */}
  
  <aside className="hidden lg:block w-64 shrink-0">
    {/* Desktop sidebar - 256px width */}
  </aside>
  
  <main className="flex-1 min-w-0">
    {/* Main content - flex to fill available space */}
  </main>
</div>
```

### Max-Width Container
```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content stays readable, scales with screen */}
  {/* Max width: 80rem = 1280px content area */}
</div>
```

### Flex Wrapping
```tsx
// Buttons that wrap on mobile, inline on desktop:
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <Button className="flex-1">Option 1</Button>
  <Button className="flex-1">Option 2</Button>
</div>
```

---

## Common Mobile-Friendly Anti-patterns ❌

### ❌ Avoid Fixed Widths on Mobile
```tsx
// BAD:
<div className="w-300">Content</div>

// GOOD:
<div className="w-full px-4">Content</div>
```

### ❌ Avoid Touch Targets < 44px
```tsx
// BAD:
<button className="h-8 w-8">X</button>

// GOOD:
<button className="h-11 w-11">X</button>
```

### ❌ Avoid 100vh on Mobile
```tsx
// BAD (includes address bar):
<div className="h-screen">Content</div>

// GOOD:
<div className="min-h-screen">Content</div>
```

### ❌ Avoid Horizontal Scrolling
```tsx
// BAD:
<div className="w-max overflow-x-auto">
  <table className="w-full" />
</div>

// GOOD:
<div className="overflow-x-auto">
  <table className="min-w-full" />
</div>
```

---

## Testing Responsive Design

### Browser DevTools
1. Open DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Select device or custom dimensions
4. Test at: 375px, 768px, 1024px, 1440px

### Lighthouse Mobile Audit
```bash
# Chrome DevTools → Lighthouse tab → Mobile
# Or command line:
lighthouse https://bloem.shop --view
```

### Real Device Testing
- Always test on actual iOS/Android devices
- Check touch targets in landscape orientation
- Test forms with on-screen keyboard
- Verify lazy loading on slow 4G

---

## Performance Tips

### Image Loading Strategy
```tsx
// Above-fold (hero, banner):
loading="eager"    // Load immediately

// Below-fold (products, lists):
loading="lazy"     // Load when needed

// All images:
decoding="async"   // Non-blocking render
```

### Code Splitting Opportunity
```typescript
// Current: Everything bundled (868 kB)
// Future: Split by route
const Browse = lazy(() => import('./pages/Browse'));
const Cart = lazy(() => import('./pages/Cart'));
const Admin = lazy(() => import('./pages/admin/AdminDashboard'));

// Can reduce initial load by 40-50%
```

---

## Files to Reference

- **Tailwind Config:** `tailwind.config.ts` - All breakpoints, spacing, colors
- **Global Styles:** `src/index.css` - prefers-reduced-motion, design system
- **Button Component:** `src/components/ui/button.tsx` - Size variants
- **Input Component:** `src/components/ui/input.tsx` - Responsive heights
- **Header Component:** `src/components/layout/Header.tsx` - Mobile nav pattern
- **Browse Page:** `src/pages/Browse.tsx` - Grid, filter drawer example
- **Item Card:** `src/components/cards/ItemCard.tsx` - Image optimization pattern
- **Mobile Filter Drawer:** `src/components/MobileFilterDrawer.tsx` - Mobile pattern
- **Responsive Image:** `src/components/ResponsiveImage.tsx` - Lazy loading pattern

---

## Quick Copy-Paste Snippets

### Responsive Button
```tsx
<Button 
  size="lg"
  className="h-11 md:h-12 w-full"
  onClick={handleClick}
>
  Call to Action
</Button>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
  {items.map(item => <ItemCard key={item.id} {...item} />)}
</div>
```

### Responsive Form Input
```tsx
<input 
  className="h-11 md:h-10 px-3 py-2 border rounded-md"
  type="text"
  placeholder="Enter text..."
/>
```

### Mobile Menu
```tsx
<Sheet className="md:hidden">
  <SheetTrigger asChild>
    <Button variant="ghost" size="icon" className="h-11 w-11">
      <Menu className="h-5 w-5" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-64">
    {/* Menu items */}
  </SheetContent>
</Sheet>
```

### Lazy-Load Image
```tsx
<img 
  src={imageUrl}
  alt={description}
  loading="lazy"
  decoding="async"
  className="w-full h-full object-cover"
/>
```

---

**Last Updated:** November 17, 2025  
**Maintainer:** AI Engineering Collaborator  
**Status:** ✅ Production Ready
