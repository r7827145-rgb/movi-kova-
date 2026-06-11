# Movi Kova

A mobile-first movie ticket booking web app with a Hotstar-inspired dark UI, glassmorphism design, and full booking flow.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite + Tailwind v4, wouter routing, Zustand, framer-motion, shadcn/ui

## Where things live

- `artifacts/cinebook/` — main React web app (preview path `/`)
- `artifacts/api-server/` — Express API server (path `/api`, port 8080)
- `artifacts/cinebook/src/data/movies.ts` — mock movie data + pricing
- `artifacts/cinebook/src/store/booking.ts` — Zustand booking/seat state
- `artifacts/cinebook/src/index.css` — global styles, Tailwind, glassmorphism classes
- `artifacts/cinebook/src/App.tsx` — root routing, Clerk auth, splash screen gate
- `artifacts/cinebook/src/components/SplashScreen.tsx` — cinematic opening animation
- `artifacts/cinebook/src/pages/admin/` — admin panel (login + dashboard)

## Architecture decisions

- All prices in ₹ (Rupees); cash-only payment model
- Clerk auth for user sign-in (email OTP + Google); protected checkout/profile routes
- Admin panel uses username+password auth; session stored as `mk_admin_session` JSON in sessionStorage
- Admin credentials: username=`admin`, password=`786786`; theater owners use their own credentials
- Secret keyboard shortcut: type `786786` anywhere (not in a text field) to open `/admin`
- Splash screen gates on `sessionStorage.getItem("mk_splash_seen")` — plays once per session
- QR code on booking confirmation uses `QRCodeSVG` from `qrcode.react` (named import)
- Glassmorphism CSS classes: `.glass-card`, `.glass-card-dark`, `.glass-navbar`, `.glass-modal`

## Product

- **Home** — hero banner, Now Showing + Coming Soon movie rows, AI chat assistant
- **Movie Detail** — cast, showtimes, format picker (IMAX/4DX/Standard)
- **Seat Picker** — interactive seat map with format-based pricing
- **Checkout** — F&B add-ons, cash-only payment, booking confirmation with QR code
- **Profile** — user bookings, account settings (Clerk-authenticated)
- **Admin Panel** — `/admin` (username: admin / password: 786786): Dashboard, Financial (revenue/theater), Movies (add/edit/delete), Theaters (create with credentials+permissions), Bookings, Users, Settings
- **Theater Panel** — same `/admin` login with theater credentials: Dashboard, Revenue, My Movies, Bookings, QR Scanner

## User preferences

- App name: Movi Kova (displayed as "MOVI KOVA" in headers)
- Dark theme throughout: primary bg `#0f0f0f`, blue accent `#1565c0`/`#1e88e5`
- Fonts: Space Grotesk (display/headings) + Inter (body)

## Gotchas

- QR import must be `import { QRCodeSVG } from "qrcode.react"` — not the default export
- Clerk `<Show>` component does not accept function children — must use JSX elements
- `index.css`: Google Fonts @import must be line 1; `@layer` declaration on line 2; then `@import "tailwindcss"`
- Admin routes must come BEFORE the wildcard routes in App.tsx Switch

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
