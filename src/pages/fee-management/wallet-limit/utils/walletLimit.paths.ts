import { SCREENS } from '@/app/permissions'

const base = SCREENS.WALLET_LIMIT.path

export const walletLimitPaths = {
  list: base,
  create: `${base}/create`,
  detail: (id: string) => `${base}/${encodeURIComponent(id)}`,
  edit: (id: string) => `${base}/${encodeURIComponent(id)}/edit`,
  history: (id: string) => `${base}/${encodeURIComponent(id)}/history`,
  specialMonths: SCREENS.WALLET_LIMIT_SPECIAL_MONTH.path
} as const

/** Tiêu đề ngắn của một cấu hình, dùng cho breadcrumb và tiêu đề trang. */
export const describePolicyTarget = (
  scopeLabel: string,
  target: string | null,
  transactionLabel: string
): string => [scopeLabel, target, transactionLabel].filter(Boolean).join(' · ')
