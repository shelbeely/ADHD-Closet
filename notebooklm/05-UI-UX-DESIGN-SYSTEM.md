# Wardrobe AI Closet - UI/UX Design System

## Design Philosophy

Wardrobe AI Closet uses **Material Design 3 Expressive** combined with **ADHD-optimized UX patterns** to create an interface that is both beautiful and highly functional for neurodivergent users.

## Screenshots

### Mobile Experience

![Mobile Main View](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-mobile-view.png)
*Mobile main view with category-first navigation*

![Mobile Menu](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/mobile-menu-open.png)
*Mobile menu with quick access to all features*

![Outfit Generator Mobile](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/outfits-generate-mobile.png)
*Outfit generator on mobile with constraint selection*

![Fit Guide Mobile](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/guide-page-mobile.png)
*Built-in fit and proportion guide on mobile*

### Desktop Experience

![Desktop Main View](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-desktop-empty.png)
*Desktop view with filters and table layout*

![Outfit Generator Desktop](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/outfits-generate-desktop.png)
*Outfit generator on desktop with full constraint options*

## Material Design 3 Implementation

### Color System

The app uses Material Design 3's dynamic color system with custom tokens defined in `app/globals.css`:

#### Primary Colors
- `--md-sys-color-primary`: Main brand color
- `--md-sys-color-on-primary`: Text on primary surfaces
- `--md-sys-color-primary-container`: Lighter primary variant
- `--md-sys-color-on-primary-container`: Text on primary containers

#### Secondary Colors
- `--md-sys-color-secondary`: Secondary accent color
- `--md-sys-color-on-secondary`: Text on secondary surfaces
- `--md-sys-color-secondary-container`: Lighter secondary variant
- `--md-sys-color-on-secondary-container`: Text on secondary containers

#### Surface Colors
- `--md-sys-color-surface`: Main background surface
- `--md-sys-color-on-surface`: Text on surface
- `--md-sys-color-surface-variant`: Alternative surface
- `--md-sys-color-on-surface-variant`: Text on surface variant

#### Semantic Colors
- `--md-sys-color-error`: Error states
- `--md-sys-color-on-error`: Text on error surfaces
- `--md-sys-color-error-container`: Error background
- `--md-sys-color-on-error-container`: Text on error background

#### Usage in Code
```css
.button-primary {
  background-color: var(--md-sys-color-primary);
  color: var(--md-sys-color-on-primary);
}

.card {
  background-color: var(--md-sys-color-surface);
  color: var(--md-sys-color-on-surface);
}
```

### Shape System

Material Design 3 emphasizes rounded, expressive shapes:

#### Border Radius Scale
- **Small**: 8px - Small components, chips
- **Medium**: 16px - Cards, buttons
- **Large**: 24px - Large cards, dialogs
- **Extra Large**: 28px - Hero elements

#### Tailwind Classes
```html
<button class="rounded-full">Primary Button</button>
<div class="rounded-3xl">Card Component</div>
<input class="rounded-xl">Text Input</input>
```

### Typography System

Clear typographic hierarchy using Material Design 3 type scale:

#### Display
- `text-display-large`: 57px / 64px line height (Hero headlines)
- `text-display-medium`: 45px / 52px (Section headers)
- `text-display-small`: 36px / 44px (Page titles)

#### Headline
- `text-headline-large`: 32px / 40px (Important headlines)
- `text-headline-medium`: 28px / 36px (Section titles)
- `text-headline-small`: 24px / 32px (Subsection titles)

#### Title
- `text-title-large`: 22px / 28px (Card titles)
- `text-title-medium`: 16px / 24px (List items)
- `text-title-small`: 14px / 20px (Dense lists)

#### Body
- `text-body-large`: 16px / 24px (Long-form content)
- `text-body-medium`: 14px / 20px (Standard body text)
- `text-body-small`: 12px / 16px (Captions, hints)

#### Label
- `text-label-large`: 14px / 20px (Button text)
- `text-label-medium`: 12px / 16px (Labels, tabs)
- `text-label-small`: 11px / 16px (Helper text)

### Elevation System

Material Design 3 uses elevation to create depth and hierarchy:

#### Shadow Utilities
- `shadow-elevation-1`: 1dp - Raised buttons, cards
- `shadow-elevation-2`: 3dp - Floating action buttons
- `shadow-elevation-3`: 6dp - Dialogs, menus
- `shadow-elevation-4`: 12dp - Modal overlays

