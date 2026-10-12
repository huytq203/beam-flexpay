import type { UseFormSetError } from 'react-hook-form'

import { businessWalletDraftSchema } from '../schemas/business-wallet-draft.schema'
import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'

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
