import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { globalMessage } from '@hooks/useMessage'

import {
  bankAccountLockSchema,
  type BankAccountLockValues
} from '../schemas/bank-account.schema'
import type { BankAccountLockMode } from '../types/bank-account.type'

interface UseBankAccountLockOptions {
  mode: BankAccountLockMode
  onConfirmed: () => void
}

export function useBankAccountLock({
  mode,
  onConfirmed
}: UseBankAccountLockOptions) {
  const { control, handleSubmit } = useForm<BankAccountLockValues>({
    resolver: zodResolver(bankAccountLockSchema),
    defaultValues: { reason: '' }
  })

  // Mock: chưa gọi API, chưa qua bước xác thực nhạy cảm (OTP/mật khẩu).
  const submit = handleSubmit(() => {
    onConfirmed()
    globalMessage.success(
      mode === 'lock'
        ? 'Đã khóa tài khoản ngân hàng'
        : 'Đã mở khóa tài khoản ngân hàng'
    )
  })

  return { control, submit }
}
