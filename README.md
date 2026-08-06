# Production-Ready Full-Stack News/Media Platform

A high-performance, production-ready full-stack News and Media website built with **Next.js (App Router with TypeScript)**, **Prisma ORM**, **PostgreSQL**, **NextAuth.js with RBAC**, **Tailwind CSS**, and **TanStack Query**.

---

## 🌟 Key Features

1. **Next.js App Router Architecture**: Modular directory structure using React Server Components (RSC), Server Actions, and API Route Handlers.
2. **SEO & Structured Data Engine**:
   - **Google NewsArticle JSON-LD**: Automatic structured schema injection on every article page.
   - **Dynamic OpenGraph Generator**: Edge-rendered `@vercel/og` card generation.
   - **Dynamic Sitemap (`/sitemap.xml`) & Robots (`/robots.txt`)**: Automatically updated via Prisma DB queries.
3. **Role-Based Access Control (RBAC)**:
   - User Roles: `ADMIN`, `EDITOR`, `AUTHOR`, `SUBSCRIBER`.
   - Protected Admin Dashboard (`/admin`) using Edge middleware (`middleware.ts`).
4. **Rendering Strategy**:
   - **Homepage & Categories**: Incremental Static Regeneration (ISR) / Server-Side Rendering (SSR).
   - **Single Article Page**: SSR with atomic view counter incrementation and nested comment tree.
   - **Admin Dashboard**: Fast Client-Side Rendering with real-time statistics.
5. **Interactive Commenting System**: Unlimited recursive nested comments with optimistic UI updates.

---

## 🚀 Setup & Installation Instructions

### 1. Environment Configuration
Copy `.env` and fill in your PostgreSQL connection string:
```bash
cp .env .env.local
```

Ensure `.env` contains:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/newsdb?schema=public"
NEXTAUTH_SECRET="your-super-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Database Migration & Seeding
Generate Prisma Client and run initial database seeding:
```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔐 Default Seed Credentials

- **Admin Account**: `admin@news.com` / `password123` (Role: `ADMIN`)
- **Author Account**: `author@news.com` / `password123` (Role: `AUTHOR`)
