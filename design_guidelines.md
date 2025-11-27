# Design Guidelines: MTA Game Shop E-Commerce Platform

## Design Approach
**Reference-Based Gaming E-Commerce**: Draw inspiration from Steam Store, Epic Games Store, and Discord Nitro's clean, gaming-focused interfaces. Prioritize bold product presentation, trust signals, and seamless transaction flows that appeal to gamers while maintaining professional credibility.

## Core Design Principles
1. **Gaming-First Aesthetic**: Bold, modern design that resonates with MTA gaming community
2. **Transaction Confidence**: Clear status tracking, secure payment indicators, transparent processes
3. **Dual-Purpose Interface**: Seamless shopping experience + powerful admin tools
4. **Mobile-Ready**: Full responsive support for on-the-go purchases and order checking

## Layout System
**Spacing Standards**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-16 to py-24 (desktop), py-12 to py-16 (mobile)
- Component spacing: gap-6 to gap-8 for grids
- Container max-width: max-w-7xl for main content

## Typography Hierarchy

**Primary Font**: Inter or Outfit (modern, readable)
**Accent Font**: Rajdhani or Orbitron (gaming aesthetic for headers)

- **Hero/Main Headlines**: text-5xl to text-6xl, font-bold, accent font
- **Section Headers**: text-3xl to text-4xl, font-bold
- **Product Titles**: text-xl, font-semibold
- **Body Text**: text-base, font-normal, leading-relaxed
- **Labels/Meta**: text-sm, font-medium
- **Buttons**: text-base, font-semibold, uppercase tracking-wide

## Component Library

### Homepage
**Hero Section** (90vh):
- Full-width background with gaming-themed imagery
- Centered headline showcasing the shop's value proposition
- Primary CTA button with blurred background
- Floating stat cards (total orders, active users, products available)

**Product Showcase** (multi-section):
- Featured products grid: 3 columns desktop, 2 tablet, 1 mobile
- Category filters as pill buttons
- Product cards with hover lift effect

**Trust Section**:
- 3-column layout: Secure Payment, Instant Delivery, 24/7 Support
- Icons, bold headings, concise descriptions

### Product Catalog Page
- Filter sidebar (left, collapsible on mobile)
- Product grid: 4 columns desktop, 2 tablet, 1 mobile
- Each card: product image, title, price tag, quick-add button
- Sorting dropdown (price, popularity, newest)

### Product Detail Cards
- Product image/icon (large, centered)
- Product name and tier badge
- Price prominently displayed
- Feature list with checkmarks
- "Add to Cart" CTA (sticky on mobile)
- Product description in expandable section

### Shopping Cart (Side Panel)
- Slide-out panel from right
- Item list with thumbnail, name, quantity controls, price
- Subtotal calculation
- Prominent checkout button
- Empty state with "Continue Shopping" suggestion

### Checkout Flow
**Two-column layout** (desktop):
- Left: Order summary with itemized list
- Right: Customer information form + payment method selector
- Progress indicator at top (Cart → Info → Payment → Confirmation)
- Security badges near payment section

### User Dashboard
**Card-based layout**:
- Welcome header with username
- Order history table/cards with status badges
- Quick stats (total spent, pending orders)
- Active orders section with detailed tracking
- Retirada status with location info and countdown

### Admin Panel
**Professional dashboard aesthetic**:
- Dark sidebar navigation (Products, Orders, Pickup Confirmation, Analytics)
- Main content area with data tables
- Product management: CRUD interface with image upload
- Pickup confirmation: Pending orders with "Confirm Pickup" action buttons
- Order details modal with full information
- Analytics cards showing revenue, completed orders, pending pickups

### Navigation
**Main Header**:
- Logo left, navigation center (Home, Products, My Orders), cart icon + user menu right
- Sticky header with subtle shadow on scroll
- Mobile: hamburger menu with slide-out navigation

**Footer**:
- 4-column layout: About, Products, Support, Legal
- Social media links
- Newsletter signup form
- Payment method icons

## Key Visual Elements

### Buttons
- **Primary**: Bold, full-width on mobile, icon support
- **Secondary**: Outlined variant for less emphasis
- **Danger**: For delete/cancel actions (admin)
- **Success**: For confirmation actions (pickup confirmed)

### Badges & Status Indicators
- **Order Status**: Pill-shaped badges (Pending Payment: yellow, Awaiting Pickup: blue, Completed: green)
- **Product Tags**: Small badges for "Popular", "New", "Limited"
- **Tier Badges**: Distinctive styling for VIP levels

### Cards
- Elevated with shadow-lg
- Rounded corners (rounded-xl)
- Hover state: subtle lift with shadow increase
- Product cards: Image top, content below
- Order cards: Horizontal layout with status on right

### Forms
- Input fields: border-2, rounded-lg, focus:ring effect
- Labels: above inputs, text-sm font-medium
- Validation: inline error messages in red
- Success states: green checkmark icons

### Modals & Overlays
- Backdrop blur effect
- Centered modal with max-w-2xl
- Close button top-right
- Primary action buttons bottom-right

## Images

### Hero Section
**Description**: Dynamic MTA server gameplay scene or stylized game elements collage
**Placement**: Full-width background, 90vh height, with gradient overlay for text readability

### Product Category Headers
**Description**: Category-specific imagery (VIP crowns, currency stacks, special item renders)
**Placement**: Banner-style backgrounds for each category section (h-48)

### Product Cards
**Description**: Icon-style representations of products (VIP badges, coin stacks, item renders)
**Placement**: Square aspect ratio (aspect-square), centered in product cards

### Trust Section
**Description**: Icons for security, speed, support (can use icon library or simple illustrations)
**Placement**: Small icons (w-12 h-12) above each trust element

### Empty States
**Description**: Friendly illustrations for empty cart, no orders yet
**Placement**: Centered in empty state containers

## Responsive Breakpoints
- **Mobile**: < 640px - Single column, bottom navigation, full-width CTAs
- **Tablet**: 640px - 1024px - Two columns, simplified filters
- **Desktop**: > 1024px - Full multi-column layouts, sidebar navigation

## Accessibility
- ARIA labels for all interactive elements
- Keyboard navigation support throughout
- Focus indicators with ring-2 ring-offset-2
- Sufficient contrast ratios (WCAG AA minimum)
- Alt text for all product images

## Animation Strategy (Minimal)
- Product card hover: subtle scale and shadow increase
- Page transitions: fade-in on route changes
- Cart panel: slide-in from right
- Success confirmations: subtle checkmark animation
- Loading states: simple spinner, no complex animations