import type {
  BankAccountCreate,
  BankAccountDto,
  BankAccountUpdate,
  SensitiveOtpConfirmation
} from '@/app/services/merchantBankAccountApi'

export interface BankAccountDraft {
  bankCode: string
  accountNumber: string
  accountName: string
  branchName: string
  status: BankAccountDto['status']
  reason: string
}

export const maskAccountNumber = (accountNumber: string): string =>
  `••••${accountNumber.slice(-4)}`

export const isDraftValid = (draft: BankAccountDraft): boolean =>
  Boolean(draft.bankCode.trim()) &&
  /^\d{6,20}$/.test(draft.accountNumber) &&
  Boolean(draft.accountName.trim())

/** Đổi ngân hàng, số tài khoản hoặc tên chủ tài khoản là thao tác nhạy cảm cần OTP. */
export const isIdentityChanged = (
  row: BankAccountDto | null,
  draft: BankAccountDraft
): boolean =>
  !row ||
  draft.bankCode.trim() !== row.bankCode ||
  draft.accountNumber !== row.accountNumber ||
  draft.accountName.trim() !== row.accountName

/** BE từ chối khóa tài khoản nếu lý do dưới 10 ký tự (mã 5730). */
export const isLockReasonMissing = (
  row: BankAccountDto | null,
  draft: BankAccountDraft
): boolean =>
  row !== null &&
  row.status !== 'INACTIVE' &&
  draft.status === 'INACTIVE' &&
  draft.reason.trim().length < 10

// Chỉ gửi field thực sự đổi để BE xác định đúng loại thay đổi cần duyệt.
export const buildUpdateBody = (
  row: BankAccountDto,
  draft: BankAccountDraft,
  otp?: SensitiveOtpConfirmation
): BankAccountUpdate => {
  const bankCode = draft.bankCode.trim()
  const accountName = draft.accountName.trim()
  const branchName = draft.branchName.trim()
  return {
    version: row.version,
    ...(bankCode !== row.bankCode ? { bankCode } : {}),
    ...(draft.accountNumber !== row.accountNumber
      ? { accountNumber: draft.accountNumber }
      : {}),
    ...(accountName !== row.accountName ? { accountName } : {}),
    ...(branchName !== (row.branchName ?? '') ? { branchName } : {}),
    ...(draft.status !== row.status ? { status: draft.status } : {}),
    reason: draft.reason.trim() || undefined,
    otp
  }
}

export const toDraft = (row: BankAccountDto | null): BankAccountDraft => ({
  bankCode: row?.bankCode ?? '',
  accountNumber: row?.accountNumber ?? '',
  accountName: row?.accountName ?? '',
  branchName: row?.branchName ?? '',
  status: row?.status ?? 'ACTIVE',
  reason: ''
})

interface CreateScope {
  merchantId?: string
  subMerchantId?: string
  isDefault: boolean
}

// Có Sub-merchant thì tài khoản thuộc Sub; không thì áp cho Master.
export const buildCreateBody = (
  draft: BankAccountDraft,
  { merchantId, subMerchantId, isDefault }: CreateScope,
  otp: SensitiveOtpConfirmation
): BankAccountCreate => ({
  ...(subMerchantId ? { subMerchantId } : { merchantId }),
  bankCode: draft.bankCode.trim(),
  accountNumber: draft.accountNumber,
  accountName: draft.accountName.trim().toUpperCase(),
  branchName: draft.branchName.trim() || undefined,
  isDefault,
  otp
})
