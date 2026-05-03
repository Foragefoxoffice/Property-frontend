# Next.js Public Site Migration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create `Property-frontend-next/` — a Next.js 14 App Router public site that replaces the Coming Soon page with fully server-rendered listing pages, dynamic OG meta tags, and a client-side user dashboard, while the Vite admin at `Property-frontend/` remains untouched.

**Architecture:** Next.js 14 App Router with Server Components for all public pages (home, listing, detail, blogs, projects). Interactive leaves (filters, forms, favorites buttons) are `'use client'` components. User dashboard lives under `app/user-dashboard/` and is fully client-side (`ssr: false`). ISR with `revalidate: 300` on all detail pages.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS v4, Ant Design 5, Axios, Framer Motion, socket.io-client, React Toastify, Lucide React.

---

## React Router → Next.js Adapter Cheat Sheet

Every component ported from `Property-frontend/src` needs these replacements:

| React Router (old) | Next.js (new) |
|---|---|
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` |
| `const navigate = useNavigate()` | `const router = useRouter()` |
| `navigate('/path')` | `router.push('/path')` |
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` |
| `<Link to="/path">` | `<Link href="/path">` |
| `import { useLocation } from 'react-router-dom'` | `import { usePathname } from 'next/navigation'` |
| `location.pathname` | `pathname` (from usePathname) |
| `import { useParams } from 'react-router-dom'` | params come as props in page components |
| `<Outlet />` | `{children}` in layouts |
| `import.meta.env.VITE_API_URL` | `process.env.NEXT_PUBLIC_API_URL` |
| `<HelmetProvider>` / `<Helmet>` | `generateMetadata()` export in page files |

---

## File Map

```
Property-frontend-next/
├── app/
│   ├── layout.tsx                              CREATE — root layout, wraps Providers
│   ├── page.tsx                                CREATE — / homepage (Server Component)
│   ├── globals.css                             CREATE — Tailwind directives
│   ├── listing/
│   │   └── page.tsx                            CREATE — /listing (Server Component shell)
│   ├── property-showcase/
│   │   └── [id]/
│   │       └── [[...slug]]/
│   │           └── page.tsx                    CREATE — ISR 300s + generateMetadata
│   ├── blogs/
│   │   ├── page.tsx                            CREATE — /blogs
│   │   └── [slug]/
│   │       └── page.tsx                        CREATE — ISR + generateMetadata
│   ├── projects/
│   │   ├── page.tsx                            CREATE — /projects
│   │   └── [slug]/
│   │       └── page.tsx                        CREATE — ISR + generateMetadata
│   ├── about/page.tsx                          CREATE
│   ├── contact/page.tsx                        CREATE
│   ├── terms-conditions/page.tsx               CREATE
│   ├── privacy-policy/page.tsx                 CREATE
│   ├── favorites/page.tsx                      CREATE — public favorites ('use client')
│   ├── login/page.tsx                          CREATE — 'use client'
│   ├── register/page.tsx                       CREATE — 'use client'
│   ├── forgot-password/page.tsx                CREATE — 'use client'
│   ├── reset-password/page.tsx                 CREATE — 'use client'
│   └── user-dashboard/
│       ├── layout.tsx                          CREATE — 'use client' auth guard
│       ├── page.tsx                            CREATE — redirect to /user-dashboard/favorites
│       ├── favorites/page.tsx                  CREATE — 'use client'
│       ├── profile/page.tsx                    CREATE — 'use client'
│       └── enquiries/page.tsx                  CREATE — 'use client' (new page)
├── components/
│   ├── Providers.tsx                           CREATE — wraps all Context providers
│   ├── Layout/
│   │   ├── PublicHeader.tsx                    CREATE — public site header ('use client')
│   │   └── PublicFooter.tsx                    CREATE — public site footer
│   ├── Home/                                   PORT from src/components/Home/*
│   ├── Listing/                                PORT from src/components/* listing components
│   ├── Property/                               PORT from src/components/PropertyShowcase/*
│   ├── Blog/                                   PORT from src/components/Blog/*
│   └── Projects/                               PORT from src/components/Projects/*
├── context/
│   ├── LanguageContext.tsx                     PORT (add 'use client', fix localStorage SSR)
│   ├── FavoritesContext.tsx                    PORT (add 'use client', fix localStorage SSR)
│   ├── PermissionContext.tsx                   PORT (add 'use client')
│   └── SocketContext.tsx                       PORT (add 'use client')
├── lib/
│   ├── api.ts                                  PORT from src/Api/action.js (client-side axios)
│   └── serverFetch.ts                          CREATE — native fetch for Server Components
├── language/
│   ├── translations.ts                         COPY from src/Language/translations.js
│   └── types.ts                                CREATE — translation type
├── public/
│   └── images/                                 COPY from Property-frontend/public/images
├── .env.local                                  CREATE
├── next.config.ts                              CREATE
├── tailwind.config.ts                          CREATE
├── tsconfig.json                               AUTO-GENERATED by create-next-app
└── package.json                                CREATE
```

---

## Task 1: Scaffold the Next.js project

**Files:**
- Create: `Property-frontend-next/` (entire project)

- [ ] **Step 1: Run create-next-app from the repo root**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
npx create-next-app@14 Property-frontend-next \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias "@/*"
```

When prompted: accept all defaults. This creates `app/`, `public/`, `next.config.ts`, `tsconfig.json`, `package.json`.

Expected output ends with: `Success! Created Property-frontend-next`

- [ ] **Step 2: Enter the new project and verify it boots**

```bash
cd Property-frontend-next
npm run dev
```

Expected: `▲ Next.js 14.x.x` server starts at `http://localhost:3000`. Open it — you should see the default Next.js page. Stop the server (Ctrl+C).

- [ ] **Step 3: Install required dependencies**

```bash
npm install axios antd framer-motion socket.io-client react-toastify \
  lucide-react react-icons clsx tailwind-merge \
  @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/modifiers @dnd-kit/utilities \
  date-fns react-day-picker class-variance-authority lenis react-quill-new
```

- [ ] **Step 4: Commit scaffold**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: scaffold Next.js 14 App Router project"
```

---

## Task 2: Configure environment, paths, and Tailwind

**Files:**
- Create: `Property-frontend-next/.env.local`
- Modify: `Property-frontend-next/next.config.ts`
- Modify: `Property-frontend-next/app/globals.css`

- [ ] **Step 1: Create `.env.local`**

```
# Property-frontend-next/.env.local
NEXT_PUBLIC_API_URL=http://localhost:5002/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_ADMIN_URL=http://localhost:5173

# Production (comment out above, uncomment below):
# NEXT_PUBLIC_API_URL=https://api.183housingsolutions.com/api/v1
# NEXT_PUBLIC_SITE_URL=https://api.183housingsolutions.com
# NEXT_PUBLIC_ADMIN_URL=https://admin.183housingsolutions.com
```

- [ ] **Step 2: Update `next.config.ts`**

```ts
// Property-frontend-next/next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '183housingsolutions.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 3: Replace `app/globals.css` with Tailwind v4 directives**

