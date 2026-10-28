import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type UseFormReturn } from 'react-hook-form'
import type { FeeScope } from '../constants/feeConfigFields'
import {
  createFeeComponentFormSchema,
  feeComponentFormSchema,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { RECEIVER_PAYER } from '../utils/bearerPairs'
import { deferLastTierCheck } from '../utils/deferLastTierCheck'
import { emptyComponent } from '../utils/feeComponentDefaults'

interface UseFeeComponentFormsInput {
  existingComponents: readonly FeeComponentFormValues[]
  initialValue: FeeComponentFormValues | null
  initialPartner: FeeComponentFormValues | null
  defaultValues: FeeComponentFormValues
  feeScope: FeeScope
  defaultBeneficiaryType: string
}

interface FeeComponentForms {
  form: UseFormReturn<FeeComponentFormValues>
  receiverForm: UseFormReturn<FeeComponentFormValues>
}

/**
 * Thêm / xoá bậc làm đổi Từ của bậc sau và vị trí bậc cuối, nhưng RHF không kiểm lại lỗi đã gắn vào các
 * ô cũ. Khi bảng bậc đang có lỗi, kiểm lại cả bảng để không giữ lỗi đã hết đúng.
 */
const useRefreshTierErrors = ({
  control,
  getFieldState,
  trigger
}: UseFormReturn<FeeComponentFormValues>): void => {
  const tierCount = useWatch({ control, name: 'tiers' }).length
  useEffect(() => {
    if (getFieldState('tiers').error) void trigger('tiers')
  }, [getFieldState, tierCount, trigger])
}

/** Form của thành phần phí, kèm form mức phí người nhận khi cả hai bên cùng chịu. */
export const useFeeComponentForms = ({
  existingComponents,
  initialValue,
  initialPartner,
  defaultValues,
  feeScope,
  defaultBeneficiaryType
}: UseFeeComponentFormsInput): FeeComponentForms => {
  const componentSchema = useMemo(
    () => createFeeComponentFormSchema(existingComponents, initialValue?.key),
    [existingComponents, initialValue?.key]
  )

  const form = useForm<FeeComponentFormValues>({
    resolver: deferLastTierCheck(zodResolver(componentSchema)),
    defaultValues,
    mode: 'onTouched'
  })

  /**
   * Mức phí người nhận khi cả hai bên cùng chịu. Phần dùng chung (loại phí, cách tính, người hưởng)
   * lấy từ form chính lúc lưu, nên form này chỉ giữ mức phí và giới hạn.
   */
  const receiverDefaults = useMemo(
    () =>
      initialPartner ??
      emptyComponent(feeScope, RECEIVER_PAYER, defaultBeneficiaryType),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ dựng một lần cho mỗi lần mở
    []
  )
  const receiverForm = useForm<FeeComponentFormValues>({
    resolver: deferLastTierCheck(zodResolver(feeComponentFormSchema)),
    defaultValues: receiverDefaults,
    mode: 'onTouched'
  })

  useRefreshTierErrors(form)
  useRefreshTierErrors(receiverForm)

  return { form, receiverForm }
}
