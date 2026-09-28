import { useState } from 'react'
import type {
  AccessSubMerchant,
  MerchantUser
} from '../types/merchantAccess.types'
import type { PickedSub } from '../components/UserSubMerchantField'
import { isSameIdSet } from '../utils/merchantAccess.utils'

const toInitialSubs = (
  user: MerchantUser | null,
  getSubMerchant: (id: string) => AccessSubMerchant | undefined
): PickedSub[] =>
  (user?.subMerchantIds ?? []).map((id) => {
    const sub = getSubMerchant(id)
    return {
      id,
      code: '',
      name: sub?.name ?? id,
      merchantId: sub?.merchantId ?? user?.merchantIds[0] ?? ''
    }
  })

/**
 * Phạm vi Merchant + Sub-merchant của User. Khi sửa, mọi thay đổi gộp thành
 * một đề xuất để người duyệt thấy trọn phạm vi mới và duyệt một lần.
 */
export const useUserScopeDraft = (
  user: MerchantUser | null,
  getSubMerchant: (id: string) => AccessSubMerchant | undefined
) => {
  const [subs, setSubs] = useState(() => toInitialSubs(user, getSubMerchant))
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState<string>()

  return {
    subs,
    setSubs,
    reason,
    reasonError,
    isChanged: (merchantIds: readonly string[]) =>
      user !== null &&
      (!isSameIdSet(merchantIds, user.merchantIds) ||
        !isSameIdSet(
          subs.map((sub) => sub.id),
          user.subMerchantIds
        )),
    // Sub-merchant không còn thuộc Merchant duy nhất của User thì bị bỏ.
    syncWithMerchants: (merchantIds: readonly string[]) =>
      setSubs((current) =>
        merchantIds.length === 1
          ? current.filter((sub) => sub.merchantId === merchantIds[0])
          : []
      ),
    changeReason: (value: string) => {
      setReason(value)
      setReasonError(undefined)
    },
    requireReason: (): boolean => {
      if (reason.trim()) return true
      setReasonError('Vui lòng nhập lý do thay đổi phạm vi')
      return false
    }
  }
}
