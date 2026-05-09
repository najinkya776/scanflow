# ScanFlow — Smart QR Review Platform for Restaurants

> Turn every QR scan into a 5-star Google review.

## Quick Start (5 minutes)

### 1. Install dependencies
```bash
cd scanflow
npm install
```

### 2. Set up environment
```bash
cp .env.example .env.local
```
Edit `.env.local` and add your `ANTHROPIC_API_KEY` (optional — works without it using fallback text).

### 3. Set up database & seed demo data
```bash
npx prisma db push
npm run db:seed
```

### 4. Start the app
```bash
npm run dev
```

Open **http://localhost:3000**

---

## Demo Credentials
- **Email:** demo@scanflow.app
- **Password:** demo1234
- **Customer Page:** http://localhost:3000/r/spice-garden

---

## Features Built

| Feature | Status |
|---|---|
| Landing page | ✅ |
| Restaurant signup / login | ✅ |
| QR code generation (PNG download) | ✅ |
| Customer-facing QR landing page | ✅ |
| Smart review funnel (positive → Google, negative → private) | ✅ |
| AI review suggestion (Claude Haiku) | ✅ |
| AI feedback analysis & insights | ✅ |
| AI marketing content generator | ✅ |
| AI reply generator for reviews | ✅ |
| Menu management (categories + items) | ✅ |
| Analytics dashboard with charts | ✅ |
| Feedback management | ✅ |
| Waiter call system | ✅ |
| Offers & promotions | ✅ |
| Settings & restaurant profile | ✅ |
| Multi-restaurant support | ✅ |

---

## Tech Stack
- **Frontend:** Next.js 14, Tailwind CSS, Recharts
- **Backend:** Next.js API Routes
- **Database:** SQLite via Prisma ORM
- **AI:** Anthropic Claude (claude-haiku-4-5)
- **Auth:** NextAuth.js v4
- **QR:** node-qrcode

---

## Monetization Plan
- Basic: ₹999/month
- Pro: ₹2,999/month  
- Enterprise: ₹9,999+/month
