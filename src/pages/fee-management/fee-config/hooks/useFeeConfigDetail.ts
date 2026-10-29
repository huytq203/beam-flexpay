import { FeeDomain, isFeeDomain } from '@components/fee/feeDomain'
import { useGetFeePolicyConfigQuery } from '@services/apiFeePolicyConfig'
import {
  FEE_SCOPE,
  POLICY_KIND,
  resolveFeeScope,
  toAssignmentScopeFields,
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
 * Policy, thành phần, bản gán và bậc phí gom trong một query `getFeePolicyConfig`, nên loader
 * toàn màn chỉ bật một lần. Chỉ coi là đang tải ở lần đầu (`isLoading`): sau khi lưu, query
 * refetch vì bị invalidate, nếu quay về trạng thái tải thì form bị dựng lại và màn nháy.
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
  const { data, isLoading, isError } = useGetFeePolicyConfigQuery(
    policyId ?? '',
    { skip }
  )

  const policy = data?.policy
  const components = data?.components
  const assignment = data?.assignments[0]
  const tiersByComponent = data?.tiersByComponent ?? {}

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
      // Phạm vi suy ngược từ tiêu chí của bản gán; luồng merchant đọc cả merchantId lẫn subjectId.
      ...toAssignmentScopeFields(feeDomain, policy.serviceType, assignment),
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
