import { accountingTransactionType, serviceTypes } from '@constants/options'
import {
  LIMIT_AND_REGULATIONS,
  LIMIT_TYPE,
  TIME_TYPE_APPLY,
  TRANSACTION_TYPE,
  VALUE_LIMIT_TYPE
} from '@pages/policy-management/limit-management/LimitAndRegulationsConst'
import { BANK_MANAGEMENT, BANK_TYPE } from '@pages/system-management/bank-management/bank-modal/BankManagementConst'
import {
  NOTIFICATION_CONTEXT_SETTING,
  NOTIFICATION_TYPE_SERVICE
} from '@pages/system-management/notification-management/NotificationManagementConst'
import { accountStatus } from '@type/customer'
import { APPLICABLE_OBJECTS, history_type } from '@type/policyManagement'
import { TransactionStatus, TransactionSubType, TransactionType } from '@type/transfer'
import { notification } from 'antd'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { forOwn, fromPairs, isDate, isEqual, reduce } from 'lodash'
import i18n from '../languages/i18n'
import { PaymentMethod } from '@type/bank'
import { DateFormat, FullFormatTime } from '@constants/datetime'

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
  else return 'error'
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
  else return i18n.t('buttons.unlockAccount')
}

export const moneyInputFormatter = (value?: string) => {
  if (value !== undefined) {
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  } else return ''
}

export const blockLetterValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
  if (!numbers.includes(e.nativeEvent.key.toString())) {
    e.preventDefault()
  }
}

export const blockArrowValue = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
    e.stopPropagation()
  }
}

export const blockLetterDecimal = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  if (!numbers.includes(e.nativeEvent.key.toString())) {
    e.preventDefault()
  }
}

export const blockLetterDecimalAndDot = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.']
  if (!numbers.includes(e.nativeEvent.key.toString())) {
    e.preventDefault()
  }
}

export const formatObject = (value: string) => {
  switch (value) {
    case 'SYSTEM':
      return i18n.t('management.sales-fee.system')
    case 'CUSTOMER_TYPE':
      return i18n.t('management.sales-fee.customer-type')
    case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
      return i18n.t('policy-management.common.applicableObjectPrivateAccount')
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
      return i18n.t('policy-management.common.applicableObjectPrivateAccount')
    case 'PRIVATE_ACCOUNT':
      return i18n.t('policy-management.common.applicableObjectPrivateAccount')
    case 'ACCOUNT_TYPE':
      return i18n.t('policy-management.common.applicableObjectAccountGroup')
    default:
      return '-'
  }
}

export const formatTransactionType = (value: string) => {
  switch (value) {
    case TRANSACTION_TYPE.DEPOSIT:
      return i18n.t('policy-management.limitAndRegulations.recharge')
    case TRANSACTION_TYPE.WITHDRAWAL:
      return i18n.t('policy-management.limitAndRegulations.withDraw')
    case TRANSACTION_TYPE.WITHDRAW:
      return i18n.t('policy-management.limitAndRegulations.withDraw')
    case TRANSACTION_TYPE.TRANSFER:
      return i18n.t('policy-management.limitAndRegulations.transferMoney')
    case TRANSACTION_TYPE.PAYMENT:
      return i18n.t('policy-management.limitAndRegulations.payment')
    case TRANSACTION_TYPE.FEE:
      return i18n.t(`policy-management.limitAndRegulations.fee`)
    case TRANSACTION_TYPE.VAT:
      return i18n.t(`policy-management.limitAndRegulations.vat`)
    case TRANSACTION_TYPE.TOTAL_LIMIT:
      return i18n.t(
        'policy-management.limitAndRegulations.totalLimitTransaction'
      )
    default:
      return '-'
  }
}

export const formatLimitValueType = (value: string) => {
  switch (value) {
    case VALUE_LIMIT_TYPE.VALUE:
      return i18n.t('policy-management.limitAndRegulations.value')
    case VALUE_LIMIT_TYPE.TIMES:
      return i18n.t('policy-management.limitAndRegulations.count')
    default:
      return '-'
  }
}

