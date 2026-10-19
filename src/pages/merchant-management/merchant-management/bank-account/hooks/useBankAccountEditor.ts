import { useState } from 'react'
import type {
  BankAccountDto,
  SensitiveOtpConfirmation
} from '@/app/services/merchantBankAccountApi'
import { feedback, type PickedEntity } from '@components/index'
import {
  isDraftValid,
  isIdentityChanged,
  isLockReasonMissing,
  toDraft,
  type BankAccountDraft
} from '../utils/bankAccount.utils'
import { useBankAccountPersist } from './useBankAccountPersist'
import { useSensitiveOtp } from './useSensitiveOtp'

/** `row = null` là tạo mới. Hook được mount theo dialog nên state luôn bắt đầu sạch. */
export const useBankAccountEditor = (
  row: BankAccountDto | null,
  initialMerchant: PickedEntity | undefined,
  onDone: () => void
) => {
  const [draft, setDraft] = useState<BankAccountDraft>(() => toDraft(row))
  const [merchant, setMerchant] = useState(initialMerchant)
  const [subMerchant, setSubMerchant] = useState<PickedEntity>()
  const [isDefault, setIsDefault] = useState(false)
  const otp = useSensitiveOtp()
  const { persist, isSaving } = useBankAccountPersist(row)

  const save = async (confirmation?: SensitiveOtpConfirmation) => {
    if (!isDraftValid(draft)) {
      feedback.warning(
        'Vui lòng kiểm tra ngân hàng, số tài khoản và tên chủ tài khoản'
      )
      return
    }
    if (isLockReasonMissing(row, draft)) {
      feedback.warning('Khóa tài khoản cần nhập lý do')
      return
    }
    if (!row && !merchant) {
      feedback.warning('Vui lòng chọn Merchant')
      return
    }
    if (isIdentityChanged(row, draft) && !confirmation) {
      await otp.request(row?.id)
      return
    }
    try {
      const input = { draft, merchant, subMerchant, isDefault }
      const message = await persist({ ...input, otp: confirmation })
      if (message) feedback.success(message)
      otp.reset()
      onDone()
    } catch {
      feedback.error('Không thể lưu tài khoản ngân hàng')
    }
  }

  return {
    draft,
    merchant,
    subMerchant,
    isDefault,
    otp,
    isSaving,
    patch: (value: Partial<BankAccountDraft>) =>
      setDraft((current) => ({ ...current, ...value })),
    setMerchant,
    setSubMerchant,
    setIsDefault,
    save
  }
}
