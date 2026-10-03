import { BankIcon, StorefrontIcon, WalletIcon } from '@components/icons'
import type { ComponentType } from 'react'

export const FeeDomain = {
  BANK: 'BANK',
  EWALLET: 'EWALLET',
  MERCHANT: 'MERCHANT'
} as const

export type FeeDomain = (typeof FeeDomain)[keyof typeof FeeDomain]

export interface FeeDomainEntry {
  readonly value: FeeDomain
  readonly label: string
  readonly Icon: ComponentType<{ size?: number; weight?: 'bold' | 'fill' }>
}

/**
 * Ba miền phí là ba nghiệp vụ khác nhau, không phải ba bộ lọc của cùng một
 * bảng: chọn miền đổi cả danh sách trường được nhập lẫn loại giao dịch hợp lệ.
 */
export const FEE_DOMAIN_ENTRIES: readonly FeeDomainEntry[] = [
  {
    value: FeeDomain.BANK,
    label: 'Phí Bank/NCC',
    Icon: BankIcon
  },
  {
    value: FeeDomain.EWALLET,
    label: 'Phí ví',
    Icon: WalletIcon
  },
  {
    value: FeeDomain.MERCHANT,
    label: 'Phí ĐVCNTT',
    Icon: StorefrontIcon
  }
]

/** Hai miền còn được phép tạo mới và xuất hiện trên danh sách chính sách. */
export const CONFIGURABLE_FEE_DOMAINS: readonly FeeDomain[] = [
  FeeDomain.BANK,
  FeeDomain.EWALLET
]

export const FEE_DOMAIN_LABEL: Readonly<Record<FeeDomain, string>> =
  Object.fromEntries(
    FEE_DOMAIN_ENTRIES.map((entry) => [entry.value, entry.label])
  ) as Record<FeeDomain, string>

export const isFeeDomain = (value: unknown): value is FeeDomain =>
  typeof value === 'string' && value in FEE_DOMAIN_LABEL
