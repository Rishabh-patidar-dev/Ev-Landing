# EV Dealer Onboarding & Management System

End-to-end platform for EV dealership onboarding — 5 ACID-safe stages, automated KYC, geo-tagged site assessment, Aadhaar OTP e-signatures, and real-time OEM pipeline management.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        BROWSER / CLIENT                             │
│  Next.js 16 (App Router) · TypeScript · Tailwind CSS v4            │
│  Zustand state · React Hook Form + Zod · Leaflet.js + OSM          │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────────┐
│                     NEXT.JS SERVER (EDGE/NODE)                      │
│  /api/leads          → lead capture + GSTIN auto-verify             │
│  /api/upload         → Supabase Storage signed URL generation       │
│  /api/verify/[type]  → KYC API proxy (sandbox/perfios/whitebooks)  │
│  /api/stage/advance  → Calls Supabase ACID RPC                      │
│  /api/dashboard/stats→ OEM aggregate stats via RPC                  │
│  proxy.ts            → Auth guard + role-based redirect             │
└──────────┬────────────────────────────────────────────────────────┘
           │
   ┌───────┴──────────────────────────────────┐
   │          SUPABASE (BaaS)                 │
   │  ┌─────────────┐  ┌──────────────────┐  │
   │  │   Auth      │  │   PostgreSQL +   │  │
   │  │  (email +   │  │   Prisma 7 ORM   │  │
   │  │  magic link)│  │   (adapter-pg)   │  │
   │  └─────────────┘  └──────────────────┘  │
   │  ┌─────────────────────────────────────┐ │
   │  │  Storage Buckets                    │ │
   │  │  dealer-documents (private)         │ │
   │  │  site-media (private)               │ │
   │  └─────────────────────────────────────┘ │
   │  ┌─────────────────────────────────────┐ │
   │  │  RLS Policies                       │ │
   │  │  • Dealers → own rows only          │ │
   │  │  • OEM Admins → all dealers         │ │
   │  │  • Super Admins → unrestricted      │ │
   │  └─────────────────────────────────────┘ │
   │  ┌─────────────────────────────────────┐ │
   │  │  RPC Functions                      │ │
   │  │  advance_stage()  — ACID stage gate │ │
   │  │  get_dashboard_stats() — aggregates │ │
   │  └─────────────────────────────────────┘ │
   └──────────────────────────────────────────┘
           │
   ┌───────┴─────────────────────────────────────┐
   │    EXTERNAL APIs (stubbed in dev mode)       │
   │  Sandbox.co.in  → Aadhaar + PAN KYC         │
   │  Perfios        → GST + bank + financials    │
   │  WhiteBooks     → GSTIN lookup               │
   │  Eko            → Bank account verification  │
   │  Leegality      → Aadhaar OTP e-signatures   │
   └─────────────────────────────────────────────┘
```

---

## 5-Stage Onboarding Flow

| Stage | Name | Department | Cost | Timeline |
|-------|------|-----------|------|----------|
| 1 | KYC & Entity Verification | Compliance | Free | 3–5 days |
| 2 | Financial Due Diligence | Finance | Free | 5–7 days |
| 3 | Site Assessment | Infrastructure | ₹5K–₹15K | 7–10 days |
| 4 | Contracts & Agreements | Legal | ₹50K–₹2L | 3–5 days |
| 5 | Training & Go-Live | Operations | ₹1L–₹5L | 14–21 days |

Stage transitions are **ACID-safe**: the `advance_stage()` Supabase RPC locks the dealer row, verifies all documents are `verified`, and atomically advances the stage — rolling back on any failure.

---

## Setup

### 1. Prerequisites
- Node.js 20+
- A Supabase project (free tier works)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.local.template .env.local
```
Fill in your Supabase URL, anon key, and service role key.

### 4. Run Supabase migrations
In the Supabase SQL editor, run `supabase/migrations/001_init.sql`.

### 5. Push Prisma schema (after setting DATABASE_URL)
```bash
npx prisma db push
```

### 6. Start development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `DATABASE_URL` | Yes | Postgres connection string (for Prisma) |
| `NEXT_PUBLIC_ENV` | No | `development` (default) or `production` |
| `SANDBOX_API_KEY` | Prod | Sandbox.co.in API key |
| `SANDBOX_API_SECRET` | Prod | Sandbox.co.in API secret |
| `PERFIOS_API_KEY` | Prod | Perfios API key |
| `WHITEBOOKS_API_KEY` | Prod | WhiteBooks API key |
| `EKO_API_KEY` | Prod | Eko API key |
| `LEEGALITY_API_KEY` | Prod | Leegality API key |
| `RESEND_API_KEY` | Prod | Resend email API key |

In `development` mode (default), all KYC APIs return mock responses — swap to prod by setting real API keys.

---

## API Reference

### `POST /api/leads`
Create a new dealer lead application.

**Body:**
```json
{
  "gstin": "22AAAAA0000A1Z5",
  "pan": "AAAAA1234A",
  "entityName": "EV Motors Pvt Ltd",
  "promoterName": "John Doe",
  "email": "john@evmotors.in",
  "mobile": "9876543210",
  "cityTier": "tier2",
  "netWorthRange": "1Cr-5Cr"
}
```

**Response:** `{ dealerId: "uuid", message: "..." }`

---

### `POST /api/upload`
Generate a Supabase Storage signed upload URL.

**Auth:** Bearer token (dealer JWT)

**Body:** `{ dealerId, stage, docType, fileName, contentType }`

**Response:** `{ signedUrl, documentId, path }`

---

### `POST /api/verify/[docType]`
Trigger async KYC verification. Supported types:
`aadhaar` `pan` `gstin` `bank_stmt` `itr` `net_worth` `balance_sheet` `cancelled_cheque`

**GET** `/api/verify/[docType]?documentId=uuid` — poll status.

---

### `POST /api/stage/advance`
ACID-safe stage progression.

**Body:** `{ dealerId: "uuid", targetStage: 2 }`

**Returns:** `{ success: true, dealerId, newStage }` or 400 with error.

---

### `GET /api/dashboard/stats`
OEM admin only. Returns pipeline aggregate stats.

---

## Color System

| Token | Hex | Tailwind |
|-------|-----|---------|
| `--ink` | `#10323A` | `bg-ink`, `text-ink` |
| `--slate` | `#4A7060` | `bg-slate`, `text-slate` |
| `--stone` | `#E2C3BA` | `bg-stone`, `text-stone` |
| `--sand` | `#B5B8B5` | `bg-sand`, `text-sand` |
| `--ink2` | `#0d1f24` | `bg-ink2` |
| `--white` | `#fafaf8` | `bg-brand-white` |

---

## User Roles

| Role | Access |
|------|--------|
| `dealer` (default) | Own profile, own documents, own stage |
| `oem_admin` | All dealers (read + advance stage) |
| `super_admin` | Full system access |

Set role in Supabase Auth → User metadata: `{ "role": "oem_admin" }`.
