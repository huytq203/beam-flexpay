import { useEffect } from 'react'
import type { UseFormSetValue } from 'react-hook-form'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import { BOTH_BEARERS, SENDER_PAYER } from '../utils/bearerPairs'
import {
  buildPayerSelectOptions,
  dependentPayerFor,
  type PayerOption
} from '../utils/payerSelectOptions'

interface UsePayerSelectOptionsInput {
  payerTypeOptions: readonly PayerOption[]
  canSplit: boolean
  isVat: boolean
  baseComponentType: string | null | undefined
  precedingComponents: readonly FeeComponentFormValues[]
  payerType: string
  setValue: UseFormSetValue<FeeComponentFormValues>
}

/**
 * Ô Người chịu của hộp thoại thành phần phí. "Cả hai bên" chỉ có khi tách được, đổi sang loại phí
 * không tách được thì về người chuyển. VAT khoá theo bên chịu phí gốc và tự chọn sẵn bên đó, để
 * cấu hình "phí người nhận, VAT người chuyển" không lọt tới bước duyệt.
 */
export const usePayerSelectOptions = ({
  payerTypeOptions,
  canSplit,
  isVat,
  baseComponentType,
  precedingComponents,
  payerType,
  setValue
}: UsePayerSelectOptionsInput): PayerOption[] => {
  const basePayer = isVat
    ? dependentPayerFor(baseComponentType, precedingComponents)
    : null
  // Bên của phí gốc có thể không có trong ô chọn (phí hoàn ẩn Người nhận theo loại gốc): khi đó không
  // khoá, để luật lúc lưu báo lỗi thay vì chọn một giá trị không hiện ra.
  const vatPayer = payerTypeOptions.some(({ value }) => value === basePayer)
    ? basePayer
    : null

  useEffect(() => {
    if (payerType === BOTH_BEARERS && !canSplit) {
      setValue('payerType', SENDER_PAYER, { shouldValidate: true })
    } else if (vatPayer && payerType !== vatPayer) {
      setValue('payerType', vatPayer, { shouldValidate: true })
    }
  }, [canSplit, payerType, setValue, vatPayer])

  return buildPayerSelectOptions(payerTypeOptions, canSplit, vatPayer)
}