#### Usage
```html
<div class="shadow-elevation-1">Card</div>
<button class="shadow-elevation-2">FAB</button>
<dialog class="shadow-elevation-3">Modal</dialog>
```

### Motion System

Smooth, meaningful transitions:

#### Duration
- **Fast**: 100ms - Small UI changes, hover states
- **Standard**: 200ms - Most transitions
- **Emphasized**: 300ms - Important state changes
- **Slow**: 400ms - Large layout shifts

#### Easing
- `ease-standard`: Cubic bezier for most animations
- `ease-emphasized`: Stronger emphasis for important changes
- `ease-decelerate`: Entry animations
- `ease-accelerate`: Exit animations

#### Example
```css
.transition-standard {
  transition: all 200ms cubic-bezier(0.4, 0.0, 0.2, 1);
}
```

## ADHD-Optimized UX Patterns

### 1. Minimal Friction

**Problem**: People with ADHD abandon complex workflows.

**Solutions Implemented**:
- **Auto-save**: All changes save immediately, no save button needed
- **No forced completion**: Can add partial information, fill in details later
- **Minimal steps**: Add an item in ~30 seconds with just one photo
- **Progressive disclosure**: Start simple, reveal complexity only when needed

**Example**: Adding an item
```
Step 1: Take/upload front photo (REQUIRED)
Step 2: Done! (Auto-saved)
Optional: Add back photo later
Optional: Add label photos later
Optional: Add tags later
```

### 2. Decision Paralysis Reducers

**Problem**: Too many choices cause overwhelm and inaction.

**Solutions Implemented**:
- **Limited choices**: Show 3-5 options max, never overwhelming lists
- **Panic Pick button**: Get instant outfit without any decisions
- **Guided workflows**: Clear next steps, no guessing
- **Smart defaults**: Pre-select common options
- **Ranked results**: Best option first, not equal choices

**Example**: Outfit Generator
```
Quick Mode: Panic Pick → Instant outfit in <5 seconds
Normal Mode: 3-5 constraint options → 3 ranked outfits
Advanced: Hide behind "More Options" button
```

### 3. Visual Clarity

**Problem**: Low contrast or cluttered interfaces are hard to process.

**Solutions Implemented**:
- **High contrast**: Text clearly readable in all modes
- **Obvious CTAs**: Primary actions are unmissable (large, high-contrast buttons)
- **Consistent patterns**: Same interactions work the same everywhere
- **Clear focus states**: Always know where keyboard focus is
- **Generous whitespace**: Elements don't crowd each other

**Color Contrast Requirements**:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- Interactive elements: 3:1 minimum

### 4. Time Blindness Support

**Problem**: Hard to estimate how long tasks take.

**Solutions Implemented**:
- **Time estimates**: "~30 seconds to add item"
- **Progress indicators**: "Step 2 of 3" or progress bars
- **Status visibility**: Always show if something is processing
- **Completion feedback**: Clear "Done!" messages
- **No hidden work**: Show when AI is processing

**Example**: AI Processing
```
Status: "Generating catalog image... ~20 seconds"
Progress: [████████░░] 80%
Result: "Done! ✓ Catalog image created"
```

### 5. Cognitive Load Reduction

**Problem**: Multiple competing tasks cause mental overload.

**Solutions Implemented**:
- **One thing at a time**: Single-column mobile flow
- **Category-first navigation**: Reduce choices by filtering early
- **Chunked information**: Break complex forms into sections
- **Clear sections**: Visual separation of different content areas
- **Hide advanced options**: Progressive disclosure for power features

**Example**: Item Form
```
Section 1: Photo (Required)
─────────
Section 2: Basic Info (Optional)
─────────
Section 3: Advanced Details (Collapsed by default)
```

### 6. Memory Support

**Problem**: Forgetting what you were doing or where things are.

**Solutions Implemented**:
- **Recent items**: Quick access to last viewed items
- **Prominent search**: Always visible, fast access
- **Breadcrumbs**: Always show where you are
- **State preservation**: Return to where you left off
- **Clear navigation**: Easy to find your way back

**Example**: Navigation
```
Home > Tops > [Item Name]
↑ Always visible, always clickable
```

### 7. Immediate Feedback

**Problem**: Delayed feedback causes uncertainty and repeat actions.

