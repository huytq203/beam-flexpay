import { accountingTransactionType } from '@constants/options'
import { PaymentMethod } from '@type/bank'
import {
  TransactionStatus,
  TransactionSubType,
  TransactionType
} from '@type/transfer'
import i18n from '../../languages/i18n'

export const getTransactionStatus = (status: string) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return {
        label: i18n.t('transfer-history.choice.success'),
        value: 'success'
      }
    case TransactionStatus.PENDING:
      return {
        label: i18n.t('transfer-history.choice.inprogress'),
        value: 'geekblue'
      }
    case TransactionStatus.APPROVED:
      return {
        label: i18n.t('transfer-history.choice.approved'),
        value: '#87d068'
      }
    case TransactionStatus.FAILED:
      return {
        label: i18n.t('transfer-history.choice.reject'),
        value: 'error'
      }
    case TransactionStatus.INIT:
      return {
        label: i18n.t('transfer-history.choice.init'),
        value: 'default'
      }
  }
}

export const getTextTransactionStatus = (status: string) => {
  switch (status) {
    case TransactionStatus.SUCCESS:
      return i18n.t('transfer-history.choice.success')
    case TransactionStatus.PENDING:
      return i18n.t('transfer-history.choice.inprogress')
    case TransactionStatus.APPROVED:
      return i18n.t('transfer-history.choice.approved')
    case TransactionStatus.FAILED:
      return i18n.t('transfer-history.choice.reject')
  }
}

export const getTransactionType = (type: string) => {
  switch (type) {
    case TransactionType.DEPOSIT:
      return i18n.t('transfer-history.types.deposit')
    case TransactionType.TRANSFER:
      return i18n.t('transfer-history.types.transfer')
    case TransactionType.PAYMENT:
      return i18n.t('transfer-history.types.payment')
    case TransactionType.WITHDRAW:
      return i18n.t('transfer-history.types.withdraw')
    case TransactionType.RECEIVAL:
      return i18n.t('transfer-history.types.receival')
    case TransactionType.TOPUP:
      return i18n.t('transfer-history.types.topup')
  }
}

export const getPaymentMethod = (method: string) => {
  switch (method) {
    case PaymentMethod.ATM_CARD:
      return i18n.t('transfer-history.paymentMethodType.atmCard')
    case PaymentMethod.QR_CODE:
      return i18n.t('transfer-history.paymentMethodType.qrCode')
    case PaymentMethod.BANK_TRANSFER:
      return i18n.t('transfer-history.paymentMethodType.bankTransfer')
    case PaymentMethod.INTERNATIONAL_CARD:
      return i18n.t('transfer-history.paymentMethodType.internationalCard')
    case PaymentMethod.E_WALLET:
      return i18n.t('transfer-history.paymentMethodType.eWallet')
  }
}

export const getAccountingTransactionType = (transaction: string) => {
  const filter = accountingTransactionType.find(
    (item: { value: string | null; label: string }) =>
      item.value === transaction
  )

  return filter?.label ?? '-'
}

export const getTransactionSubType = (type: string) => {
  switch (type) {
    case TransactionSubType.MAIN:
    case TransactionSubType.PARTNER:
    case TransactionSubType.RECEIVER:
      return i18n.t('transfer-history.subTypes.transfer')
    case TransactionSubType.FEE:
    case TransactionSubType.RECEIVE_FEE:
      return i18n.t('transfer-history.subTypes.fee')
    case TransactionSubType.VAT:
    case TransactionSubType.RECEIVE_VAT:
      return i18n.t('transfer-history.subTypes.vat')
    default:
      return '-'
  }
}
