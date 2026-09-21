// Data for the redesigned Month Wise Report — every Income/Expense account
// broken down by calendar month. Jul/Aug 2026 match your real screenshots;
// the rest of the year is filled with plausible fake numbers so the demo
// shows a full, lived-in year instead of ten empty columns.

export const demoMonthWiseYear = 2026;

export const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export interface MonthlyAccountRow {
  name: string;
  values: number[]; // length 12, Jan..Dec
}

export const demoIncomeAccountsMonthly: MonthlyAccountRow[] = [
  { name: "Other Income", values: [500, 0, 800, 0, 1200, 0, 0, 0, 600, 0, 900, 0] },
  { name: "Salary", values: [45000, 45000, 46000, 46000, 48000, 48000, 50000, 50000, 50000, 52000, 52000, 54000] },
];

export const demoExpenseAccountsMonthly: MonthlyAccountRow[] = [
  { name: "Electricity Bill", values: [2400, 2350, 2600, 2700, 3100, 3400, 2929, 3212, 3050, 2800, 2600, 2500] },
  { name: "Milk", values: [3200, 3150, 3300, 3250, 3400, 3500, 7260, 3520, 3300, 3200, 3100, 3400] },
  { name: "Asif", values: [1000, 1050, 1100, 1150, 1200, 1250, 1900, 1230, 1150, 1100, 1050, 1000] },
  { name: "Ayoub", values: [2000, 2050, 2100, 2150, 2200, 2250, 2600, 2280, 2200, 2150, 2100, 2050] },
  { name: "Wasif", values: [400, 420, 440, 460, 480, 500, 1110, 520, 480, 460, 440, 420] },
  { name: "Akif", values: [100, 110, 120, 130, 140, 150, 880, 140, 130, 120, 110, 100] },
  { name: "Refreshment", values: [1200, 1250, 1300, 1350, 1400, 1450, 6280, 1620, 1400, 1350, 1300, 1250] },
  { name: "Expenses", values: [2000, 2100, 2200, 2300, 2400, 2500, 6843, 2284, 2400, 2300, 2200, 2100] },
  { name: "Rashan", values: [4000, 4100, 4200, 4300, 4400, 4500, 13170, 4330, 4400, 4300, 4200, 4100] },
  { name: "SA", values: [200, 210, 220, 230, 240, 250, 600, 300, 240, 230, 220, 210] },
  { name: "Motor Cycle", values: [2000, 2050, 2100, 2150, 2200, 2250, 6570, 2270, 2200, 2150, 2100, 2050] },
  { name: "Gas Bill", values: [6800, 6500, 0, 0, 0, 0, 7850, 0, 0, 0, 6200, 7200] },
  { name: "Other Expenses", values: [1200, 1250, 1300, 1350, 1400, 1450, 2773, 1540, 1400, 1350, 1300, 1250] },
  { name: "House Rent", values: [14000, 14000, 14000, 14000, 14000, 14000, 14000, 14000, 14000, 14000, 14000, 14000] },
];