**Solutions Implemented**:
- **Instant responses**: <100ms for most interactions
- **Success confirmation**: Visual and text feedback for actions
- **Optimistic UI**: Show changes immediately, sync in background
- **Loading states**: Show spinners for >300ms operations
- **Error messages**: Clear, actionable error descriptions

**Example**: Save Feedback
```
User clicks save
→ Button shows checkmark immediately
→ "Saved!" toast appears
→ Background sync completes
→ Toast disappears after 3 seconds
```

### 8. Progressive Disclosure

**Problem**: Too much information upfront is overwhelming.

**Solutions Implemented**:
- **Start minimal**: Show only essential options
- **Expand on request**: "More options" buttons reveal advanced features
- **Contextual help**: Show tips only when relevant
- **Collapsible sections**: Hide details until needed
- **Smart defaults**: Most users never need advanced options

**Example**: Outfit Generator
```
Default View:
- Weather (4 options)
- Mood (4 options)
- [Generate] button

Click "More Options":
- Occasion dropdown
- Time available toggle
- Color preference
- Style constraints
```

## Component Patterns

### Buttons

#### Primary Button
- `rounded-full` (fully rounded)
- High contrast background
- Clear label
- 48px minimum height (touch-friendly)
- Prominent shadow

```html
<button class="
  bg-primary text-on-primary
  rounded-full px-8 py-4
  shadow-elevation-2
  text-label-large font-medium
  hover:shadow-elevation-3
  transition-standard
  min-h-[48px]
">
  Primary Action
</button>
```

#### Secondary Button
- `rounded-xl` (less rounded than primary)
- Outlined or subtle background
- Clear label
- 48px minimum height

```html
<button class="
  border-2 border-outline
  text-on-surface
  rounded-xl px-6 py-3
  text-label-large
  hover:bg-surface-variant
  transition-standard
  min-h-[48px]
">
  Secondary Action
</button>
```

#### Panic Pick Button (Special)
- Extra large
- Bright, attention-grabbing color
- Clear icon + text
- Pulsing animation (subtle)

```html
<button class="
  bg-error text-on-error
  rounded-full px-12 py-6
  shadow-elevation-3
  text-headline-small font-bold
  min-h-[64px]
  animate-pulse-subtle
">
  ⚡ Panic Pick
</button>
```

### Cards

Standard card for items:

```html
<div class="
  bg-surface text-on-surface
  rounded-3xl
  shadow-elevation-1
  p-6
  hover:shadow-elevation-2
  transition-standard
">
  <img src="..." class="rounded-2xl mb-4" />
  <h3 class="text-title-large mb-2">Item Title</h3>
  <p class="text-body-medium text-on-surface-variant">
    Description
  </p>
</div>
```

### Forms

Form fields with ADHD-friendly patterns:

```html
<div class="space-y-6">
  <!-- Field group -->
  <div class="space-y-2">
    <label class="text-label-large font-medium">
      Item Title
      <span class="text-on-surface-variant text-label-small">
        (Optional)
      </span>
    </label>
    <input
      type="text"
      class="
        w-full px-4 py-3
        rounded-xl
        border-2 border-outline
        bg-surface
        text-body-large
        focus:border-primary focus:outline-none
        transition-standard
      "
      placeholder="Black Band T-shirt"
    />
  </div>
  
  <!-- Auto-save indicator -->
  <div class="text-body-small text-on-surface-variant">
    ✓ Auto-saved
  </div>
</div>
```

### Navigation

#### Mobile Navigation
- Fixed bottom navigation bar
- 4-5 items maximum
- Icons + labels
- Active state clearly visible

```html
<nav class="
  fixed bottom-0 left-0 right-0
  bg-surface-container
  border-t border-outline-variant
  px-2 py-3
  flex justify-around items-center
">
  <a class="flex flex-col items-center gap-1 px-4 py-2">
    <svg class="w-6 h-6">...</svg>
    <span class="text-label-small">Home</span>
  </a>
  <!-- More items... -->
</nav>
```

#### Desktop Navigation
- Sidebar with filters
- Breadcrumbs at top
- Clear section labels

### Loading States

Clear loading indicators:

