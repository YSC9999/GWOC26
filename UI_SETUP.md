# Basho UI - Complete Setup

## Overview

A fully functional e-commerce platform built with Next.js, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons.

## Theme Colors

- **Clay**: #C97C5D (Primary accent)
- **Soil**: #5A3E36 (Dark text/headings)
- **Sand**: #EFE5D8 (Light background)
- **Ink**: #1F1F1F (Text)

---

## Files Created/Updated

### 1. **Global Styling**

- **File**: `src/app/globals.css`
- **Features**:
  - Font imports (Playfair Display & Inter)
  - Tailwind directives
  - Custom utility classes (`.btn-primary`, `.btn-secondary`, `.card`, etc.)
  - CSS animations (fadeInUp, slideInFromLeft, slideInFromRight)
  - Custom scrollbar styling

### 2. **Authentication Pages**

#### Login Page

- **File**: `src/app/auth/login/page.tsx`
- **Features**:
  - Email and password input fields
  - Form validation
  - Error handling
  - Responsive design with Framer Motion
  - Link to signup page

#### Signup Page

- **File**: `src/app/auth/signup/page.tsx`
- **Features**:
  - Full name, email, password inputs
  - Password confirmation
  - Form validation
  - Error handling
  - Link to login page

### 3. **Main Pages**

#### Home/Dashboard

- **File**: `src/app/main/page.tsx`
- **Features**:
  - Hero section with CTAs
  - Features showcase (3-column grid)
  - Call-to-action section
  - Framer Motion animations
  - Responsive layout

#### About Page

- **File**: `src/app/main/about/page.tsx`
- **Features**:
  - Mission statement
  - Core values list
  - Statistics section
  - Commitment cards (4-column grid)
  - Animated sections

#### Products Page

- **File**: `src/app/main/products/page.tsx`
- **Features**:
  - Product grid (3-column layout)
  - Category filtering system
  - Product cards with:
    - Emoji images
    - Star ratings (1-5 stars)
    - Review count
    - Price display
    - Add to cart button
  - 6 sample products across 7 categories
  - Responsive design

#### Product Detail Page

- **File**: `src/app/products/[id]/page.tsx`
- **Features**:
  - Large product image display
  - Detailed product information
  - Rating and reviews
  - Quantity selector (+ and - buttons)
  - Add to cart / Wishlist / Share buttons
  - Product features list (6 items)
  - Specifications table
  - Related products section (3-column grid)
  - Benefit icons (Free Shipping, Returns, Warranty, etc.)
  - Breadcrumb navigation

#### Workshops Page

- **File**: `src/app/main/workshops/page.tsx`
- **Features**:
  - Workshop cards (2-column layout)
  - Level badges (Beginner, Intermediate, Advanced)
  - Workshop details:
    - Instructor name
    - Date, time, duration
    - Participant count
    - Price
    - Description
  - 6 sample workshops
  - Enroll button on each workshop
  - CTA section for workshop requests

#### Blog Page

- **File**: `src/app/blog/page.tsx`
- **Features**:
  - Blog post cards (2-column grid)
  - Category tags
  - Author and date info
  - Read time estimate
  - Post excerpts
  - Pagination controls
  - Newsletter subscription section

#### Contact Page

- **File**: `src/app/main/contact/page.tsx`
- **Features**:
  - Contact form with fields:
    - Name, email, subject, message
    - Form validation
    - Success message
  - Contact information cards:
    - Email, phone, address
  - Business hours
  - Icon integration (Mail, Phone, MapPin, Send)

### 4. **E-Commerce Pages**

#### Shopping Cart

- **File**: `src/app/main/cart/page.tsx`
- **Features**:
  - Cart item display with images
  - Quantity controls (+ and -)
  - Item removal
  - Order summary sidebar with:
    - Subtotal, tax, shipping
    - Total price
  - Checkout button
  - Continue shopping link
  - Promotional banner

#### Checkout Page

- **File**: `src/app/main/checkout/page.tsx`
- **Features**:
  - Multi-step checkout (3 steps):
    1. Shipping address
    2. Payment information
    3. Order confirmation
  - Progress indicator
  - Form fields for:
    - Name, email, phone
    - Address, city, state, zip
    - Card details
  - Order summary panel
  - Back/Next navigation
  - Success confirmation screen

### 5. **Components**

#### Navbar

- **File**: `src/components/Navbar.tsx`
- **Features**:
  - Fixed position with blur effect
  - Logo/brand name
  - Navigation links to all pages
  - Mobile responsive menu (hamburger)
  - Authentication status display
  - Cart and account links (when logged in)
  - Logout button

#### Footer

- **File**: `src/components/Footer.tsx`
- **Features**:
  - 4-column layout:
    1. Brand description + social icons
    2. Quick links
    3. Company links
    4. Legal links
  - Social media icons (Facebook, Twitter, Instagram, LinkedIn)
  - Business hours section
  - Copyright information
  - Responsive design

### 6. **Layout Files**

#### Root Layout

- **File**: `src/app/layout.tsx`
- **Features**:
  - Global background image
  - Navbar integration
  - Footer integration
  - Main content wrapper

#### Auth Layout

- **File**: `src/app/auth/layout.tsx`
- **Features**:
  - Centered auth form layout
  - Sand background color

#### Main Layout

- **File**: `src/app/main/layout.tsx`
- **Features**:
  - Background image
  - Footer component
  - Flexible height layout

---

## UI Components & Utility Classes

### Button Styles

- `.btn-primary` - Solid clay button with hover effect
- `.btn-secondary` - White button with clay border
- `.btn-outline` - Soil border with hover fill

### Card Components

- `.card` - White rounded container with shadow
- `.card:hover` - Enhanced shadow on hover

### Text & Headings

- `.section-title` - 4xl bold soil-colored heading
- All h1-h6 use Playfair Display serif font

### Form Elements

- `.input-field` - Styled input with soil border and clay focus state

### Animations

- `.animate-fadeInUp` - Fade in with upward motion
- `.animate-slideInLeft` - Slide from left
- `.animate-slideInRight` - Slide from right

---

## Key Features

✅ **Responsive Design** - Mobile, tablet, and desktop optimized
✅ **Smooth Animations** - Framer Motion integration throughout
✅ **Color-Coded Levels** - Green (Beginner), Yellow (Intermediate), Red (Advanced)
✅ **Star Ratings** - Visual 5-star rating system
✅ **Form Validation** - Client-side validation on all forms
✅ **Icon Integration** - Lucide React icons throughout
✅ **SEO Ready** - Proper heading hierarchy and semantic HTML
✅ **Accessibility** - ARIA labels and semantic elements
✅ **Modern Stack** - Next.js 16+, TypeScript, Tailwind 4

---

## Navigation Structure

```
/
├── /main (Home/Dashboard)
│   ├── /about
│   ├── /products
│   ├── /products/[id]
│   ├── /workshops
│   ├── /contact
│   ├── /cart
│   └── /checkout
├── /auth
│   ├── /login
│   └── /signup
└── /blog
```

---

## Sample Data Included

- 6 Products with categories
- 6 Workshops with instructors
- 4 Blog posts
- 3 Related products per product page
- Contact information and hours
- Testimonial/stats sections

All sample data can be easily replaced with API calls to your backend.
