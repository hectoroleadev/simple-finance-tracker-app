
import { CategoryType, FinanceItem, HistoryEntry } from './types';

export const INITIAL_ITEMS: FinanceItem[] = [
  // Debts
  { id: '1', name: 'Bank Loan', amount: 300, category: CategoryType.DEBT },
  { id: '2', name: 'Credit Card', amount: 11625, category: CategoryType.DEBT },
  { id: '3', name: 'Store Credit', amount: 8452, category: CategoryType.DEBT },
  // Investments
  { id: '4', name: 'Nu Account', amount: 192258, category: CategoryType.INVESTMENTS },
  { id: '5', name: 'Stock Market', amount: 24620.41, category: CategoryType.INVESTMENTS },
  { id: '6', name: 'Crypto', amount: 71835.48, category: CategoryType.INVESTMENTS },
  { id: '7', name: 'Bonds', amount: 5271.96, category: CategoryType.INVESTMENTS },
  { id: '8', name: 'Brokerage', amount: 12289, category: CategoryType.INVESTMENTS },
  // Liquid Cash
  { id: '9', name: 'Main Bank', amount: 0, category: CategoryType.LIQUID_CASH },
  { id: '10', name: 'Wallet', amount: 550, category: CategoryType.LIQUID_CASH },
  { id: '11', name: 'Vouchers', amount: 657, category: CategoryType.LIQUID_CASH },
  // Retirement
  { id: '12', name: '401k / PPR', amount: 4142, category: CategoryType.RETIREMENT },
  { id: '13', name: 'Pension Fund', amount: 751852.36, category: CategoryType.RETIREMENT },
];

// Ordered Newest to Oldest for correct display in table and chart logic
export const INITIAL_HISTORY: HistoryEntry[] = [
  { id: 'h28', date: '2026-01-30T12:00:00Z', savings: 307481.85, debt: 20377.00, balance: 287104.85, retirement: 755994.36 },
  { id: 'h27', date: '2026-01-15T12:00:00Z', savings: 281624.28, debt: 7792.36, balance: 273831.92, retirement: 729657.98 },
  { id: 'h26', date: '2025-12-30T12:00:00Z', savings: 278796.97, debt: 21650.00, balance: 257146.97, retirement: 718502.00 },
  { id: 'h25', date: '2025-12-15T12:00:00Z', savings: 252657.33, debt: 15800.00, balance: 236857.33, retirement: 713864.00 },
  { id: 'h24', date: '2025-12-01T12:00:00Z', savings: 239259.97, debt: 16500.00, balance: 222759.97, retirement: 716182.00 },
  { id: 'h23', date: '2025-11-30T12:00:00Z', savings: 235073.54, debt: 25000.00, balance: 210073.54, retirement: 715925.00 },
  { id: 'h22', date: '2025-11-15T12:00:00Z', savings: 217324.87, debt: 17000.00, balance: 200324.87, retirement: 696584.00 },
  { id: 'h21', date: '2025-10-30T12:00:00Z', savings: 214436.11, debt: 30000.00, balance: 184436.11, retirement: 697584.00 },
  { id: 'h20', date: '2025-10-15T12:00:00Z', savings: 183341.00, debt: 10800.00, balance: 172541.00, retirement: 694223.00 },
  { id: 'h19', date: '2025-09-30T12:00:00Z', savings: 188242.00, debt: 20817.00, balance: 167425.00, retirement: 684184.00 },
  { id: 'h18', date: '2025-07-30T12:00:00Z', savings: 224615.00, debt: 10251.00, balance: 214364.00, retirement: 658923.47 },
  { id: 'h17', date: '2025-06-30T12:00:00Z', savings: 245282.00, debt: 16132.00, balance: 229150.00, retirement: 654756.68 },
  { id: 'h16', date: '2025-05-30T12:00:00Z', savings: 261282.00, debt: 26132.00, balance: 235150.00, retirement: 654756.68 },
  { id: 'h15', date: '2025-04-30T12:00:00Z', savings: 284702.80, debt: 21934.00, balance: 262768.80, retirement: 630756.68 },
  { id: 'h14', date: '2025-03-30T12:00:00Z', savings: 283819.75, debt: 23264.00, balance: 260555.75, retirement: 630756.68 },
  { id: 'h13', date: '2025-02-28T12:00:00Z', savings: 300272.00, debt: 23163.00, balance: 277109.00, retirement: 630256.68 },
  { id: 'h12', date: '2025-02-14T12:00:00Z', savings: 321944.00, debt: 37930.00, balance: 284014.00, retirement: 629256.68 },
  { id: 'h11', date: '2025-01-30T12:00:00Z', savings: 329560.55, debt: 26358.00, balance: 303202.55, retirement: 595000.00 },
  { id: 'h10', date: '2024-12-30T12:00:00Z', savings: 328802.88, debt: 30258.00, balance: 298544.88, retirement: 590000.00 },
  { id: 'h9', date: '2024-12-15T12:00:00Z', savings: 304681.00, debt: 16020.00, balance: 288661.00, retirement: 595123.00 },
  { id: 'h8', date: '2024-11-30T12:00:00Z', savings: 300715.10, debt: 30520.00, balance: 270195.10, retirement: 594053.23 },
  { id: 'h7', date: '2024-11-15T12:00:00Z', savings: 283922.73, debt: 22150.00, balance: 261772.73, retirement: 586515.40 },
  { id: 'h6', date: '2024-10-30T12:00:00Z', savings: 272252.00, debt: 28950.00, balance: 243302.00, retirement: 581850.30 },
  { id: 'h5', date: '2024-09-30T12:00:00Z', savings: 274227.34, debt: 24500.00, balance: 249727.34, retirement: 580593.27 },
  { id: 'h4', date: '2024-08-30T12:00:00Z', savings: 314654.00, debt: 42900.00, balance: 271754.00, retirement: 560593.27 },
  { id: 'h3', date: '2024-07-30T12:00:00Z', savings: 335798.96, debt: 27100.00, balance: 308698.96, retirement: 549603.38 },
  { id: 'h2', date: '2024-06-30T12:00:00Z', savings: 350969.52, debt: 30258.00, balance: 320711.52, retirement: 543453.79 },
  { id: 'h1', date: '2024-05-30T12:00:00Z', savings: 376596.36, debt: 39394.00, balance: 337202.36, retirement: 536884.00 },
];