```html
<!-- Spinner -->
<div class="flex items-center gap-3">
  <svg class="animate-spin w-5 h-5">...</svg>
  <span class="text-body-medium">
    Generating catalog image... ~20 seconds
  </span>
</div>

<!-- Progress bar -->
<div class="space-y-2">
  <div class="flex justify-between text-body-small">
    <span>Processing...</span>
    <span>80%</span>
  </div>
  <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden">
    <div class="h-full bg-primary transition-all duration-300" style="width: 80%"></div>
  </div>
</div>

<!-- Skeleton loader -->
<div class="animate-pulse space-y-4">
  <div class="h-48 bg-surface-variant rounded-3xl"></div>
  <div class="h-4 bg-surface-variant rounded-full w-3/4"></div>
  <div class="h-4 bg-surface-variant rounded-full w-1/2"></div>
</div>
```

## Responsive Design

### Breakpoints

- **Mobile**: < 1024px (category-first, vertical flow)
- **Desktop**: ≥ 1024px (filters sidebar, table/grid views)

### Mobile-First Approach

Design for mobile first, enhance for desktop:

```css
/* Mobile default */
.item-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

/* Desktop enhancement */
@media (min-width: 1024px) {
  .item-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
  }
}
```

### Touch Targets

All interactive elements must be at least 48x48dp for easy tapping:

```html
<button class="min-h-[48px] min-w-[48px] p-3">
  <svg class="w-6 h-6">...</svg>
</button>
```

## Dark Mode

Full dark mode support with Material Design 3 dark theme:

- Dark backgrounds with lighter text
- Reduced contrast to prevent eye strain
- Same color roles, different shades
- Smooth theme transitions

```css
@media (prefers-color-scheme: dark) {
  :root {
    --md-sys-color-surface: #1C1B1F;
    --md-sys-color-on-surface: #E6E1E5;
    /* More dark theme tokens... */
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

- **Color contrast**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **Focus indicators**: Clear focus states on all focusable elements
- **ARIA labels**: Screen reader friendly
- **Semantic HTML**: Proper heading hierarchy, landmarks

### Keyboard Shortcuts

Power users can use keyboard shortcuts:

- `Ctrl/Cmd + K`: Focus search
- `Ctrl/Cmd + N`: New item
- `Escape`: Close modal/drawer
- `Tab`: Navigate forward
- `Shift + Tab`: Navigate backward
- Arrow keys: Navigate lists

## Design Validation Checklist

Before shipping any UI change, verify:

- [ ] Follows Material Design 3 guidelines
- [ ] Uses theme color tokens (no arbitrary colors)
- [ ] Reduces cognitive load
- [ ] Provides immediate feedback
- [ ] Works on mobile (<1024px) and desktop (≥1024px)
- [ ] Has clear focus states for keyboard navigation
- [ ] Meets WCAG 2.1 AA contrast requirements
- [ ] Touch targets are at least 48x48dp
- [ ] Loading states are clear
- [ ] Error states are helpful
- [ ] Works in dark mode
- [ ] Can be completed while distracted
- [ ] Next step is obvious
- [ ] Easy to undo mistakes

## Component Library

The app uses custom components built on Material Design 3 principles. Key components include:

- **ItemCard**: Displays item with image, title, tags
- **ItemGrid**: Responsive grid of ItemCards
- **CategoryTabs**: Category filter tabs
- **FilterPanel**: Advanced filtering sidebar
- **SearchBar**: Prominent search with clear results
- **BulkEditTable**: Desktop table view with selection
- **OutfitCard**: Display outfit with multiple items
- **OutfitGenerator**: Constraint-based outfit creation
- **AddItemButton**: Floating action button for quick add
- **SuccessFeedback**: Toast notifications for confirmations
- **LoadingSpinner**: Consistent loading indicators

## Design Resources

- **Figma Design System**: (Future: Link to Figma file)
- **Color Palette**: See `app/globals.css`
- **Component Examples**: See `app/components/`
- **Tailwind Config**: See `app/tailwind.config.ts`

## Further Reading

- [Material Design 3](https://m3.material.io/)
- [Material Design 3 Figma Kit](https://www.figma.com/community/file/1035203688168086460)
- [ADHD UX Best Practices](https://shelbeely.github.io/ADHD-Closet/features/ADHD_IMPROVEMENTS/)
- [Accessibility Guidelines (WCAG 2.1)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Touch Target Sizes](https://www.nngroup.com/articles/touch-target-size/)
- [Project Repository](https://github.com/shelbeely/ADHD-Closet)
- [Full Documentation](https://shelbeely.github.io/ADHD-Closet/)
