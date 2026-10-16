import dayjs, { type Dayjs } from 'dayjs'
import {
  WalletLimitPaymentMethod,
  WalletLimitScope,
  WalletLimitStatus,
  WalletLimitTransactionType
} from '@type/walletLimit.type'
import type { WalletLimitListFilters } from '../types/walletLimitList.types'

export const WALLET_LIMIT_FILTER_KEYS = [
  'scopeType',
  'targetKeyword',
  'transactionType',
  'status',
  'bankCode',
  'paymentMethod',
  'createdFrom',
  'createdTo'
] as const

export type WalletLimitFilterKey = (typeof WALLET_LIMIT_FILTER_KEYS)[number]
export type WalletLimitUrlFilters = Partial<
  Record<WalletLimitFilterKey, string>
>

/** Ô "Mã định danh" nhận SĐT ví nên không được lên URL. */
export const WALLET_LIMIT_SENSITIVE_KEYS: readonly WalletLimitFilterKey[] = [
  'targetKeyword'
]

const DATE_FORMAT = 'YYYY-MM-DD'
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** Giá trị lạ trên URL (gõ tay, mã cũ) bị bỏ thay vì đẩy xuống API. */
const pickValue = <T extends string>(
  allowed: Record<string, T>,
  raw: string | undefined
): T | undefined => Object.values(allowed).find((value) => value === raw)

const toDate = (raw: string | undefined): Dayjs | undefined => {
  if (!raw || !DATE_PATTERN.test(raw)) return undefined
  const date = dayjs(raw)
  return date.isValid() ? date : undefined
}

export const toWalletLimitFilters = (
  filters: WalletLimitUrlFilters
): WalletLimitListFilters => ({
  scopeType: pickValue(WalletLimitScope, filters.scopeType),
  targetKeyword: filters.targetKeyword ?? '',
  transactionType: pickValue(
    WalletLimitTransactionType,
    filters.transactionType
  ),
  status: pickValue(WalletLimitStatus, filters.status),
  bankCode: filters.bankCode,
  paymentMethod: pickValue(WalletLimitPaymentMethod, filters.paymentMethod),
  createdFrom: toDate(filters.createdFrom),
  createdTo: toDate(filters.createdTo)
})

export const toWalletLimitUrlFilters = (
  filters: WalletLimitListFilters
): WalletLimitUrlFilters => ({
  scopeType: filters.scopeType,
  targetKeyword: filters.targetKeyword.trim(),
  transactionType: filters.transactionType,
  status: filters.status,
  bankCode: filters.bankCode,
  paymentMethod: filters.paymentMethod,
  createdFrom: filters.createdFrom?.format(DATE_FORMAT),
  createdTo: filters.createdTo?.format(DATE_FORMAT)
})