```css
/* Property-frontend-next/app/globals.css */
@import "tailwindcss";

:root {
  --brand: #41398B;
  --brand-light: #E8E8FF;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

- [ ] **Step 4: Copy public assets**

```bash
cp -r "/Users/arundurai/Public/Loki Works/Property/Property-frontend/public/images" \
      "/Users/arundurai/Public/Loki Works/Property/Property-frontend-next/public/"
```

- [ ] **Step 5: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: configure env, Tailwind, next.config, and copy public assets"
```

---

## Task 3: Port language files and contexts

**Files:**
- Create: `Property-frontend-next/language/translations.ts`
- Create: `Property-frontend-next/context/LanguageContext.tsx`
- Create: `Property-frontend-next/context/FavoritesContext.tsx`
- Create: `Property-frontend-next/context/PermissionContext.tsx`
- Create: `Property-frontend-next/context/SocketContext.tsx`

- [ ] **Step 1: Copy translations**

```bash
cp "/Users/arundurai/Public/Loki Works/Property/Property-frontend/src/Language/translations.js" \
   "/Users/arundurai/Public/Loki Works/Property/Property-frontend-next/language/translations.ts"
```

Then open `language/translations.ts` and add this line at the top if it doesn't exist:
```ts
// language/translations.ts  — no changes needed, already a plain JS object export
```

- [ ] **Step 2: Create `context/LanguageContext.tsx`**

The key difference from the Vite version: `localStorage` is not available during SSR so we guard it.

```tsx
// Property-frontend-next/context/LanguageContext.tsx
'use client'

import React, { createContext, useContext, useState } from 'react'

interface LanguageContextValue {
  language: string
  toggleLanguage: (lang: string) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'vi',
  toggleLanguage: () => {},
})

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<string>(() => {
    if (typeof window === 'undefined') return 'vi'
    return localStorage.getItem('language') || 'vi'
  })

  const toggleLanguage = (lang: string) => {
    setLanguage(lang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
```

- [ ] **Step 3: Create `context/FavoritesContext.tsx`**

Port from `Property-frontend/src/Context/FavoritesContext.jsx` with these changes:
- Add `'use client'` at top
- Guard all `localStorage` accesses with `typeof window !== 'undefined'`
- Replace `@/Api/action` import with `@/lib/api`
- Replace `@/Common/CommonToaster` with inline toast call

```tsx
// Property-frontend-next/context/FavoritesContext.tsx
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useLanguage } from './LanguageContext'
import { translations } from '@/language/translations'
import { addFavorite as apiAddFavorite } from '@/lib/api'

interface Favorite {
  _id: string
  property: Record<string, unknown>
  createdAt: string
}

interface FavoritesContextValue {
  favorites: Favorite[]
  loading: boolean
  addFavorite: (property: Record<string, unknown>) => Promise<boolean>
  removeFavorite: (propertyId: string) => Promise<boolean>
  isFavorite: (propertyId: string) => boolean
  fetchFavorites: () => Promise<void>
  sendEnquiry: (message?: string) => Promise<void>
  clearFavorites: () => void
}

const FavoritesContext = createContext<FavoritesContextValue>({} as FavoritesContextValue)

export const useFavorites = () => useContext(FavoritesContext)

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const { language } = useLanguage()
  const t = (translations as Record<string, Record<string, string>>)[language]

  const [favorites, setFavorites] = useState<Favorite[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('localFavorites')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('localFavorites', JSON.stringify(favorites))
    }
  }, [favorites])

  const fetchFavorites = async () => { setLoading(false) }

  const isFavorite = (propertyId: string) =>
    favorites.some(fav => {
      const fPropId = (fav.property as Record<string, unknown>)._id ||
        ((fav.property as Record<string, unknown>).listingInformation as Record<string, unknown>)?.listingInformationPropertyId
      return fPropId === propertyId
    })

  const addFavorite = async (property: Record<string, unknown>): Promise<boolean> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) { toast.error(t.loginToAddFavorite); return false }
    if (!property) return false

    const propId = (property._id || (property.listingInformation as Record<string, unknown>)?.listingInformationPropertyId) as string
    if (isFavorite(propId)) { toast.warning(t.alreadyInFavorites); return false }

    const newFav: Favorite = { _id: Date.now().toString(), property, createdAt: new Date().toISOString() }
    setFavorites(prev => [...prev, newFav])
    toast.success(t.addedToFavorites)
    return true
  }

  const removeFavorite = async (propertyId: string): Promise<boolean> => {
    if (!propertyId) return false
    setFavorites(prev => prev.filter(f => {
      const fPropId = (f.property as Record<string, unknown>)._id ||
        ((f.property as Record<string, unknown>).listingInformation as Record<string, unknown>)?.listingInformationPropertyId
      return f._id !== propertyId && fPropId !== propertyId
    }))
    toast.success(t.removedFromFavorites)
    return true
  }

  const sendEnquiry = async (messageProp = '') => {
    const message = typeof messageProp === 'string' ? messageProp : ''
    if (favorites.length === 0) { toast.warning(t.noFavoritesToSend); return }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) { toast.error(t.loginToSendEnquiry); return }

    try {
      setActionLoading('sending')
      const propertyIds = favorites.map(fav =>
        (fav.property as Record<string, unknown>)._id ||
        ((fav.property as Record<string, unknown>).listingInformation as Record<string, unknown>)?.listingInformationPropertyId
      ).filter(Boolean) as string[]

      if (propertyIds.length === 0) { toast.error(t.invalidFavorites); return }
      await apiAddFavorite(propertyIds, message)
      toast.success(t.enquirySent)
    } catch {
      toast.error(t.errorSendingEnquiry)
    } finally {
      setActionLoading(null)
    }
  }

  const clearFavorites = () => {
    setFavorites([])
    if (typeof window !== 'undefined') localStorage.removeItem('localFavorites')
  }

  return (
    <FavoritesContext.Provider value={{ favorites, loading, addFavorite, removeFavorite, isFavorite, fetchFavorites, sendEnquiry, clearFavorites }}>
      {children}
      {actionLoading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-white border-t-[#41398B] rounded-full animate-spin" />
            <p className="text-white text-lg tracking-wide font-medium">
              {actionLoading === 'sending' ? (language === 'en' ? 'Sending Enquiry...' : 'Đang gửi yêu cầu...') : '...'}
            </p>
          </div>
        </div>
      )}
    </FavoritesContext.Provider>
  )
}
```

- [ ] **Step 4: Create `context/PermissionContext.tsx`**

Port from `Property-frontend/src/Context/PermissionContext.jsx`. Add `'use client'` at top and replace `@/Api/action` with `@/lib/api`. The logic is identical — just add the directive and fix the import path.

```tsx
// Property-frontend-next/context/PermissionContext.tsx
'use client'

// Copy the full contents of:
// Property-frontend/src/Context/PermissionContext.jsx
// Then:
//   1. Add 'use client' as the very first line
//   2. Change: import { getRoles } from '@/Api/action'
//      To:     import { getRoles } from '@/lib/api'
//   3. Add TypeScript types to the function signatures (or use `any` for a quick port)
```

