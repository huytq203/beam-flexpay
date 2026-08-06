import dayjs from 'dayjs'
import { isDate } from 'lodash'
import { t } from 'i18next'
import { APPLICABLE_OBJECTS, history_type } from '@type/policyManagement'
import i18n from '../../languages/i18n'

export const formatObject = (value: string) => {
  switch (value) {
    case 'SYSTEM':
      return i18n.t('management.sales-fee.system')
    case 'CUSTOMER_TYPE':
      return i18n.t('management.sales-fee.customer-type')
    case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
    case 'PRIVATE_ACCOUNT':
      return i18n.t('policy-management.common.applicableObjectPrivateAccount')
  }
}

export const formatObjectPolicy = (value: string) => {
  switch (value) {
    case 'SYSTEM':
      return i18n.t('policy-management.common.applicableObjectSystem')
    case 'ACCOUNT_GROUP':
      return i18n.t('policy-management.common.applicableObjectAccountGroup')
    case 'PERSONAL_ACCOUNT':
    case 'PRIVATE_ACCOUNT':
      return i18n.t('policy-management.common.applicableObjectPrivateAccount')
    case 'ACCOUNT_TYPE':
      return i18n.t('policy-management.common.applicableObjectAccountGroup')
    default:
      return '-'
  }
}

export function formatObjectHistory(obj: unknown, key?: string): string {
  try {
    if (key === 'Chi tiết') {
      if (!Array.isArray(obj)) return String(obj)

      return obj
        .map((item) => {
          if (typeof item !== 'object' || item === null) return String(item)
          return Object.entries(item)
            .map(
              ([entryKey, value]) =>
                `<strong>${entryKey}</strong>: ${String(value)}`
            )
            .join(', ')
        })
        .join('<br/>')
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj)
        .map(
          ([entryKey, value]) =>
            `<strong>${formatKey(entryKey)}</strong>: ${processValue(value, entryKey)}`
        )
        .join('<br/>')
    }

    return processValue(obj)
  } catch {
    return String(obj)
  }
}

export function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (value) => value.toUpperCase())
}

export function processValue(value: unknown, key?: string): string {
  if (typeof value === 'string' && isDate(value)) {
    return dayjs(value).format('DD/MM/YYYY')
  }

  if (key === 'DETAILS') {
    return `${
      typeof value === 'string' && value.length > 0
        ? `<ul>${t(value)
            .split(',')
            .map((item: string) => `<li>${item}</li>`)
            .join(' ')}</ul>`
        : null
    }`
  }

  return String(value)
}

export const getApplicableObject = (object: APPLICABLE_OBJECTS) => {
  switch (object) {
    case APPLICABLE_OBJECTS.SYSTEM:
      return i18n.t`policy-management.payment.system`
    case APPLICABLE_OBJECTS.ACCOUNT_GROUP:
      return i18n.t`policy-management.payment.accountGroup`
    case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
      return i18n.t`policy-management.payment.personalAccount`
  }
}

export const getTypeHistory = (message: string) => {
  if (message === history_type.UPDATE_HISTORY) {
    return i18n.t`policy-management.history.update`
  }
  return i18n.t`policy-management.history.delete`
}
