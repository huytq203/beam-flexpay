import type { BaseSyntheticEvent } from 'react'
import type { Control } from 'react-hook-form'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  adminChangePasswordSchema,
  type AdminChangePasswordInput
} from '@/app/schemas/change-password'
import { useAdminChangePasswordMutation } from '@services/authEndpoints'
import { resolveChangePasswordFailure } from './change-password-error'

interface UseChangePasswordOptions {
  onSuccess: () => void
}

interface UseChangePasswordResult {
  control: Control<AdminChangePasswordInput>
  isSubmitting: boolean
  isValid: boolean
  submitError: string | null
  submit: (event?: BaseSyntheticEvent) => Promise<void>
  clearSubmitError: () => void
}

const DEFAULT_VALUES: AdminChangePasswordInput = {
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
}

export function useChangePassword({
  onSuccess
}: UseChangePasswordOptions): UseChangePasswordResult {
  const [changePassword, { isLoading: isSubmitting }] =
    useAdminChangePasswordMutation()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid }
  } = useForm<AdminChangePasswordInput>({
    resolver: zodResolver(adminChangePasswordSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES
  })
  const submit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await changePassword(values).unwrap()
      onSuccess()
    } catch (error) {
      if (!error || typeof error !== 'object') {
        setSubmitError('Chưa thể đổi mật khẩu lúc này. Vui lòng thử lại.')
        return
      }
      const failure = resolveChangePasswordFailure(error)
      if (failure.field) {
        setError(
          failure.field,
          { type: 'server', message: failure.message },
          { shouldFocus: true }
        )
        return
      }
      setSubmitError(failure.message)
    }
  })
  return {
    control,
    isSubmitting,
    isValid,
    submitError,
    submit,
    clearSubmitError: () => setSubmitError(null)
  }
}
