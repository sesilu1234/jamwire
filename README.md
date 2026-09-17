<div align="center">

<img src="public/jamwire_icon.png" alt="Jamwire" width="420" />

### 🎸 Find the next spot where music happens.

A live map of jam sessions and open mics — the recurring, unticketed,
show-up-and-play kind.

[![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-58C4DC?logo=react&logoColor=white)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20+%20PostGIS-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000?logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 🚀 Run it

```bash
pnpm install
pnpm dev        # → http://localhost:3000
```

You'll need a `.env.local` with Supabase, Google Maps, NextAuth and Upstash
keys. Other scripts: `pnpm build`, `pnpm lint`, `pnpm format`.

## 🗺️ What's where

| Path                               | What lives there                                     |
| ---------------------------------- | ---------------------------------------------------- |
| `app/Home`                         | The map + card feed — the product                    |
| `app/[locationSlug]`               | Per-city pages (SEO landing pages)                   |
| `app/jam/[jamId]`                  | A single jam, with JSON-LD for rich results          |
| `app/createJam`                    | Host flow: place picker, dates, photos               |
| `app/api/public`                   | Unauthenticated reads: markers, cards, geocoding     |
| `app/api/private`                  | Authenticated writes: create / update / delete       |
| `lib/brand.ts`                     | 🎨 Name, tagline, logo, domain — **all in one file** |
| `cron_jobs/` + `.github/workflows` | Date rollovers, priority scoring, backups            |

## 🎨 Branding

Every user-facing string and image reads from [`lib/brand.ts`](lib/brand.ts).
Rename the app, swap the tagline or change the logo there and it propagates
everywhere — page titles, metadata, the header, the social card.

- **Logo** → replace `public/jamwire_icon.png`
- **Social preview** → generated at build time by
  [`app/opengraph-image.tsx`](app/opengraph-image.tsx), so it can never drift
  out of sync
- **Icons** → `app/icon.png`, `app/apple-icon.png`, `app/favicon.ico`

> **A note on the old name.** This was called _Jamspots_. The repo folder, the
> Supabase bucket (`jamspots_imageBucket`) and the S3 backup bucket
> (`jamspots-pg-dump`) still say so on purpose — renaming a bucket breaks every
> image URL already stored in the database, for zero user-visible benefit.

## 🤝 Adding a jam

Anyone can add one through the site — no special access needed. Host a weekly
jam or an open mic? Put it on the map. That's the whole point.

<div align="center">

**[jamwire.xyz](https://jamwire.xyz)**

</div>
