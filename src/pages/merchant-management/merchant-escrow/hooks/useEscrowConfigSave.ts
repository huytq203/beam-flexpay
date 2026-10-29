import { useState } from 'react'
import {
  useChallengeEscrowConfigSaveMutation,
  useGetEscrowOverviewQuery,
  usePreviewEscrowConfigMutation,
  useSaveEscrowConfigMutation
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
  EscrowConfigPreview,
  EscrowSaveResult
} from '../types/merchantEscrow.types'
import {
  toEscrowConfigRequest,
  type EscrowConfigFormValues
} from '../utils/escrowConfig.schema'

const OUTCOME_TEXT: Record<EscrowSaveResult['outcome'], string> = {
  APPLIED: 'Đã lưu và áp dụng cấu hình ký quỹ',
  PENDING_APPROVAL: 'Thay đổi làm giảm mức bảo đảm, đã gửi chờ phê duyệt'
}

const STALE = 'MERCHANT_ESCROW_CONFIG_STALE'

/** 409 phiên bản cũ: người khác vừa lưu/duyệt cấu hình sau khi form được mở. */
const isStale = (failure: unknown): boolean => readErrorName(failure) === STALE

/**
 * Luồng lưu cấu hình ký quỹ: xem trước (không OTP) → xin OTP theo Master → `PUT config`.
 * `expectedVersion` luôn đọc từ tổng quan mới nhất ở thời điểm gửi, để sau khi 409 tải lại thì
 * lần lưu kế tiếp so với phiên bản vừa tải chứ không lặp lại phiên bản cũ.
 */
export const useEscrowConfigSave = (
  masterId: string,
  onSaved?: (result: EscrowSaveResult) => void
) => {
  const overview = useGetEscrowOverviewQuery(masterId, { skip: !masterId })
  const [previewConfig, { isLoading: isPreviewing }] =
    usePreviewEscrowConfigMutation()
  const [challengeSave] = useChallengeEscrowConfigSaveMutation()
  const [saveConfig] = useSaveEscrowConfigMutation()
  const { otp, begin } = useCredentialOtp<EscrowSaveResult>()
  const [previewError, setPreviewError] = useState('')

  const expectedVersion = overview.data?.current?.version ?? null

  /** Trả `null` khi BE từ chối nội dung; câu lỗi tiếng Việt nằm ở `previewError`. */
  const preview = async (
    values: EscrowConfigFormValues
  ): Promise<EscrowConfigPreview | null> => {
    setPreviewError('')
    try {
      return await previewConfig({
        masterId,
        body: toEscrowConfigRequest(values, expectedVersion)
      }).unwrap()
    } catch (failure) {
      setPreviewError(
        getApiErrorDetail(failure, 'Không xem trước được thay đổi cấu hình')
      )
      return null
    }
  }

  const save = (values: EscrowConfigFormValues) =>
    begin({
      // BE luôn đòi OTP; nội dung đã được kiểm ở bước xem trước nên không cần precheck.
      precheck: () => Promise.resolve({ otpRequired: true }),
      challenge: () => challengeSave(masterId).unwrap(),
      submit: async (sensitiveOtp) => {
        try {
          return await saveConfig({
            masterId,
            body: {
              ...toEscrowConfigRequest(values, expectedVersion),
              sensitiveOtp
            }
          }).unwrap()
        } catch (failure) {
          // Tải lại tổng quan để lần lưu sau dùng phiên bản mới; form giữ nguyên giá trị đang nhập.
          if (isStale(failure)) void overview.refetch()
          // BE tiêu OTP trước mọi kiểm tra khác: lỗi ngoài bước OTP thì phải xin mã mới.
          throw isOtpStepError(readErrorName(failure))
            ? failure
            : withOtpConsumedNotice(failure)
        }
      },
      onDone: (result) => {
        feedback.success(OUTCOME_TEXT[result.outcome])
        onSaved?.(result)
      }
    })

  return { preview, save, otp, isPreviewing, previewError }
}
