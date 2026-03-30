# CanWealth — Free Canadian Wealth Tracker
### Designed from three expert perspectives: Security · UX · Product

---

## What We're Building

A **free, private, mobile-first Progressive Web App** that gives you a Wealthica-style net worth dashboard — without paying a subscription or giving any app your financial passwords.

Your data lives in **your own Google Sheet**. The app never touches your banking credentials.

---

## Architecture

```
[React PWA on GitHub Pages]
        |
        | Google OAuth2 PKCE (Sign in once with Google)
        v
[Google Apps Script]  ← validates your identity server-side
        |
        | Only you can access your data
        v
[Your Google Sheet]   ← 7 structured sheets, your Google Drive
```

**Why this stack:**
- GitHub Pages = free HTTPS hosting
- Google Apps Script = free serverless backend (no server bills)
- Google Sheets = free database you can see and edit directly
- No credentials to any financial institution ever stored anywhere

---

## Security Design (Security Expert Perspective)

1. **No financial passwords** — ever. CSV exports only. You download the file from the institution's site, upload it here.
2. **Single-owner lockdown** — Your Google account ID is written to the Settings sheet on first sign-in. Apps Script rejects every request that doesn't match that ID.
3. **Google ID Token verification** — Apps Script verifies your JWT against Google's public keys on every request. The Sheet ID is never exposed to the browser.
4. **OAuth PKCE** — No client secret in the frontend. Your `GOOGLE_CLIENT_ID` is a public identifier (safe to expose), restricted in Google Cloud Console to your GitHub Pages domain only.
5. **Content Security Policy** — Strict CSP meta tag blocks all non-approved origins.
6. **Input validation** — All data is validated in Apps Script before writing to the Sheet (types, lengths, formats). No injection via CSV.
7. **Sheet not shared** — The Google Sheet is set to "Private" (no public link). Only the Apps Script service account can access it.

---

## UX Design (UX Expert Perspective)

**Mobile-first.** Primary use case: open on phone after downloading monthly statements.

### Navigation
- **Mobile:** Fixed bottom tab bar — Dashboard · Accounts · Import · Settings
- **Desktop:** Collapsible left sidebar (same 4 sections)

### Dashboard (what you see first)
1. **Net Worth card** — Big CAD number + green/red delta vs last month
2. **Account balance cards** — Horizontal scroll, one card per institution
3. **Allocation donut chart** — Cash / Canadian Equities / Crypto / Other
4. **Recent transactions** — Last 10 entries

### CSV Import Wizard (5 steps)
1. Select which account this file is for
2. Drag-and-drop or tap to upload the CSV
3. Field mapping (pre-filled for Wealthsimple/Tangerine/Computershare/Newton)
4. Preview parsed rows (green=new, yellow=duplicate, red=error)
5. Result summary (47 imported, 3 skipped)

### Design tokens
- Primary color: Teal `#0D9488`
- Danger: Red `#DC2626`
- Background: `gray-50` (not harsh white)
- Cards: `rounded-xl shadow-sm`
- Font: 16px minimum (prevents iOS zoom on inputs)
- Touch targets: 44×44px minimum (Apple HIG)

---

## Product Features (Product Owner Perspective)

### MVP — Phase 1
| # | Feature |
|---|---------|
| 1 | Google Sign-In + first-run setup |
| 2 | Add/edit accounts (Wealthsimple, Tangerine, Computershare, Newton) |
| 3 | CSV import wizard with pre-built column mappings for all 4 institutions |
| 4 | Duplicate detection (import same CSV twice safely) |
| 5 | Net worth dashboard (CAD total + account breakdown) |
| 6 | Balance history area chart |
| 7 | Asset allocation donut chart |
| 8 | Transaction list (searchable, filterable) |
| 9 | Manual balance entry (for accounts without CSV balance) |
| 10 | PWA install (home screen on iOS + Android) |
| 11 | Settings: Apps Script URL, display currency, data export |

### Phase 2
- Holdings detail with ACB (Adjusted Cost Base) for Canadian tax
- Manual price entry for unrealized gain/loss
- Newton read-only API auto-sync (no password, API key only)
- Time-weighted return (TWR) performance metrics
- CRA-friendly export for tax season

### Phase 3
- Canada Open Banking (when available, ~2026)
- Multi-currency (USD holdings with exchange rate)
- Budget / spending analysis
- Net worth goal tracking

---

## Google Sheets Schema (7 sheets)

