import { t } from 'i18next'
import { accountStatus } from '@type/customer'
import i18n from '../../languages/i18n'

export const getGender = (gender: string | number) => {
  switch (+gender) {
    case 0:
      return t`labels.unknow`
    case 1:
      return t`labels.male`
    default:
      return t`labels.female`
  }
}

export const getTagColor = (status?: boolean, active?: number) => {
  if (status || active === 1) return 'geekblue'
  return 'error'
}

export const getTagAccountStatusColor = (status?: string) => {
  switch (status) {
    case accountStatus.LINKED:
      return 'geekblue'
    case accountStatus.NOT_VERIFIED:
      return ''
    case 'waitingForRefund':
      return 'processing'
    case accountStatus.VERIFIED:
      return 'cyan'
  }
}

export const getLabelButton = (status: string) => {
  if (status === 'lock') return i18n.t('buttons.lockAccount')
  return i18n.t('buttons.unlockAccount')
}

export const getStatusText = (status?: boolean) => {
  if (status) return i18n.t('labels.active')
  return i18n.t('labels.lock')
}

export const getStatusAccountText = (status: string | null | undefined) => {
  switch (status) {
    case accountStatus.LINKED:
      return i18n.t('labels.linked')
    case accountStatus.NOT_VERIFIED:
      return i18n.t('labels.notVerified')
    case accountStatus.VERIFIED:
      return i18n.t('labels.verified')
    default:
      return i18n.t('labels.linked')
  }
}

export function getRefundStatusText(status: string) {
  if (status === 'refunded') return i18n.t('labels.refunded')
  return i18n.t('labels.waitingForRefund')
}

export function getBankStatus(status: boolean) {
  if (status) return i18n.t`labels.active`
  return i18n.t`labels.lock`
}

export const getAccountType = (type?: string) => {
  if (type === 'PERSONAL') return i18n.t('internal-accounts-report.personal')
  return i18n.t('internal-accounts-report.enterprise')
}

export const getVerifyTye = (customerVerificationId: string) => {
  if (customerVerificationId) {
    return i18n.t`internal-account-report.verified.ekyc`
  }
  return i18n.t`internal-account-report.verified.not_ekyc`
}

export const getStatusPaymentLinkBank = (status: number) => {
  switch (status) {
    case 0:
      return i18n.t('payment-link.status.inactive')
    case 1:
      return i18n.t('payment-link.status.active')
  }
}
