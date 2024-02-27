import i18n from '@languages/i18n'
import { CustomerType, VerifiedOptions } from '@type/accountGroup'
import { accountStatus } from '@type/customer'
import { notificationService } from '@type/notification'
import { APPLICABLE_OBJECTS, history_type } from '@type/policyManagement'
import { t } from 'i18next'
import { templateFormatBody, templateFormatTitle } from './regex'
import { TRANSACTION_TYPE } from '@pages/policy-management/limit-management/LimitAndRegulationsConst'
import { AccountingBalanceType } from '@type/accounting'

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

export const serviceTypes = [
  {
    value: notificationService.DEPOSIT_LINK_BANK,
    label: t`notification-management.service-type.deposit-link-bank`
  },
  {
    value: notificationService.DEPOSIT_CARD_PHONE,
    label: t`notification-management.service-type.deposit-phone-number`
  },
  {
    value: notificationService.DEPOSIT_FAIL,
    label: t`notification-management.service-type.deposit-fail`
  },

  {
    value: notificationService.CHARGE_CARD_PHONE_NUMBER,
    label: t`notification-management.service-type.charge-card-phone-number`
  },
  {
    value: notificationService.CHARGE_DATA_3G_4G,
    label: t`notification-management.service-type.charge-data-3g-4g`
  },
  {
    value: notificationService.PAYMENT_CARD_PHONE,
    label: t`notification-management.service-type.payment-card-phone`
  },
  {
    value: notificationService.PAYMENT_DATA_3G_4G,
    label: t`notification-management.service-type.payment-data-3g-4g`
  },
  {
    value: notificationService.TRANSFER_MOVER,
    label: t`notification-management.service-type.transfer-mover`
  },
  {
    value: notificationService.TRANSFER_RECEIVE,
    label: t`notification-management.service-type.transfer-receive`
  },
  {
    value: notificationService.WITHDRAW_LINK_BANK,
    label: t`notification-management.service-type.withdraw-link-bank`
  },
  {
    value: notificationService.WITHDRAW_NOT_LINK_BANK,
    label: t`notification-management.service-type.withdraw-not-link-bank`
  },
  {
    value: notificationService.LINK_BANK,
    label: t`notification-management.service-type.link-bank`
  },
  {
    value: notificationService.UNLINK_BANK,
    label: t`notification-management.service-type.un-link-bank`
  },
  {
    value: notificationService.PAYMENT_BILL,
    label: t`notification-management.service-type.payment-bill`
  },
  {
    value: notificationService.WARNING_LOGIN_NEW_DEVICE,
    label: t`notification-management.service-type.warning-login-new-device`
  },
  {
    value: notificationService.WARNING_CHANGE_PASSWORD,
    label: t`notification-management.service-type.warning-change-password`
  },
  {
    value: notificationService.OTHER,
    label: t`notification-management.service-type.other-service`
  }
]

