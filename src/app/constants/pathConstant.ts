import {
  AUTHENTICATION,
  FEEMANAGEMENT,
  FEEMANAGEMENT_V2,
  BANKANDCONNECT,
  REPORTS,
  REPAYMENTANDDISBURSE,
  INTERNAL_WALLET,
  ROLEMANAGEMENT,
  FORBIDDENERROR,
  PERSONALWALLET,
  CUSTOMERS,
  CUSTOMERTRANSACTION,
  INTERNAL,
  STATE_BANK,
} from './routersConstant'

export const PATHS = {
  AUTH: {
    LOGIN: `${AUTHENTICATION}/login`,
    FORGOT_PASSWORD: `${AUTHENTICATION}/forgot-password`,
    RESET_PASSWORD: `${AUTHENTICATION}/reset-password`,
    VERIFY_TOKEN: `${AUTHENTICATION}/verify-token`,
    VERIFY: `${AUTHENTICATION}/verify`,
    VERIFY_CODE: `${AUTHENTICATION}/verify-code`
  },

  FEE_V2: {
    OUTBOUND_FEE: {
      MANAGEMENT: `${FEEMANAGEMENT_V2}/outbound-fee-management`,
      CREATE: `${FEEMANAGEMENT_V2}/outbound-fee-management/create`,
      UPDATE: (id: string) => `${FEEMANAGEMENT_V2}/outbound-fee-management/update/${id}`
    },
    INBOUND_FEE: {
      LIST: `${FEEMANAGEMENT_V2}/inbound-fee-management`,
      CREATE: `${FEEMANAGEMENT_V2}/inbound-fee-management/create`,
      UPDATE: `${FEEMANAGEMENT_V2}/inbound-fee-management/update`
    },
    VAT_FEE: {
      MANAGEMENT: `${FEEMANAGEMENT_V2}/vat-fee-management`,
      CREATE: `${FEEMANAGEMENT_V2}/vat-fee-management/create`,
      UPDATE: (id: string) => `${FEEMANAGEMENT_V2}/vat-fee-management/update/${id}`
    }
  },

  WALLET: {
    CUSTOMERS: {
      LIST: `${PERSONALWALLET}${CUSTOMERS}/list`,
      LOOKUP: `${PERSONALWALLET}${CUSTOMERS}/lookup`,
      CANCEL: `${PERSONALWALLET}${CUSTOMERS}/cancel`,
      EKYC: `${PERSONALWALLET}${CUSTOMERS}/ekyc`,
      FREEZE_ACCOUNT: `${PERSONALWALLET}${CUSTOMERS}/freeze-account`,
      UN_FREEZE_ACCOUNT: `${PERSONALWALLET}${CUSTOMERS}/un-freeze-account`
    },
    TRANSACTION: {
      TRANSFER_HISTORY: `${PERSONALWALLET}${CUSTOMERTRANSACTION}/transfer-history`,
      NAPAS_TOKEN: `${PERSONALWALLET}${CUSTOMERTRANSACTION}/napas-token`
    },
    CUSTOMERS_GROUP: `${PERSONALWALLET}/customers-group`
  },

  FEE: {
    POLICY_MANAGEMENT: `${FEEMANAGEMENT}/policy-management`,
    DIRECT_DEPOSIT: `${FEEMANAGEMENT}/direct-deposit`,
    PAYMENT: `${FEEMANAGEMENT}/payment`,
    ACCOUNT_BANK_PAYMENT: `${FEEMANAGEMENT}/account-bank-payment`,
    WITHDRAW_MONEY: `${FEEMANAGEMENT}/withdraw-money`,
    LIMIT_REGULATIONS: `${FEEMANAGEMENT}/limit-regulations`,
    E_WALLET_TRANSFER_MONEY: `${FEEMANAGEMENT}/e-wallet-transfer-money`,
    FORM_SETTING: `${FEEMANAGEMENT}/form-setting`
  },

  BANK_CONNECT: {
    BANKS: `${BANKANDCONNECT}/banks`,
    NOTIFICATION_MANAGEMENT: `${BANKANDCONNECT}/notification-management`
  },

  REPORTS: {
    INTERNAL: {
      ACCOUNTS: `${REPORTS}${INTERNAL}/accounts`,
      DETAIL_ACCOUNT: `${REPORTS}${INTERNAL}/detail-account`
    },
    STATE_BANK: {
      OVERVIEW: `${REPORTS}${STATE_BANK}/overview`,
      ACCOUNT_GUARANTEE: `${REPORTS}${STATE_BANK}/account-guarantee`,
      TRANSACTION_MANAGEMENT_REPORT: `${REPORTS}${STATE_BANK}/transaction-management-report`
    }
  },

  REPAYMENT_DISBURSE: {
    DASHBOARD: `${REPAYMENTANDDISBURSE}/dashboard`,
    SMS_METRICS: `${REPAYMENTANDDISBURSE}/sms-metrics`,
    REPAYMENT: {
      PARTNER_CONTACT: `${REPAYMENTANDDISBURSE}/repayment/partner-contact`,
      INVOICE_QUERY: `${REPAYMENTANDDISBURSE}/repayment/invoice-query`,
      REPAYMENT_TRANSACTION: `${REPAYMENTANDDISBURSE}/repayment/repayment-transaction`,
      PAYMENT_SERVICE: `${REPAYMENTANDDISBURSE}/repayment/payment-service`
    },
    DISBURSE: {
      DISBURSE_TRANSACTION: `${REPAYMENTANDDISBURSE}/disburse/disburse-transaction`,
      DISBURSE_PARTNER_CONTACT: `${REPAYMENTANDDISBURSE}/disburse/disburse-partner-contact`,
      DISBURSE_INVOICE_QUERY: `${REPAYMENTANDDISBURSE}/disburse/disburse-invoice-query`
    }
  },

  INTERNAL_WALLET: {
    GROUP: `${INTERNAL_WALLET}/group`,
    ACCOUNT: {
      DETAILS: `${INTERNAL_WALLET}/account/details`,
      TRANSACTIONS: `${INTERNAL_WALLET}/account/transactions`
    },
    SETTING: `${INTERNAL_WALLET}/setting`,
    INTERNAL_ACCOUNTING: {
      DEPOSIT_REQUEST: `${INTERNAL_WALLET}/internal-accounting/deposit-request`,
      DEPOSIT_APPROVAL: `${INTERNAL_WALLET}/internal-accounting/deposit-approval`
    }
  },

  ROLE: {
    ADMIN_ACCOUNT: `${ROLEMANAGEMENT}/admin-account`,
    MANAGE_GROUP_PERMISSIONS: `${ROLEMANAGEMENT}/manage-group-permissions`
  },

  FORBIDDEN: FORBIDDENERROR,
  NOT_FOUND: '/404',

  HOME: '/'
} as const

// Type for path values
export type PathValue = typeof PATHS[keyof typeof PATHS]