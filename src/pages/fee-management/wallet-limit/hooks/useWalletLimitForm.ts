import { zodResolver } from '@hookform/resolvers/zod'
import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { useForm, type UseFormReturn } from 'react-hook-form'
import {
  createWalletLimitFormSchema,
  type WalletLimitFormValues
} from '../schemas/walletLimitForm.schema'
import {
  buildEmptyFormValues,
  getSystemRequiredKeys,
  policyToFormValues
} from '../utils/walletLimit.formMapper'

/**
 * Form dùng chung cho Thêm mới (không có `policy`) và Cập nhật. Cấu hình Hệ
 * thống đang có số thì ô đó không được bỏ trống: schema dựng từ bản gốc.
 */
export const useWalletLimitForm = (
  policy?: WalletLimitPolicy
): UseFormReturn<WalletLimitFormValues> => {
  const requiredKeys = policy ? getSystemRequiredKeys(policy) : []
  return useForm<WalletLimitFormValues>({
    resolver: zodResolver(createWalletLimitFormSchema({ requiredKeys })),
    defaultValues: policy ? policyToFormValues(policy) : buildEmptyFormValues(),
    reValidateMode: 'onChange'
  })
}
