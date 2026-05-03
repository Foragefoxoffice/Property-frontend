# Next.js Public Site Migration — Design Spec
Date: 2026-04-28

## Overview

Migrate the public-facing pages of the 183 Housing Solutions real estate app from React + Vite to Next.js 14+ (App Router). The Vite admin (`Property-frontend/`) stays untouched. A new sibling project `Property-frontend-next/` houses the Next.js public site.

## Decisions

| Question | Answer |
|---|---|
| Deployment | Separate subdomains: `183housingsolutions.com` → Next.js, `admin.183housingsolutions.com` → Vite admin |
| Auth strategy | Keep JWT in localStorage; user dashboard is client-side only (no SSR for auth-gated pages) |
| i18n | Port LanguageContext as-is (client-side localStorage toggle, EN/VI) |
| Data fetching | ISR with `revalidate: 300` on detail pages; SSR for listing index with filters |
| Project location | `Property-frontend-next/` sibling folder in the same repo |
| Router | Next.js 14 App Router |

## Routes → Files

| URL | File | Strategy |
|---|---|---|
| `/` | `app/page.tsx` | Server Component |
| `/listing` | `app/listing/page.tsx` | Server Component + 'use client' filter panel |
| `/property-showcase/[id]/[[...slug]]` | `app/property-showcase/[id]/[[...slug]]/page.tsx` | ISR 300s + generateMetadata() |
| `/blogs` | `app/blogs/page.tsx` | Server Component |
| `/blogs/[slug]` | `app/blogs/[slug]/page.tsx` | ISR 300s + generateMetadata() |
| `/projects` | `app/projects/page.tsx` | Server Component |
| `/projects/[slug]` | `app/projects/[slug]/page.tsx` | ISR 300s + generateMetadata() |
| `/about` | `app/about/page.tsx` | Server Component |
| `/contact` | `app/contact/page.tsx` | Server Component + 'use client' form |
| `/terms-conditions` | `app/terms-conditions/page.tsx` | Server Component |
| `/privacy-policy` | `app/privacy-policy/page.tsx` | Server Component |
| `/login` | `app/login/page.tsx` | 'use client' |
| `/register` | `app/register/page.tsx` | 'use client' |
| `/forgot-password` | `app/forgot-password/page.tsx` | 'use client' |
| `/reset-password` | `app/reset-password/page.tsx` | 'use client' |
| `/user-dashboard` | `app/user-dashboard/layout.tsx` | 'use client' auth guard |
| `/user-dashboard/favorites` | `app/user-dashboard/favorites/page.tsx` | 'use client' |
| `/user-dashboard/profile` | `app/user-dashboard/profile/page.tsx` | 'use client' |
| `/user-dashboard/enquiries` | `app/user-dashboard/enquiries/page.tsx` | 'use client' (new page) |
| `/favorites` | `app/favorites/page.tsx` | 'use client' |

## Architecture

### Server Components (public pages)
- Fetch data directly from backend API using `fetch()` with `next: { revalidate: 300 }`
- Return HTML with OG meta tags pre-rendered for crawlers
- Interactive children (filters, enquiry forms, favorites button) are 'use client' leaf components

### Client Components (interactive)
- Search/filter panel on listing page
- Enquiry/contact forms
- Favorites toggle button
- Language switcher
- All user dashboard pages

### generateMetadata() — Listing Detail
```ts
export async function generateMetadata({ params }): Promise<Metadata> {
  const property = await fetchProperty(params.id);
  return {
    title: property.title,
    description: property.description,
    openGraph: {
      title: property.title,
      description: property.description,
      images: [property.images[0]?.url],
      url: `https://api.183housingsolutions.com/property-showcase/${params.id}/${property.slug}`,
    },
  };
}
```

### Auth Guard (user-dashboard)
```ts
// app/user-dashboard/layout.tsx  — 'use client'
// Reads localStorage token on mount, redirects to /login if missing
// Same logic as current ProtectedRoute.jsx
```

### Shared Contexts
Ported verbatim: `LanguageContext`, `FavoritesContext`, `PermissionContext`, `SocketContext`
All wrapped in `app/layout.tsx` inside a `Providers` client component.

### API Layer
Single `lib/api.ts` — Axios instance pointing to `https://api.183housingsolutions.com/api/v1`.
Server-side fetches use native `fetch()` (for Next.js caching). Client-side fetches use the Axios instance.

## Tech Stack
- Next.js 14+ (App Router)
- React 18
- Tailwind CSS v4
- Ant Design 5 (kept for component parity)
- Shadcn/ui
- Axios (client-side)
- Framer Motion
- socket.io-client
- React Toastify
- TypeScript

## Build Order
1. Auth (login, register, forgot/reset password)
2. Public layout (header, footer, root layout with providers)
3. User dashboard (layout guard, favorites, profile, enquiries)
4. Users (profile page, auth context)
5. Listings (listing page with filters, listing detail with ISR + OG meta)
6. Remaining public pages (home, about, contact, blogs, projects)

## Out of Scope
- Admin (stays in `Property-frontend/` — not touched)
- Backend changes (no cookie-based auth)
- i18n URL routing (client-side language toggle only)
- Coming Soon page (removed — not ported to Next.js)
