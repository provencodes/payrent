export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  },

  // Financial Configuration
  finance: {
    referralBonusKobo: 25000, // 250 naira
    baseInterestRate: 15, // 15%
    highAmountThreshold: 1000000, // 1M naira
    longTermThreshold: 12, // 12 months
  },

  // OTP Configuration
  otp: {
    length: 6,
    expiryMinutes: 10,
  },

  // Loan Configuration
  loan: {
    maxDebtToIncomeRatio: 0.4, // 40%
    minLoanAmount: 10000,
    maxLoanAmount: 5000000,
    minRepaymentPeriod: 3,
    maxRepaymentPeriod: 24,
  },

  // Pagination
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
});
