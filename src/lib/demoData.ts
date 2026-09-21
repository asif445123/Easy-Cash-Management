// Sample data used ONLY by the /demo pages. None of this is real or persisted —
// it exists purely so a visitor can see what the real (authenticated) pages
// look like before creating an account.

export const demoAccountTypes = [
  { serial: 1, type: "Cash", receivablePayable: "—", dashboard: "—" },
  { serial: 2, type: "Bank", receivablePayable: "—", dashboard: "—" },
  { serial: 3, type: "Accounts Payable", receivablePayable: "Yes", dashboard: "—" },
  { serial: 4, type: "Accounts Receivable", receivablePayable: "Yes", dashboard: "—" },
  { serial: 5, type: "Expenses", receivablePayable: "—", dashboard: "Expense" },
  { serial: 6, type: "Income", receivablePayable: "—", dashboard: "Income" },
  { serial: 7, type: "Net Profit & Loss", receivablePayable: "—", dashboard: "—" },
  { serial: 8, type: "Compensation", receivablePayable: "—", dashboard: "—" },
];

export const demoAccountsMaster = [
  { code: 8, description: "Iftakhar", type: "Accounts Receivable", opDebit: 0, opCredit: 0 },
  { code: 7, description: "Compensation", type: "Compensation", opDebit: 0, opCredit: 0 },
  { code: 24, description: "Motorcycle", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 23, description: "Salary Advance", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 22, description: "Rashan", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 21, description: "Expenses", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 20, description: "Refreshment", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 19, description: "Akif", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 18, description: "Wasif", type: "Expenses", opDebit: 0, opCredit: 0 },
  { code: 14, description: "Atif", type: "Accounts Payable", opDebit: 0, opCredit: 0 },
  { code: 13, description: "Asif", type: "Accounts Receivable", opDebit: 8540, opCredit: 0 },
  { code: 12, description: "Ishfaq", type: "Accounts Receivable", opDebit: 0, opCredit: 0 },
  { code: 11, description: "Electricity Bill", type: "Expenses", opDebit: 2929, opCredit: 0 },
  { code: 10, description: "Other Income", type: "Income", opDebit: 0, opCredit: 0 },
  { code: 2, description: "UBL Bank", type: "Bank", opDebit: 0, opCredit: 0 },
  { code: 1, description: "Cash in Hand", type: "Cash", opDebit: 0, opCredit: 0 },
];

export const demoJournalVoucherEntries = [
  { serial: "JV 89", date: "17/08/2026", debit: 60, credit: 60 },
  { serial: "JV 88", date: "15/08/2026", debit: 13140, credit: 13140 },
  { serial: "JV 87", date: "14/08/2026", debit: 450, credit: 450 },
  { serial: "JV 86", date: "13/08/2026", debit: 1350, credit: 1350 },
  { serial: "JV 85", date: "12/08/2026", debit: 1130, credit: 1130 },
  { serial: "JV 84", date: "10/08/2026", debit: 220, credit: 220 },
  { serial: "JV 83", date: "08/08/2026", debit: 1750, credit: 1750 },
  { serial: "JV 82", date: "10/08/2026", debit: 10150, credit: 10150 },
  { serial: "JV 81", date: "09/08/2026", debit: 15660, credit: 15660 },
];

export const demoJournalVoucherReport = [
  { date: "2026-07-31", serial: "JV 45", debit: 500, credit: 500 },
  { date: "2026-08-01", serial: "JV 75", debit: 5000, credit: 5000 },
  { date: "2026-08-02", serial: "JV 46", debit: 30, credit: 30 },
  { date: "2026-08-02", serial: "JV 76", debit: 200, credit: 200 },
  { date: "2026-08-03", serial: "JV 47", debit: 1560, credit: 1560 },
  { date: "2026-08-04", serial: "JV 48", debit: 270, credit: 270 },
];

