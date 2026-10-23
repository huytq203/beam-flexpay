import { useState } from 'react'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'
import {
  useApproveMerchantMutation,
  useRejectMerchantMutation,
  useSetMerchantLockedMutation,
  useSubmitMerchantMutation
} from '@services/apiMerchant'
import type {
  MerchantRejectionReason,
  MerchantRejectionReasonCode
} from '@type/merchant'
import {
  MERCHANT_ACTION_LABEL,
  type MerchantDetailAction
} from '../constants/merchantDetail.constants'

export const useMerchantDetailActions = (id: string | undefined) => {
  const [submit] = useSubmitMerchantMutation()
  const [approve] = useApproveMerchantMutation()
  const [reject] = useRejectMerchantMutation()
  const [setLocked] = useSetMerchantLockedMutation()
  const [action, setAction] = useState<MerchantDetailAction | null>(null)
  const [reason, setReason] = useState('')
  const [reasonCode, setReasonCode] = useState<MerchantRejectionReasonCode>()
  const [isWorking, setIsWorking] = useState(false)

  const close = () => {
    setAction(null)
    setReason('')
    setReasonCode(undefined)
  }

  /** Chọn lý do mẫu: điền sẵn ghi chú mặc định của BE, người dùng vẫn sửa được. */
  const pickReason = (picked: MerchantRejectionReason | undefined) => {
    setReasonCode(picked?.code)
    if (picked) setReason(picked.defaultNote)
  }

  const validate = (): boolean => {
    if ((action === 'lock' || action === 'unlock') && !reason.trim()) {
      feedback.warning('Vui lòng nhập lý do')
      return false
    }
    if (action === 'reject' && !reason.trim()) {
      feedback.warning(
        'Vui lòng cung cấp lý do từ chối để Merchant biết cách khắc phục'
      )
      return false
    }
    if (action === 'reject' && reason.trim().length > 500) {
      feedback.warning('Ghi chú chi tiết tối đa 500 ký tự')
      return false
    }
    return true
  }

  const run = async (current: MerchantDetailAction, merchantId: string) => {
    if (current === 'submit') await submit(merchantId).unwrap()
    if (current === 'approve') await approve(merchantId).unwrap()
    if (current === 'reject')
      await reject({
        id: merchantId,
        reasonCode,
        detail: reason.trim()
      }).unwrap()
    if (current === 'lock' || current === 'unlock')
      await setLocked({
        id: merchantId,
        lock: current === 'lock',
        reason: reason.trim()
      }).unwrap()
  }

  const confirm = async () => {
    if (!id || !action || !validate()) return
    const label = MERCHANT_ACTION_LABEL[action]
    setIsWorking(true)
    try {
      await run(action, id)
      feedback.success(`${label} thành công`)
      close()
    } catch (error) {
      feedback.error(
        getApiErrorDetail(
          error,
          `Không thể ${label.toLocaleLowerCase('vi-VN')}`
        )
      )
    } finally {
      setIsWorking(false)
    }
  }

  return {
    action,
    open: setAction,
    close,
    reason,
    setReason,
    reasonCode,
    pickReason,
    isWorking,
    confirm
  }
}

export type MerchantDetailActions = ReturnType<typeof useMerchantDetailActions>
