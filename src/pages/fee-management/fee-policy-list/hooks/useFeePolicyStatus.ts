import { useMessage } from '@hooks/useMessage'
import {
  usePatchActivateFeeMutation,
  usePatchDeactivateFeeMutation
} from '@services/apiFeePolicy.api'
import { useState } from 'react'

export interface UseFeePolicyStatusResult {
  /** Chính sách đang chờ nhập lý do kích hoạt. */
  activating: { id: string; name: string } | null
  askActivate: (id: string, name: string) => void
  cancelActivate: () => void
  confirmActivate: (reason: string) => Promise<void>
  deactivate: (id: string) => Promise<void>
  isActivating: boolean
  isDeactivating: boolean
  /** Id đang có lệnh chạy dở, để chỉ khoá đúng dòng đó. */
  busyId: string | null
}

/**
 * Bật và tắt một chính sách phí.
 *
 * Kích hoạt phải kèm lý do vì nó đưa biểu phí vào áp dụng thật — lưu vết ai bật
 * và vì sao là ràng buộc kiểm toán, không phải tuỳ chọn. Tắt thì không cần: nó
 * chỉ dừng áp dụng, không đổi số tiền của giao dịch nào đã tính.
 */
export const useFeePolicyStatus = (): UseFeePolicyStatusResult => {
  const { successMess } = useMessage()
  const [activating, setActivating] = useState<{
    id: string
    name: string
  } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const [activateFee, { isLoading: isActivating }] =
    usePatchActivateFeeMutation()
  const [deactivateFee, { isLoading: isDeactivating }] =
    usePatchDeactivateFeeMutation()

  const confirmActivate = async (reason: string): Promise<void> => {
    if (!activating) return
    setBusyId(activating.id)
    try {
      await activateFee({ id: activating.id, reason }).unwrap()
      successMess('Đã kích hoạt chính sách phí')
      setActivating(null)
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    } finally {
      setBusyId(null)
    }
  }

  const deactivate = async (id: string): Promise<void> => {
    setBusyId(id)
    try {
      await deactivateFee(id).unwrap()
      successMess('Đã ngừng áp dụng chính sách phí')
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    } finally {
      setBusyId(null)
    }
  }

  return {
    activating,
    askActivate: (id, name) => setActivating({ id, name }),
    cancelActivate: () => setActivating(null),
    confirmActivate,
    deactivate,
    isActivating,
    isDeactivating,
    busyId
  }
}