- [ ] **Step 5: Create `context/SocketContext.tsx`**

```tsx
// Property-frontend-next/context/SocketContext.tsx
'use client'

// Copy the full contents of:
// Property-frontend/src/Context/SocketContext.jsx
// Then:
//   1. Add 'use client' as the very first line
//   2. No other changes needed
```

- [ ] **Step 6: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: port language files and all context providers"
```

---

## Task 4: Port the API layer

**Files:**
- Create: `Property-frontend-next/lib/api.ts`
- Create: `Property-frontend-next/lib/serverFetch.ts`

- [ ] **Step 1: Create `lib/api.ts` (client-side Axios — port of `src/Api/action.js`)**

```ts
// Property-frontend-next/lib/api.ts
import axios from 'axios'

const API = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_API_URL || 'https://api.183housingsolutions.com/api/v1').replace(/\/$/, ''),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    const lang = localStorage.getItem('language') || 'vi'
    config.headers['Accept-Language'] = lang
  }
  return config
})

API.interceptors.response.use(
  (res) => res,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config.url.includes('/auth/login') &&
      typeof window !== 'undefined'
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('userRole')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── AUTH ──────────────────────────────────────────────────────────────────
export const loginUser = (data: object) => API.post('/auth/login', data)
export const registerUser = (data: object) => API.post('/auth/register', data)
export const userRegisterApi = (data: object) => API.post('/auth/user-register', data)
export const forgotPassword = (data: object) => API.post('/auth/forgot-password', data)
export const resetPassword = (data: object) => API.post('/auth/reset-password', data)
export const getMe = () => API.get('/auth/me')
export const updatePassword = (data: object) => API.put('/auth/update-password', data)

// ─── USERS ─────────────────────────────────────────────────────────────────
export const getAllUsers = () => API.get('/users')
export const getUserById = (id: string) => API.get(`/users/${id}`)
export const createUser = (data: object) => API.post('/users', data)
export const updateUser = (id: string, data: object) => API.put(`/users/${id}`, data)
export const deleteUser = (id: string) => API.delete(`/users/${id}`)

// ─── PROPERTIES ────────────────────────────────────────────────────────────
export const getAllProperties = (params?: object) => API.get('/properties', { params })
export const getSingleListingByPropertyID = (id: string) => API.get(`/properties/${id}`)
export const createProperty = (data: object) => API.post('/properties', data)
export const updateProperty = (id: string, data: object) => API.put(`/properties/${id}`, data)

// ─── FAVORITES / ENQUIRY ───────────────────────────────────────────────────
export const getFavorites = () => API.get('/favorites')
export const addFavorite = (propertyIds: string[], message: string) =>
  API.post('/favorites', { propertyIds, message })
export const removeFavorite = (id: string) => API.delete(`/favorites/${id}`)

// ─── BLOGS ─────────────────────────────────────────────────────────────────
export const getAllBlogs = (params?: object) => API.get('/blogs', { params })
export const getBlogBySlug = (slug: string) => API.get(`/blogs/${slug}`)

// ─── PROJECTS ──────────────────────────────────────────────────────────────
export const getAllProjects = (params?: object) => API.get('/projects', { params })
export const getProjectBySlug = (slug: string) => API.get(`/projects/${slug}`)

// ─── CMS ───────────────────────────────────────────────────────────────────
export const getHomeCms = () => API.get('/cms/home')
export const getAboutCms = () => API.get('/cms/about')
export const getContactCms = () => API.get('/cms/contact')
export const getHeaderCms = () => API.get('/cms/header')
export const getFooterCms = () => API.get('/cms/footer')

// ─── ROLES ─────────────────────────────────────────────────────────────────
export const getRoles = () => API.get('/roles')

// ─── ENQUIRIES ─────────────────────────────────────────────────────────────
export const getUserEnquiries = () => API.get('/enquiries/my')
export const createEnquiry = (data: object) => API.post('/enquiries', data)

export default API
```

- [ ] **Step 2: Create `lib/serverFetch.ts` (server-side fetch for Server Components)**

```ts
// Property-frontend-next/lib/serverFetch.ts
// Used only in Server Components — no localStorage, no axios

const BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://api.183housingsolutions.com/api/v1').replace(/\/$/, '')

export async function serverGet<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    next: { revalidate },
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) throw new Error(`Server fetch failed: ${path} — ${res.status}`)
  const json = await res.json()
  return json
}

export const fetchAllProperties = (params?: Record<string, string>) => {
  const qs = params ? '?' + new URLSearchParams(params).toString() : ''
  return serverGet<{ success: boolean; data: unknown[] }>(`/properties${qs}`)
}

export const fetchPropertyById = (id: string) =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>(`/properties/${id}`)

export const fetchAllBlogs = () =>
  serverGet<{ success: boolean; data: unknown[] }>('/blogs')

export const fetchBlogBySlug = (slug: string) =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>(`/blogs/${slug}`)

export const fetchAllProjects = () =>
  serverGet<{ success: boolean; data: unknown[] }>('/projects')

export const fetchProjectBySlug = (slug: string) =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>(`/projects/${slug}`)

export const fetchHomeCms = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/cms/home')

export const fetchAboutCms = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/cms/about')

export const fetchContactCms = () =>
  serverGet<{ success: boolean; data: Record<string, unknown> }>('/cms/contact')
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add client-side API layer and server-side fetch utilities"
```

---

## Task 5: Root layout with Providers

**Files:**
- Create: `Property-frontend-next/components/Providers.tsx`
- Modify: `Property-frontend-next/app/layout.tsx`

- [ ] **Step 1: Create `components/Providers.tsx`**

All context providers must be in a `'use client'` component because they use hooks. The root layout is a Server Component and cannot directly use context. This wrapper solves that.

```tsx
// Property-frontend-next/components/Providers.tsx
'use client'

import { LanguageProvider } from '@/context/LanguageContext'
import { PermissionProvider } from '@/context/PermissionContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { SocketProvider } from '@/context/SocketContext'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <PermissionProvider>
        <FavoritesProvider>
          <SocketProvider>
            {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </SocketProvider>
        </FavoritesProvider>
      </PermissionProvider>
    </LanguageProvider>
  )
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

```tsx
// Property-frontend-next/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'

export const metadata: Metadata = {
  title: '183 Housing Solutions',
  description: 'Find your perfect home in Vietnam',
  openGraph: {
    siteName: '183 Housing Solutions',
    locale: 'en_US',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Start dev server and verify no crash**

```bash
cd "/Users/arundurai/Public/Loki Works/Property/Property-frontend-next"
npm run dev
```

Expected: Server starts at `http://localhost:3000` with no red errors in terminal.

