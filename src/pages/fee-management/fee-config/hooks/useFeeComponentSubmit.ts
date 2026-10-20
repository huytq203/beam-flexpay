import type { UseFormReturn } from 'react-hook-form'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import {
  BOTH_BEARERS,
  BOTH_BEARERS_DUPLICATE_MESSAGE,
  RECEIVER_PAYER,
  SENDER_PAYER
} from '../utils/bearerPairs'
import { withZeroRates } from '../utils/feeComponentDefaults'

interface UseFeeComponentSubmitInput {
  form: UseFormReturn<FeeComponentFormValues>
  receiverForm: UseFormReturn<FeeComponentFormValues>
  initialValue: FeeComponentFormValues | null
  initialPartner: FeeComponentFormValues | null
  existingComponents: readonly FeeComponentFormValues[]
  onSave: (values: FeeComponentFormValues[]) => void
}

/**
 * Cả hai bên cùng chịu lưu thành hai thành phần cùng loại phí, như backend vẫn nhận. Trùng tổ
 * hợp định danh phải tự kiểm ở đây: resolver chỉ thấy giá trị tạm BOTH, không trùng với gì.
 */
export const useFeeComponentSubmit = ({
  form,
  receiverForm,
  initialValue,
  initialPartner,
  existingComponents,
  onSave
}: UseFeeComponentSubmitInput): (() => Promise<void>) =>
  form.handleSubmit(async (value) => {
    if (value.payerType !== BOTH_BEARERS) {
      onSave([withZeroRates(value)])
      return
    }
    const ownKeys = new Set(
      [initialValue?.key, initialPartner?.key].filter(Boolean)
    )
    const clashes = [SENDER_PAYER, RECEIVER_PAYER].some((payer) =>
      existingComponents.some(
        (existing) =>
          !ownKeys.has(existing.key) &&
          existing.componentType === value.componentType &&
          existing.payerType === payer &&
          existing.beneficiaryType === value.beneficiaryType
      )
    )
    if (clashes) {
      // Câu riêng: câu trùng chung bị hiệu ứng kiểm lại ba ô xoá ngay vì giá trị tạm BOTH không trùng.
      form.setError('componentType', {
        type: 'custom',
        message: BOTH_BEARERS_DUPLICATE_MESSAGE
      })
      return
    }
    const shared = {
      feeScope: value.feeScope,
      componentType: value.componentType,
      baseOn: value.baseOn,
      baseComponentType: value.baseComponentType,
      calculationMethod: value.calculationMethod,
      beneficiaryType: value.beneficiaryType,
      roundMode: value.roundMode,
      payerType: RECEIVER_PAYER
    }
    Object.entries(shared).forEach(([field, next]) =>
      receiverForm.setValue(field as keyof typeof shared, next as never)
    )
    if (!(await receiverForm.trigger())) return
    onSave([
      withZeroRates({ ...value, payerType: SENDER_PAYER }),
      withZeroRates({ ...receiverForm.getValues(), ...shared })
    ])
  })