export const formatLimitTimeType = (value: string) => {
  switch (value) {
    case VALUE_LIMIT_TYPE.TIMES:
      return i18n.t('policy-management.limitAndRegulations.times')
    case TIME_TYPE_APPLY.DAY:
      return i18n.t('policy-management.limitAndRegulations.day')
    case TIME_TYPE_APPLY.WEEK:
      return i18n.t('policy-management.limitAndRegulations.week')
    case TIME_TYPE_APPLY.MONTH:
      return i18n.t('policy-management.limitAndRegulations.month')
    case TIME_TYPE_APPLY.YEAR:
      return i18n.t('policy-management.limitAndRegulations.year')
    default:
      return '-'
  }
}

export const formatLimitType = (value: string) => {
  switch (value) {
    case LIMIT_TYPE.LIMIT_MIN:
      return i18n.t('policy-management.limitAndRegulations.minLimit')
    case LIMIT_TYPE.LIMIT_MAX:
      return i18n.t('policy-management.limitAndRegulations.maxLimit')
    default:
      return '-'
  }
}

export function formatObjectHistory(obj: any, key?: string): string {
  try {
    if (key && key === 'Chi tiết') {
      if (Array.isArray(obj)) {
        const array = obj
        return array
          .map((item: string) => {
            const formattedEntries = Object.entries(item).map(
              ([key, value]) => {
                return `<strong>${key.toString()}</strong>: ${value.toString()}`
              }
            )
            return formattedEntries.join(', ')
          })
          .join('<br/>')
      } else {
        return obj
      }
    } else if (typeof obj === 'object' && obj !== null) {
      const formattedEntries = Object.entries(obj).map(([key, value]) => {
        return `<strong>${formatKey(key)}</strong>: ${processValue(value, key)}`
      })
      return formattedEntries.join('<br/>')
    } else {
      return processValue(obj)
    }
  } catch (e) {
    return obj
  }
}

export function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
}

export function processValue(value: any, key?: string): string {
  if (typeof value === 'string' && isDate(value)) {
    return dayjs(value).format('DD/MM/YYYY')
  } else if (key === 'DETAILS') {
    return `${value && value.length > 0
        ? `<ul>${t(value)
          .split(',')
          .map((item: string) => `<li>${item}</li>`)
          .join(' ')}</ul>`
        : null
      }`
  }
  return String(value)
}

