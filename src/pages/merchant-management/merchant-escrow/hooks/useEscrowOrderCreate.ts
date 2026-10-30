import { useState } from 'react'
import {
  useChallengeEscrowOrderCreateMutation,
  useCreateEscrowOrderMutation,
  usePreviewEscrowOrderMutation
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'
import { useCredentialOtp } from '../../merchant-gateway/key-connection/hooks/useCredentialOtp'
import { isOtpStepError } from '../../merchant-gateway/key-connection/utils/credential.utils'
import {
  readErrorName,
  withOtpConsumedNotice
} from '../../merchant-reconciliation/utils/reconciliation.utils'
import type {
  EscrowOrder,
  EscrowOrderImpact
} from '../types/merchantEscrow.types'
import {
  toEscrowOrderCreate,
  type EscrowOrderFormValues
} from '../utils/escrowOrder.schema'

/**
 * Luồng gửi lệnh nạp ký quỹ (SRS 3.6.27 STT 13–14): xem trước (không OTP, BE chạy đúng các kiểm tra
 * của lần gửi thật và trả bảng tác động) → xin OTP theo Master (QT-07) → `POST /merchant-escrow-orders`.
 * Cùng khuôn với `useEscrowConfigSave` để hành vi OTP của module thống nhất.
 */
export const useEscrowOrderCreate = (
  masterId: string,
  onCreated?: (order: EscrowOrder) => void
) => {
  const [previewOrder, { isLoading: isPreviewing }] =
    usePreviewEscrowOrderMutation()
  const [challengeCreate] = useChallengeEscrowOrderCreateMutation()
  const [createOrder] = useCreateEscrowOrderMutation()
  const { otp, begin } = useCredentialOtp<EscrowOrder>()
  const [previewError, setPreviewError] = useState('')

  /**
   * Trả `null` khi BE từ chối; câu tiếng Việt của BE (vd. trùng mã tham chiếu kèm mã lệnh cũ, số tiền
   * trích vượt số dư khả dụng của Sub kèm số dư thực tế) nằm ở `previewError` và hiện nguyên văn.
   */
  const preview = async (
    values: EscrowOrderFormValues
  ): Promise<EscrowOrderImpact | null> => {
    setPreviewError('')
    try {
      return await previewOrder(toEscrowOrderCreate(values, masterId)).unwrap()
    } catch (failure) {
      setPreviewError(
        getApiErrorDetail(failure, 'Không xem trước được lệnh nạp ký quỹ')
      )
      return null
    }
  }

  const submit = (values: EscrowOrderFormValues) =>
    begin({
      // BE luôn đòi OTP; nội dung đã qua bước xem trước nên không cần gửi thử.
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challengeCreate(masterId).unwrap(),
      submit: async (sensitiveOtp) => {
        try {
          return await createOrder({
            ...toEscrowOrderCreate(values, masterId),
            sensitiveOtp
          }).unwrap()
        } catch (failure) {
          // BE tiêu OTP trước các kiểm tra còn lại (vd. Sub vừa bị rút bớt số dư, mã tham chiếu vừa bị
          // lệnh khác dùng — bước 4 workflow): lỗi ngoài bước OTP thì lần sau phải xin mã mới.
          throw isOtpStepError(readErrorName(failure))
            ? failure
            : withOtpConsumedNotice(failure)
        }
      },
      onDone: (order) => {
        feedback.success('Đã gửi lệnh nạp ký quỹ chờ phê duyệt')
        onCreated?.(order)
      }
    })

  return { preview, submit, otp, isPreviewing, previewError }
}
