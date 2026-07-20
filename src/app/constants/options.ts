import i18n from '@languages/i18n'
import { CustomerType, VerifiedOptions } from '@type/accountGroup'
import { accountStatus } from '@type/customer'
import { APPLICABLE_OBJECTS, history_type } from '@type/policyManagement'
import { t } from 'i18next'
import { AccountingTransactionType, AccountingBalanceType } from '@type/accounting'
import { AccountingSubType } from '@type/accounting'
import { ReportType } from '@type/report'

export const objectOptions = [
  { label: t`management.sales-fee.system`, value: 'SYSTEM' },
  { label: t`management.sales-fee.customer-type`, value: 'CUSTOMER_TYPE' },
  {
    label: t`policy-management.common.applicableObjectPrivateAccount`,
    value: 'PRIVATE_ACCOUNT'
  }
]

export const objectOptionsNotify = [
  { label: t`management.sales-fee.system`, value: 'SYSTEM' },
  { label: t`management.sales-fee.customerType`, value: 'CUSTOMER_TYPE' },
  { label: t`management.sales-fee.private-object`, value: 'PRIVATE_ACCOUNT' }
]

export const bankStatus = [
  { label: t`labels.activating`, value: 1 },
  { label: t`labels.lock`, value: 0 }
]

export const bankSearchStatus = [
  { label: t`labels.all`, value: -1 },
  ...bankStatus
]

export const bankTypeSearchStatus = [
  { value: -1, label: t`labels.all` },
  { value: 'LINK', label: t(`system-management.bank.options.LINK`) },
  { value: 'DEPOSIT', label: t(`system-management.bank.options.DEPOSIT`) },
  { value: 'WITHDRAW', label: t(`system-management.bank.options.WITHDRAW`) },
  { value: 'GATEWAY', label: t(`system-management.bank.options.GATEWAY`) }
]

export const accountStatusOptions = [
  {
    label: i18n.t('labels.verified'),
    value: accountStatus.VERIFIED
  },
  {
    label: i18n.t('labels.notVerified'),
    value: accountStatus.NOT_VERIFIED
  },
  {
    label: i18n.t('labels.linked'),
    value: accountStatus.LINKED
  }
]

export const dataPermissionListArray = [
  {
    id: 1,
    name: t('manage-group-permissions.form.permission.approve')
  },
  {
    id: 2,
    name: t('manage-group-permissions.form.permission.view')
  },
  {
    id: 3,
    name: t('manage-group-permissions.form.permission.add')
  },
  {
    id: 4,
    name: t('manage-group-permissions.form.permission.edit')
  },
  {
    id: 5,
    name: t('manage-group-permissions.form.permission.delete')
  }
]