| Sheet | Purpose |
|-------|---------|
| `accounts` | Account registry (no credentials) |
| `transactions` | Normalized ledger from all CSVs |
| `balances` | Point-in-time net worth snapshots |
| `holdings` | Securities and crypto positions |
| `prices` | Manual price cache for valuations |
| `import_log` | Audit trail for every import |
| `settings` | App config + owner Google ID |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v3 |
| Charts | Recharts |
| CSV parsing | PapaParse |
| Auth | Google Identity Services (`@react-oauth/google`) |
| PWA | `vite-plugin-pwa` + Workbox |
| Icons | Lucide React |
| Backend | Google Apps Script (V8) |
| Storage | Google Sheets API v4 |
| Hosting | GitHub Pages (free) |
| CI/CD | GitHub Actions (free) |

---

## File Structure

```
Finance-master/
├── apps-script/              ← Google Apps Script backend
│   ├── Code.gs               ← doGet/doPost router
│   ├── Auth.gs               ← Google ID token verification
│   ├── Accounts.gs
│   ├── Transactions.gs
│   ├── Balances.gs
│   ├── Holdings.gs
│   ├── Prices.gs
│   ├── ImportLog.gs
│   ├── Settings.gs
│   ├── Utils.gs
│   └── appsscript.json
├── public/
│   ├── manifest.json         ← PWA manifest
│   └── icons/                ← 192px, 512px, maskable icons
├── src/
│   ├── api/                  ← Apps Script API clients
│   ├── auth/                 ← Google OAuth context + guard
│   ├── components/
│   │   ├── layout/           ← AppShell, BottomNav, Sidebar
│   │   ├── dashboard/        ← NetWorthCard, AllocationChart, etc.
│   │   ├── accounts/         ← AccountList, AddAccountModal
│   │   ├── transactions/     ← TransactionTable, Filters
│   │   ├── import/           ← ImportWizard (5 steps)
│   │   ├── holdings/         ← HoldingsList, ManualPriceModal
│   │   └── ui/               ← Button, Card, Modal, Toast, etc.
│   ├── hooks/                ← useNetWorth, useAllocation, etc.
│   ├── pages/                ← Dashboard, Accounts, Transactions, Import, Settings
│   ├── utils/                ← csvNormalizers, dedup, currency, dates
│   └── constants/            ← institutions, assetClasses, accountTypes
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
└── .env.example              ← VITE_GOOGLE_CLIENT_ID, VITE_APPS_SCRIPT_URL
```

---

## Implementation Phases

### Phase 0 — Foundation
- [ ] Vite + React scaffold
- [ ] Tailwind CSS config (teal theme)
- [ ] `vite-plugin-pwa` + manifest
- [ ] GitHub Actions deploy workflow
- [ ] Verify deploy to GitHub Pages

### Phase 1 — Auth + Backend
- [ ] Google Apps Script project + Auth.gs
- [ ] Settings.gs (owner lockdown)
- [ ] React Google OAuth context
- [ ] Login page + auth guard
- [ ] First-run setup flow

### Phase 2 — Accounts
- [ ] Accounts.gs backend
- [ ] AccountList + AddAccountModal
- [ ] AccountsPage

### Phase 3 — CSV Import
- [ ] csvNormalizers.js (all 4 institutions)
- [ ] Transactions.gs + dedup logic
- [ ] ImportWizard (5 steps)
- [ ] Institution presets

### Phase 4 — Dashboard
- [ ] useNetWorth, useAllocation, usePerformance hooks
- [ ] NetWorthCard + BalanceHistoryChart
- [ ] AllocationChart
- [ ] RecentTransactions
- [ ] DashboardPage

### Phase 5 — Transactions + Holdings
- [ ] TransactionTable + filters
- [ ] HoldingsList + manual price
- [ ] TransactionsPage + HoldingsPage

### Phase 6 — PWA + Polish
- [ ] PWA icons + offline page
- [ ] Service worker caching
- [ ] Settings page (export, preferences)
- [ ] Final QA (all 4 institution CSVs, mobile Safari, Android Chrome)

---

## Known Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Apps Script quota (6 min/day) | Medium | Batch writes with `appendRows()` instead of per-row |
| CSV format changes by institutions | Medium | Live preview in step 4 shows bad data before commit |
| iOS Safari PWA quirks | Medium | App doesn't use push/background sync (not needed) |
| GitHub Pages no server headers | Low | CSP via meta tag; migrate to Cloudflare Pages if needed |
| Wealthsimple CSV format variations | Medium | Versioned presets + manual mapping fallback |
