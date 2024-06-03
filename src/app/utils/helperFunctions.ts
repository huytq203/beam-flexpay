import { accountingTransactionType, serviceTypes } from '@constants/options'
import { notificationService } from '@type/notification'
import { APPLICABLE_OBJECTS, history_type } from '@type/policyManagement'
import { TransactionStatus, TransactionType } from '@type/transfer'
import { notification } from 'antd'
import dayjs from 'dayjs'
import { t } from 'i18next'
import i18n from '../languages/i18n'

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
    case 'LINKED':
      return 'geekblue'
    case 'NOT_VERIFIED':
      return ''
    case 'waitingForRefund':
      return 'processing'
    case 'VERIFIED':
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

export const blockLetterDecimalAndDot =
   (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    case 'PERSONAL_ACCOUNT':
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
    case 'DEPOSIT':
      return i18n.t('policy-management.limitAndRegulations.recharge')
    case 'WITHDRAWAL':
      return i18n.t('policy-management.limitAndRegulations.withDraw')
    case 'WITHDRAW':
      return i18n.t('policy-management.limitAndRegulations.withDraw')
    case 'TRANSFER':
      return i18n.t('policy-management.limitAndRegulations.transferMoney')
    case 'PAYMENT':
      return i18n.t('policy-management.limitAndRegulations.payment')
    case 'TOTAL_LIMIT':
      return i18n.t(
        'policy-management.limitAndRegulations.totalLimitTransaction'
      )
    default:
      return '-'
  }
}

export const formatLimitValueType = (value: string) => {
  switch (value) {
    case 'VALUE':
      return i18n.t('policy-management.limitAndRegulations.value')
    case 'TIMES':
      return i18n.t('policy-management.limitAndRegulations.count')
    default:
      return '-'
  }
}

export const formatLimitTimeType = (value: string) => {
  switch (value) {
    case 'TIMES':
      return i18n.t('policy-management.limitAndRegulations.times')
    case 'DAY':
      return i18n.t('policy-management.limitAndRegulations.day')
    case 'WEEK':
      return i18n.t('policy-management.limitAndRegulations.week')
    case 'MONTH':
      return i18n.t('policy-management.limitAndRegulations.month')
    case 'YEAR':
      return i18n.t('policy-management.limitAndRegulations.year')
    default:
      return '-'
  }
}

export const formatLimitType = (value: string) => {
  switch (value) {
    case 'LIMIT_MIN':
      return i18n.t('policy-management.limitAndRegulations.minLimit')
    case 'LIMIT_MAX':
      return i18n.t('policy-management.limitAndRegulations.maxLimit')
    default:
      return '-'
  }
}

export const formatHisoryData = (value: string | number) => {
  if (!isNaN(Number(value))) {
    if (value) {
      return convertNumber(value)
    } else return '-'
  } else {
    switch (value) {
      case 'DEPOSIT':
        return i18n.t('policy-management.limitAndRegulations.recharge')
      case 'WITHDRAWAL':
        return i18n.t('policy-management.limitAndRegulations.withDraw')
      case 'WITHDRAW':
        return i18n.t('policy-management.limitAndRegulations.withDraw')
      case 'TRANSFER':
        return i18n.t('policy-management.limitAndRegulations.transferMoney')
      case 'PAYMENT':
        return i18n.t('policy-management.limitAndRegulations.payment')
      case 'TOTAL_LIMIT':
        return i18n.t(
          'policy-management.limitAndRegulations.totalLimitTransaction'
        )
      case 'VALUE':
        return i18n.t('policy-management.limitAndRegulations.value')
      case 'TIMES':
        return i18n.t('policy-management.limitAndRegulations.count')
      case 'LIMIT_MIN':
        return i18n.t('policy-management.limitAndRegulations.minLimit')
      case 'LIMIT_MAX':
        return i18n.t('policy-management.limitAndRegulations.maxLimit')
      case 'DAY':
        return i18n.t('policy-management.limitAndRegulations.day')
      case 'WEEK':
        return i18n.t('policy-management.limitAndRegulations.week')
      case 'MONTH':
        return i18n.t('policy-management.limitAndRegulations.month')
      case 'YEAR':
        return i18n.t('policy-management.limitAndRegulations.year')
      default:
        return '-'
    }
  }
}

export const convertNumber = (amount: string | number,suffix?: string | undefined) => {
  if (!amount && amount !== 0) {
    return '-'
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (suffix ?? '')
}

export const getStatusText = (status?: boolean) => {
  if (status) return i18n.t('labels.active')
  else return i18n.t('labels.lock')
}

export const getStatusAccountText = (status: string | null | undefined) => {
  switch (status) {
    case 'LINKED':
      return i18n.t('labels.linked')
    case 'NOT_VERIFIED':
      return i18n.t('labels.notVerified')
    case 'VERIFIED':
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

export const getNotificationService = (service: notificationService) => {
  const services = serviceTypes.concat([
    {
      value: notificationService.OTHER,
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
    (item: { value: string; label: string }) => item.value === transaction
  )

  if (filters) return filters.label

  return '-'
}