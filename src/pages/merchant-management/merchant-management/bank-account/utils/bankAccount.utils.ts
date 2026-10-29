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
  /** Ô "dùng TK tên khác tên pháp nhân" (quyết định 22/10), chỉ có nghĩa với TK Master. */
  allowDifferentHolderName: boolean
  status: BankAccountDto['status']
  reason: string
}

export const maskAccountNumber = (accountNumber: string): string =>
  `••••${accountNumber.slice(-4)}`

/** TK thuộc Sub không bị đối chiếu tên pháp nhân nên không dùng ô miễn so tên. */
export const isMasterAccount = (row: BankAccountDto): boolean =>
  !row.subMerchantId

/** Ô miễn so tên trên TK Master có bị bật/tắt so với giá trị đang lưu không. */
const isExemptionChanged = (
  row: BankAccountDto,
  draft: BankAccountDraft
): boolean =>
  isMasterAccount(row) &&
  draft.allowDifferentHolderName !== Boolean(row.holderNameExempt)

export const isDraftValid = (draft: BankAccountDraft): boolean =>
  Boolean(draft.bankCode.trim()) &&
  /^\d{6,20}$/.test(draft.accountNumber) &&
  Boolean(draft.accountName.trim())

/**
 * Đổi ngân hàng, số tài khoản hoặc tên chủ tài khoản là thao tác nhạy cảm cần OTP. Bật/tắt ô
 * "dùng tên khác pháp nhân" cũng vậy vì BE coi đó là nới/siết kiểm soát chống rửa tiền.
 */
export const isIdentityChanged = (
  row: BankAccountDto | null,
  draft: BankAccountDraft
): boolean =>
  !row ||
  draft.bankCode.trim() !== row.bankCode ||
  draft.accountNumber !== row.accountNumber ||
  draft.accountName.trim() !== row.accountName ||
  isExemptionChanged(row, draft)

/** Khóa tài khoản bắt buộc có lý do. */
export const isLockReasonMissing = (
  row: BankAccountDto | null,
  draft: BankAccountDraft
): boolean =>
  row !== null &&
  row.status !== 'INACTIVE' &&
  draft.status === 'INACTIVE' &&
  !draft.reason.trim()

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
    ...(isExemptionChanged(row, draft)
      ? { allowDifferentHolderName: draft.allowDifferentHolderName }
      : {}),
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
  allowDifferentHolderName: Boolean(row?.holderNameExempt),
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
  // Chỉ gửi khi TK Master được tích; không tích thì để BE áp quy tắc mặc định (phải khớp pháp nhân).
  ...(!subMerchantId && draft.allowDifferentHolderName
    ? { allowDifferentHolderName: true }
    : {}),
  otp
})
