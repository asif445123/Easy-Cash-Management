# Enter Data menu, Cylinder module, sidebar profile dropdown

## Navigation (sidebar order)
- Dashboard
- **Manage Accounts** — moved up so it sits directly under Dashboard.
- **Enter Data** (new group, below Manage Accounts) — expands to:
  Cash Book, Telly Cash, Journal Voucher, Motorcycle, Electricity Bill, Cylinder.
  These entry screens were previously top-level links; they now live only here.
- Show Reports — now also lists **Cylinder Report**.
- User approvals (admin), then Settings and Contact Us.

## Sidebar profile — dropdown
- `src/components/UserMenu.tsx` — new `variant="sidebar"`. The bottom of the
  sidebar shows only the avatar circle and the user's name (with a ▲ marker).
  Clicking it opens a panel above the profile with the signed-in name, email,
  and **Logout**. The separate Logout button and always-visible email under
  the name were removed from the sidebar.
- The desktop top bar and mobile top bar use the same dropdown (name, email, Logout).

## New — Cylinder (`/admin/cylinder`, Enter Data → Cylinder)
- `src/models/CylinderPurchase.ts` — date, amount (Rs), rate (Rs per kg),
  quantity (kg, = amount ÷ rate).
- `src/app/api/admin/cylinder/route.ts` (list/create) and
  `src/app/api/admin/cylinder/[id]/route.ts` (update/delete).
- `src/app/admin/cylinder/page.tsx` — entry form (Date, Amount (Rs),
  Rate (Rs per kg)) and a table of DATE / AMOUNT / RATE / QUANTITY / ACTIONS.

## New — Cylinder Report (`/admin/reports/cylinder`, Show Reports → Cylinder Report)
- `src/app/api/admin/reports/cylinder/route.ts` — read-only. Each purchase's
  period runs until the next purchase (the last one runs to the "To" date).
  Totals: total kg, total spent, per-day cost, per-kg cost, and average kg/day
  over completed fill-up periods.
- `src/app/admin/reports/cylinder/page.tsx` — From/To range, stat cards,
  "Cylinder average", and a purchase table. Click a row for its period, per-day
  cost, kg per day, rate, and next fill-up date.

## Icons
- `src/components/SidebarIcons.tsx` — new `CylinderIcon`, `EnterDataIcon`, and a
  `cylinder` case in `ReportItemIcon`.

# Manage Accounts menu, Chart of Accounts, logout-only dropdown, Inventory removed

## Navigation
- **New "Manage Accounts" sidebar group** (below Dashboard, above Show Reports).
  It expands to three links:
  - Account Types
  - Accounts Master File
  - **Chart of Accounts** (new)
  Account Types and Accounts Master File were moved out of the top-level
  entry list so they now live only under Manage Accounts. The group
  auto-expands (and highlights) whenever you are on one of its screens.
  The same group is mirrored in the public demo sidebar.

## New — Chart of Accounts (`/admin/chart-of-accounts`)
- `src/lib/chartOfAccounts.ts` — builds a three-level tree from the data the
  app already stores (there is no stored parent/child hierarchy):
  - **Level 1** accounting head: Assets, Liabilities, Equity, Income,
    Expenses (plus "Other Accounts" for types that match nothing)
  - **Level 2** the Account Type (Cash, Bank, Accounts Receivable, …)
  - **Level 3** the account itself
  A type's head comes from the flags on Account Types (Income / Expense /
  Cash-Bank) and, when no flag applies, from keywords in the name
  ("Accounts Payable" → Liability, "Capital" → Equity, …). Nothing is
  guessed silently: unmatched types are shown under **Other Accounts**.
- `src/app/admin/chart-of-accounts/page.tsx` — the screen from the reference
  layout: columns **Code | Account Name | Level | Type | Sub | Opening**,
  collapsible heads and types, search, accounting-head filter, opening
  totals (Dr / Cr), print, and an empty state that links to Account Types.
  Opening = opening debit − opening credit (negative = credit balance).
- `src/app/demo/chart-of-accounts/page.tsx` (+ its layout with metadata) —
  the public demo version, built from the sample accounts.
- Accounts Master File header now has a "View Chart of Accounts" button.

## Account dropdown — Logout only
- `src/components/UserMenu.tsx` — the avatar dropdown now shows the signed-in
  name and email and **only Logout, with its icon** (red, like the reference
  screenshot). The Settings entry is gone from the dropdown (Settings keeps
  its own sidebar link) and no language switcher is included.
- `src/components/AppShell.tsx` — the dropdown is now actually wired up: a
  slim desktop top bar (right-aligned) plus the dark mobile top bar both open
  it; it gained a `variant="dark"` for the dark header.

## Inventory removed
- Deleted `src/app/admin/items`, `src/app/api/admin/items`,
  `src/app/api/admin/categories`, `src/app/api/admin/brands`,
  `src/models/Item.ts`, `src/models/Category.ts`, `src/models/Brand.ts`.
- Removed the "Inventory items" sidebar link and the `InventoryIcon` export.
- `/admin/items` removed from both middleware copies — `/admin` itself
  (User approvals) stays admin-only.

# Fix: dashboard broke when you moved everything to Journal Voucher

## ⚠️ Required action after deploying
Go to **Account Types** and check the new "This is a Cash/Bank account
type" box on your **Cash** and **Bank** types (the ones "Cash in Hand"
and "UBL Bank" use). Without this, the dashboard has no way to know which
accounts to treat as Cash/Bank — same reason as the Income/Expense
checkboxes from before, this is a setting only you can make correctly.

## What was actually wrong
The dashboard identified "which accounts are Cash/Bank" by scanning your
**Cash Book vouchers** for which account codes had ever been used as the
cash/bank side. That worked at first, but broke completely the moment you
deleted your Cash Book transfer entries and re-entered them as Journal
Vouchers instead — with zero Cash Book vouchers left, that scan found
nothing, and the whole dashboard fell back to all zeros.

## The fix
- src/models/AccountType.ts — new `isCashBankType` flag
- src/app/api/admin/account-types/route.ts — accepts it on create
- src/app/admin/account-types/page.tsx — new checkbox "This is a Cash /
  Bank account type", shown in the Dashboard column of the list
- src/app/api/dashboard/summary/route.ts — now finds Cash/Bank accounts
  by their Account Type flag instead of scanning Cash Book vouchers. This
  works correctly regardless of whether you record a transaction via Cash
  Book, Journal Voucher, or both — which is exactly your use case now
  (Journal Voucher for withdrawals, since it's 1 entry instead of 2).

Income/Expense classification and the combined Cash Book + Journal
Voucher movement calculation from the last fix are unchanged — this only
fixes how Cash/Bank accounts themselves are identified.
