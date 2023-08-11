import { DefaultOptionType } from 'antd/es/select'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { t } from 'i18next'

dayjs.extend(relativeTime)

export type PARTNER_TYPE = 'DISBURSE' | 'REPAYMENT'

export const PARTNER_TYPE_OPTIONS = [
  {
    label: t('REPAYMENT'),
    value: 'REPAYMENT'
  },
  {
    label: t('DISBURSE'),
    value: 'DISBURSE'
  }
]

export enum transactionStatus {
  'SUCCESS' = 'SUCCESS',
  'APPROVED' = 'APPROVED',
  'PENDING' = 'PENDING',
  'FAILED' = 'FAILED',
  'ERROR' = 'ERROR',
  'REFUND_SUCCESS' = 'REFUND_SUCCESS'
}

export const TRANSACTION_STATUS_OPTIONS = (): DefaultOptionType[] => {
  return Object.values(transactionStatus).map((val) => ({
    value: val,
    label: t(`partner-repayment-list.${val.toLowerCase()}`)
  }))
}

function range(min: number, max: number) {
  var len = max - min + 1
  var arr = new Array(len)
  for (var i = 0; i < len; i++) {
    arr[i] = min + i
  }
  return arr
}

export const DisburseTransactionPeriodOption = (): DefaultOptionType[] => {
  const start = 2020
  const end = dayjs().year()
  const years = range(start, end)
  const months = range(1, 12)

  let options: DefaultOptionType[] = []
  years.forEach((y) => {
    months.forEach((m) => {
      options.push({
        label: m + '/' + y,
        value: m + '/' + y
      })
    })
  })
  return options
}
