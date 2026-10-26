import {
  useChallengeConfirmHandledOtpMutation,
  useConfirmReconciliationHandledMutation
} from '@/app/services/merchantReconciliationApi'
import { feedback } from '@components/index'
import { useCredentialOtp } from '../../merchant-gateway/key-connection/hooks/useCredentialOtp'
import type { ReconciliationResult } from '../types/reconciliation.types'
import { isOtpStepError } from '../../merchant-gateway/key-connection/utils/credential.utils'
import {
  readErrorName,
  withOtpConsumedNotice
} from '../utils/reconciliation.utils'

const SUCCESS_TEXT = 'Đã xác nhận xử lý và gỡ tạm dừng quyết toán'

/**
 * Luồng OTP của "Xác nhận đã xử lý": xin mã theo đúng Sub rồi gửi cause/treatment kèm mã.
 * BE tiêu mã trước các kiểm tra còn lại nên lỗi ngoài bước OTP kèm lời nhắc xin mã mới.
 */
export const useConfirmHandled = (onDone: () => void) => {
  const [challengeOtp] = useChallengeConfirmHandledOtpMutation()
  const [confirmHandled] = useConfirmReconciliationHandledMutation()
  const { otp, begin } = useCredentialOtp<ReconciliationResult>()

  const start = (subId: string, cause: string, treatment: string) =>
    begin({
      // BE luôn đòi OTP và không kiểm tra pause khi phát mã; FE chỉ cho mở với Sub đang pause.
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challengeOtp(subId).unwrap(),
      submit: async (sensitiveOtp) => {
        try {
          return await confirmHandled({
            subId,
            body: {
              cause: cause.trim(),
              treatment: treatment.trim(),
              sensitiveOtp
            }
          }).unwrap()
        } catch (failure) {
          throw isOtpStepError(readErrorName(failure))
            ? failure
            : withOtpConsumedNotice(failure)
        }
      },
      onDone: () => {
        feedback.success(SUCCESS_TEXT)
        onDone()
      }
    })

  return { otp, start }
}