export const demoCashBookRecent = [
  { date: "2026-08-19", account: "1 — Cash in Hand", narration: "School Fee", debit: 0, credit: 1000 },
  { date: "2026-08-19", account: "21 — Expenses", narration: "Mango Juce", debit: 580, credit: 0 },
  { date: "2026-08-18", account: "8 — Iftakhar", narration: "Cash Paid", debit: 660, credit: 0 },
  { date: "2026-08-18", account: "15 — Milk", narration: "4 Kg Milk, Onion, Potato, Tomato", debit: 1370, credit: 0 },
  { date: "2026-08-17", account: "20 — Refreshment", narration: "Breakfast, Dinner", debit: 280, credit: 0 },
  { date: "2026-08-15", account: "2 — UBL Bank", narration: "Cash Withdrawal from Bank", debit: 10000, credit: 0 },
  { date: "2026-08-12", account: "1 — Cash in Hand", narration: "Site Payment - Al Habib Plaza", debit: 150000, credit: 0 },
  { date: "2026-08-10", account: "24 — Motor Cycle", narration: "Fuel top-up", debit: 0, credit: 2270 },
  { date: "2026-08-09", account: "11 — Electricity Bill", narration: "August cycle bill payment", debit: 0, credit: 3212 },
  { date: "2026-08-05", account: "6 — House Rent", narration: "Monthly rent", debit: 0, credit: 14000 },
];

export const demoCashBankBook = {
  accountLabel: "8 — Iftakhar",
  opening: 0,
  closing: 100,
  rows: [
    { date: "2026-07-31", ref: "JV 43 — Iftakhar advance", debit: 200, credit: 0, balance: 200 },
    { date: "2026-08-02", ref: "JV 46 — Grocery reimbursement", debit: 0, credit: 80, balance: 120 },
    { date: "2026-08-04", ref: "JV 49 — Asif", debit: 50, credit: 0, balance: 170 },
    { date: "2026-08-06", ref: "JV 52 — Partial settlement", debit: 0, credit: 120, balance: 50 },
    { date: "2026-08-08", ref: "JV 55 — Aslam", debit: 100, credit: 0, balance: 150 },
    { date: "2026-08-10", ref: "JV 58 — Refund adjustment", debit: 0, credit: 50, balance: 100 },
    { date: "2026-08-12", ref: "JV 85 — Kamran", debit: 100, credit: 0, balance: 200 },
    { date: "2026-08-14", ref: "JV 87 — Payment received", debit: 0, credit: 150, balance: 50 },
    { date: "2026-08-16", ref: "JV 90 — Wasif", debit: 200, credit: 0, balance: 250 },
    { date: "2026-08-17", ref: "JV 91 — Settlement", debit: 0, credit: 150, balance: 100 },
  ],
};

export const demoAccountsList = [
  { code: 14, description: "Atif", type: "Accounts Payable", opDebit: 0, opCredit: 0 },
  { code: 12, description: "Ishfaq", type: "Accounts Receivable", opDebit: 0, opCredit: 0 },
  { code: 13, description: "Asif", type: "Accounts Receivable", opDebit: 0, opCredit: 0 },
  { code: 8, description: "Iftakhar", type: "Accounts Receivable", opDebit: 0, opCredit: 0 },
  { code: 2, description: "UBL Bank", type: "Bank", opDebit: 44398, opCredit: 0 },
];

export const demoLedgerSummary = [
  { code: 1, description: "Cash in Hand", opening: -19190, closing: 11780 },
  { code: 2, description: "UBL Bank", opening: 44398, closing: 44398 },
  { code: 13, description: "Asif", opening: 8540, closing: 14600 },
];

export const demoReceivablePayable = {
  receivable: [
    { code: 12, description: "Ishfaq", balance: 300 },
    { code: 13, description: "Asif", balance: 14600 },
    { code: 8, description: "Iftakhar", balance: 100 },
  ],
  receivableTotal: 15000,
  payable: [{ code: 14, description: "Atif", balance: 43740 }],
  payableTotal: 43740,
};

export const demoTrialBalance2 = [
  { code: 1, description: "Cash in Hand", debit: 11780, credit: null },
  { code: 10, description: "Other Income", debit: null, credit: null },
  { code: 11, description: "Electricity Bill", debit: 2929, credit: null },
  { code: 12, description: "Ishfaq", debit: 300, credit: null },
  { code: 13, description: "Asif", debit: 14600, credit: null },
];

