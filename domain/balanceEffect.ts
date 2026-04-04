export enum BalanceEffect {
  POSITIVE = 'POSITIVE',     // Increases balance (income/assets)
  NEGATIVE = 'NEGATIVE',     // Decreases balance (debts/expenses)
  INFORMATIVE = 'INFORMATIVE', // Doesn't affect balance (hidden from dashboard)
  INFORMATIVE_STAT = 'INFORMATIVE_STAT' // Doesn't affect balance but shows in dashboard (e.g. retirement)
}
