import { FeeDomain } from '@components/fee/feeDomain'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import {
  DEFAULT_PRIORITY,
  getDomainFieldRules
} from '../constants/feeConfigFields'
import {
  feeConfigFormSchema,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'

export const buildEmptyForm = (
  feeDomain: FeeDomain = FeeDomain.EWALLET
): FeeConfigFormValues => ({
  feeDomain,
  name: '',
  description: '',
  priority: DEFAULT_PRIORITY,
  serviceType: '',
  bankCode: '',
  paymentMethod: '',
  merchantId: '',
  validFrom: '',
  validTo: '',
  components: []
})

export interface UseFeeConfigFormResult {
  form: UseFormReturn<FeeConfigFormValues>
  /** Đổi miền phí và dọn những lựa chọn không còn nghĩa ở miền mới. */
  changeDomain: (next: FeeDomain) => void
}

/**
 * Một form duy nhất cho cả ba phần của màn. Gộp lại vì màn lưu bằng hai lời gọi
 * tuần tự: lời gọi thứ hai không quay lui được, nên mọi thứ phải hợp lệ trước
 * khi lời gọi thứ nhất chạy.
 */
export const useFeeConfigForm = (
  defaultValues: FeeConfigFormValues
): UseFeeConfigFormResult => {
  const form = useForm<FeeConfigFormValues>({
    resolver: zodResolver(feeConfigFormSchema),
    defaultValues,
    mode: 'onTouched'
  })

  const changeDomain = (next: FeeDomain) => {
    const current = form.getValues()
    const rules = getDomainFieldRules(next)
    const keepServiceType = rules.serviceTypes.includes(current.serviceType)

    form.reset({
      ...current,
      feeDomain: next,
      // Loại giao dịch của miền cũ có thể không tồn tại ở miền mới; giữ lại là
      // gửi lên một tổ hợp backend không nhận.
      serviceType: keepServiceType ? current.serviceType : '',
      // ĐVCNTT không hiện ở miền khác, giữ lại là gửi lên một tiêu chí người
      // dùng không còn nhìn thấy để sửa.
      merchantId: rules.showMerchant ? current.merchantId : ''
    })
  }

  return { form, changeDomain }
}