export const demoTrialBalance6 = [
  { code: 1, description: "Cash in Hand", openDebit: null, openCredit: 19190, transDebit: 61294, transCredit: 30324, closeDebit: 11780, closeCredit: null },
  { code: 10, description: "Other Income", openDebit: null, openCredit: null, transDebit: null, transCredit: null, closeDebit: null, closeCredit: null },
  { code: 11, description: "Electricity Bill", openDebit: 2929, openCredit: null, transDebit: null, transCredit: null, closeDebit: 2929, closeCredit: null },
  { code: 12, description: "Ishfaq", openDebit: 300, openCredit: null, transDebit: null, transCredit: null, closeDebit: 300, closeCredit: null },
  { code: 13, description: "Asif", openDebit: 8540, openCredit: null, transDebit: 12060, transCredit: 6000, closeDebit: 14600, closeCredit: null },
];

export const demoMotorcycle = {
  odometer: [
 { date: "19/08/2026", reading: 15701, kmSince: 18, note: "Madina Town" },
    { date: "17/08/2026", reading: 15683, kmSince: 34, note: "Susan Road" },
    { date: "15/08/2026", reading: 15649, kmSince: 28, note: "Jaranwala Road" },
    { date: "13/08/2026", reading: 15621, kmSince: 15, note: "Gulistan Colony" },
    { date: "11/08/2026", reading: 15606, kmSince: 20, note: "People's Colony" },
    { date: "09/08/2026", reading: 15586, kmSince: 12, note: "Samanabad" },
    { date: "07/08/2026", reading: 15574, kmSince: 25, note: "Ghulam Muhammadabad" },
    { date: "05/08/2026", reading: 15549, kmSince: 18, note: "Millat Town" },
    { date: "03/08/2026", reading: 15531, kmSince: 22, note: "Eden Valley" },
    { date: "01/08/2026", reading: 15509, kmSince: 19, note: "Al-Rehman Garden" },
  ],
  fuel: [
    { date: "09/08/2026", amount: 2270, rate: 329.29, quantity: 6.89 },
    { date: "20/07/2026", amount: 3000, rate: 317.4, quantity: 9.45 },
    { date: "02/07/2026", amount: 2320, rate: 300.12, quantity: 7.73 },
  ],
  mobile: [{ date: "02/07/2026", reading: 14627 }],
  tuning: [{ date: "14/12/2025", reading: 11495 }],
  limits: { mobileLimit: 3000, tuningLimit: 10000 },
  report: {
    from: "01-Jul-2026",
    to: "17-Aug-2026",
    totalKm: 1022,
    totalSpent: 7590,
    kmPerLPrice: 158,
    perKmCost: 7.43,
    petrolAvg: 42.45,
    mobile: {
      last: 14627,
      current: 15649,
      limit: 17627,
      used: 1022,
      remaining: 1978,
      usedPct: 34.1,
      duePct: 65.9,
      lastEntryDaysAgo: 47,
    },
    tuning: {
      last: 11495,
      current: 15649,
      limit: 21495,
      used: 4154,
      remaining: 5846,
      usedPct: 41.5,
      duePct: 58.5,
      lastEntryDaysAgo: 247,
    },
  },
};

// ── Electricity Bill ────────────────────────────────────────────────────────
// Two-part feature, matching the real page: daily "Meter Reading" log (with a
// "With Motor" flag per reading, and the day-over-day unit spread), and a
// separate itemized monthly "Bill" (exact period + every charge line item).
// The Electricity Bill Report just combines both, read-only.
export const demoElectricityBill = {
  meterReadings: [
    { date: "19/08/2026", reading: 5901, spread: 7, withMotor: true },
    { date: "18/08/2026", reading: 5894, spread: 5, withMotor: true },
    { date: "17/08/2026", reading: 5889, spread: 5, withMotor: true },
    { date: "16/08/2026", reading: 5884, spread: 4, withMotor: true },
    { date: "15/08/2026", reading: 5880, spread: 3, withMotor: false },
    { date: "14/08/2026", reading: 5877, spread: 5, withMotor: true },
    { date: "13/08/2026", reading: 5872, spread: 6, withMotor: true },
    { date: "12/08/2026", reading: 5866, spread: 6, withMotor: false },
    { date: "11/08/2026", reading: 5860, spread: 4, withMotor: true },
    { date: "10/08/2026", reading: 5856, spread: 4, withMotor: true },
  ],
  billDefaultCharges: [
    "100 Units @ 10.54",
    "Units @ 13.01",
    "Fixed Charges",
    "FPA Energy",
    "F.C Surcharge",
    "QTA",
    "Taxes ED",
    "Taxes GST",
    "Taxes on FPA ED",
    "Taxes of FPA GST",
  ],
  billHistory: [
    { month: "Jul 2026", period: "20 Jul – 19 Aug 2026", units: 412, amount: 9840 },
    { month: "Jun 2026", period: "20 Jun – 19 Jul 2026", units: 378, amount: 8920 },
    { month: "May 2026", period: "20 May – 19 Jun 2026", units: 401, amount: 9530 },
  ],
  report: {
    from: "01-Jun-2026",
    to: "17-Aug-2026",
    totalUnits: 1191,
    totalSpent: 28290,
    avgUnitCost: 23.75,
    avgMonthlyBill: 9430,
  },
};

