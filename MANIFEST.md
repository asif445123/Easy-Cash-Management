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
