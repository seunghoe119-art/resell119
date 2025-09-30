# Design Guidelines: 중고 판매글 생성 도우미 (Used Goods Listing Generator)

## Design Approach
**System-Based Design**: Tailwind-influenced utility design system with dark mode priority, optimized for productivity and data entry workflows.

## Core Design Principles
- **Efficiency First**: Minimize friction in the listing creation process
- **Visual Clarity**: Dark backgrounds with high-contrast text for extended use
- **Instant Feedback**: Real-time preview reinforces user actions
- **Korean-Optimized**: Typography and spacing tuned for Korean text readability

## Color Palette

### Dark Mode (Primary)
- **Background**: 
  - Primary: 220 15% 12% (deep charcoal)
  - Secondary: 220 15% 16% (card backgrounds)
  - Tertiary: 220 12% 20% (hover states)
- **Text**:
  - Primary: 210 10% 95% (high contrast white)
  - Secondary: 210 8% 70% (muted text)
  - Tertiary: 210 8% 50% (labels, placeholders)
- **Accent Red** (Critical Actions):
  - Primary: 0 84% 60% (save, copy buttons)
  - Hover: 0 84% 55%
- **Borders**: 220 10% 25% (subtle separation)

### Semantic Colors
- Success: 142 71% 45% (saved confirmation)
- Warning: 38 92% 50% (validation alerts)
- Info: 217 91% 60% (helper text)

## Typography

### Font Families
```
Primary: 'Noto Sans KR', -apple-system, system-ui, sans-serif
Monospace: 'JetBrains Mono', 'Courier New', monospace (for preview area)
```

### Scale
- **Headings**: 
  - H1: text-3xl font-bold (navigation title)
  - H2: text-2xl font-semibold (page sections)
  - H3: text-xl font-medium (form groups)
- **Body**: text-base leading-relaxed (Korean requires generous line-height)
- **Labels**: text-sm font-medium (form labels)
- **Small**: text-xs (timestamps, metadata)

## Layout System

### Spacing Primitives
Use Tailwind units: **2, 4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-6
- Section margins: mb-8
- Tight spacing: gap-4
- Generous spacing: gap-8

### Grid Structure
- **Navigation**: Full-width sticky header (h-16)
- **Two-Column Layout** (sell.html):
  - Left: w-full lg:w-1/2 (form inputs)
  - Right: w-full lg:w-1/2 (preview - sticky on desktop)
  - Gap: gap-8
- **Responsive Breakpoint**: Stack to single column below lg (1024px)

## Component Library

### Navigation Bar
- Dark background (bg-[220_15%_12%]) with bottom border
- Horizontal menu items with hover states
- Active page indicated with red underline (border-b-2)
- Height: h-16, items centered vertically

### Form Inputs
- **Text Inputs**: 
  - Dark background (bg-[220_15%_16%])
  - Rounded corners (rounded-lg)
  - Padding: px-4 py-3
  - Border on focus: ring-2 ring-red-500
  - Placeholder text: text-[210_8%_50%]

- **Textareas**: 
  - Same styling as text inputs
  - Min height: min-h-[120px]
  - Resize: resize-y

- **Dropdowns/Selects**:
  - Match text input styling
  - Custom chevron icon (red accent)

- **Checkboxes/Radio**:
  - Custom styled with red accent when checked
  - Larger hit targets (w-5 h-5)
  - Labels with adequate spacing (ml-3)

- **Date Pickers**: 
  - Native input with dark theme override
  - Calendar icon prefix

### Buttons
- **Primary (Red)**: 
  - bg-red-600 hover:bg-red-500
  - px-6 py-3 rounded-lg
  - font-semibold text-white
  - Used for: [복사하기], [저장하기]

- **Secondary**: 
  - Border style: border-2 border-[220_10%_25%]
  - hover:bg-[220_15%_16%]
  - Used for: [초기화]

- **List Items** (saved.html):
  - Card-style (bg-[220_15%_16%])
  - Hover lift effect: hover:translate-y-[-2px]
  - Subtle shadow on hover

### Preview Area
- **Container**: 
  - Monospace font for alignment
  - bg-[220_15%_16%] rounded-xl p-8
  - Sticky positioning: sticky top-24
  - Max height with scroll: max-h-[calc(100vh-8rem)]

- **Emoji Integration**: 
  - Preserve emoji rendering
  - Adequate spacing around emoji headers

- **Dynamic Content**:
  - Fade-in animation for new content (duration-200)
  - Empty state message when no data entered

### Cards (Saved Listings)
- bg-[220_15%_16%] rounded-lg p-6
- Border on hover: border border-red-500/30
- Flex layout: justify-between items-center
- Cursor: cursor-pointer

### Form Groups
- Vertical spacing: space-y-6
- Label above input pattern
- Helper text below inputs (text-sm text-[210_8%_50%])

## Animations
**Minimal and Purposeful**:
- Button hover: transition-colors duration-150
- Card hover: transition-transform duration-200
- Preview updates: No animation (instant feedback)
- Toast notifications: Slide in from top (duration-300)

## Accessibility
- All form inputs have associated labels
- Focus states with visible red ring
- Keyboard navigation support
- ARIA labels for icon buttons
- Sufficient color contrast (WCAG AA minimum)

## Images
**No hero images** - This is a utility application focused on productivity. Visual real estate is dedicated to functional elements (forms and preview).

## Responsive Behavior
- **Desktop (lg+)**: Two-column side-by-side layout
- **Tablet (md)**: Two-column with narrower gaps
- **Mobile**: Single column stack, preview below form
- Navigation: Horizontal menu stays horizontal (compact spacing on mobile)

## Special Considerations
- **Korean Text Rendering**: Extra line-height (leading-relaxed) for readability
- **Form Persistence**: Visual indicator when data is auto-loaded from URL
- **Empty States**: Friendly Korean messages encouraging first input
- **Loading States**: Red spinner for Supabase operations