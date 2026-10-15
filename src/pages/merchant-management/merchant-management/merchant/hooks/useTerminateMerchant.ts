import { useState } from 'react'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { feedback } from '@components/index'
import { useTerminateMerchantMutation } from '@services/apiMerchant'
import type { ContentMerchant, TerminationResult } from '@type/merchant'
import { useSensitiveOtp } from '../../bank-account/hooks/useSensitiveOtp'
import type { TerminateForm } from '../schemas/terminate.schema'

export const useTerminateMerchant = (merchant: ContentMerchant | null) => {
  const otp = useSensitiveOtp('MERCHANT_TERMINATION')
  const [terminate, state] = useTerminateMerchantMutation()
  const [result, setResult] = useState<TerminationResult | null>(null)

  const requestOtp = async (): Promise<void> => {
    if (merchant) await otp.request(merchant.id)
  }

  const submit = async (form: TerminateForm): Promise<boolean> => {
    const confirmation = otp.toConfirmation()
    if (!merchant || !confirmation) return false
    try {
      setResult(
        await terminate({
          id: merchant.id,
          body: { ...form, otp: confirmation }
        }).unwrap()
      )
      otp.reset()
      return true
    } catch (error) {
      feedback.error(
        getApiErrorDetail(error, 'Không thể chấm dứt hợp tác merchant')
      )
      return false
    }
  }

  return {
    otp,
    requestOtp,
    submit,
    result,
    isSubmitting: state.isLoading,
    clearResult: () => setResult(null)
  }
}
