import { FeeDomain, isFeeDomain } from '@components/fee/feeDomain'
import { useGetAssignmentsByPolicyQuery } from '@services/apiFeeAssignment'
import { useGetFeeComponentPoliciesByIdQuery } from '@services/apiFeeComponent'
import { useLazyGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { useGetFeePolicyByIdQuery } from '@services/apiFeePolicy.api'
import type { FeeComponentTier, FeePolicyComponent } from '@type/fee.type'
import { useEffect, useState } from 'react'
import type {
  FeeComponentFormValues,
  FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import type { FeeConfigSnapshot } from './useFeeConfigSubmit'
import { buildEmptyForm } from './useFeeConfigForm'

export interface UseFeeConfigDetailResult {
  values: FeeConfigFormValues | null
  /** Id của bản ghi đang có, để luồng lưu biết là cập nhật chứ không tạo mới. */
  snapshot: FeeConfigSnapshot | null
  /** Backend khoá sửa cấu hình con ở mọi trạng thái khác Khởi tạo và Từ chối. */
  isEditable: boolean
  isLoading: boolean
  isError: boolean
}

const EDITABLE_STATUSES = ['INIT', 'REJECTED']

const toIsoOrEmpty = (value: string | null | undefined): string =>
  value ? value.replace(' ', 'T') : ''

/**
 * Nạp lại một chính sách để sửa.
 *
 * Bậc phí phải gọi riêng cho từng thành phần vì backend không trả kèm. Dùng
 * trigger lazy của RTK Query rồi gom bằng `Promise.all` — vẫn là RTK Query, chỉ
 * là không gọi được hook trong vòng lặp.
 */
export const useFeeConfigDetail = (
  policyId: string | undefined
): UseFeeConfigDetailResult => {
  const skip = !policyId

  const policyQuery = useGetFeePolicyByIdQuery(policyId as string, { skip })
  const componentQuery = useGetFeeComponentPoliciesByIdQuery(policyId as string, { skip })
  const assignmentQuery = useGetAssignmentsByPolicyQuery(policyId as string, {
    skip
  })
  const [fetchTiers] = useLazyGetFeeComponentTierQuery()

  /**
   * Kết quả tải bậc phí kèm khoá của lô thành phần nó thuộc về. Gói chung một
   * state để trạng thái "đang tải" suy ra được từ việc khoá đã khớp hay chưa,
   * thay vì đặt cờ ngay trong thân effect — đặt cờ ở đó là một vòng render thừa
   * mỗi lần effect chạy.
   */
  const [tierResult, setTierResult] = useState<{
    key: string
    data: Record<string, FeeComponentTier[]>
    hasError: boolean
  } | null>(null)

  const components = componentQuery.data as FeePolicyComponent[] | undefined
  const componentKey = (components ?? []).map((item) => item.id).join(',')

  useEffect(() => {
    if (!components || components.length === 0) return

    const key = components.map((item) => item.id).join(',')
    let cancelled = false

    Promise.all(
      components.map(async (component) => {
        const rows = await fetchTiers(component.id).unwrap()
        return [component.id, (rows ?? []) as FeeComponentTier[]] as const
      })
    )
      .then((entries) => {
        if (cancelled) return
        setTierResult({
          key,
          data: Object.fromEntries(entries),
          hasError: false
        })
      })
      .catch(() => {
        if (!cancelled) setTierResult({ key, data: {}, hasError: true })
      })

    return () => {
      cancelled = true
    }
  }, [components, fetchTiers])

  const isLoadingTiers =
    componentKey.length > 0 && tierResult?.key !== componentKey
  const hasTierError = tierResult?.key === componentKey && tierResult.hasError
  const tiersByComponent = tierResult?.data ?? {}

  const policy = policyQuery.data
  const assignment = assignmentQuery.data?.[0]

  const isLoading =
    policyQuery.isLoading ||
    componentQuery.isLoading ||
    assignmentQuery.isLoading ||
    isLoadingTiers

  const isError =
    policyQuery.isError ||
    componentQuery.isError ||
    assignmentQuery.isError ||
    hasTierError

  if (skip || isLoading || isError || !policy) {
    return {
      values: null,
      snapshot: null,
      isEditable: true,
      isLoading: skip ? false : isLoading,
      isError
    }
  }

  const formComponents: FeeComponentFormValues[] = (components ?? []).map(
    (component) => ({
      key: component.id,
      componentType: component.componentType,
      baseOn: component.baseOn,
      baseComponentType: component.baseComponentType,
      calculationMethod: component.calculationMethod,
      payerType: component.payerType,
      // 0 và ô trống mang cùng một nghĩa với backend, nên nạp lại thành ô trống
      // để bản ghi cũ trông đúng như lúc chưa ai đặt khoản đó.
      fixedAmount: component.fixedAmount || null,
      percentage: component.percentage || null,
      minFee: component.minFee || null,
      maxFee: component.maxFee || null,
      roundMode: component.roundMode,
      // Giá trị bắt đầu không nạp lại: form suy nó từ bậc trước, và bản ghi cũ
      // có thể mang một giá trị lệch chuẩn mà form sẽ tự nắn về đúng.
      tiers: (tiersByComponent[component.id] ?? []).map((tier) => ({
        // Riêng giá trị kết thúc giữ nguyên: trống ở đây nghĩa là vô cùng, khác
        // hẳn 0.
        maxValue: tier.maxValue,
        fixedAmount: tier.fixedAmount || null,
        percentage: tier.percentage || null,
        minFee: tier.minFee || null,
        maxFee: tier.maxFee || null
      }))
    })
  )

  const feeDomain = isFeeDomain(policy.feeDomain)
    ? policy.feeDomain
    : FeeDomain.EWALLET

  return {
    values: {
      ...buildEmptyForm(feeDomain),
      name: policy.name,
      description: policy.description ?? '',
      priority: policy.priority,
      serviceType: policy.serviceType,
      validFrom: toIsoOrEmpty(policy.validFrom),
      validTo: toIsoOrEmpty(policy.validTo),
      bankCode: assignment?.bankCode ?? '',
      paymentMethod: assignment?.paymentMethod ?? '',
      merchantId: assignment?.merchantId ?? '',
      subjectId: assignment?.subjectId ?? '',
      components: formComponents
    },
    snapshot: {
      policyId: policy.id,
      componentIds: (components ?? []).map((component) => component.id),
      assignmentId: assignment?.id ?? null
    },
    isEditable: EDITABLE_STATUSES.includes(policy.status),
    isLoading: false,
    isError: false
  }
}
