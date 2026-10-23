import { useState } from 'react'
import {
  useUpdateGatewayPaymentConfigMutation,
  type PaymentMethod
} from '@/app/services/merchantGatewayApi'
import {
  useGetScopedPaymentMethodConfigQuery,
  useInheritSubPaymentMethodConfigMutation,
  usePatchPaymentMethodConfigMutation
} from '@/app/services/merchantPaymentMethodApi'
import { feedback } from '@components/index'
import { SYSTEM_DEFAULT_METHODS } from '../constants/paymentMethod.constants'
import {
  isVersionConflict,
  paymentMethodErrorMessage
} from '../utils/paymentMethodError'
import { configOrigin, ownVersion } from '../utils/paymentMethodSource'

interface Draft {
  scopeKey: string
  useSystemDefault?: boolean
  methods?: PaymentMethod[]
  active?: boolean
  reason: string
  reasonError: string
}

interface UsePaymentMethodEditorArgs {
  masterId: string
  /** Bỏ trống = cấp Master. */
  subMerchantId?: string
  /** Chưa chọn Sub thì chưa tải. */
  skip?: boolean
  onSaved: () => void
}

export function usePaymentMethodEditor({
  masterId,
  subMerchantId,
  skip,
  onSaved
}: UsePaymentMethodEditorArgs) {
  const scopeKey = subMerchantId ?? 'MASTER'
  const isSub = Boolean(subMerchantId)
  const query = useGetScopedPaymentMethodConfigQuery(
    { masterId, subMerchantId },
    { skip }
  )
  const [patch, patchState] = usePatchPaymentMethodConfigMutation()
  const [resetMaster, resetState] = useUpdateGatewayPaymentConfigMutation()
  const [inheritSub, inheritState] = useInheritSubPaymentMethodConfigMutation()
  const [stored, setDraft] = useState<Draft>({
    scopeKey,
    reason: '',
    reasonError: ''
  })
  // Đổi cấp (Master ↔ Sub) thì bỏ mọi thay đổi đang dở của cấp cũ.
  const draft: Draft =
    stored.scopeKey === scopeKey
      ? stored
      : { scopeKey, reason: '', reasonError: '' }
  const update = (patchDraft: Partial<Draft>) =>
    setDraft({ ...draft, ...patchDraft })

  const config = query.currentData
  const capabilities = config?.capabilities ?? []
  const isEligible = (method: PaymentMethod) =>
    capabilities.find((item) => item.method === method)?.eligible !== false
  const origin = config ? configOrigin(config) : undefined
  const useSystemDefault =
    !isSub &&
    (draft.useSystemDefault ?? (origin !== undefined && origin !== 'OWN'))
  // Giá trị kế thừa có thể chứa hình thức chưa đủ điều kiện (mặc định hệ
  // thống bật cả 5); bỏ chúng khỏi điểm xuất phát để lần ghi đầu không bị 5506.
  const baseMethods = (config?.enabledMethods.value ?? []).filter(
    (method) => origin === 'OWN' || isEligible(method)
  )
  const methods = draft.methods ?? baseMethods
  const displayedMethods = useSystemDefault ? SYSTEM_DEFAULT_METHODS : methods
  const active = draft.active ?? (config?.configured ? config.active : true)
  const saving =
    patchState.isLoading || resetState.isLoading || inheritState.isLoading

  const toggleMethod = (method: PaymentMethod, checked: boolean) =>
    update({
      methods: checked
        ? [...methods, method]
        : methods.filter((item) => item !== method)
    })

  const requireReason = () => {
    const reason = draft.reason.trim()
    if (!reason) update({ reasonError: 'Vui lòng nhập lý do thay đổi' })
    return reason
  }

  const handleError = (error: unknown, fallback: string) => {
    feedback.error(paymentMethodErrorMessage(error, fallback, capabilities))
    if (isVersionConflict(error)) void query.refetch()
  }

  const save = async () => {
    if (!config) return
    const reason = requireReason()
    if (!reason) return
    const keepMethods =
      draft.methods === undefined && config.enabledMethods.suspended
    if (!useSystemDefault && !keepMethods && methods.length === 0) {
      feedback.warning('Cần bật ít nhất một hình thức thanh toán')
      return
    }
    try {
      if (useSystemDefault) {
        // PATCH cấm `inherit` ở Master (5509); chỉ PUT cũ xoá được cấu hình Master.
        await resetMaster({ id: masterId, inherit: true, reason }).unwrap()
      } else {
        await patch({
          masterId,
          subMerchantId,
          body: {
            enabledMethods: keepMethods ? undefined : methods,
            active,
            version: ownVersion(config),
            reason
          }
        }).unwrap()
      }
      feedback.success(
        `Đã ${config.configured ? 'cập nhật' : 'thiết lập'} hình thức thanh toán`
      )
      onSaved()
    } catch (error) {
      handleError(error, 'Không thể cập nhật hình thức thanh toán')
    }
  }

  const returnToMaster = async () => {
    if (!config || !subMerchantId) return
    const reason = requireReason()
    if (!reason) return
    try {
      await inheritSub({
        masterId,
        subMerchantId,
        reason,
        version: ownVersion(config)
      }).unwrap()
      feedback.success('Sub-merchant đã quay về kế thừa Master')
      setDraft({ scopeKey, reason: '', reasonError: '' })
    } catch (error) {
      handleError(error, 'Không thể quay về kế thừa Master')
    }
  }

  return {
    query,
    config,
    isSub,
    origin,
    capabilities,
    useSystemDefault,
    displayedMethods,
    active,
    saving,
    reason: draft.reason,
    reasonError: draft.reasonError,
    setUseSystemDefault: (value: boolean) =>
      update({ useSystemDefault: value }),
    setActive: (value: boolean) => update({ active: value }),
    setReason: (value: string) => update({ reason: value, reasonError: '' }),
    toggleMethod,
    save,
    returnToMaster
  }
}

export type PaymentMethodEditorState = ReturnType<typeof usePaymentMethodEditor>
