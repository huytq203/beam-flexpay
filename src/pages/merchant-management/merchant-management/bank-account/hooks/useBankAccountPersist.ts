import {
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  type BankAccountDto,
  type SensitiveOtpConfirmation
} from '@/app/services/merchantBankAccountApi'
import type { PickedEntity } from '@components/index'
import {
  buildCreateBody,
  buildUpdateBody,
  type BankAccountDraft
} from '../utils/bankAccount.utils'

export interface PersistInput {
  draft: BankAccountDraft
  merchant?: PickedEntity
  subMerchant?: PickedEntity
  isDefault: boolean
  otp?: SensitiveOtpConfirmation
}

/** Gọi API lưu và trả về thông điệp thành công phù hợp với kết quả. */
export const useBankAccountPersist = (row: BankAccountDto | null) => {
  const [create, createState] = useCreateBankAccountMutation()
  const [update, updateState] = useUpdateBankAccountMutation()

  const persist = async (input: PersistInput): Promise<string | null> => {
    if (!row) {
      if (!input.otp) return null
      const scope = {
        merchantId: input.merchant?.id,
        subMerchantId: input.subMerchant?.id,
        isDefault: input.isDefault
      }
      await create(buildCreateBody(input.draft, scope, input.otp)).unwrap()
      return 'Đã thêm tài khoản ngân hàng'
    }
    const body = buildUpdateBody(row, input.draft, input.otp)
    const result = await update({ id: row.id, body }).unwrap()
    return result.applied
      ? 'Đã cập nhật tài khoản ngân hàng'
      : 'Đã gửi yêu cầu thay đổi để chờ duyệt'
  }

  return {
    persist,
    isSaving: createState.isLoading || updateState.isLoading
  }
}