export const dataRolePermission = [
  {
    id: 12,
    name: t`manage-group-permissions.form.managementAdminAndAuthorization`,
    permissions: [
      {
        label: '',
        value: 'GROUP_APPROVE_ALL'
      },
      {
        label: '',
        value: 'GROUP_VIEW_ALL'
      },
      {
        label: '',
        value: 'GROUP_ADD_ALL'
      },
      {
        label: '',
        value: 'GROUP_EDIT_ALL'
      },
      {
        label: '',
        value: 'GROUP_DELETE_ALL'
      }
    ]
  },
  {
    id: 6,
    name: t`manage-group-permissions.form.managementAdminAndAuthorization`,
    permissions: [
      {
        label: '',
        value: 'ADMIN_APPROVE'
      },
      {
        label: '',
        value: 'ADMIN_VIEW'
      },
      {
        label: '',
        value: 'ADMIN_ADD'
      },
      {
        label: '',
        value: 'ADMIN_EDIT'
      },
      {
        label: '',
        value: 'ADMIN_DELETE'
      }
    ]
  },
  {
    id: 7,
    name: t`manage-group-permissions.form.manageGroupPermissions`,
    permissions: [
      {
        label: '',
        value: 'GROUP_APPROVE'
      },
      {
        label: '',
        value: 'GROUP_VIEW'
      },
      {
        label: '',
        value: 'GROUP_ADD'
      },
      {
        label: '',
        value: 'GROUP_EDIT'
      },
      {
        label: '',
        value: 'GROUP_DELETE'
      }
    ]
  },
  {
    id: 11,
    name: t`manage-group-permissions.form.managePersonalWalletAccounts`,
    permissions: [
      {
        label: '',
        value: 'CUSTOMER_APPROVE_ALL'
      },
      {
        label: '',
        value: 'CUSTOMER_VIEW_ALL'
      },
      {
        label: '',
        value: 'CUSTOMER_ADD_ALL'
      },
      {
        label: '',
        value: 'CUSTOMER_EDIT_ALL'
      },
      {
        label: '',
        value: 'CUSTOMER_DELETE_ALL'
      }
    ]
  },
  {
    id: 8,
    name: t`manage-group-permissions.form.manageIndividualAccountsWallet`,
    permissions: [
      {
        label: '',
        value: 'CUSTOMER_GROUP_APPROVE'
      },
      {
        label: '',
        value: 'CUSTOMER_GROUP_VIEW'
      },
      {
        label: '',
        value: 'CUSTOMER_GROUP_ADD'
      },
      {
        label: '',
        value: 'CUSTOMER_GROUP_EDIT'
      },
      {
        label: '',
        value: 'CUSTOMER_GROUP_DELETE'
      }
    ]
  },
  {
    id: 9,
    name: t`manage-group-permissions.form.managePersonalWalletAccounts`,
    permissions: [
      {
        label: '',
        value: 'CUSTOMER_APPROVE'
      },
      {
        label: '',
        value: 'CUSTOMER_VIEW'
      },
      {
        label: '',
        value: 'CUSTOMER_ADD'
      },
      {
        label: '',
        value: 'CUSTOMER_EDIT'
      },
      {
        label: '',
        value: 'CUSTOMER_DELETE'
      }
    ]
  },
  {
    id: 10,
    name: t`manage-group-permissions.form.manageIndividualWalletTransaction`,
    permissions: [
      {
        label: '',
        value: 'CUSTOMER_TRANSACTION_APPROVE'
      },
      {
        label: '',
        value: 'CUSTOMER_TRANSACTION_VIEW'
      },
      {
        label: '',
        value: 'CUSTOMER_TRANSACTION_ADD'
      },
      {
        label: '',
        value: 'CUSTOMER_TRANSACTION_EDIT'
      },
      {
        label: '',
        value: 'CUSTOMER_TRANSACTION_DELETE'
      }
    ]
  }
]

export const typeOptions = [
  {
    label: i18n.t`customer-group.customer-type.personal`,
    value: CustomerType.PERSONAL
  },
  {
    label: i18n.t`customer-group.customer-type.enterprise`,
    value: CustomerType.ENTERPRISE
  }
]

export const verifiedOptions = [
  {
    label: i18n.t`internal-account-report.verified.ekyc`,
    value: VerifiedOptions.KYC_VERIFICATION
  },
  {
    label: i18n.t`internal-account-report.verified.not_ekyc`,
    value: VerifiedOptions.NOT_VERIFICATION
  }
]

export const applicableObjects = [
  {
    value: APPLICABLE_OBJECTS.SYSTEM,
    label: t`policy-management.payment.system`
  },
  {
    value: APPLICABLE_OBJECTS.ACCOUNT_GROUP,
    label: t`policy-management.payment.accountGroup`
  },
  {
    value: APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
    label: t`policy-management.payment.personalAccount`
  }
]

export type paymentServiceType = 'DISBURSE' | 'REPAYMENT'

export const historyType = [
  {
    value: '',
    label: t`labels.all`
  },
  {
    value: history_type.UPDATE_HISTORY,
    label: t`policy-management.history.update`
  },
  {
    value: history_type.DELETE_HISTORY,
    label: t`policy-management.history.delete`
  }
]




export const notificationStatus = [
  {
    value: null,
    label: t`labels.all`
  },
  {
    value: true,
    label: t`labels.active`
  },
  {
    value: false,
    label: t`labels.deactivate`
  }
]

export const feeSettingsKey = [
  {
    value: 'deposit-fee-principle',
    label: t`labels.deposit-fee-principle`
  },
  {
    value: 'withdraw-fee-principle',
    label: t`labels.withdraw-fee-principle`
  }
]

