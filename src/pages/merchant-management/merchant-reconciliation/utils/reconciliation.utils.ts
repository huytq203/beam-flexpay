import type { Dayjs } from 'dayjs'
import { formatVnd } from '../../merchant-settlement/utils/money'
import {
  FIRST_COUNT_EQUATION_NO,
  MIN_NOTE_LENGTH,
  OTP_CONSUMED_NOTICE
} from '../constants/reconciliation.constants'
import type {
  ReconciliationEquation,
  ReconciliationResult
} from '../types/reconciliation.types'

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Đọc tên mã lỗi (`message`) của BE; rẽ nhánh theo đây, không theo `status`. */
export const readErrorName = (error: unknown): string => {
  if (!isRecord(error) || !isRecord(error.data)) return ''
  const { message } = error.data
  return typeof message === 'string' ? message : ''
}

/** `run` trả 200 + UNAVAILABLE, `balance-report` trả 503: cùng là "chưa đọc được sổ cái". */
export const isLedgerUnavailable = (error: unknown): boolean =>
  (isRecord(error) && error.status === 503) ||
  readErrorName(error) === 'MERCHANT_ESCROW_BALANCE_UNAVAILABLE'

export const isUnavailableResult = (
  result?: Pick<ReconciliationResult, 'result'> | null
): boolean => result?.result === 'UNAVAILABLE'

export const isNoteValid = (value: string): boolean =>
  value.trim().length >= MIN_NOTE_LENGTH

export const toBusinessDate = (value?: Dayjs | null): string | undefined =>
  value ? value.format('YYYY-MM-DD') : undefined

export const isCountEquation = (equation: Pick<ReconciliationEquation, 'no'>) =>
  equation.no >= FIRST_COUNT_EQUATION_NO

/** 1-6 là đồng; 7-9 là số vi phạm nên không gắn đơn vị tiền. */
export const formatEquationValue = (
  equation: Pick<ReconciliationEquation, 'no'>,
  value: number
): string =>
  isCountEquation(equation) ? String(value) : `${formatVnd(value)} đ`

export const formatSignedDifference = (
  equation: Pick<ReconciliationEquation, 'no'>,
  value: number
): string => {
  if (value === 0) return formatEquationValue(equation, 0)
  return `${value > 0 ? '+' : '-'}${formatEquationValue(equation, Math.abs(value))}`
}

/**
 * `confirm-handled` tiêu OTP trước khi chạy các kiểm tra còn lại, nên mọi lỗi không
 * thuộc bước OTP đều kèm lời nhắc xin mã mới. Giữ nguyên `message` để hook OTP phân loại.
 */
export const withOtpConsumedNotice = (failure: unknown): unknown => {
  if (!isRecord(failure) || !isRecord(failure.data)) return failure
  const { detail } = failure.data
  const text = typeof detail === 'string' ? detail.trim() : ''
  return {
    ...failure,
    data: {
      ...failure.data,
      detail: text ? `${text} ${OTP_CONSUMED_NOTICE}` : OTP_CONSUMED_NOTICE
    }
  }
}
