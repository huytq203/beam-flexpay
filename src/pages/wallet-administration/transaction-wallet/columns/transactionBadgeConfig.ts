import {
  PaymentMethod,
  PaymentMethodEnum,
  SourceDomain,
  SourceDomainLabel,
  TransactionType,
  type TransactionKey
} from '../constants/Transaction.constant'

export const TRANSACTION_FREEZE_STATUS = {
  FROZEN: {
    label: 'Đang đóng băng',
    className: 'warning-status',
    shimmerColor: 'rgba(245, 158, 11, 0.18)'
  }
}

export const TRANSACTION_TYPE_BADGE_CONFIG: Record<
  TransactionKey,
  { label: string; className: string }
> = {
  CASH_IN: {
    label: TransactionType.CASH_IN,
    className: 'success-status'
  },
  CASH_OUT: {
    label: TransactionType.CASH_OUT,
    className: 'danger-status'
  },
  P2P_TRANSFER: {
    label: TransactionType.P2P_TRANSFER,
    className: 'info-status'
  },
  MERCHANT_PAYMENT: {
    label: TransactionType.MERCHANT_PAYMENT,
    className: 'info-status'
  },
  REVERSAL: {
    label: TransactionType.REVERSAL,
    className: 'normal-status'
  }
}

export const SOURCE_DOMAIN_BADGE_CONFIG: Record<
  SourceDomain,
  { label: string; className: string }
> = {
  [SourceDomain.EWALLET]: {
    label: SourceDomainLabel[SourceDomain.EWALLET],
    className: 'normal-status'
  }
}

export const PAYMENT_METHOD_BADGE_CONFIG: Record<
  PaymentMethodEnum,
  { label: string; className: string }
> = {
  [PaymentMethodEnum.ATM]: {
    label: PaymentMethod[PaymentMethodEnum.ATM],
    className: 'normal-status'
  },
  [PaymentMethodEnum.CC]: {
    label: PaymentMethod[PaymentMethodEnum.CC],
    className: 'normal-status'
  },
  [PaymentMethodEnum.VA]: {
    label: PaymentMethod[PaymentMethodEnum.VA],
    className: 'normal-status'
  },
  [PaymentMethodEnum.QR_CODE]: {
    label: PaymentMethod[PaymentMethodEnum.QR_CODE],
    className: 'normal-status'
  },
  [PaymentMethodEnum.WALLET_BALANCE]: {
    label: PaymentMethod[PaymentMethodEnum.WALLET_BALANCE],
    className: 'normal-status'
  },
  [PaymentMethodEnum.LINKED_ACCOUNT]: {
    label: PaymentMethod[PaymentMethodEnum.LINKED_ACCOUNT],
    className: 'normal-status'
  }
}
