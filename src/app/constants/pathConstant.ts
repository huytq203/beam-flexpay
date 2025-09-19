// Path constants for navigation
export const PATHS = {
  // Authentication paths
  AUTH: {
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_TOKEN: '/auth/verify-token',
    VERIFY: '/auth/verify',
    VERIFY_CODE: '/auth/verify-code'
  },

  // Fee Management V2 paths
  FEE_V2: {
    OUTBOUND_FEE: {
      MANAGEMENT: '/fee-v2/outbound-fee-management',
      CREATE: '/fee-v2/outbound-fee-management/create',
      UPDATE: (id: string) => `/fee-v2/outbound-fee-management/update/${id}`
    }
  },

  // Personal Wallet paths
  WALLET: {
    CUSTOMERS: {
      LIST: '/wallet/customers/list',
      LOOKUP: '/wallet/customers/lookup',
      CANCEL: '/wallet/customers/cancel',
      EKYC: '/wallet/customers/ekyc',
      FREEZE_ACCOUNT: '/wallet/customers/freeze-account',
      UN_FREEZE_ACCOUNT: '/wallet/customers/un-freeze-account'
    },
    TRANSACTION: {
      TRANSFER_HISTORY: '/wallet/transaction/transfer-history',
      NAPAS_TOKEN: '/wallet/transaction/napas-token'
    },
    CUSTOMERS_GROUP: '/wallet/customers-group'
  },

  // Fee Management paths
  FEE: {
    POLICY_MANAGEMENT: '/fee/policy-management',
    DIRECT_DEPOSIT: '/fee/direct-deposit',
    PAYMENT: '/fee/payment',
    ACCOUNT_BANK_PAYMENT: '/fee/account-bank-payment',
    WITHDRAW_MONEY: '/fee/withdraw-money',
    LIMIT_REGULATIONS: '/fee/limit-regulations',
    E_WALLET_TRANSFER_MONEY: '/fee/e-wallet-transfer-money',
    FORM_SETTING: '/fee/form-setting'
  },

  // Bank and Connect paths
  BANK_CONNECT: {
    BANKS: '/bank-and-connect/banks',
    NOTIFICATION_MANAGEMENT: '/bank-and-connect/notification-management'
  },

  // Reports paths
  REPORTS: {
    INTERNAL: {
      ACCOUNTS: '/reports/internal/accounts',
      DETAIL_ACCOUNT: '/reports/internal/detail-account'
    },
    STATE_BANK: {
      OVERVIEW: '/reports/state-bank/overview',
      ACCOUNT_GUARANTEE: '/reports/state-bank/account-guarantee',
      TRANSACTION_MANAGEMENT_REPORT: '/reports/state-bank/transaction-management-report'
    }
  },

  // Repayment and Disburse paths
  REPAYMENT_DISBURSE: {
    DASHBOARD: '/repayment-and-disburse/dashboard',
    SMS_METRICS: '/repayment-and-disburse/sms-metrics',
    REPAYMENT: {
      PARTNER_CONTACT: '/repayment-and-disburse/repayment/partner-contact',
      INVOICE_QUERY: '/repayment-and-disburse/repayment/invoice-query',
      REPAYMENT_TRANSACTION: '/repayment-and-disburse/repayment/repayment-transaction',
      PAYMENT_SERVICE: '/repayment-and-disburse/repayment/payment-service'
    },
    DISBURSE: {
      DISBURSE_TRANSACTION: '/repayment-and-disburse/disburse/disburse-transaction',
      DISBURSE_PARTNER_CONTACT: '/repayment-and-disburse/disburse/disburse-partner-contact',
      DISBURSE_INVOICE_QUERY: '/repayment-and-disburse/disburse/disburse-invoice-query'
    }
  },

  // Internal Wallet paths
  INTERNAL_WALLET: {
    GROUP: '/internal-wallet/group',
    ACCOUNT: {
      DETAILS: '/internal-wallet/account/details',
      TRANSACTIONS: '/internal-wallet/account/transactions'
    },
    SETTING: '/internal-wallet/setting',
    INTERNAL_ACCOUNTING: {
      DEPOSIT_REQUEST: '/internal-wallet/internal-accounting/deposit-request',
      DEPOSIT_APPROVAL: '/internal-wallet/internal-accounting/deposit-approval'
    }
  },

  // Role Management paths
  ROLE: {
    ADMIN_ACCOUNT: '/role/admin-account',
    MANAGE_GROUP_PERMISSIONS: '/role/manage-group-permissions'
  },

  // Error paths
  FORBIDDEN: '/forbidden',
  NOT_FOUND: '/404',

  // Default paths
  HOME: '/'
} as const

// Type for path values
export type PathValue = typeof PATHS[keyof typeof PATHS]