export const formatHistoryData = (value: string | number) => {
  if (!isNaN(Number(value))) {
    if (value) {
      return convertNumber(value)
    } else return '-'
  } else {
    switch (value) {
      case TRANSACTION_TYPE.DEPOSIT:
        return i18n.t('policy-management.limitAndRegulations.recharge')
      case TRANSACTION_TYPE.WITHDRAWAL:
        return i18n.t('policy-management.limitAndRegulations.withDraw')
      case TRANSACTION_TYPE.WITHDRAW:
        return i18n.t('policy-management.limitAndRegulations.withDraw')
      case TRANSACTION_TYPE.TRANSFER:
        return i18n.t('policy-management.limitAndRegulations.transferMoney')
      case TRANSACTION_TYPE.PAYMENT:
        return i18n.t('policy-management.limitAndRegulations.payment')
      case TRANSACTION_TYPE.FEE:
        return i18n.t(`policy-management.limitAndRegulations.fee`)
      case TRANSACTION_TYPE.VAT:
        return i18n.t(`policy-management.limitAndRegulations.vat`)
      case TRANSACTION_TYPE.TOTAL_LIMIT:
        return i18n.t(
          'policy-management.limitAndRegulations.totalLimitTransaction'
        )
      case VALUE_LIMIT_TYPE.VALUE:
        return i18n.t('policy-management.limitAndRegulations.value')
      case VALUE_LIMIT_TYPE.TIMES:
        return i18n.t('policy-management.limitAndRegulations.count')
      case LIMIT_TYPE.LIMIT_MIN:
        return i18n.t('policy-management.limitAndRegulations.minLimit')
      case LIMIT_TYPE.LIMIT_MAX:
        return i18n.t('policy-management.limitAndRegulations.maxLimit')
      case TIME_TYPE_APPLY.DAY:
        return i18n.t('policy-management.limitAndRegulations.day')
      case TIME_TYPE_APPLY.WEEK:
        return i18n.t('policy-management.limitAndRegulations.week')
      case TIME_TYPE_APPLY.MONTH:
        return i18n.t('policy-management.limitAndRegulations.month')
      case TIME_TYPE_APPLY.YEAR:
        return i18n.t('policy-management.limitAndRegulations.year')
      case BANK_TYPE.LINK:
        return i18n.t('system-management.bank.options.LINK')
      case BANK_TYPE.LINK_DEPOSIT:
        return i18n.t('system-management.bank.options.LINK_DEPOSIT')
      case BANK_TYPE.LINK_GATEWAY:
        return i18n.t('system-management.bank.options.LINK_GATEWAY')
      case BANK_TYPE.LINK_WITHDRAW:
        return i18n.t('system-management.bank.options.LINK_WITHDRAW')
      case APPLICABLE_OBJECTS.SYSTEM:
        return i18n.t('policy-management.payment.system')
      case APPLICABLE_OBJECTS.ACCOUNT_GROUP:
        return i18n.t('policy-management.payment.accountGroup')
      case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
        return i18n.t('policy-management.payment.personalAccount')
      case NOTIFICATION_TYPE_SERVICE.DEPOSIT_LINK_BANK:
        return i18n.t('notification-management.service-type.deposit-link-bank')
      case NOTIFICATION_TYPE_SERVICE.DEPOSIT_CARD_PHONE:
        return i18n.t('notification-management.service-type.deposit-card-phone')
      case NOTIFICATION_TYPE_SERVICE.DEPOSIT_FAIL:
        return i18n.t('notification-management.service-type.deposit-fail')
      case NOTIFICATION_TYPE_SERVICE.CHARGE_CARD_PHONE_NUMBER:
        return i18n.t('notification-management.service-type.charge-card-phone-number')
      case NOTIFICATION_TYPE_SERVICE.CHARGE_DATA_3G_4G:
        return i18n.t('notification-management.service-type.charge-data-3g-4g')
      case NOTIFICATION_TYPE_SERVICE.PAYMENT_CARD_PHONE:
        return i18n.t('notification-management.service-type.payment-card-phone')
      case NOTIFICATION_TYPE_SERVICE.PAYMENT_DATA_3G_4G:
        return i18n.t('notification-management.service-type.payment-data-3g-4g')
      case NOTIFICATION_TYPE_SERVICE.TRANSFER_MOVER:
        return i18n.t('notification-management.service-type.transfer-mover')
      case NOTIFICATION_TYPE_SERVICE.TRANSFER_RECEIVE:
        return i18n.t('notification-management.service-type.transfer-receive')
      case NOTIFICATION_TYPE_SERVICE.WITHDRAW_LINK_BANK:
        return i18n.t('notification-management.service-type.withdraw-link-bank')
      case NOTIFICATION_TYPE_SERVICE.WITHDRAW_NOT_LINK_BANK:
        return i18n.t('notification-management.service-type.withdraw-not-link-bank')
      case NOTIFICATION_TYPE_SERVICE.LINK_BANK:
        return i18n.t('notification-management.service-type.link-bank')
      case NOTIFICATION_TYPE_SERVICE.UNLINK_BANK:
        return i18n.t('notification-management.service-type.un-link-bank')
      case NOTIFICATION_TYPE_SERVICE.PAYMENT_BILL:
        return i18n.t('notification-management.service-type.payment-bill')
      case NOTIFICATION_TYPE_SERVICE.WARNING_LOGIN_NEW_DEVICE:
        return i18n.t('notification-management.service-type.warning-login-new-device')
      case NOTIFICATION_TYPE_SERVICE.WARNING_CHANGE_PASSWORD:
        return i18n.t('notification-management.service-type.warning-change-password')
      case NOTIFICATION_TYPE_SERVICE.OTHER:
        return i18n.t('notification-management.service-type.other-service')

      default:
        // if (typeof JSON.parse(value.toString()) === 'string') return value;
        // else if (typeof JSON.parse(value.toString()) === 'object') return formatObjectHistory(JSON.parse(value.toString()));
        // else return '-';
        return value
    }
  }
}

export const convertNumber = (
  amount: string | number,
  suffix?: string | undefined
) => {
  if (!amount && amount !== 0) {
    return '-'
  }
  return (
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (suffix ?? '')
  )
}