export const FeeOptions = [
  {
    label: t`policy-management.depositManagement.modalContent.tableModal.variableFee`,
    value: 'FLEXIBLE'
  },
  {
    label: t`policy-management.depositManagement.modalContent.tableModal.fixedFee`,
    value: 'FIXED'
  }
]

export const AdminManagementOptions = [
  {
    value: null,
    label: t('labels.all')
  },
  {
    value: true,
    label: t('labels.active')
  },
  {
    value: false,
    label: t('labels.lock')
  }
]

export const attributeOptions = [
  { label: i18n.t('product.attributeValue.newProduct'), value: 'NEW_PRODUCT' },
  { label: i18n.t('product.attributeValue.hotProduct'), value: 'HOT_PRODUCT' },
  {
    label: i18n.t('product.attributeValue.promoProduct'),
    value: 'PROMOTION_PRODUCTS'
  }
]

export const internalWalletGroupStatusOptions = [
  { label: i18n.t('internal-wallet-group.status.all'), value: null },
  { label: i18n.t('internal-wallet-group.status.active'), value: 1 },
  { label: i18n.t('internal-wallet-group.status.in-active'), value: 0 },
]

export const accountingOptions = [
  { label: i18n.t('internal-wallet.placeholders.add'), value: 1 },
  { label: i18n.t('internal-wallet.placeholders.reduce'), value: 0 }
]

export const fundsOptions = [
  { label: i18n.t('internal-wallet.fundsOptions.all'), value: null },
  { label: i18n.t('internal-wallet.fundsOptions.bank'), value: 'LINK_BANK' },
  { label: i18n.t('internal-wallet.fundsOptions.napas'), value: 'NAPAS' },
  {
    label: i18n.t('internal-wallet.fundsOptions.gate'),
    value: 'PAYMENT_GATEWAY'
  },
  { label: i18n.t('internal-wallet.fundsOptions.wallet'), value: 'EWALLET' },
  { label: i18n.t('internal-wallet.fundsOptions.atmCard'), value: 'ATM_CARD' },
]

export const walletTypeOptions = [
  {
    label: i18n.t('internal-wallet.walletTypeOptions.khcn'),
    value: AccountingBalanceType.PERSONAL,
  },
  {
    label: i18n.t('internal-wallet.walletTypeOptions.internalWallet'),
    value: AccountingBalanceType.INTERNAL,
  },
  {
    label: i18n.t('internal-wallet.walletTypeOptions.khdn'),
    value: AccountingBalanceType.ENTERPRISE,
  },
]

export const accountingStatus = [
  { label: i18n.t('internal-wallet.status.all'), value: null },
  { label: i18n.t('internal-wallet.status.active'), value: 1 },
  { label: i18n.t('internal-wallet.status.in-active'), value: 0 }
]

export const accountingSubType = [
  { label: i18n.t('accounting.subType.other'), value: AccountingSubType.OTHER },
  { label: i18n.t('accounting.subType.fee'), value: AccountingSubType.FEE },
  { label: i18n.t('accounting.subType.vat'), value: AccountingSubType.VAT },
]

export const accountingTransactionType = [
  {
    label: i18n.t('internal-wallet.transactionType.all'),
    value: null
  },
  {
    label: i18n.t('internal-wallet.transactionType.transfer'),
    value: AccountingTransactionType.TRANSFER
  },
  {
    label: i18n.t('internal-wallet.transactionType.deposit'),
    value: AccountingTransactionType.CASH_IN
  },
  {
    label: i18n.t('internal-wallet.transactionType.withdraw'),
    value: AccountingTransactionType.CASH_OUT
  },
  {
    label: i18n.t('internal-wallet.transactionType.billPayment'),
    value: AccountingTransactionType.BILL_PAYMENT
  },
  {
    label: i18n.t('internal-wallet.transactionType.collet'),
    value: AccountingTransactionType.ADVANDED_COLLECT
  }
]
export const reportType = [
  {
    label: i18n.t('state-bank-overview.reportType.highest-transaction-value'),
    value: ReportType.HIGHEST_TRANSACTION_VALUE
  },
  {
    label: i18n.t('state-bank-overview.reportType.highest-number-transactions'),
    value: ReportType.HIGHEST_NUMBER_TRANSACTIONS
  }
]

export enum Options {
  ALL = 'all',
}