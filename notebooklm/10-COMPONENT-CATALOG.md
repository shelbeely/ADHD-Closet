# Twin Style - Component Catalog

## Overview

Complete visual and functional reference for all React components in the Twin Style application. This catalog helps developers understand available components, their props, and usage patterns.

## Component Categories

1. [Display Components](#display-components)
2. [Form Components](#form-components)
3. [Layout Components](#layout-components)
4. [Navigation Components](#navigation-components)
5. [Utility Components](#utility-components)
6. [Native Feature Components](#native-feature-components)

---

## Display Components

### ItemCard

**Purpose**: Display a single wardrobe item with image, metadata, and quick actions.

**Screenshot**: ![Mobile View](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/main-mobile-view.png)

**Props**:
```typescript
interface ItemCardProps {
  item: ItemComplete;
  onStateChange?: (itemId: string, newState: string) => void;
  onClick?: (itemId: string) => void;
  showQuickActions?: boolean;
}
```

**Usage**:
```typescript
<ItemCard
  item={item}
  onStateChange={handleStateChange}
  showQuickActions={true}
/>
```

**Features**:
- Displays catalog image or fallback
- Shows title, category, brand
- Tag pills (max 3 visible, +N more indicator)
- Quick state change buttons (Laundry/Available)
- Touch-optimized (48x48dp minimum)
- Material Design 3 styling

**ADHD Optimizations**:
- Large, clear image
- Obvious CTAs
- Immediate feedback on state change
- No navigation required for quick actions

---

### ItemGrid

**Purpose**: Responsive grid layout for displaying multiple items.

**Props**:
```typescript
interface ItemGridProps {
  items: ItemComplete[];
  loading?: boolean;
  emptyMessage?: string;
  onItemClick?: (itemId: string) => void;
  onStateChange?: (itemId: string, newState: string) => void;
}
```

**Usage**:
```typescript
<ItemGrid
  items={items}
  loading={loading}
  emptyMessage="No items found"
  onItemClick={handleItemClick}
/>
```

**Responsive Behavior**:
- Mobile (<1024px): 2 columns
- Tablet (1024-1440px): 3 columns
- Desktop (>1440px): 4-5 columns
- Auto-adjusts gap spacing

**Features**:
- Skeleton loading states
- Empty state handling
- Virtualized scrolling (future)
- Grid-to-table view toggle

---

### LoadingState

**Purpose**: Consistent loading indicators throughout the app.

**Props**:
```typescript
interface LoadingStateProps {
  message?: string;
  timeEstimate?: number; // seconds
  showProgress?: boolean;
  progress?: number; // 0-100
}
```

**Variants**:

**Spinner**:
```typescript
<LoadingState message="Loading items..." />
```

**Progress Bar**:
```typescript
<LoadingState
  message="Generating catalog image..."
  timeEstimate={20}
  showProgress={true}
  progress={65}
/>
```

**Skeleton**:
```typescript
<LoadingState.Skeleton type="item-card" count={6} />
```

**ADHD Optimizations**:
- Always show time estimates
- Progress visibility
- Clear messaging
- No ambiguous spinners

---

### SuccessFeedback

**Purpose**: Toast-style success notifications.

**Props**:
```typescript
interface SuccessFeedbackProps {
  message: string;
  duration?: number; // ms, default 3000
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}
```

**Usage**:
```typescript
<SuccessFeedback
  message="Item saved!"
  duration={3000}
  action={{
    label: "View",
    onClick: () => router.push(`/items/${itemId}`)
  }}
/>
```

**Features**:
- Auto-dismiss after duration
- Slide-in animation from bottom
- Optional action button
- Manual dismiss option
- Stacking support (multiple toasts)

---

### CategoryTabs

**Purpose**: Category filter navigation optimized for mobile.

**Screenshot**: ![Mobile Menu](https://raw.githubusercontent.com/shelbeely/ADHD-Closet/main/docs/screenshots/mobile-menu-open.png)

**Props**:
```typescript
interface CategoryTabsProps {
  selected: Category | 'all';
  onChange: (category: Category | 'all') => void;
  counts?: Record<Category, number>;
  showCounts?: boolean;
}
```

**Usage**:
```typescript
<CategoryTabs
  selected={selectedCategory}
  onChange={setSelectedCategory}
  counts={categoryCounts}
  showCounts={true}
/>
```

**Features**:
- Horizontal scrollable on mobile
- Active tab indicator
- Item counts per category
- Icon + label for clarity
- Touch-optimized spacing

**Categories**:
- All (shows all categories)
- Tops
- Bottoms
- Dresses
- Outerwear
- Shoes
- Accessories
- Jewelry
- And more...

---

### FranchiseBadge

**Purpose**: Display band/franchise merchandise indicator.

**Props**:
```typescript
interface FranchiseBadgeProps {
  franchise: string;
  franchiseType: FranchiseType;
  size?: 'small' | 'medium' | 'large';
}
```

**Usage**:
```typescript
<FranchiseBadge
  franchise="Killstar"
  franchiseType="band"
  size="medium"
/>
```

**Display**:
- Icon based on type (🎸 band, 🎬 movie, 🎮 game, etc.)
- Franchise name
- Colored border based on type
- Tooltip with full details

---

### ColorCompatibilityBadge

**Purpose**: Show color harmony rating for outfit combinations.

**Props**:
```typescript
interface ColorCompatibilityBadgeProps {
  score: number; // 0-1
  colors: string[]; // hex codes
  showDetails?: boolean;
}
```

**Usage**:
```typescript
<ColorCompatibilityBadge
  score={0.85}
  colors={['#000000', '#FF0000', '#FFFFFF']}
  showDetails={true}
/>
```

**Display**:
- Color harmony score (0-100%)
- Visual indicator (✓ / ⚠ / ✗)
- Color swatch preview
- Expandable explanation

---

### VisualWeightBadge

**Purpose**: Show visual balance rating for outfits.

**Props**:
```typescript
interface VisualWeightBadgeProps {
  balance: 'balanced' | 'top-heavy' | 'bottom-heavy';
  severity: number; // 0-1
}
```

**Usage**:
```typescript
<VisualWeightBadge
  balance="balanced"
  severity={0.2}
/>
```

**Display**:
- Visual representation of balance
- Color-coded indicator
- Tooltip with explanation

---

## Form Components

### EnhancedSearch

**Purpose**: Powerful search with filters and suggestions.

**Props**:
```typescript
interface EnhancedSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFilter: (filters: ItemFilters) => void;
  suggestions?: string[];
  placeholder?: string;
}
```

**Usage**:
```typescript
<EnhancedSearch
  value={searchQuery}
  onChange={setSearchQuery}
  onFilter={handleFilterChange}
  suggestions={recentSearches}
  placeholder="Search items..."
/>
```

**Features**:
- Real-time search
- Fuzzy matching
- Recent searches
- Advanced filter panel
- Keyboard shortcuts (Cmd/Ctrl + K)
- Clear button

**Filter Options**:
- Category
- State
- Tags
- Colors
- Brand
- Size

---

### AddItemButton

**Purpose**: Floating action button for adding items.

**Props**:
```typescript
interface AddItemButtonProps {
  onCamera?: () => void;
  onGallery?: () => void;
  onManual?: () => void;
}
```

**Usage**:
```typescript
<AddItemButton
  onCamera={handleCameraCapture}
  onGallery={handleGallerySelect}
  onManual={() => router.push('/items/new')}
/>
```

**Features**:
- Fixed position (bottom-right)
- Expands to show options
- Icon + label for clarity
- Material Design 3 FAB style
- Haptic feedback on native apps

**ADHD Optimization**:
- Always visible
- Single tap to primary action (camera)
- Alternative options available

---

### QuickActionsMenu

**Purpose**: Context menu for item quick actions.

**Props**:
```typescript
interface QuickActionsMenuProps {
  itemId: string;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onStateChange?: (state: ItemState) => void;
}
```

**Usage**:
```typescript
<QuickActionsMenu
  itemId={item.id}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onStateChange={handleStateChange}
/>
```

**Actions**:
- Edit item
- Change state (available/laundry/unavailable/donate)
- Duplicate item
- View history
- Delete item

---

## Layout Components

### ClosetRail

**Purpose**: 3D visualization of wardrobe items (Phase 6 feature).

**Props**:
```typescript
interface ClosetRailProps {
  items: ItemWithImages[];
  groupBy?: 'category' | 'color' | 'recent';
  searchQuery?: string;
  onItemClick?: (itemId: string) => void;
}
```

**Usage**:
```typescript
<ClosetRail
  items={items}
  groupBy="category"
  searchQuery={searchQuery}
  onItemClick={handleItemClick}
/>
```

**Features**:
- Three.js 3D rendering
- Hanging card textures
- Lazy texture loading
- Camera controls (orbit, zoom)
- Highlight search results
- Performance optimized

**Technical Details**:
- Uses @react-three/fiber
- Thumbnail textures (512px max)
- Instancing for performance
- Touch controls on mobile

---

### SeasonalBanner

**Purpose**: Contextual banner for seasonal suggestions.

**Props**:
```typescript
interface SeasonalBannerProps {
  season: 'spring' | 'summer' | 'fall' | 'winter';
  suggestions?: string[];
  onDismiss?: () => void;
}
```

**Usage**:
```typescript
<SeasonalBanner
  season="winter"
  suggestions={["Pack away summer items", "Prepare winter coats"]}
  onDismiss={handleDismiss}
/>
```

**Features**:
- Auto-detects current season
- Contextual suggestions
- Dismissible
- Re-appears after period

---

## Navigation Components

### QuickStatsWidget

**Purpose**: Dashboard widget showing wardrobe stats.

**Props**:
```typescript
interface QuickStatsWidgetProps {
  stats: {
    totalItems: number;
    available: number;
    laundry: number;
    recentlyAdded: number;
  };
  onCategoryClick?: (category: string) => void;
}
```

**Usage**:
```typescript
<QuickStatsWidget
  stats={wardrobeStats}
  onCategoryClick={handleCategoryClick}
/>
```

**Display**:
- Total items count
- Available items
- Items in laundry
- Recently added count
- Most worn items (top 3)
- Category breakdown chart

---

### StyleProfileWidget

**Purpose**: Display user's style profile and trends.

**Props**:
```typescript
interface StyleProfileWidgetProps {
  profile: {
    dominantColors: string[];
    commonTags: string[];
    categories: Record<Category, number>;
    brands: Record<string, number>;
  };
}
```

**Usage**:
```typescript
<StyleProfileWidget profile={styleProfile} />
```

**Display**:
- Color palette visualization
- Top style tags
- Category distribution
- Favorite brands
- Style consistency score

---

## Utility Components

### NFCScanner

**Purpose**: Scan NFC tags to identify items.

**Platform**: Native apps (iOS, Android) and Chrome/Edge on Android

**Props**:
```typescript
interface NFCScannerProps {
  onScan: (tagId: string, itemId: string) => void;
  onError?: (error: Error) => void;
  continuous?: boolean;
}
```

**Usage**:
```typescript
<NFCScanner
  onScan={handleNFCScan}
  onError={handleError}
  continuous={false}
/>
```

**Features**:
- Detects NFC tag presence
- Reads tag UID
- Maps to item
- Logs scan event
- Haptic feedback

**Reference**: [NFC Tag Support](https://shelbeely.github.io/ADHD-Closet/features/NFC_TAG_SUPPORT/)

---

### NFCAssign

**Purpose**: Assign NFC tag to item.

**Props**:
```typescript
interface NFCAssignProps {
  itemId: string;
  onAssign?: (tagId: string) => void;
  existingTag?: string;
}
```

**Usage**:
```typescript
<NFCAssign
  itemId={item.id}
  onAssign={handleTagAssign}
  existingTag={item.nfcTag?.tagId}
/>
```

**Features**:
- Write tag UID to database
- Optional label for tag
- Test scan after assignment
- Remove tag assignment

---

### CapacitorInit

**Purpose**: Initialize Capacitor native features.

**Props**:
```typescript
interface CapacitorInitProps {
  enableHaptics?: boolean;
  statusBarColor?: string;
  children: ReactNode;
}
```

**Usage**:
```typescript
<CapacitorInit enableHaptics={true} statusBarColor="#1C1B1F">
  <App />
</CapacitorInit>
```

**Features**:
- Detects platform (web/iOS/Android)
- Configures status bar
- Enables haptic feedback
- Sets up splash screen
- Initializes NFC if available

---

### NativeFeaturesDemo

**Purpose**: Demo page for testing native capabilities.

**Features Tested**:
- Camera access
- File system access
- Share functionality
- Haptic feedback
- NFC scanning
- Status bar control

**Usage**: Development/testing only, not in production UI.

---

### SmartAccessorySuggestions

**Purpose**: AI-powered accessory recommendations for outfits.

**Props**:
```typescript
interface SmartAccessorySuggestionsProps {
  outfitItems: string[]; // item IDs
  onSelect?: (accessoryId: string) => void;
}
```

**Usage**:
```typescript
<SmartAccessorySuggestions
  outfitItems={[topId, bottomId, shoesId]}
  onSelect={handleAccessorySelect}
/>
```

**Features**:
- Analyzes outfit colors and style
- Suggests complementary accessories
- Considers occasion and weather
- Ranked by compatibility score

---

## Component Composition Patterns

### Example: Item Detail Page

```typescript
export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const { item, loading } = useItem(params.id);
  
  if (loading) {
    return <LoadingState message="Loading item..." />;
  }
  
  if (!item) {
    return <ErrorState message="Item not found" />;
  }
  
  return (
    <div className="container mx-auto p-4">
      <ItemCard item={item} />
      
      {item.nfcTag && (
        <NFCAssign
          itemId={item.id}
          existingTag={item.nfcTag.tagId}
        />
      )}
      
      {item.franchise && (
        <FranchiseBadge
          franchise={item.franchise}
          franchiseType={item.franchiseType}
        />
      )}
      
      <QuickActionsMenu
        itemId={item.id}
        onEdit={() => router.push(`/items/${item.id}/edit`)}
        onDelete={handleDelete}
      />
    </div>
  );
}
```

### Example: Outfit Generator Page

```typescript
export default function OutfitGeneratorPage() {
  const [constraints, setConstraints] = useState<OutfitConstraints>({});
  const [outfits, setOutfits] = useState<OutfitComplete[]>([]);
  const [loading, setLoading] = useState(false);
  
  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraints),
      });
      const data = await response.json();
      setOutfits(data.outfits);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <ConstraintSelector
        constraints={constraints}
        onChange={setConstraints}
      />
      
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full py-4 bg-primary text-on-primary rounded-full"
      >
        {loading ? 'Generating...' : 'Generate Outfits'}
      </button>
      
      {loading && (
        <LoadingState
          message="Creating outfits..."
          timeEstimate={15}
        />
      )}
      
      {outfits.map(outfit => (
        <OutfitCard
          key={outfit.id}
          outfit={outfit}
          onRate={handleRate}
        />
      ))}
    </div>
  );
}
```

---

## Styling Conventions

### Tailwind Classes Used

**Layout**:
- `container mx-auto` - Centered responsive container
- `flex`, `grid` - Flexbox and grid layouts
- `space-y-4`, `gap-4` - Consistent spacing

**Colors**:
- `bg-surface`, `text-on-surface` - Surface colors
- `bg-primary`, `text-on-primary` - Primary colors
- `bg-error`, `text-on-error` - Error states

**Shapes**:
- `rounded-3xl` - Cards and containers
- `rounded-full` - Primary buttons
- `rounded-xl` - Secondary elements

**Interactive States**:
- `hover:shadow-elevation-2` - Hover effects
- `transition-all duration-200` - Smooth transitions
- `disabled:opacity-50` - Disabled states

### Component File Structure

```
components/
├── ItemCard.tsx           # Main component
├── ItemCard.module.css    # Component-specific styles (rare)
└── __tests__/
    └── ItemCard.test.tsx  # Tests (future)
```

---

## Accessibility Features

All components include:
- **ARIA labels** for screen readers
- **Keyboard navigation** support
- **Focus indicators** (visible focus rings)
- **Touch targets** minimum 48x48dp
- **Color contrast** WCAG 2.1 AA compliant
- **Alternative text** for images
- **Semantic HTML** proper heading hierarchy

---

## Performance Considerations

**Image Components**:
- Use Next.js Image component for optimization
- Lazy loading by default
- Responsive sizes attribute
- WebP format when supported

**List Components**:
- Virtualized scrolling for >100 items (future)
- Pagination on mobile
- Skeleton loading states
- Debounced search

**3D Components**:
- Texture lazy loading
- Low poly models
- Instancing for duplicates
- Frame rate limiting

---

## External Resources

- **Material Design 3 Components**: https://m3.material.io/components
- **Next.js Image Optimization**: https://nextjs.org/docs/app/building-your-application/optimizing/images
- **React Patterns**: https://react.dev/learn
- **Accessibility Guide**: https://www.w3.org/WAI/WCAG21/quickref/
- **Repository**: https://github.com/shelbeely/ADHD-Closet
- **Full Documentation**: https://shelbeely.github.io/ADHD-Closet/