export const getStatusText = (status?: boolean) => {
  if (status) return i18n.t('labels.active')
  else return i18n.t('labels.lock')
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

export function toPromise<T>(func: T): Promise<T> {
  return Promise.resolve(func)
}

export function getDate(date: string | null | undefined) {
  return date?.split('T')?.[0] ?? null
}

export function getRefundStatusText(status: string) {
  if (status === 'refunded') return i18n.t('labels.refunded')
  else return i18n.t('labels.waitingForRefund')
}

export function getBankStatus(status: boolean) {
  if (status) return i18n.t`labels.active`
  else return i18n.t`labels.lock`
}

export const getAccountType = (type?: string) => {
  if (type === 'PERSONAL') return i18n.t('internal-accounts-report.personal')
  else return i18n.t('internal-accounts-report.enterprise')
}

export const getStringDateFromMoment = (
  date: string | undefined,
  formatDate: string
) => {
  if (date) return dayjs(date).toISOString()
  else return undefined
}

/**
 * Format UTC datetime string to local date string
 * dayjs automatically converts UTC to browser's local timezone
 * @param time - UTC datetime string (e.g., "2025-10-24T17:00:00.000Z")
 * @returns Formatted date string in local timezone (e.g., "25/10/2025" for VN +7)
 */
export const formatUTCToLocalDate = (time?: string | null) => {
  if (!time) return ''
  return dayjs(time).format(DateFormat)
}

/**
 * Format UTC datetime string to local datetime string
 * dayjs automatically converts UTC to browser's local timezone
 * @param time - UTC datetime string (e.g., "2025-10-24T17:00:00.000Z")
 * @returns Formatted datetime string in local timezone (e.g., "25/10/2025 00:00:00" for VN +7)
 */
export const formatUTCToLocalDateTime = (time?: string | null) => {
  if (!time) return ''
  return dayjs(time).format(FullFormatTime)
}

// Legacy function names - kept for backward compatibility
export const getVNDateStringFromUTCTimeString = formatUTCToLocalDate
export const getVNDateTimeStringFromUTCTimeString = formatUTCToLocalDateTime


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

export const renderDisplayOn = (detailData: any) => {
  if (detailData?.data?.showWeb && detailData?.data?.showApp === 1) {
    return t`productType.web-app`
  } else if (detailData?.data?.showApp === 1) {
    return t`productType.app`
  } else if (detailData?.data?.showWeb === 1) {
    return t`productType.web`
  } else {
    return t`product.noneDisplayOn`
  }
}

export const convertValueCheckbox = (value: boolean | number): string => {
  return value ? '1' : '0'
}

export const convertLocalStringNumber = (number?: number | string) => {
  if (!number) return 0
  return typeof number === 'string' || typeof number === 'number'
    ? Number(number).toLocaleString()
    : 0
}

export const parseNumberFromCommaString = (value?: string): number => {
  return Number((value ?? '').replace(/,/g, ''))
}

export const parseNumberFromPercentString = (value?: string): number => {
  return Number((value ?? '').replace('%', ''))
}

export const getApplicableObject = (object: APPLICABLE_OBJECTS) => {
  switch (object) {
    case APPLICABLE_OBJECTS.SYSTEM:
      return i18n.t`policy-management.payment.system`
    case APPLICABLE_OBJECTS.ACCOUNT_GROUP:
      return i18n.t`policy-management.payment.accountGroup`
    case APPLICABLE_OBJECTS.PERSONAL_ACCOUNT:
      return i18n.t`policy-management.payment.personalAccount`
    default:
      break
  }
}

export const showSuccessMessage = (msg: string) => {
  notification.destroy()
  notification.success({ message: msg })
}

export const getTypeHistory = (msg: string) => {
  if (msg === history_type.UPDATE_HISTORY)
    return i18n.t`policy-management.history.update`
  else return i18n.t`policy-management.history.delete`
}

export const getGeneralReportDeviceChartTitle = (title: string) => {
  switch (title) {
    case 'totalDeviceAndroid':
      return i18n.t`internal-accounts-report.chart.title.totalDeviceAndroid`
    case 'totalDeviceIos':
      return i18n.t`internal-accounts-report.chart.title.totalDeviceIos`
    case 'totalDeviceOther':
      return i18n.t`internal-accounts-report.chart.title.totalDeviceOther`
    default:
      break
  }
}

export const getNotificationService = (service: NOTIFICATION_TYPE_SERVICE) => {
  const services = serviceTypes.concat([
    {
      value: NOTIFICATION_TYPE_SERVICE.OTHER,
      label: i18n.t`notification-management.service-type.other-service`
    }
  ])

  const item: { value: string; label: string } | undefined = services.find(
    (item) => service === item.value
  )
  if (item) return item.label
  else return undefined
}

export const getVerifyTye = (customerVerificationId: string) => {
  if (customerVerificationId)
    return i18n.t`internal-account-report.verified.ekyc`
  else return i18n.t`internal-account-report.verified.not_ekyc`
}

export const fnTransformResponse = (response: any) => {
  return response.data
}

export const fnDisableStartDate = (current: dayjs.Dayjs, to: dayjs.Dayjs) => {
  current = current.startOf('day')
  to = to.endOf('day')
  return current > dayjs().endOf('day') || current > dayjs(to, 'YYYY-MM-DD')
}

export const fnDisableEndDate = (current: dayjs.Dayjs, from: dayjs.Dayjs) => {
  current = current.endOf('day')
  from = from.startOf('day')
  return current > dayjs().endOf('day') || current < dayjs(from, 'YYYY-MM-DD')
}

/**
 * function that support to get params from url
 * @param key
 * @returns
 */
export const getParamsFromURL = (key: string) =>
  new URLSearchParams(window.location.search).get(key)

export const getAccountingTransactionType = (transaction: string) => {
  const filters = accountingTransactionType.find(
    (item: { value: string | null; label: string }) => item.value === transaction
  )

  if (filters) return filters.label

  return '-'
}

export function parseManually(str: string) {
  // Remove the outer braces and whitespace
  const trimmedStr = str.trim().slice(1, -1)

  // Initialize an empty object to hold the parsed data
  const result: Record<string, any> = {}

  // Split the string by commas, but only those outside of quotes
  const pairs = trimmedStr.match(
    /("(?:\\"|[^"])*?"|\d+):("(?:\\"|[^"])*?"|\d+)/g
  )

  if (pairs) {
    pairs.forEach((pair: any) => {
      // Split each pair by the colon
      const [key, value] = pair.split(/:(.+)/).map((s: string) => s.trim())

      // Remove quotes from around the key and value
      const cleanedKey = key.replace(/^"(.*)"$/, '$1')
      let cleanedValue = value.replace(/^"(.*)"$/, '$1')

      // Convert numeric strings to numbers
      if (!isNaN(cleanedValue)) {
        cleanedValue = Number(cleanedValue)
      }

      // Add the key-value pair to the result object
      result[cleanedKey] = cleanedValue
    })

    return result
  }
  return str
}

export const getNameColumnTypeChange = (title: string) => {
  switch (title) {
    case LIMIT_AND_REGULATIONS.APPLICABLE_OBJECT:
      return i18n.t`policy-management.limitAndRegulations.label.appliableTime`
    case LIMIT_AND_REGULATIONS.LIMIT_TYPE:
      return i18n.t`policy-management.limitAndRegulations.label.limitType`
    case LIMIT_AND_REGULATIONS.LIMIT_VALUE_TYPE:
      return i18n.t`policy-management.limitAndRegulations.label.limitValueType`
    case LIMIT_AND_REGULATIONS.LIMIT_VALUE:
      return i18n.t`policy-management.limitAndRegulations.label.limitValue`
    case LIMIT_AND_REGULATIONS.TIME_LIMIT:
      return i18n.t`policy-management.limitAndRegulations.label.timeLimit`
    case LIMIT_AND_REGULATIONS.APPLICABLE_TIME:
      return i18n.t`policy-management.limitAndRegulations.label.appliableTime`
    case LIMIT_AND_REGULATIONS.TRANSACTION_TYPE:
      return i18n.t`policy-management.limitAndRegulations.label.transactionType`
    case BANK_MANAGEMENT.TRADING_NAME:
      return i18n.t`system-management.bank.trading-name`
    case BANK_MANAGEMENT.ADDRESS:
      return i18n.t`system-management.bank.address`
    case BANK_MANAGEMENT.FULL_LOGO:
      return i18n.t`system-management.bank.full-logo`
    case BANK_MANAGEMENT.PRIORITY:
      return i18n.t`system-management.bank.priority`
    case BANK_MANAGEMENT.TINY_LOGO:
      return i18n.t`system-management.bank.tiny-logo`
    case BANK_MANAGEMENT.STATUS:
      return i18n.t`system-management.bank.status`
    case BANK_MANAGEMENT.TYPE:
      return i18n.t`system-management.bank.type`
    case BANK_MANAGEMENT.WEBSITE:
      return i18n.t`system-management.bank.website`
    case NOTIFICATION_CONTEXT_SETTING.OBJECT:
      return i18n.t`notification-management.object`
    case NOTIFICATION_CONTEXT_SETTING.SERVICE:
      return i18n.t`notification-management.service`
    case NOTIFICATION_CONTEXT_SETTING.STATUS:
      return i18n.t`notification-management.status`
    case NOTIFICATION_CONTEXT_SETTING.TEXT_TITLE:
      return i18n.t`notification-management.text-title`
    case NOTIFICATION_CONTEXT_SETTING.APPLY_DATE:
      return i18n.t`notification-management.apply-date`
    case NOTIFICATION_CONTEXT_SETTING.CONTENT:
      return i18n.t`notification-management.content`
    default:
      return title
  }
}

export const getTransactionSubType = (type: string) => {
  switch (type) {
    case TransactionSubType.MAIN:
      return i18n.t('transfer-history.subTypes.transfer')
    case TransactionSubType.PARTNER:
      return i18n.t('transfer-history.subTypes.transfer')
    case TransactionSubType.RECEIVER:
      return i18n.t('transfer-history.subTypes.transfer')
    case TransactionSubType.FEE:
      return i18n.t('transfer-history.subTypes.fee')
    case TransactionSubType.VAT:
      return i18n.t('transfer-history.subTypes.vat')
    case TransactionSubType.RECEIVE_VAT:
      return i18n.t('transfer-history.subTypes.vat')
    case TransactionSubType.RECEIVE_FEE:
      return i18n.t('transfer-history.subTypes.fee')
    default:
      return '-'
  }
}

export const getStatusPaymentLinkBank = (status: number) => {
  switch (status) {
    case 0:
      return i18n.t('payment-link.status.inactive')
    case 1:
      return i18n.t('payment-link.status.active')
  }
}

export interface Data {
  [key: string]: any
}

/**
 * Chuyển đổi một đối tượng FormData thành một đối tượng JavaScript thuần.
 * @param formData - Đối tượng FormData cần chuyển đổi.
 * @returns Đối tượng JavaScript thuần đã chuyển đổi.
 */
export const formDataToObject = (formData: FormData): Data => {
  const entries = Array.from(formData.entries())
  return fromPairs(entries)
}

/**
 * So sánh dữ liệu trong đối tượng `formData` với dữ liệu ban đầu trong đối tượng `initData` và trả về một mảng các trường khác nhau.
 *
 * @param formData - Đối tượng dữ liệu biểu mẫu để so sánh.
 * @param initData - Đối tượng dữ liệu ban đầu để so sánh.
 * @returns Một mảng các chuỗi đại diện cho các trường khác nhau giữa hai đối tượng.
 */
export const compareFormData = (formData: FormData, initData: Data): string[] => {
  const formDataObj = formDataToObject(formData)
  const differentFields: string[] = []

  forOwn(formDataObj, (value, key) => {
    // không so sánh trường bigImage 
    if (key === 'bigImage') {
      return
    }
    if (value != initData[key]) {
      differentFields.push(key)
    }
  })

  return differentFields
}
/**
 * So sánh các thuộc tính của một đối tượng thông báo với một đối tượng payload và trả về một mảng các khóa
 * nơi các giá trị khác nhau.
 *
 * @param notification - Đối tượng thông báo để so sánh.
 * @param payload - Đối tượng payload để so sánh với thông báo.
 * @returns Một mảng các khóa nơi các giá trị trong payload khác với các giá trị trong thông báo.
 */
export const compareData = (notification: any, payload: any) => {
  return reduce(payload, (result: string[], value, key) => {
    if (!isEqual(value, notification[key])) {
      result.push(key)
    }
    return result
  }, [] as string[])
}

/**
 * Ghi log dữ liệu được cung cấp cùng với một tin nhắn tùy chọn.
 * Nếu dữ liệu là một thể hiện của FormData, nó sẽ chuyển đổi thành JSON và ghi log.
 * Nếu dữ liệu không phải là một thể hiện của FormData, nó sẽ ghi log tin nhắn và dữ liệu như vậy.
 *
 * @param message - Một tin nhắn tùy chọn để ghi log cùng với dữ liệu.
 * @param data - Dữ liệu cần ghi log.
 */
export const logData = (message: string = '', data: any) => {
  if (data instanceof FormData) {
    const formDataObject: { [key: string]: any } = {}
    data.forEach((value, key) => {
      formDataObject[key] = value
    })
    message = `FormData as JSON: ${message}`
  } else {

  }
}

export function removeNullUndefinedFields<T extends object>(obj: T): Partial<T> {
  const newObj: Partial<T> = {}
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== null && obj[key] !== undefined) {
      newObj[key] = obj[key]
    }
  }
  return newObj
}


/**
 * Chuyển đổi dạng mini percent sang percent string kèm %, bỏ các chữ số 0 thừa sau dấu phẩy
 * @param value - Dạng mini percent
 * @returns Dạng percent string kèm %, bỏ các chữ số 0 thừa sau dấu phẩy
 * @example
 * convertMiniPercentToPercent(1000) // "10%"
 * convertMiniPercentToPercent(10000) // "100%"
 * convertMiniPercentToPercent(1050) // "10.5%"
 */
export const convertMiniPercentToPercent = (value?: number): string => {
  if (!value) return ''
  return `${(value / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`
}

/**
 * Chuyển đổi percent sang mini percent (nhân 1000)
 * @param value - Giá trị percent (ví dụ: 10.5)
 * @returns Giá trị mini percent (ví dụ: 10500)
 * @example
 * convertPercentToMiniPercent(10) // 10000
 * convertPercentToMiniPercent(10.5) // 10500
 * convertPercentToMiniPercent(0.5) // 500
 */
export const convertPercentToMiniPercent = (value?: number): number | undefined => {
  if (value === undefined || value === null) return undefined
  return Math.round(value * 1000)
}

/**
 * Chuyển đổi mini percent sang percent (chia 1000)
 * @param value - Giá trị mini percent (ví dụ: 10500)
 * @returns Giá trị percent (ví dụ: 10.5)
 * @example
 * convertMiniPercentToPercentNumber(10000) // 10
 * convertMiniPercentToPercentNumber(10500) // 10.5
 * convertMiniPercentToPercentNumber(500) // 0.5
 */
export const convertMiniPercentToPercentNumber = (value?: number): number | undefined => {
  if (value === undefined || value === null) return undefined
  return value / 1000
}


export const extractNativeDateFromPicker = (value: unknown): Date | null => {
  if (!value) return null

  if (isDate(value)) return value

  if (typeof value === 'object' && value !== null) {
    const dateObj = value as Record<string, unknown>

    if (dateObj.$d instanceof Date) return dateObj.$d
    if (dateObj._d instanceof Date) return dateObj._d

    if (typeof dateObj.toDate === 'function') {
      return (dateObj.toDate as () => Date)()
    }
  }

  return null
}

export const validateFutureDatetime = (_: unknown, value: unknown): Promise<void> => {
  if (!value) return Promise.resolve()

  const selectedDate = extractNativeDateFromPicker(value)
  if (!selectedDate) return Promise.resolve()

  const currentDate = new Date()

  const isBefore = selectedDate.getTime() < currentDate.getTime()

  if (isBefore) {
    return Promise.reject(new Error('Ngày giờ áp dụng phải lớn hơn hoặc bằng ngày giờ hiện tại'))
  }
  return Promise.resolve()
}

/**
 * Kiểm tra xem giá trị có rỗng hay không (null, undefined, hoặc 0)
 * @param value - Giá trị cần kiểm tra
 * @returns true nếu giá trị là null, undefined, hoặc 0
 * @example
 * isNullOrZero(null) // true
 * isNullOrZero(undefined) // true
 * isNullOrZero(0) // true
 * isNullOrZero(5) // false
 * isNullOrZero('') // false
 */
export const isNullOrZero = (value: any): boolean => {
  return value === null || value === undefined || value === 0
}

/**
 * Normalize fullwidth characters to ASCII (normal characters)
 * Converts characters like Ｐｈí to Phí
 * Also normalizes fullwidth space to normal space
 */
export const normalizeText = (text: string): string => {
  if (!text) return text
  return text
    .replace(/[\uff01-\uff5e]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\u3000/g, ' ')
    .trim()
}

export interface SelectOption {
  label: string;
  value: string | boolean;
}
/**
 * 
 * @param enumObject 
 * truyền vào là 1 object có key là string và value là string hoặc boolean
 * @returns 
 */

export const mapEnumToSelectOptions = <
  T extends Record<string, string | boolean>
>(
  enumObject: T
): SelectOption[] => {
  return Object.entries(enumObject).map(([key, value]) => ({
    label: String(value), // đảm bảo label là string
    value: key
  }));
};
