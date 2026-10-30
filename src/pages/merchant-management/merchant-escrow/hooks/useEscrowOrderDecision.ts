import { useState } from 'react'
import {
  useApproveEscrowOrderMutation,
  useChallengeEscrowOrderDecisionMutation,
  useRejectEscrowOrderMutation,
  useReturnEscrowOrderMutation
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'
import { useCredentialOtp } from '../../merchant-gateway/key-connection/hooks/useCredentialOtp'
import { isOtpStepError } from '../../merchant-gateway/key-connection/utils/credential.utils'
import {
  readErrorName,
  withOtpConsumedNotice
} from '../../merchant-reconciliation/utils/reconciliation.utils'
import type { EscrowOrder } from '../types/merchantEscrow.types'

/**
 * Ba quyết định của người phê duyệt với một lệnh nạp (SRS 3.6.29 STT 17–19, FR-MER-0629-05).
 * Duyệt và Từ chối xác thực lại bằng OTP theo QT-07 (NFR-MER-0629-01), mã gắn với đúng lệnh và
 * đúng quyết định (`reject=true/false`); Trả lại để bổ sung không cần OTP. Mọi mutation đã làm mới tag
 * ký quỹ kể cả khi lỗi, nên hàng chờ và drawer tự tải lại sau 409 "người khác đã xử lý" (NFR-0629-02).
 */
export const useEscrowOrderDecision = (orderId: string, onDone?: () => void) => {
  const [challenge] = useChallengeEscrowOrderDecisionMutation()
  const [approve] = useApproveEscrowOrderMutation()
  const [reject] = useRejectEscrowOrderMutation()
  const [returnOrder, { isLoading: isReturning }] =
    useReturnEscrowOrderMutation()
  const { otp, begin } = useCredentialOtp<EscrowOrder>()
  const [returnError, setReturnError] = useState('')

  // BE kiểm OTP ở controller trước mọi điều kiện nghiệp vụ: lỗi ngoài bước OTP nghĩa là mã đã bị
  // tiêu, lần sau phải xin mã mới — nối thêm lời nhắc vào câu lỗi của BE.
  const rethrow = (failure: unknown): never => {
    throw isOtpStepError(readErrorName(failure))
      ? failure
      : withOtpConsumedNotice(failure)
  }

  const decide = (rejecting: boolean, reason: string, success: string) =>
    begin({
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challenge({ id: orderId, reject: rejecting }).unwrap(),
      submit: async (sensitiveOtp) => {
        const body = { reason: reason.trim() || undefined, sensitiveOtp }
        try {
          return rejecting
            ? await reject({ id: orderId, body }).unwrap()
            : await approve({ id: orderId, body }).unwrap()
        } catch (failure) {
          return rethrow(failure)
        }
      },
      onDone: () => {
        feedback.success(success)
        onDone?.()
      }
    })

  /** Ghi chú duyệt tùy chọn; BE lưu vào lý do quyết định. Ghi sổ chạy nền nên lệnh qua APPROVING trước. */
  const approveOrder = (note: string) =>
    decide(false, note, 'Đã duyệt, đang ghi sổ ký quỹ')

  /** Lý do bắt buộc (đã kiểm ở dialog), không đặt độ dài tối thiểu theo quyết định 27/10. */
  const rejectOrder = (reason: string) =>
    decide(true, reason, 'Đã từ chối lệnh nạp ký quỹ')

  /** Trả về `true` khi BE nhận; câu lỗi BE nằm ở `returnError`. */
  const returnForEdit = async (reason: string): Promise<boolean> => {
    setReturnError('')
    try {
      await returnOrder({ id: orderId, reason: reason.trim() }).unwrap()
      feedback.success('Đã trả lại lệnh để người lập bổ sung')
      onDone?.()
      return true
    } catch (failure) {
      setReturnError(getApiErrorDetail(failure, 'Không trả lại được lệnh'))
      return false
    }
  }

  return {
    otp,
    approveOrder,
    rejectOrder,
    returnForEdit,
    isReturning,
    returnError
  }
}
