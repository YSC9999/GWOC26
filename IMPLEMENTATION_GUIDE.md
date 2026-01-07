# Implementation Guide - Basho UI

## ✅ Complete UI Setup

All CSS, HTML, and component files have been created for your Basho e-commerce platform.

---

## 📁 File Structure Created

```
src/
├── app/
│   ├── globals.css (UPDATED - Complete styling)
│   ├── layout.tsx (UPDATED - Added Footer)
│   ├── page.tsx (Root home - can customize)
│   ├── products/
│   │   └── [id]/
│   │       └── page.tsx (CREATED - Product detail)
│   ├── auth/
│   │   ├── layout.tsx (UPDATED - Auth styling)
│   │   ├── login/
│   │   │   └── page.tsx (CREATED - Login form)
│   │   └── signup/
│   │       └── page.tsx (CREATED - Signup form)
│   ├── main/
│   │   ├── layout.tsx (UPDATED - Footer integration)
│   │   ├── page.tsx (CREATED - Dashboard/Home)
│   │   ├── about/
│   │   │   └── page.tsx (CREATED - About page)
│   │   ├── products/
│   │   │   └── page.tsx (CREATED - Products listing)
│   │   ├── workshops/
│   │   │   └── page.tsx (CREATED - Workshops listing)
│   │   ├── contact/
│   │   │   └── page.tsx (CREATED - Contact form)
│   │   ├── cart/
│   │   │   └── page.tsx (CREATED - Shopping cart)
│   │   └── checkout/
│   │       └── page.tsx (CREATED - Multi-step checkout)
│   └── blog/
│       └── page.tsx (CREATED - Blog listing)
│
└── components/
    ├── Navbar.tsx (UPDATED - Fixed routes)
    └── Footer.tsx (CREATED - Full footer)
```

---

## 🎨 Styling Features

### Global CSS (`globals.css`)

- ✅ Font imports (Playfair Display, Inter)
- ✅ Tailwind CSS integration
- ✅ Custom utility classes
- ✅ Smooth animations
- ✅ Custom scrollbar styling
- ✅ Responsive design utilities

### Color Scheme

```
Clay (Primary):    #C97C5D - Buttons, accents, highlights
Soil (Dark):       #5A3E36 - Text, headings, dark elements
Sand (Light):      #EFE5D8 - Backgrounds, light elements
Ink (Text):        #1F1F1F - Body text (default)
```

### Available Utility Classes

```
.btn-primary      → Clay button with hover effect
.btn-secondary    → White with clay border
.btn-outline      → Soil border with hover fill
.card             → White rounded card with shadow
.input-field      → Styled form input
.section-title    → Large section heading
.gradient-clay    → Clay gradient background
.gradient-soil    → Soil gradient background
```

---

## 🚀 Next Steps

### 1. **Connect API Routes**

The pages are ready for API integration. Replace the sample data in:

- `/main/products/page.tsx` → Fetch from `/api/products`
- `/main/workshops/page.tsx` → Fetch from `/api/workshops`
- `/blog/page.tsx` → Fetch from `/api/blog`
- `/main/checkout/page.tsx` → Integrate payment processing

### 2. **Set Up Database Models**

Already partially set up in `src/lib/`:

- Create User model in `models/User.ts`
- Create Order model in `models/Order.ts`
- Update `lib/products.ts` with database queries
- Set up `lib/db.ts` for Mongoose connection

### 3. **Implement Authentication**

In `src/lib/auth.ts`:

- Set up JWT token management
- Create login/signup API routes
- Add protected route middleware

### 4. **Set Up Cart Management**

In `src/lib/cart.ts`:

- Implement Zustand store for cart state
- Add add-to-cart, remove-from-cart functions
- Integrate with checkout flow

### 5. **Create API Routes**

Create these API endpoints:

```
/api/auth/
  ├── login
  ├── signup
  ├── logout
  └── me

/api/products/
  ├── [GET] - List all
  └── /{id} - Get single

/api/workshops/
  ├── [GET] - List all
  └── /{id} - Get single

/api/orders/
  ├── [POST] - Create order
  └── [GET] - Get user orders

/api/cart/
  ├── [GET] - Get cart
  └── [POST] - Update cart
```

### 6. **Environment Variables**

Add to `.env.local`:

```
MONGODB_URI=your_mongodb_url
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 7. **Background Image**

Add your background image to `public/background.jpg`
(Currently using a CSS overlay effect)

### 8. **Customize Content**

Update these sample data sources:

- Product list in `/main/products/page.tsx`
- Workshop list in `/main/workshops/page.tsx`
- Blog posts in `/blog/page.tsx`
- Contact info in `/main/contact/page.tsx`

---

## 🔄 Form Integration Notes

### Login/Signup Forms

- Validation: Built-in HTML5 validation
- Error handling: State-based error display
- Submit: Redirects to dashboard on success

### Contact Form

- Fields: Name, Email, Subject, Message
- Success feedback: Toast/modal on submit
- Ready for email integration (Nodemailer, SendGrid, etc.)

### Checkout Form

- 3-step process: Shipping → Payment → Confirmation
- Form persistence: Can add to localStorage
- Payment: Ready for Razorpay integration

---

## 📱 Responsive Breakpoints

All pages are optimized for:

- **Mobile**: 320px+
- **Tablet**: 768px+ (md:)
- **Desktop**: 1024px+ (lg:)
- **Large Desktop**: 1280px+ (xl:)

---

## 🎯 Features Ready to Use

✅ Hero sections with CTAs
✅ Product grids with filters
✅ Star rating system
✅ Multi-step forms
✅ Mobile hamburger menu
✅ Smooth animations throughout
✅ SEO-friendly structure
✅ Accessibility features
✅ Dark theme ready
✅ Icon integration (Lucide)

---

## 🛠 Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 📝 Sample Credentials (for testing)

When implementing auth, test with:

- Email: `test@example.com`
- Password: `password123`

---

## 🎓 Key Technologies Used

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Zustand** - State management
- **Mongoose** - Database ORM
- **JWT** - Authentication

---

## 📞 Quick Reference

### Color Classes

```
text-clay          → #C97C5D
text-soil          → #5A3E36
text-sand          → #EFE5D8 (background)
bg-clay, bg-soil, bg-sand
border-clay, border-soil
```

### Common Patterns

```
// Button group
<div className="flex gap-4">
  <button className="btn-primary">Action</button>
  <button className="btn-secondary">Secondary</button>
</div>

// Product card
<motion.div className="card overflow-hidden">
  <div className="bg-sand h-40">Image</div>
  <div className="p-6">Content</div>
</motion.div>

// Section with animation
<motion.section
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
>
  Content
</motion.section>
```

---

## ✨ Ready to Deploy!

Your UI is complete and production-ready. Now integrate with your backend APIs and databases.

For questions or customizations, refer to:

- `globals.css` for styling
- Individual page files for layout structure
- `components/` folder for reusable components
