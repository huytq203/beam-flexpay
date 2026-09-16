import { zodResolver } from '@hookform/resolvers/zod'
import { useIdempotencyKey } from '@hooks/useIdempotencyKey'
import { useMessage } from '@hooks/useMessage'
import { usePostUnfreezeMutation } from '@services/apiFreezes'
import { usePostUnfreezeTransactionMutation } from '@services/apiWalletAccount.api'
import type { FreezeItem } from '@type/freeze.type'
import { getReleasableAmount } from '@utils/freeze'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch, type Control } from 'react-hook-form'
import {
  buildUnfreezeRequestSchema,
  toVnd,
  UnfreezeAmountMode,
  type UnfreezeRequestFormValues
} from './unfreeze-request.schema'

export interface UseUnfreezeRequestFormResult {
  control: Control<UnfreezeRequestFormValues>
  unfreezeType: UnfreezeAmountMode
  remaining: number
  shortfall: number
  /** Trần tuyệt đối của bản ghi (remainingAmount + shortfallAmount). */
  maxAmount: number
  isLoading: boolean
  submit: () => void
}

/** Chọn endpoint mở băng theo việc bản ghi có gắn giao dịch gốc hay không. */
export const useUnfreezeRequestForm = (
  item: FreezeItem,
  onSuccess?: () => void
): UseUnfreezeRequestFormResult => {
  const { successMess } = useMessage()
  const remaining = item.remainingAmount ?? item.amount
  const maxAmount = getReleasableAmount(item)

  const schema = useMemo(
    () => buildUnfreezeRequestSchema(maxAmount),
    [maxAmount]
  )
  const { control, handleSubmit, reset, setValue } =
    useForm<UnfreezeRequestFormValues>({
      defaultValues: {
        unfreezeType: UnfreezeAmountMode.FULL,
        amount: maxAmount,
        reason: ''
      },
      resolver: zodResolver(schema)
    })
  const unfreezeType = useWatch({ control, name: 'unfreezeType' })

  // "Toàn bộ" khoá số tiền theo maxAmount (toàn bộ phần đang bị giữ + thiếu);
  // chuyển sang "một phần" thì xoá trắng để admin buộc phải tự gõ.
  useEffect(() => {
    setValue(
      'amount',
      unfreezeType === UnfreezeAmountMode.FULL ? maxAmount : 0,
      { shouldValidate: false }
    )
  }, [maxAmount, setValue, unfreezeType])

  const [postUnfreeze, { isLoading: isUnfreezing }] = usePostUnfreezeMutation()
  const [postUnfreezeTransaction, { isLoading: isUnfreezingTransaction }] =
    usePostUnfreezeTransactionMutation()
  const idempotency = useIdempotencyKey()

  const onSubmit = async (values: UnfreezeRequestFormValues): Promise<void> => {
    const body = {
      accountId: item.accountId,
      freezeId: item.id,
      amount: values.amount,
      reason: values.reason
    }

    try {
      if (item.sourceTransactionId && item.sourceTransactionCode) {
        await postUnfreezeTransaction({
          ...body,
          sourceTransactionId: item.sourceTransactionId,
          idempotencyKey: idempotency.take()
        }).unwrap()
      } else {
        await postUnfreeze({
          ...body,
          idempotencyKey: idempotency.take()
        }).unwrap()
      }
      idempotency.reset()
      successMess(`Đã mở băng ${toVnd(values.amount)} thành công`)
      reset()
      onSuccess?.()
    } catch {
      /* lỗi đã được thông báo tập trung ở fetchBaseQueryCustom */
    }
  }

  return {
    control,
    unfreezeType,
    remaining,
    shortfall: item.shortfallAmount ?? 0,
    maxAmount,
    isLoading: isUnfreezing || isUnfreezingTransaction,
    submit: handleSubmit(onSubmit)
  }
}
