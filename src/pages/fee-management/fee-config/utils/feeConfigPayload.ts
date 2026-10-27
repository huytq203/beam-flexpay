import { outputBeneficiaryFor } from '../constants/feeComponentParties'
import {
  ASSIGNMENT_DATETIME_FORMAT,
  POLICY_DATETIME_FORMAT,
  type FeeAssignmentCreateRequest,
  type FeePolicySetupRequest
} from '@/app/schemas/fee-setup.schema'
import {
  EXECUTABLE_CURRENCY,
  getExecutablePayer,
  getSelectablePayers
} from '@utils/fee-execution'
import dayjs from 'dayjs'
import {
  allowsBankCriteria,
  allowsProviderCriteria,
  FEE_SCOPE,
  isMerchantAssignmentFlow,
  MERCHANT_SUBJECT_TYPE,
  POLICY_KIND,
  WALLET_SUBJECT_TYPE,
  type PolicyKind
} from '../constants/feeConfigFields'
import { allowsOriginalTypeCriteria } from '../constants/feeRefundOriginalType'
import {
  CalculationMethod,
  getTierStart,
  usesTiers,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'

/** Chế độ làm tròn thống nhất toàn hệ thống; BE khai `@NotNull` nên vẫn phải gửi. */
const ROUND_MODE = 'UP'

/** Ô để trống là "không thu khoản này"; backend khai `@NotNull` nên gửi 0. */
const orZero = (value: number | null | undefined): number => value ?? 0

/**
 * Form không còn công thức "Miễn phí": điền 0 vào cả hai ô là miễn phí. Backend vẫn nhận biết miễn
 * phí bằng công thức FREE nên gửi FREE, còn VAT 0% giữ DIRECT vì thuế suất 0 là cấu hình hợp lệ.
 */
const toBackendMethod = (
  component: FeeConfigFormValues['components'][number]
): string =>
  component.calculationMethod === CalculationMethod.DIRECT &&
  component.componentType !== 'VAT' &&
  orZero(component.percentage) === 0 &&
  orZero(component.fixedAmount) === 0
    ? CalculationMethod.FREE
    : component.calculationMethod

const toPolicyMoment = (value: string): string =>
  dayjs(value).format(POLICY_DATETIME_FORMAT)

const toAssignmentMoment = (value: string): string =>
  dayjs(value).format(ASSIGNMENT_DATETIME_FORMAT)

/**
 * Form → payload thiết lập trọn gói.
 *
 * SYSTEM được giữ để BE tách chi phí đầu vào; payer cũ chưa thực thi được
 * chuẩn hoá về USER/MERCHANT. Phí đầu ra miền Ví luôn về SYSTEM; chi phí đầu
 * vào và các miền khác giữ người hưởng của từng thành phần.
 *
 * Loại chính sách quyết định luồng thành phần được gửi: phí khách chỉ gửi phí đầu ra, phí đầu
 * vào chỉ gửi chi phí đầu vào, để không bao giờ trộn hai luồng vào một chính sách.
 */
export const toSetupRequest = (
  form: FeeConfigFormValues,
  policyKind: PolicyKind = POLICY_KIND.CUSTOMER_FEE
): FeePolicySetupRequest => {
  const executablePayer = getExecutablePayer(form.serviceType)
  if (!executablePayer) {
    throw new Error(
      `Loại giao dịch ${form.serviceType} chưa có hợp đồng thực thi phí`
    )
  }

  const scope =
    policyKind === POLICY_KIND.INPUT_COST
      ? FEE_SCOPE.INPUT_COST
      : FEE_SCOPE.OUTPUT_FEE

  return {
    policyKind,
    policy: {
      name: form.name.trim(),
      serviceType: form.serviceType,
      description: form.description.trim() || undefined,
      feeDomain: form.feeDomain,
      currency: EXECUTABLE_CURRENCY,
      validFrom: toPolicyMoment(form.validFrom),
      validTo: form.validTo ? toPolicyMoment(form.validTo) : undefined,
      priority: form.priority
    },
    components: form.components
      .filter((component) => component.feeScope === scope)
      .map((component) => ({
        feeScope: component.feeScope,
        componentType: component.componentType,
        baseOn: component.baseOn,
        baseComponentType:
          component.baseOn === 'FEE_COMPONENT'
            ? component.baseComponentType
            : undefined,
        calculationMethod: toBackendMethod(component),
        // Thành phần chia bậc lấy số từ bảng bậc, hai ô này phải về 0 để backend
        // không cộng thêm một lần nữa lên trên kết quả của bậc.
        fixedAmount: usesTiers(component.calculationMethod)
          ? 0
          : orZero(component.fixedAmount),
        percentage: usesTiers(component.calculationMethod)
          ? 0
          : orZero(component.percentage),
        roundMode: ROUND_MODE,
        minFee: usesTiers(component.calculationMethod)
          ? 0
          : orZero(component.minFee),
        maxFee: usesTiers(component.calculationMethod)
          ? 0
          : orZero(component.maxFee),
        // Giữ SYSTEM cho cost estimate; chỉ chuẩn hoá payer cũ SENDER/RECEIVER.
        // Payer ngoài tập cho phép (hoàn tiền chỉ còn USER) về mặc định.
        payerType:
          component.payerType === 'SYSTEM'
            ? 'SYSTEM'
            : getSelectablePayers(form.serviceType).includes(
                  component.payerType
                )
              ? component.payerType
              : executablePayer,
        // Phí đầu ra: VAT về Ngân hàng, loại phí khác về Hệ thống; phí đầu vào giữ lựa chọn.
        beneficiaryType:
          component.payerType !== 'SYSTEM'
            ? outputBeneficiaryFor(component.componentType)
            : component.beneficiaryType,
        tiers: usesTiers(component.calculationMethod)
          ? component.tiers.map((tier, index) => ({
              // Backend dùng khoảng bao đóng và nhận min bậc sau = max trước + 1;
              // form suy nó ra để không tạo khoảng hở hoặc chồng lấn.
              minValue: getTierStart(component.tiers, index),
              maxValue: tier.maxValue,
              roundMode: ROUND_MODE,
              minFee: orZero(tier.minFee),
              maxFee: orZero(tier.maxFee),
              fixedAmount: orZero(tier.fixedAmount),
              percentage: orZero(tier.percentage)
            }))
          : []
      }))
  }
}

type AssignmentSubjectFields = Pick<
  FeeAssignmentCreateRequest,
  'merchantId' | 'subjectType' | 'subjectId' | 'customerGroup'
>

/**
 * Tiêu chí đối tượng của bản gán theo phạm vi.
 *
 * Phạm vi loại trừ nhau: gửi kèm tiêu chí của phạm vi không được chọn sẽ tạo ra bản gán hẹp
 * hơn ý người vận hành, mà màn hình lại không hiện ô đó để họ thấy.
 * Cặp chủ thể phải cùng có hoặc cùng vắng: backend từ chối bản gán khai nửa cặp.
 */
const toAssignmentSubjectFields = (
  form: FeeConfigFormValues
): AssignmentSubjectFields => {
  const { assignmentScope } = form
  const customerGroup =
    assignmentScope === 'SEGMENT' ? form.customerGroup || undefined : undefined

  if (isMerchantAssignmentFlow(form.feeDomain, form.serviceType)) {
    // Merchant cụ thể gửi cả merchantId lẫn cặp MERCHANT: chỉ có merchantId thì bản gán được
    // 128 điểm và thua bản gán nhóm (256); cặp chủ thể được 512. Backend bắt subjectId == merchantId.
    const merchantId =
      assignmentScope === 'SUBJECT' ? form.merchantId || undefined : undefined
    return {
      merchantId,
      subjectType: merchantId ? MERCHANT_SUBJECT_TYPE : undefined,
      subjectId: merchantId,
      customerGroup
    }
  }

  return {
    // Luồng ví không có ô Merchant; chính sách Bank cũ giữ merchantId đứng riêng như trước.
    merchantId: form.merchantId || undefined,
    subjectType:
      assignmentScope === 'SUBJECT' && form.subjectId
        ? WALLET_SUBJECT_TYPE
        : undefined,
    subjectId:
      assignmentScope === 'SUBJECT' ? form.subjectId || undefined : undefined,
    customerGroup
  }
}

/**
 * Form → payload gán đối tượng.
 *
 * Tiêu chí để trống nghĩa là áp cho tất cả, nên gửi chuỗi rỗng và gửi thiếu
 * trường là hai chuyện khác nhau ở backend: chuỗi rỗng từng tạo ra những bản
 * gán không bao giờ khớp. Bỏ hẳn trường khi người dùng không chọn.
 */
export const toAssignmentRequest = (
  form: FeeConfigFormValues,
  feePolicyId: string
): FeeAssignmentCreateRequest => ({
  feePolicyId,
  serviceType: form.serviceType,
  bankCode: allowsBankCriteria(form.serviceType)
    ? form.bankCode || undefined
    : undefined,
  // Backend chỉ nhận NCC trên nạp/rút ví; ô bị ẩn ở các loại khác nên không gửi để khỏi bị từ chối.
  providerCode: allowsProviderCriteria(form.serviceType)
    ? form.providerCode || undefined
    : undefined,
  // Backend chỉ nhận loại giao dịch gốc trên phí hoàn tiền; ô bị ẩn ở các loại khác nên không gửi.
  originalTransactionType: allowsOriginalTypeCriteria(form.serviceType)
    ? form.originalTransactionType || undefined
    : undefined,
  paymentMethod: form.paymentMethod || undefined,
  ...toAssignmentSubjectFields(form),
  effectiveFromDate: form.validFrom
    ? toAssignmentMoment(form.validFrom)
    : undefined,
  effectiveToDate: form.validTo ? toAssignmentMoment(form.validTo) : undefined
})

/**
 * Form phí đầu vào → payload gán tuyến thanh toán.
 *
 * Chỉ khai NCC, Ngân hàng, phương thức và ngày hiệu lực. Backend từ chối bản gán phí đầu
 * vào có merchant, loại thẻ, nhóm khách, chủ thể hay loại giao dịch gốc, nên các trường đó không
 * bao giờ có mặt ở đây dù form có giữ giá trị cũ. Loại giao dịch là `serviceType` của chính sách.
 */
export const toInputCostAssignmentRequest = (
  form: FeeConfigFormValues,
  feePolicyId: string
): FeeAssignmentCreateRequest => ({
  feePolicyId,
  serviceType: form.serviceType,
  providerCode: allowsProviderCriteria(form.serviceType)
    ? form.providerCode || undefined
    : undefined,
  bankCode: allowsBankCriteria(form.serviceType)
    ? form.bankCode || undefined
    : undefined,
  paymentMethod: form.paymentMethod || undefined,
  effectiveFromDate: form.validFrom
    ? toAssignmentMoment(form.validFrom)
    : undefined,
  effectiveToDate: form.validTo ? toAssignmentMoment(form.validTo) : undefined
})
