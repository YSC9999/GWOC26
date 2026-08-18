# 🏗️ Basho System Architecture

This document provides a comprehensive overview of the system architecture for the GWOC26 Basho E-Commerce Platform. It covers the high-level system integrations, application component flow, and the database entity-relationship model.

---

## 1. High-Level System Architecture

The platform follows a modern decoupled architecture centered around Next.js, with server-side logic handled via Next.js API routes and App Router actions. It integrates with various external SaaS providers for specialized capabilities.

```mermaid
graph TD
    Client[Web Browser / Client]
    
    subgraph "Next.js Application (Vercel / Host)"
        AppRouter[Next.js App Router]
        ServerActions[Server Actions & API Routes]
        Zustand[Zustand State Management]
    end

    subgraph "Database Tier"
        MongoDB[(MongoDB Atlas)]
    end

    subgraph "External Integrations"
        Cloudinary[Cloudinary - Media & Image CDN]
        Razorpay[Razorpay - Payments]
        Shiprocket[Shiprocket - Logistics & Shipping]
        Twilio[Twilio - SMS Notifications]
        Nodemailer[Nodemailer - Email Service]
        Gemini[Google Gemini AI - Chatbot]
    end

    Client <-->|React 19 / UI| AppRouter
    Client <-->|State Updates| Zustand
    AppRouter <-->|HTTP Requests| ServerActions
    
    ServerActions <-->|Mongoose ODM| MongoDB
    
    ServerActions -->|Uploads & Optimizations| Cloudinary
    ServerActions <-->|Payment Verification| Razorpay
    ServerActions <-->|Shipping Rates| Shiprocket
    ServerActions -->|Send SMS| Twilio
    ServerActions -->|Send Emails| Nodemailer
    ServerActions <-->|Conversational AI| Gemini
```

---

## 2. Application Component Flow

This diagram illustrates how data flows internally within the Next.js frontend, separating client-side state from server-side rendering and administrative controls.

```mermaid
graph LR
    subgraph "Client Tier (Browser)"
        UI[React Components]
        CartSync[Cart State - Zustand]
        Session[Session Manager]
    end

    subgraph "Routing Tier (Next.js)"
        PublicRoutes((Public Pages))
        AuthRoutes((Auth Pages))
        AdminRoutes((Admin Dashboard))
    end

    subgraph "Server Tier"
        API_Auth["/api/auth/*"]
        API_Shop["/api/products/* & /api/orders/*"]
        API_Admin["/api/admin/*"]
        API_Studio["/api/workshops/* & /api/gallery/*"]
    end

    UI --> PublicRoutes
    UI --> AuthRoutes
    UI --> AdminRoutes

    PublicRoutes --> API_Shop
    PublicRoutes --> API_Studio
    AuthRoutes --> API_Auth
    AdminRoutes -->|Admin Guard Middleware| API_Admin

    CartSync <--> API_Shop
    Session <--> API_Auth
```

---

## 3. Entity-Relationship (ER) Data Model

The application utilizes MongoDB for data persistence. Below is the Entity-Relationship diagram showcasing how the primary models interact, including users, products, orders, and studio-specific features.

```mermaid
erDiagram
    USER ||--o{ ORDER : places
    USER ||--o{ REVIEW : writes
    USER ||--o{ CUSTOM_ORDER : requests
    USER ||--o{ WORKSHOP_REGISTRATION : enrolls
    USER ||--o{ STUDIO_VISIT : books
    USER ||--o{ WALLET_TRANSACTION : has

    PRODUCT ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ REVIEW : receives
    PRODUCT }o--|| CATEGORY : belongs_to

    ORDER ||--|{ ORDER_ITEM : contains
    ORDER }o--o| COUPON : uses

    WORKSHOP ||--o{ WORKSHOP_REGISTRATION : has
    WORKSHOP }o--|| WORKSHOP_CATEGORY : belongs_to

    GALLERY }o--|| ALBUM : belongs_to

    FEATURED_COLLECTION ||--o{ PRODUCT : features

    CUSTOM_ORDER }o--o| ORDER : converts_to

    USER {
        ObjectId _id
        string name
        string email
        string role
        string tier
        number walletBalance
    }

    PRODUCT {
        ObjectId _id
        string name
        number price
        string category
        array images
        number stockQuantity
    }

    ORDER {
        ObjectId _id
        string orderNumber
        number total
        string paymentStatus
        string status
    }
    
    WORKSHOP {
        ObjectId _id
        string title
        date schedule
        number capacity
        number price
    }
```