export const demoMonthWise = [
  { month: "Jun 2026", income: 280000, expense: 118400, net: 161600 },
  { month: "Jul 2026", income: 320000, expense: 135750, net: 184250 },
  { month: "Aug 2026", income: 96000, expense: 52310, net: 43690 },
];

export const demoMonthComparison = {
  periodA: "Jul 2026",
  periodB: "Aug 2026",
  rows: [
    { label: "Income", a: 320000, b: 96000, change: -70.0 },
    { label: "Expense", a: 135750, b: 52310, change: -61.5 },
    { label: "Net", a: 184250, b: 43690, change: -76.3 },
  ],
};

export const demoYearWise = [
  { year: 2025, income: 2650000, expense: 1180400, net: 1469600 },
  { year: 2026, income: 1830000, expense: 842300, net: 987700 },
];

export const demoYearComparison = {
  periodA: 2025,
  periodB: 2026,
  rows: [
    { label: "Income", a: 2650000, b: 1830000, change: -30.9 },
    { label: "Expense", a: 1180400, b: 842300, change: -28.6 },
    { label: "Net", a: 1469600, b: 987700, change: -32.8 },
  ],
};

// ── Dashboard page ─────────────────────────────────────────────────────────
export const demoDashboard = {
  from: "31-Jul-2026",
  to: "17-Aug-2026",
  balance: 43739,
  income: 50000,
  expense: 32264,
  cashBank: [
    { account: "Cash in Hand (1)", opening: 0, current: 11780 },
    { account: "UBL Bank (2)", opening: 44398, current: 31959 },
  ],
  expenseBreakdown: [
    { num: 1, label: "House Rent", amount: 14000, pct: 43.39 },
    { num: 2, label: "Rashan", amount: 3720, pct: 11.53 },
    { num: 3, label: "Milk", amount: 2640, pct: 8.18 },
    { num: 4, label: "Expenses", amount: 2284, pct: 7.08 },
    { num: 5, label: "B.Ayoub", amount: 2280, pct: 7.07 },
    { num: 6, label: "Motor Cycle", amount: 2270, pct: 7.04 },
    { num: 7, label: "Refreshment", amount: 1620, pct: 5.02 },
    { num: 8, label: "Other Expenses", amount: 1590, pct: 4.93 },
    { num: 9, label: "Asif", amount: 1130, pct: 3.5 },
    { num: 10, label: "Wasif", amount: 340, pct: 1.05 },
    { num: 11, label: "SA", amount: 250, pct: 0.77 },
    { num: 12, label: "Akif", amount: 140, pct: 0.43 },
  ],
  recentTransactions: [
    { date: "2026-08-17", title: "Breakfast", amount: 60 },
    { date: "2026-08-16", title: "2 Egg Tawa", amount: 270 },
    { date: "2026-08-16", title: "Grapes", amount: 320 },
    { date: "2026-08-15", title: "Sweet Lime", amount: 400 },
    { date: "2026-08-14", title: "Toothpaste", amount: 350 },
    { date: "2026-08-14", title: "7 O'Clock", amount: 80 },
    { date: "2026-08-13", title: "Pencil Cell", amount: 140 },
    { date: "2026-08-12", title: "Almon Protein Shampoo", amount: 620 },
  ],
};
