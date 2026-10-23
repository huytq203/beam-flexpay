import { FeeDomain, isFeeDomain } from '@components/fee/feeDomain'
import { useGetAssignmentsByPolicyQuery } from '@services/apiFeeAssignment'
import { useGetFeeComponentPoliciesByIdQuery } from '@services/apiFeeComponent'
import { useLazyGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { useGetFeePolicyByIdQuery } from '@services/apiFeePolicy.api'
import type { FeeComponentTier, FeePolicyComponent } from '@type/fee.type'
import { useEffect, useState } from 'react'
import {
  FEE_SCOPE,
  POLICY_KIND,
  resolveFeeScope,
  type FeeScope,
  type PolicyKind
} from '../constants/feeConfigFields'
import {
  CalculationMethod,
  type FeeComponentFormValues,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import type { FeeConfigSnapshot } from './useFeeConfigSubmit'
import { buildEmptyForm } from './useFeeConfigForm'

export interface UseFeeConfigDetailResult {
  values: FeeConfigFormValues | null
  /** Id của bản ghi đang có, để luồng lưu biết là cập nhật chứ không tạo mới. */
  snapshot: FeeConfigSnapshot | null
  /** Mã đối soát của chính sách đang xem; null khi tạo mới hoặc BE cũ chưa trả. */
  feeCode: string | null
  /** Backend khoá sửa cấu hình con ở mọi trạng thái khác Khởi tạo và Từ chối. */
  isEditable: boolean
  /** Loại chính sách đã lưu; null khi tạo mới hoặc chưa tải xong. BE cũ chưa trả = phí khách. */
  policyKind: PolicyKind | null
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
  policyId: string | undefined,
  /**
   * Luồng thành phần đưa vào form. Chính sách phí khách chỉ có phí đầu ra, chính sách phí đầu vào
   * chỉ có chi phí đầu vào; thành phần lạc luồng (dữ liệu trước khi tách) bị bỏ khỏi form, và vì
   * lúc lưu form dựng lại toàn bộ thành phần nên chúng cũng bị xoá khỏi chính sách.
   */
  scope: FeeScope = FEE_SCOPE.OUTPUT_FEE
): UseFeeConfigDetailResult => {
  const skip = !policyId

  const policyQuery = useGetFeePolicyByIdQuery(policyId as string, { skip })
  const componentQuery = useGetFeeComponentPoliciesByIdQuery(
    policyId as string,
    { skip }
  )
  const assignmentQuery = useGetAssignmentsByPolicyQuery(policyId as string, {
    skip
  })
  const [fetchTiers] = useLazyGetFeeComponentTierQuery()

  /**
   * Kết quả tải bậc phí kèm id chính sách nó thuộc về. Chỉ tải đúng một lần cho
   * mỗi chính sách: khi lưu, các mutation làm query thành phần refetch và đổi id
   * thành phần liên tục; nếu tải lại bậc theo mỗi lần đổi thì màn quay về trạng
   * thái "đang tải" và form bị dựng lại, người dùng thấy nháy.
   */
  const [tierResult, setTierResult] = useState<{
    policyId: string
    data: Record<string, FeeComponentTier[]>
    hasError: boolean
  } | null>(null)

  const components = componentQuery.data as FeePolicyComponent[] | undefined
  const hasComponents = (components?.length ?? 0) > 0
  const loadedPolicyId = tierResult?.policyId

  useEffect(() => {
    if (!policyId || !components || components.length === 0) return
    if (loadedPolicyId === policyId) return

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
          policyId,
          data: Object.fromEntries(entries),
          hasError: false
        })
      })
      .catch(() => {
        if (!cancelled) setTierResult({ policyId, data: {}, hasError: true })
      })

    return () => {
      cancelled = true
    }
  }, [policyId, components, loadedPolicyId, fetchTiers])

  const isTierResultCurrent = tierResult?.policyId === policyId
  const isLoadingTiers = hasComponents && !isTierResultCurrent
  const hasTierError = isTierResultCurrent && Boolean(tierResult?.hasError)
  const tiersByComponent = isTierResultCurrent ? (tierResult?.data ?? {}) : {}

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
      feeCode: null,
      isEditable: true,
      policyKind: null,
      isLoading: skip ? false : isLoading,
      isError
    }
  }

  const formComponents: FeeComponentFormValues[] = (components ?? [])
    .filter(
      (component) =>
        resolveFeeScope(component.feeScope, component.payerType) === scope
    )
    .map((component) => {
      // Form không còn công thức Miễn phí: bản ghi FREE (hoặc DIRECT thu 0 đồng) nạp lại thành
      // DIRECT với 0 ở cả hai ô, để thấy rõ "đã điền 0" thay vì hai ô trống bị báo thiếu mức phí.
      const isFreeDirect =
        (component.calculationMethod === CalculationMethod.FREE ||
          component.calculationMethod === CalculationMethod.DIRECT) &&
        !component.fixedAmount &&
        !component.percentage
      return {
        key: component.id,
        feeScope: resolveFeeScope(component.feeScope, component.payerType),
        componentType: component.componentType,
        baseOn: component.baseOn,
        baseComponentType: component.baseComponentType,
        calculationMethod: isFreeDirect
          ? CalculationMethod.DIRECT
          : component.calculationMethod,
        payerType: component.payerType,
        beneficiaryType: component.beneficiaryType,
        // 0 và ô trống mang cùng một nghĩa với backend, nên nạp lại thành ô trống
        // để bản ghi cũ trông đúng như lúc chưa ai đặt khoản đó.
        fixedAmount: isFreeDirect ? 0 : component.fixedAmount || null,
        percentage: isFreeDirect ? 0 : component.percentage || null,
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
      }
    })

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
      providerCode: assignment?.providerCode ?? '',
      originalTransactionType: assignment?.originalTransactionType ?? '',
      paymentMethod: assignment?.paymentMethod ?? '',
      merchantId: assignment?.merchantId ?? '',
      subjectId: assignment?.subjectId ?? '',
      customerGroup: assignment?.customerGroup ?? '',
      // Bản gán chỉ lưu tiêu chí, không lưu phạm vi; suy ngược ra để ô chọn hiện
      // đúng thứ người tạo đã chọn. Cá nhân trước vì nó hẹp hơn nhóm.
      assignmentScope: assignment?.subjectId
        ? 'SUBJECT'
        : assignment?.customerGroup
          ? 'SEGMENT'
          : 'ALL',
      components: formComponents
    },
    snapshot: {
      policyId: policy.id,
      componentIds: (components ?? []).map((component) => component.id),
      assignmentId: assignment?.id ?? null
    },
    feeCode: policy.feeCode ?? null,
    isEditable: EDITABLE_STATUSES.includes(policy.status),
    policyKind: policy.policyKind ?? POLICY_KIND.CUSTOMER_FEE,
    isLoading: false,
    isError: false
  }
}
