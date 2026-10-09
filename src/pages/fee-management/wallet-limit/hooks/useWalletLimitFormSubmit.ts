import { globalMessage } from '@hooks/useMessage'
import {
  useCreateWalletLimitPolicyMutation,
  useUpdateWalletLimitPolicyMutation
} from '@services/apiWalletLimit'
import {
  WalletLimitStatus,
  type WalletLimitPolicy
} from '@type/walletLimit.type'
import { useState } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { WalletLimitFormBannerState } from '../components/WalletLimitFormBanner'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { parseWalletLimitError } from '../utils/walletLimit.error'
import {
  formValuesToCreateBody,
  formValuesToUpdateBody,
  mapServerFieldErrors,
  policyToFormValues
} from '../utils/walletLimit.formMapper'
import { walletLimitPaths } from '../utils/walletLimit.paths'

export const SAVED_MESSAGE = 'Đã lưu, có hiệu lực ngay.'

interface UseWalletLimitFormSubmitOptions {
  form: UseFormReturn<WalletLimitFormValues>
  policy?: WalletLimitPolicy
  onReload?: () => Promise<WalletLimitPolicy | undefined>
}

/** Đưa lỗi BE về form: từng ô cạnh ô nhập, phần còn lại lên banner đầu form. */
const applyServerError = (
  form: UseFormReturn<WalletLimitFormValues>,
  error: unknown
): WalletLimitFormBannerState => {
  const parsed = parseWalletLimitError(error)
  if (parsed.kind === 'conflict') {
    return { kind: 'conflict', message: parsed.message }
  }
  const { errors, unmapped } = mapServerFieldErrors(parsed.fields)
  errors.forEach(({ name, message }) =>
    form.setError(name, { type: 'server', message })
  )
  return { kind: 'error', message: [parsed.message, ...unmapped].join(' ') }
}

export const useWalletLimitFormSubmit = ({
  form,
  policy,
  onReload
}: UseWalletLimitFormSubmitOptions) => {
  const navigate = useNavigate()
  const [createPolicy, createState] = useCreateWalletLimitPolicyMutation()
  const [updatePolicy, updateState] = useUpdateWalletLimitPolicyMutation()
  const [banner, setBanner] = useState<WalletLimitFormBannerState | null>(null)
  const [pendingLock, setPendingLock] = useState<WalletLimitFormValues | null>(
    null
  )
  const [isReloading, setIsReloading] = useState(false)

  const save = async (values: WalletLimitFormValues) => {
    setBanner(null)
    try {
      const saved = policy
        ? await updatePolicy({
            id: policy.id,
            body: formValuesToUpdateBody(values)
          }).unwrap()
        : await createPolicy(formValuesToCreateBody(values)).unwrap()
      globalMessage.success(SAVED_MESSAGE)
      navigate(walletLimitPaths.detail(saved.id))
    } catch (error) {
      setBanner(applyServerError(form, error))
    }
  }

  const onSubmit = form.handleSubmit(async (values) => {
    const isLocking =
      policy?.status === WalletLimitStatus.ACTIVE &&
      values.status === WalletLimitStatus.LOCKED
    if (isLocking) setPendingLock(values)
    else await save(values)
  })

  const confirmLock = () => {
    const values = pendingLock
    setPendingLock(null)
    if (values) void save(values)
  }

  const reload = async () => {
    if (!onReload) return
    setIsReloading(true)
    try {
      const fresh = await onReload()
      if (!fresh) return
      form.reset(policyToFormValues(fresh))
      setBanner(null)
      globalMessage.success('Đã tải lại cấu hình mới nhất.')
    } finally {
      setIsReloading(false)
    }
  }

  return {
    onSubmit,
    banner,
    isSaving: createState.isLoading || updateState.isLoading,
    isReloading,
    reload,
    pendingLock,
    confirmLock,
    cancelLock: () => setPendingLock(null)
  }
}
