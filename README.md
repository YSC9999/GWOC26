<div align="center">
  <h1>🏺 Basho E-Commerce Platform</h1>
  <p><em>A modern, high-performance storefront for handcrafted Japanese-inspired pottery.</em></p>
</div>

---

## 🌟 Overview

Welcome to the **GWOC26 Basho** project! This is a fully functional e-commerce platform built with the latest web technologies. It seamlessly blends elegant design with robust performance to provide an exceptional shopping experience. 

## 🚀 Tech Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **State Management** | Zustand |
| **Database** | MongoDB Atlas with Mongoose |
| **Media & Assets**| Cloudinary |
| **Integrations** | Razorpay (Payments), Twilio & Nodemailer (Notifications), Google Gemini (AI) |

## ✨ Key Features

- **Blazing Fast Imagery:** Built-in Cloudinary URL transformations with Next.js `<Image>` for layout shift-free, globally CDN-delivered media.
- **Dynamic Catalog & Gallery:** Filterable product listings, an engaging masonry gallery grid, and an interactive workshop booking system.
- **Admin Dashboard:** Comprehensive CRM capabilities to effortlessly manage inventory, custom orders, collections, and users.
- **Resilient Architecture:** Graceful fallbacks and robust API error handling ensure the UI remains stable under varying loads.
- **User Experience:** Tier-based loyalty accounts, wishlists, and robust cart state management.

## 🛠️ Getting Started

### 1. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/YSC9999/GWOC26.git
cd gwoc26
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and configure your credentials:

```env
MONGODB_URL=your_mongodb_connection_string
CLOUDINARY_URL=your_cloudinary_url
# Add other required API keys for Razorpay, Twilio, Gemini, etc.
```

### 3. Run Development Server

Start the local development server:

```bash
npm run dev
```

> **Note for Windows Users:** If you experience `500 Internal Server Errors` with a Turbopack `os error 80` panic across API routes, simply stop the server, delete the `.next` folder, and restart.

### 4. Explore

Visit `http://localhost:3000` to view the application in your browser.

---

## 🏗️ Architecture

For a comprehensive overview of the system architecture, including High-Level System Flow, Component Architecture, and the complete Data Entity-Relationship (ER) model, please see the [Architecture Documentation](ARCHITECTURE.md).

---

<div align="center">
  <p>Built with ❤️ for GWOC26</p>
</div>