export const serviceRegex = [
  {
    value: notificationService.DEPOSIT_LINK_BANK,
    bodyRegex: templateFormatBody.depositLinkBank,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.deposit-link-bank`,
    defaultBody: t`notification-management.default-body.deposit-link-bank`
  },
  {
    value: notificationService.DEPOSIT_CARD_PHONE,
    bodyRegex: templateFormatBody.depositCardPhone,
    titleRegex: templateFormatTitle.depositCardPhone,
    defaultTile: t`notification-management.default-title.deposit-phone-number`,
    defaultBody: t`notification-management.default-body.deposit-phone-number`
  },
  {
    value: notificationService.DEPOSIT_FAIL,
    bodyRegex: templateFormatBody.depositFail,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.deposit-fail`,
    defaultBody: t`notification-management.default-body.deposit-fail`
  },

  {
    value: notificationService.CHARGE_CARD_PHONE_NUMBER,
    bodyRegex: templateFormatBody.chargeCardPhoneNumber,
    titleRegex: templateFormatTitle.chargeCardPhoneNumber,
    defaultTile: t`notification-management.default-title.charge-card-phone-number`,
    defaultBody: t`notification-management.default-body.charge-card-phone-number`
  },
  {
    value: notificationService.CHARGE_DATA_3G_4G,
    bodyRegex: templateFormatBody.chargeData3G,
    titleRegex: templateFormatTitle.chargeData3G,
    defaultTile: t`notification-management.default-title.charge-data-3g-4g`,
    defaultBody: t`notification-management.default-body.charge-data-3g-4g`
  },
  {
    value: notificationService.PAYMENT_CARD_PHONE,
    bodyRegex: templateFormatBody.paymentCardPhone,
    titleRegex: templateFormatTitle.paymentCardPhone,
    defaultTile: t`notification-management.default-title.payment-card-phone`,
    defaultBody: t`notification-management.default-body.payment-card-phone`
  },
  {
    value: notificationService.PAYMENT_DATA_3G_4G,
    bodyRegex: templateFormatBody.payment3G,
    titleRegex: templateFormatTitle.payment3G,
    defaultTile: t`notification-management.default-title.payment-data-3g-4g`,
    defaultBody: t`notification-management.default-body.payment-data-3g-4g`
  },
  {
    value: notificationService.TRANSFER_MOVER,
    bodyRegex: templateFormatBody.transferMover,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.transfer-mover`,
    defaultBody: t`notification-management.default-body.transfer-mover`
  },
  {
    value: notificationService.TRANSFER_RECEIVE,
    bodyRegex: templateFormatBody.transferReceive,
    titleRegex: templateFormatTitle.transferReceive,
    defaultTile: t`notification-management.default-title.transfer-receive`,
    defaultBody: t`notification-management.default-body.transfer-receive`
  },
  {
    value: notificationService.WITHDRAW_LINK_BANK,
    bodyRegex: templateFormatBody.withdrawLinkBank,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.withdraw-link-bank`,
    defaultBody: t`notification-management.default-body.withdraw-link-bank`
  },
  {
    value: notificationService.WITHDRAW_NOT_LINK_BANK,
    bodyRegex: templateFormatBody.withdrawUnlinkBank,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.withdraw-not-link-bank`,
    defaultBody: t`notification-management.default-body.withdraw-not-link-bank`
  },
  {
    value: notificationService.LINK_BANK,
    bodyRegex: templateFormatBody.linkBank,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.link-bank`,
    defaultBody: t`notification-management.default-body.link-bank`
  },
  {
    value: notificationService.UNLINK_BANK,
    bodyRegex: templateFormatBody.unLinkBank,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.un-link-bank`,
    defaultBody: t`notification-management.default-body.un-link-bank`
  },
  {
    value: notificationService.PAYMENT_BILL,
    bodyRegex: templateFormatBody.paymentBill,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.payment-bill`,
    defaultBody: t`notification-management.default-body.payment-bill`
  },
  {
    value: notificationService.WARNING_LOGIN_NEW_DEVICE,
    bodyRegex: templateFormatBody.loginWarning,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.warning-login-new-device`,
    defaultBody: t`notification-management.default-body.warning-login-new-device`
  },
  {
    value: notificationService.WARNING_CHANGE_PASSWORD,
    bodyRegex: undefined,
    titleRegex: undefined,
    defaultTile: t`notification-management.default-title.warning-change-password`,
    defaultBody: t`notification-management.default-body.warning-change-password`
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
    label: t`policy-management.depositManagement.modalContent.tabelModal.variableFee`,
    value: 'FLEXIBLE'
  },
  {
    label: t`policy-management.depositManagement.modalContent.tabelModal.fixedFee`,
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
  { label: i18n.t('internal-wallet.fundsOptions.bank'), value: 'LINK_BANK' },
  { label: i18n.t('internal-wallet.fundsOptions.napas'), value: 'NAPAS' },
  {
    label: i18n.t('internal-wallet.fundsOptions.gate'),
    value: 'PAYMENT_GATEWAY'
  },
  { label: i18n.t('internal-wallet.fundsOptions.wallet'), value: 'EWALLET' }
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
  { label: i18n.t('internal-wallet.status.active'), value: 1 },
  { label: i18n.t('internal-wallet.status.in-active'), value: 0 }
]

export const accountingTransactionType = [
  {
    label: i18n.t('internal-wallet.transactionType.transfer'),
    value: TRANSACTION_TYPE.TRANSFER
  },
  {
    label: i18n.t('internal-wallet.transactionType.deposit'),
    value: TRANSACTION_TYPE.DEPOSIT
  },
  {
    label: i18n.t('internal-wallet.transactionType.withdraw'),
    value: TRANSACTION_TYPE.WITHDRAW
  },
  {
    label: i18n.t('internal-wallet.transactionType.billPayment'),
    value: 'BILL_PAYMENT'
  },
  {
    label: i18n.t('internal-wallet.transactionType.collet'),
    value: 'ADVANDED_COLLECT'
  }
]