- [ ] **Step 4: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add Providers wrapper and root layout"
```

---

## Task 6: Auth pages (login, register, forgot-password, reset-password)

**Files:**
- Create: `app/login/page.tsx`
- Create: `app/register/page.tsx`
- Create: `app/forgot-password/page.tsx`
- Create: `app/reset-password/page.tsx`

- [ ] **Step 1: Create `app/login/page.tsx`**

Port from `Property-frontend/src/Login/Login.jsx`. Key changes:
- Add `'use client'` at top
- Replace `useNavigate` → `useRouter` from `next/navigation`
- Replace `<Link to=` → `<Link href=` from `next/link`
- Replace `window.location.search` with `useSearchParams()` from `next/navigation`

```tsx
// Property-frontend-next/app/login/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Loader2, X } from 'lucide-react'
import { loginUser } from '@/lib/api'
import { toast } from 'react-toastify'
import { usePermissions } from '@/context/PermissionContext'
import { useFavorites } from '@/context/FavoritesContext'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/language/translations'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshPermissions, getFirstAccessiblePath } = usePermissions()
  const { fetchFavorites } = useFavorites()
  const { language } = useLanguage()
  const t = (translations as Record<string, Record<string, string>>)[language]

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [staffFormData, setStaffFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)

  useEffect(() => {
    if (searchParams.get('error') === 'inactive') {
      setError('Your account has been deactivated or deleted. Please contact admin.')
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleStaffChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setStaffFormData({ ...staffFormData, [e.target.name]: e.target.value })

  const handleLogin = async (data: { email: string; password: string }) => {
    setError('')
    setLoading(true)
    try {
      const res = await loginUser(data)
      if (res.data.success) {
        const user = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('userId', user?._id || user?.id || '')
        localStorage.setItem('userName', user?.name || '')
        localStorage.setItem('userRole', user?.role || 'user')
        const newPermissions = await refreshPermissions()
        await fetchFavorites()
        toast.success(t.loginSuccess)

        if (user?.role === 'user') {
          router.push('/')
        } else {
          const firstPath = getFirstAccessiblePath(newPermissions)
          // Admin roles redirect to the Vite admin subdomain
          const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.183housingsolutions.com'
          window.location.href = `${adminUrl}${firstPath}`
        }
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      setError(axiosErr.response?.data?.error || t.loginFailed)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleLogin(formData) }
  const handleStaffSubmit = (e: React.FormEvent) => { e.preventDefault(); handleLogin(staffFormData) }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#f6f4ff] to-[#e5defc] relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full bg-contain bg-bottom bg-no-repeat h-120"
        style={{ backgroundImage: "url('/images/login/bg.png')" }} />

      <div className="mb-16 text-center z-10">
        <img className="h-16" src="/images/login/logo.png" alt="183 Housing Solutions" />
      </div>

      <div className="relative z-10 w-full max-w-lg bg-white shadow-xl rounded-2xl px-8 py-10 border border-gray-100">
        <h2 style={{ fontWeight: 800, fontSize: 36 }} className="text-center text-gray-800 mb-3">
          {t.login}
        </h2>
        <p className="text-center text-[#000] text-md mb-8">{t.loginSubtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2a2a2a] mb-1">{t.emailAddress}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input type="email" name="email" required value={formData.email}
                onChange={handleChange} placeholder={t.enterEmail}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2a2a2a] mb-1">{t.password}</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
              <input type={showPassword ? 'text' : 'password'} name="password" required
                value={formData.password} onChange={handleChange} placeholder={t.enterPassword}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link href="/forgot-password" className="text-sm text-[#4A3AFF] hover:underline">{t.forgotPassword}</Link>
            </div>
          </div>

          {error && (
            <p className="text-center text-red-500 text-xs bg-red-50 py-2 rounded-md border border-red-200">{error}</p>
          )}

          <button type="submit" disabled={loading}
            className="w-full cursor-pointer py-3 bg-[#41398B] hover:bg-[#41398be1] text-white font-semibold rounded-4xl shadow-md transition-all flex justify-center items-center">
            {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> {t.loggingIn}</> : t.loginButton}
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              {t.dontHaveAccount}{' '}
              <Link href="/register" className="text-[#4A3AFF] hover:text-[#41398B] font-semibold transition">{t.registerHere}</Link>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              <button type="button"
                onClick={() => { setStaffFormData({ email: '', password: '' }); setError(''); setIsStaffModalOpen(true) }}
                className="text-gray-500 hover:text-[#41398B] font-medium transition cursor-pointer underline hover:no-underline">
                {t.staffLogin}
              </button>
            </p>
          </div>
        </form>
      </div>

      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <button onClick={() => setIsStaffModalOpen(false)}
              className="absolute cursor-pointer top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
            <div className="mb-8 text-center">
              <img className="h-10 mx-auto mb-4" src="/images/login/logo.png" alt="" />
              <h2 style={{ fontWeight: 800, fontSize: 28 }} className="text-gray-800 mb-2">{t.staffLogin}</h2>
              <p className="text-gray-500 text-sm">{t.staffLoginSubtitle}</p>
            </div>
            <form onSubmit={handleStaffSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#2a2a2a] mb-1">{t.emailAddress}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input type="email" name="email" required value={staffFormData.email}
                    onChange={handleStaffChange} placeholder={t.enterEmail}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2a2a2a] mb-1">{t.password}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
                  <input type={showPassword ? 'text' : 'password'} name="password" required
                    value={staffFormData.password} onChange={handleStaffChange} placeholder={t.enterPassword}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#4A3AFF] focus:border-[#4A3AFF] outline-none text-gray-700" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1">
                  <Link href="/forgot-password" className="text-sm text-[#4A3AFF] hover:underline">{t.forgotPassword}</Link>
                </div>
              </div>
              {error && <p className="text-center text-red-500 text-sm bg-red-50 py-2 rounded-md border border-red-200">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full cursor-pointer py-3 bg-[#41398B] hover:bg-[#41398be1] text-white font-semibold rounded-4xl shadow-md transition-all flex justify-center items-center">
                {loading ? <><Loader2 className="animate-spin mr-2" size={18} /> {t.loggingIn}</> : t.loginButton}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Wrap in Suspense because useSearchParams() requires it
export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>
}
```

- [ ] **Step 2: Create `app/register/page.tsx`**

Port from `Property-frontend/src/Login/Register.jsx`. Apply the same adapter changes:
- `'use client'` at top
- `useNavigate` → `useRouter`
- `<Link to=` → `<Link href=`
- Fix import paths (`@/lib/api`, `@/context/`, `@/language/translations`)

- [ ] **Step 3: Create `app/forgot-password/page.tsx`**

Port from `Property-frontend/src/Login/ForgotPassword.jsx`. Same adapter changes.

- [ ] **Step 4: Create `app/reset-password/page.tsx`**

Port from `Property-frontend/src/Login/ResetPassword.jsx`. Same adapter changes. Use `useSearchParams()` wrapped in `<Suspense>` for reading the token from the URL.

- [ ] **Step 5: Verify auth pages render**

```bash
cd "/Users/arundurai/Public/Loki Works/Property/Property-frontend-next"
npm run dev
```

Visit `http://localhost:3000/login` — should show the login form. Visit `/register` — should show registration form. No console errors about missing contexts.

- [ ] **Step 6: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: port auth pages (login, register, forgot/reset password)"
```

---

## Task 7: Public layout (header and footer)

**Files:**
- Create: `Property-frontend-next/components/Layout/PublicHeader.tsx`
- Create: `Property-frontend-next/components/Layout/PublicFooter.tsx`

- [ ] **Step 1: Identify the existing public header/footer**

```bash
find "/Users/arundurai/Public/Loki Works/Property/Property-frontend/src/components" \
  -type f -name "*.jsx" | xargs grep -l "header\|Header\|navbar\|Navbar" 2>/dev/null | head -10
```

Note the file path returned — that is the component to port.

- [ ] **Step 2: Port `PublicHeader.tsx`**

Copy the header component. Apply adapters:
- `'use client'` (header is interactive — language switcher, mobile menu, auth state)
- `useNavigate` → `useRouter`, `useLocation` → `usePathname`
- `<Link to=` → `<Link href=`
- Fix all import paths to use `@/`

```tsx
// Property-frontend-next/components/Layout/PublicHeader.tsx
'use client'

// Port of Property-frontend/src/components/[Header component]
// Adapter changes applied (see cheat sheet at top of this plan)
```

- [ ] **Step 3: Port `PublicFooter.tsx`**

Footer is likely a static Server Component (no interactivity). Check if it uses any hooks. If not, omit `'use client'`. Fix `<Link to=` → `<Link href=`.

- [ ] **Step 4: Add header/footer to `app/layout.tsx`**

```tsx
// Property-frontend-next/app/layout.tsx  (update)
import type { Metadata } from 'next'
import './globals.css'
import Providers from '@/components/Providers'
import PublicHeader from '@/components/Layout/PublicHeader'
import PublicFooter from '@/components/Layout/PublicFooter'

export const metadata: Metadata = {
  title: '183 Housing Solutions',
  description: 'Find your perfect home in Vietnam',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <PublicHeader />
          <main className="flex-1">{children}</main>
          <PublicFooter />
        </Providers>
      </body>
    </html>
  )
}
```

Note: user-dashboard layout will override this with a different header. That is handled in Task 8.

- [ ] **Step 5: Verify layout renders on `/login`**

```bash
npm run dev
```

Visit `http://localhost:3000/login` — header and footer should appear. No layout shift or missing import errors.

- [ ] **Step 6: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add public header and footer layout"
```

---

## Task 8: User dashboard layout and auth guard

**Files:**
- Create: `Property-frontend-next/app/user-dashboard/layout.tsx`
- Create: `Property-frontend-next/app/user-dashboard/page.tsx`

- [ ] **Step 1: Create `app/user-dashboard/layout.tsx`**

This layout is `'use client'`, checks localStorage for token on mount, and redirects to `/login` if missing. It replaces the Vite `ProtectedRoute` + `UserDashboardLayout`.

```tsx
// Property-frontend-next/app/user-dashboard/layout.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Heart, User, MessageSquare } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'
import { useFavorites } from '@/context/FavoritesContext'
import { translations } from '@/language/translations'

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { language } = useLanguage()
  const { favorites } = useFavorites()
  const t = (translations as Record<string, Record<string, string>>)[language]
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('userRole')
    if (!token) {
      router.replace('/login')
      return
    }
    // Only regular users access the user dashboard
    if (role !== 'user') {
      router.replace('/login')
      return
    }
    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#41398B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isActive = (path: string) => pathname.startsWith(path)

  const navItems = [
    { href: '/user-dashboard/profile', icon: <User size={20} />, label: t.myProfile },
    { href: '/user-dashboard/favorites', icon: <Heart size={20} />, label: t.myFavorites },
    { href: '/user-dashboard/enquiries', icon: <MessageSquare size={20} />, label: t.myEnquiries || 'My Enquiries' },
  ]

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gradient-to-b from-[#F7F6F9] to-[#EAE8FD] pt-4 pb-16 lg:pb-0 relative">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-[280px] flex-col items-center py-6 h-full overflow-y-auto scrollbar-hide">
        <div className="flex flex-col w-full gap-4 px-4">
          {navItems.map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`group flex items-center gap-3 px-2 py-2 rounded-full transition
                ${isActive(href) ? 'bg-[#41398B] text-white' : 'hover:bg-[#41398B] hover:text-white'}`}>
              <span className="p-3 rounded-full bg-[#E8E8FF] text-[#41398B] group-hover:bg-white">{icon}</span>
              <span className="font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">{children}</div>

      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 flex items-center justify-around px-2 z-[9999] lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        {navItems.map(({ href, icon, label }) => (
          <Link key={href} href={href}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full relative transition-colors
              ${isActive(href) ? 'text-[#41398B]' : 'text-gray-400'}`}>
            {icon}
            {href.includes('favorites') && favorites.length > 0 && (
              <span className="absolute top-2 right-1/4 bg-[#41398B] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {favorites.length}
              </span>
            )}
            <span className="text-[10px] font-medium mt-1">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/user-dashboard/page.tsx`**

```tsx
// Property-frontend-next/app/user-dashboard/page.tsx
import { redirect } from 'next/navigation'

export default function UserDashboardIndex() {
  redirect('/user-dashboard/favorites')
}
```

- [ ] **Step 3: Verify redirect works**

```bash
npm run dev
```

Visit `http://localhost:3000/user-dashboard` without a token in localStorage — should redirect to `/login`. Open browser DevTools → Application → Local Storage, add `token=test` and `userRole=user`, then visit `/user-dashboard` — should redirect to `/user-dashboard/favorites` (blank page for now).

- [ ] **Step 4: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add user dashboard layout with client-side auth guard"
```

---

## Task 9: User dashboard pages (favorites, profile, enquiries)

**Files:**
- Create: `app/user-dashboard/favorites/page.tsx`
- Create: `app/user-dashboard/profile/page.tsx`
- Create: `app/user-dashboard/enquiries/page.tsx`

- [ ] **Step 1: Create `app/user-dashboard/favorites/page.tsx`**

Port from `Property-frontend/src/Pages/Favorites.jsx` (the `isDashboard=true` version). Apply adapters.

```tsx
// Property-frontend-next/app/user-dashboard/favorites/page.tsx
'use client'

// Port of Property-frontend/src/Pages/Favorites.jsx
// Pass isDashboard={true} behaviour inline (the Vite version used a prop)
// Adapter changes: useNavigate → useRouter, Link to → Link href, fix imports
```

- [ ] **Step 2: Create `app/user-dashboard/profile/page.tsx`**

Port from `Property-frontend/src/Pages/UserProfile.jsx`. Apply adapters.

```tsx
// Property-frontend-next/app/user-dashboard/profile/page.tsx
'use client'

// Port of Property-frontend/src/Pages/UserProfile.jsx
// Adapter changes: useNavigate → useRouter, Link to → Link href, fix imports
```

- [ ] **Step 3: Create `app/user-dashboard/enquiries/page.tsx`**

This is a new page. It fetches the user's submitted enquiries from `/enquiries/my`.

```tsx
// Property-frontend-next/app/user-dashboard/enquiries/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { getUserEnquiries } from '@/lib/api'
import { useLanguage } from '@/context/LanguageContext'
import { translations } from '@/language/translations'

interface Enquiry {
  _id: string
  properties: { title?: string; _id: string }[]
  message: string
  status: string
  createdAt: string
}

export default function EnquiriesPage() {
  const { language } = useLanguage()
  const t = (translations as Record<string, Record<string, string>>)[language]
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getUserEnquiries()
      .then(res => setEnquiries(res.data?.data || []))
      .catch(() => setError('Failed to load enquiries'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-4 border-[#41398B] border-t-transparent rounded-full animate-spin" /></div>
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>

  return (
    <div className="max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-[#41398B] mb-6">
        {t.myEnquiries || 'My Enquiries'}
      </h1>

      {enquiries.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">{t.noEnquiries || 'No enquiries yet'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map(enquiry => (
            <div key={enquiry._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    enquiry.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'}`}>
                  {enquiry.status}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(enquiry.createdAt).toLocaleDateString()}
                </span>
              </div>

              {enquiry.properties?.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm text-gray-500 mb-1">Properties:</p>
                  <div className="flex flex-wrap gap-2">
                    {enquiry.properties.map(p => (
                      <span key={p._id} className="px-2 py-1 bg-[#E8E8FF] text-[#41398B] text-xs rounded-md">
                        {p.title || p._id}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {enquiry.message && (
                <p className="text-sm text-gray-600 mt-2 border-t border-gray-50 pt-2">{enquiry.message}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Verify all three pages render**

```bash
npm run dev
```

With a valid `token` + `userRole=user` in localStorage:
- `http://localhost:3000/user-dashboard/favorites` — should show favorites list
- `http://localhost:3000/user-dashboard/profile` — should show profile form
- `http://localhost:3000/user-dashboard/enquiries` — should show enquiries list (empty state if no data)

- [ ] **Step 5: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add user dashboard pages (favorites, profile, enquiries)"
```

---

## Task 10: Listing page with server-side data + client filter panel

**Files:**
- Create: `app/listing/page.tsx`
- Create: `components/Listing/ListingFilterPanel.tsx`

- [ ] **Step 1: Create `components/Listing/ListingFilterPanel.tsx`**

The filter panel is interactive — it must be `'use client'`. Port the filter UI from `Property-frontend/src/Admin/Filters/Filter.jsx` or the public listing filter component. Apply adapters.

```tsx
// Property-frontend-next/components/Listing/ListingFilterPanel.tsx
'use client'

import React, { useState } from 'react'

interface FilterState {
  type: string
  minPrice: string
  maxPrice: string
  location: string
  bedrooms: string
}

interface ListingFilterPanelProps {
  initialFilters: FilterState
  onFilterChange: (filters: FilterState) => void
}

export default function ListingFilterPanel({ initialFilters, onFilterChange }: ListingFilterPanelProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)

  const handleChange = (key: keyof FilterState, value: string) => {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFilterChange(updated)
  }

  return (
    <div className="flex flex-wrap gap-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <select value={filters.type} onChange={e => handleChange('type', e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41398B]">
        <option value="">All Types</option>
        <option value="Lease">For Lease</option>
        <option value="Sale">For Sale</option>
        <option value="Home Stay">Home Stay</option>
      </select>

      <input type="text" placeholder="Location" value={filters.location}
        onChange={e => handleChange('location', e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41398B] w-40" />

      <input type="number" placeholder="Min Price" value={filters.minPrice}
        onChange={e => handleChange('minPrice', e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41398B] w-32" />

      <input type="number" placeholder="Max Price" value={filters.maxPrice}
        onChange={e => handleChange('maxPrice', e.target.value)}
        className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#41398B] w-32" />
    </div>
  )
}
```

- [ ] **Step 2: Create `app/listing/page.tsx`**

The page shell is a Server Component — it fetches the initial list of properties server-side. Filters are applied client-side via the `ListingFilterPanel`. Port the card rendering from `Property-frontend/src/Pages/ListingPage.jsx`.

```tsx
// Property-frontend-next/app/listing/page.tsx
import { fetchAllProperties } from '@/lib/serverFetch'
import ListingClientWrapper from '@/components/Listing/ListingClientWrapper'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Property Listings | 183 Housing Solutions',
  description: 'Browse all available properties for lease, sale, and home stay.',
}

export default async function ListingPage() {
  let properties: unknown[] = []
  try {
    const res = await fetchAllProperties()
    properties = res.data || []
  } catch {
    properties = []
  }

  return (
    <div className="min-h-screen bg-[#F7F6F9]">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-[#41398B] mb-6">Property Listings</h1>
        <ListingClientWrapper initialProperties={properties} />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/Listing/ListingClientWrapper.tsx`**

This client wrapper holds filter state and renders both the filter panel and the property grid.

```tsx
// Property-frontend-next/components/Listing/ListingClientWrapper.tsx
'use client'

import React, { useState, useMemo } from 'react'
import ListingFilterPanel from './ListingFilterPanel'
import PropertyCard from './PropertyCard'

interface FilterState {
  type: string
  minPrice: string
  maxPrice: string
  location: string
  bedrooms: string
}

const DEFAULT_FILTERS: FilterState = { type: '', minPrice: '', maxPrice: '', location: '', bedrooms: '' }

export default function ListingClientWrapper({ initialProperties }: { initialProperties: unknown[] }) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return (initialProperties as Record<string, unknown>[]).filter(p => {
      const listing = (p.listingInformation as Record<string, unknown>) || {}
      if (filters.type && listing.listingType !== filters.type) return false
      if (filters.location) {
        const loc = String(listing.location || p.title || '').toLowerCase()
        if (!loc.includes(filters.location.toLowerCase())) return false
      }
      return true
    })
  }, [initialProperties, filters])

  return (
    <div>
      <ListingFilterPanel initialFilters={filters} onFilterChange={setFilters} />
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-400 py-16">No properties found</p>
        ) : (
          filtered.map((p) => <PropertyCard key={String((p as Record<string, unknown>)._id)} property={p as Record<string, unknown>} />)
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/Listing/PropertyCard.tsx`**

Port from the existing property card component in `Property-frontend/src/components/`. Apply adapters. This must be `'use client'` if it has a favorites button, otherwise it can be a Server Component.

```tsx
// Property-frontend-next/components/Listing/PropertyCard.tsx
'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useFavorites } from '@/context/FavoritesContext'

export default function PropertyCard({ property }: { property: Record<string, unknown> }) {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites()
  const id = String(property._id || '')
  const listing = (property.listingInformation as Record<string, unknown>) || {}
  const title = String(property.title || listing.title || 'Untitled Property')
  const price = String(listing.price || listing.listingPrice || '')
  const type = String(listing.listingType || '')
  const images = (property.images as { url: string }[]) || []
  const thumbnail = images[0]?.url || '/images/dummy-img.jpg'
  const slug = String(property.slug || id)

  const favorited = isFavorite(id)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition">
      <div className="relative h-52 overflow-hidden">
        <img src={thumbnail} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
        <button onClick={() => favorited ? removeFavorite(id) : addFavorite(property)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition">
          <Heart size={18} className={favorited ? 'fill-[#41398B] text-[#41398B]' : 'text-gray-400'} />
        </button>
        {type && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-[#41398B] text-white text-xs rounded-full">{type}</span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-1 line-clamp-2">{title}</h3>
        {price && <p className="text-[#41398B] font-bold text-sm">{price}</p>}
        <Link href={`/property-showcase/${id}/${slug}`}
          className="mt-3 block w-full text-center py-2 border-2 border-[#41398B] text-[#41398B] rounded-lg text-sm font-medium hover:bg-[#41398B] hover:text-white transition">
          View Details
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Verify listing page renders**

```bash
npm run dev
```

Visit `http://localhost:3000/listing` — should show the property grid with filter panel. If backend is running locally you'll see real data; if not, the grid shows "No properties found".

- [ ] **Step 6: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add listing page with server data fetch and client filter panel"
```

---

## Task 11: Property detail page with ISR and generateMetadata

**Files:**
- Create: `app/property-showcase/[id]/[[...slug]]/page.tsx`

This is the most SEO-critical page. It uses `generateMetadata()` for OG tags and `revalidate: 300` for ISR.

- [ ] **Step 1: Create the page file**

```tsx
// Property-frontend-next/app/property-showcase/[id]/[[...slug]]/page.tsx
import { fetchPropertyById } from '@/lib/serverFetch'
import type { Metadata } from 'next'
import PropertyDetailClient from '@/components/Property/PropertyDetailClient'

interface PageProps {
  params: { id: string; slug?: string[] }
}

// ISR — revalidate every 5 minutes
export const revalidate = 300

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetchPropertyById(params.id)
    const property = res.data as Record<string, unknown>
    const listing = (property.listingInformation as Record<string, unknown>) || {}

    const title = String(property.title || listing.title || '183 Housing Solutions')
    const description = String(property.description || listing.description || 'View property details')
    const images = (property.images as { url: string }[]) || []
    const imageUrl = images[0]?.url || ''
    const slug = (params.slug?.[0]) || String(property.slug || params.id)
    const url = `${process.env.NEXT_PUBLIC_SITE_URL}/property-showcase/${params.id}/${slug}`

    return {
      title: `${title} | 183 Housing Solutions`,
      description,
      openGraph: {
        title,
        description,
        url,
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: title }] : [],
        type: 'website',
        siteName: '183 Housing Solutions',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    }
  } catch {
    return {
      title: 'Property | 183 Housing Solutions',
      description: 'Real estate listings in Vietnam',
    }
  }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  let property: Record<string, unknown> | null = null
  try {
    const res = await fetchPropertyById(params.id)
    property = res.data as Record<string, unknown>
  } catch {
    property = null
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold text-gray-700">Property Not Found</h1>
        <p className="text-gray-400 mt-2">This listing may have been removed or does not exist.</p>
      </div>
    )
  }

  return <PropertyDetailClient property={property} />
}
```

- [ ] **Step 2: Create `components/Property/PropertyDetailClient.tsx`**

Port from `Property-frontend/src/Pages/PropertyShowcasePage.jsx` (or the showcase component). The server page passes the pre-fetched `property` as a prop; interactive elements (enquiry button, favorites, image gallery) are handled here.

```tsx
// Property-frontend-next/components/Property/PropertyDetailClient.tsx
'use client'

// Port of Property-frontend/src/Pages/PropertyShowcasePage.jsx
// and its child components from src/components/PropertyShowcase/
// Key changes:
//   - Add 'use client' at top
//   - useNavigate → useRouter
//   - Link to → Link href
//   - No need to fetch property here (passed as prop from server)
//   - Fix all import paths to use @/
```

- [ ] **Step 3: Verify ISR and OG meta tags**

```bash
npm run dev
```

Visit `http://localhost:3000/property-showcase/SOME_ID` — the page should render. View page source in browser — you should see `<meta property="og:title"` and `<meta property="og:image"` tags in the `<head>`. This confirms `generateMetadata()` is working.

- [ ] **Step 4: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add property detail page with ISR 300s and generateMetadata OG tags"
```

---

## Task 12: Home page

**Files:**
- Create: `app/page.tsx`
- Port: `components/Home/` (all sub-components)

- [ ] **Step 1: Copy home sub-components**

```bash
cp -r "/Users/arundurai/Public/Loki Works/Property/Property-frontend/src/components/Home/" \
      "/Users/arundurai/Public/Loki Works/Property/Property-frontend-next/components/Home/"
```

Then for each `.jsx` file in `components/Home/`:
- Rename to `.tsx`
- Fix all import paths (replace `@/Api/action` → `@/lib/api`, `@/Language/` → `@/language/`, etc.)
- Replace `useNavigate`/`Link`/`useLocation` imports
- Add `'use client'` if the component uses hooks (useState, useEffect, context)
- Components that are purely static JSX (no hooks) can remain Server Components

- [ ] **Step 2: Create `app/page.tsx`**

```tsx
// Property-frontend-next/app/page.tsx
import { fetchHomeCms, fetchAllProperties } from '@/lib/serverFetch'
import HomePageClient from '@/components/Home/HomePageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '183 Housing Solutions — Find Your Home in Vietnam',
  description: 'Browse properties for lease, sale, and home stay in Vietnam.',
  openGraph: {
    title: '183 Housing Solutions',
    description: 'Find your perfect home in Vietnam',
    images: ['/images/og-default.jpg'],
  },
}

export default async function HomePage() {
  let cmsData: Record<string, unknown> = {}
  let featuredProperties: unknown[] = []

  try {
    const [cms, props] = await Promise.all([
      fetchHomeCms(),
      fetchAllProperties({ limit: '6', featured: 'true' }),
    ])
    cmsData = (cms.data as Record<string, unknown>) || {}
    featuredProperties = (props.data as unknown[]) || []
  } catch {
    // Render with empty data — components handle empty state gracefully
  }

  return <HomePageClient cmsData={cmsData} featuredProperties={featuredProperties} />
}
```

- [ ] **Step 3: Create `components/Home/HomePageClient.tsx`**

```tsx
// Property-frontend-next/components/Home/HomePageClient.tsx
'use client'

// Assembles all home section components (HomeBanner, HomeAbout, etc.)
// passing cmsData and featuredProperties as props
// Port from Property-frontend/src/Pages/HomePage.jsx
```

- [ ] **Step 4: Verify home page**

```bash
npm run dev
```

Visit `http://localhost:3000` — should render the home page (not the Coming Soon page). All home sections should be visible.

- [ ] **Step 5: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add home page with server-side CMS data and featured properties"
```

---

## Task 13: Remaining public pages

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/contact/page.tsx`
- Create: `app/blogs/page.tsx`
- Create: `app/blogs/[slug]/page.tsx`
- Create: `app/projects/page.tsx`
- Create: `app/projects/[slug]/page.tsx`
- Create: `app/terms-conditions/page.tsx`
- Create: `app/privacy-policy/page.tsx`
- Create: `app/favorites/page.tsx`

Pattern for each page is identical. Use the about page as the example:

- [ ] **Step 1: Create `app/about/page.tsx`**

```tsx
// Property-frontend-next/app/about/page.tsx
import { fetchAboutCms } from '@/lib/serverFetch'
import AboutPageClient from '@/components/About/AboutPageClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | 183 Housing Solutions',
  description: 'Learn about 183 Housing Solutions and our mission.',
}

export default async function AboutPage() {
  let cmsData: Record<string, unknown> = {}
  try {
    const res = await fetchAboutCms()
    cmsData = (res.data as Record<string, unknown>) || {}
  } catch {}
  return <AboutPageClient cmsData={cmsData} />
}
```

- [ ] **Step 2: Port `components/About/AboutPageClient.tsx`**

Copy from `Property-frontend/src/Pages/AboutPage.jsx` and its child components. Add `'use client'`, fix imports.

- [ ] **Step 3: Create `app/blogs/page.tsx` and `app/blogs/[slug]/page.tsx`**

For blog list:
```tsx
// Property-frontend-next/app/blogs/page.tsx
import { fetchAllBlogs } from '@/lib/serverFetch'
import BlogListClient from '@/components/Blog/BlogListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | 183 Housing Solutions',
  description: 'Real estate news and insights from Vietnam.',
}

export default async function BlogsPage() {
  let blogs: unknown[] = []
  try { blogs = (await fetchAllBlogs()).data || [] } catch {}
  return <BlogListClient blogs={blogs} />
}
```

For blog detail (ISR + OG meta):
```tsx
// Property-frontend-next/app/blogs/[slug]/page.tsx
import { fetchBlogBySlug } from '@/lib/serverFetch'
import BlogDetailClient from '@/components/Blog/BlogDetailClient'
import type { Metadata } from 'next'

interface PageProps { params: { slug: string } }

export const revalidate = 300

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const res = await fetchBlogBySlug(params.slug)
    const blog = res.data as Record<string, unknown>
    return {
      title: `${String(blog.title || 'Blog')} | 183 Housing Solutions`,
      description: String(blog.excerpt || blog.description || ''),
      openGraph: {
        title: String(blog.title || ''),
        description: String(blog.excerpt || ''),
        images: blog.image ? [{ url: String(blog.image) }] : [],
      },
    }
  } catch {
    return { title: 'Blog | 183 Housing Solutions' }
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  let blog: Record<string, unknown> | null = null
  try { blog = (await fetchBlogBySlug(params.slug)).data as Record<string, unknown> } catch {}
  if (!blog) return <div className="text-center py-20"><h1 className="text-2xl text-gray-600">Post not found</h1></div>
  return <BlogDetailClient blog={blog} />
}
```

- [ ] **Step 4: Create project pages**

Follow the exact same pattern as blogs but import `fetchAllProjects` / `fetchProjectBySlug` from `@/lib/serverFetch`. Port components from `Property-frontend/src/components/Projects/`.

- [ ] **Step 5: Create simple static pages**

```tsx
// Property-frontend-next/app/terms-conditions/page.tsx
import { serverGet } from '@/lib/serverFetch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions | 183 Housing Solutions',
}

export default async function TermsPage() {
  let content: Record<string, unknown> = {}
  try {
    const res = await serverGet<{ success: boolean; data: Record<string, unknown> }>('/cms/terms-conditions')
    content = res.data || {}
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#41398B] mb-8">Terms & Conditions</h1>
      {content.content ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: String(content.content) }} />
      ) : (
        <p className="text-gray-500">Content coming soon.</p>
      )}
    </div>
  )
}
```

```tsx
// Property-frontend-next/app/privacy-policy/page.tsx  — identical pattern
import { serverGet } from '@/lib/serverFetch'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | 183 Housing Solutions',
}

export default async function PrivacyPage() {
  let content: Record<string, unknown> = {}
  try {
    const res = await serverGet<{ success: boolean; data: Record<string, unknown> }>('/cms/privacy-policy')
    content = res.data || {}
  } catch {}

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-[#41398B] mb-8">Privacy Policy</h1>
      {content.content ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: String(content.content) }} />
      ) : (
        <p className="text-gray-500">Content coming soon.</p>
      )}
    </div>
  )
}
```

```tsx
// Property-frontend-next/app/contact/page.tsx
// Port from Property-frontend/src/Pages/ContactPage.jsx
// Contact form must be 'use client' — wrap in ContactPageClient component
```

```tsx
// Property-frontend-next/app/favorites/page.tsx
'use client'
// Port from Property-frontend/src/Pages/Favorites.jsx (isDashboard=false version)
```

- [ ] **Step 6: Verify all pages render without errors**

```bash
npm run dev
```

Visit each route:
- `http://localhost:3000/about`
- `http://localhost:3000/contact`
- `http://localhost:3000/blogs`
- `http://localhost:3000/projects`
- `http://localhost:3000/terms-conditions`
- `http://localhost:3000/privacy-policy`

No red errors in terminal. Each page renders its layout (header/footer visible).

- [ ] **Step 7: Commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: add all remaining public pages (about, contact, blogs, projects, terms, privacy)"
```

---

## Task 14: Production build verification

- [ ] **Step 1: Run production build**

```bash
cd "/Users/arundurai/Public/Loki Works/Property/Property-frontend-next"
npm run build
```

Expected: Build completes with no errors. You'll see a table showing each route and its rendering strategy (SSG/ISR/SSR).

If there are errors, common fixes:
- `localStorage is not defined` → add `typeof window !== 'undefined'` guard
- `useSearchParams() needs Suspense` → wrap the component in `<Suspense>`
- Missing module → check import path uses `@/` not relative `../`

- [ ] **Step 2: Run production server locally**

```bash
npm run start
```

Visit `http://localhost:3000`. Verify:
- Home page loads and OG tags in source
- `/listing` shows properties
- `/property-showcase/[real-id]` shows OG meta in source
- `/user-dashboard` redirects to login

- [ ] **Step 3: Confirm Vite admin is untouched**

```bash
cd "/Users/arundurai/Public/Loki Works/Property/Property-frontend"
npm run dev
```

Expected: Vite admin starts on its port without any changes.

- [ ] **Step 4: Final commit**

```bash
cd "/Users/arundurai/Public/Loki Works/Property"
git add Property-frontend-next/
git commit -m "feat: Next.js public site migration complete — production build verified"
```

---

## Deployment Notes (not in scope of this plan)

When deploying:
1. Deploy `Property-frontend-next/` to Vercel (or any Node host) for `183housingsolutions.com`
2. Deploy `Property-frontend/` (Vite admin) to a separate host for `admin.183housingsolutions.com`
3. In `app/login/page.tsx` — the admin redirect URL `https://admin.183housingsolutions.com` is hardcoded. Update to use `process.env.NEXT_PUBLIC_ADMIN_URL` for flexibility.
4. Add `NEXT_PUBLIC_ADMIN_URL=https://admin.183housingsolutions.com` to production `.env`.
