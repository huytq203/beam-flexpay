import type { UseFormSetError } from 'react-hook-form'

import type { EnterpriseWalletDto } from '@services/merchantEnterpriseWalletApi'

import { businessWalletDraftSchema } from '../schemas/business-wallet-draft.schema'
import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'

/** Đổi số OTP là thao tác nhạy cảm: BE yêu cầu mật khẩu quản trị. */
export const isOtpPhoneChanged = (
  values: BusinessWalletFormValues,
  detail: EnterpriseWalletDto | undefined
): boolean =>
  Boolean(detail && values.otpPhone.trim() !== (detail.otpPhone ?? ''))

/** Trả về false (kèm lỗi gắn vào field) khi dữ liệu không đủ điều kiện lưu nháp. */
export const validateDraft = (
  values: BusinessWalletFormValues,
  setError: UseFormSetError<BusinessWalletFormValues>
): boolean => {
  const result = businessWalletDraftSchema.safeParse(values)
  if (result.success) return true
  result.error.issues.forEach((issue) =>
    setError(issue.path[0] as keyof BusinessWalletFormValues, {
      message: issue.message
    })
  )
  return false
}
