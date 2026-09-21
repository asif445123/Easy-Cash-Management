// Data for the Electricity Bill Report page — grouped by billing period, split
// by With Motor / Without Motor unit counts, with the matching bill amount
// (Rs 0 for a period whose bill hasn't been entered yet, like August).

export const demoElectricityBillReport = {
  from: "01-Jan-2026",
  to: "31-Dec-2026",
  totalUnits: 1781,
  withMotor: 823,
  withoutMotor: 958,
  rsPerUnit: 13.39,
  periods: [
    { period: "December 2026", withMotor: 85, withoutMotor: 95, totalUnits: 180, billAmount: 2450.0 },
    { period: "November 2026", withMotor: 74, withoutMotor: 90, totalUnits: 164, billAmount: 2190.0 },
    { period: "October 2026", withMotor: 66, withoutMotor: 84, totalUnits: 150, billAmount: 1995.0 },
    { period: "September 2026", withMotor: 60, withoutMotor: 80, totalUnits: 140, billAmount: 1860.0 },
    { period: "August 2026", withMotor: 47, withoutMotor: 27, totalUnits: 74, billAmount: 0 },
    { period: "July 2026", withMotor: 71, withoutMotor: 97, totalUnits: 168, billAmount: 3211.73 },
    { period: "June 2026", withMotor: 95, withoutMotor: 88, totalUnits: 183, billAmount: 2510.0 },
    { period: "May 2026", withMotor: 82, withoutMotor: 91, totalUnits: 173, billAmount: 2340.0 },
    { period: "April 2026", withMotor: 70, withoutMotor: 85, totalUnits: 155, billAmount: 2080.0 },
    { period: "March 2026", withMotor: 63, withoutMotor: 79, totalUnits: 142, billAmount: 1890.0 },
    { period: "February 2026", withMotor: 58, withoutMotor: 74, totalUnits: 132, billAmount: 1750.0 },
    { period: "January 2026", withMotor: 52, withoutMotor: 68, totalUnits: 120, billAmount: 1572.0 },
  ],
};