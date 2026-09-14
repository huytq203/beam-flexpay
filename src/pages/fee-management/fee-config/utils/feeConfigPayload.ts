import {
  ASSIGNMENT_DATETIME_FORMAT,
  POLICY_DATETIME_FORMAT,
  type FeeAssignmentCreateRequest,
  type FeePolicySetupRequest
} from '@/app/schemas/fee-setup.schema'
import {
  EXECUTABLE_BENEFICIARY,
  EXECUTABLE_CURRENCY,
  getExecutablePayer
} from '@utils/fee-execution'
import dayjs from 'dayjs'
import { WALLET_SUBJECT_TYPE } from '../constants/feeConfigFields'
import {
  getTierStart,
  usesTiers,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'

/** Chế độ làm tròn thống nhất toàn hệ thống; BE khai `@NotNull` nên vẫn phải gửi. */
const ROUND_MODE = 'UP'

/** Ô để trống là "không thu khoản này"; backend khai `@NotNull` nên gửi 0. */
const orZero = (value: number | null | undefined): number => value ?? 0

const toPolicyMoment = (value: string): string =>
  dayjs(value).format(POLICY_DATETIME_FORMAT)

const toAssignmentMoment = (value: string): string =>
  dayjs(value).format(ASSIGNMENT_DATETIME_FORMAT)

/**
 * Form → payload thiết lập trọn gói.
 *
 * Người chịu lấy từ form vì người vận hành được phép chọn; hộp thoại đã cảnh
 * báo khi giá trị lệch hợp đồng thực thi. Người hưởng thì không: mọi giá trị
 * khác hệ thống đều bị bước duyệt từ chối, nên ghi cứng ở đây để không có
 * đường nào gửi lên một giá trị khác.
 */
export const toSetupRequest = (
  form: FeeConfigFormValues
): FeePolicySetupRequest => {
  if (!getExecutablePayer(form.serviceType)) {
    throw new Error(
      `Loại giao dịch ${form.serviceType} chưa có hợp đồng thực thi phí`
    )
  }

  return {
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
    components: form.components.map((component) => ({
      componentType: component.componentType,
      baseOn: component.baseOn,
      baseComponentType:
        component.baseOn === 'FEE_COMPONENT'
          ? component.baseComponentType
          : undefined,
      calculationMethod: component.calculationMethod,
      // Thành phần chia bậc lấy số từ bảng bậc, hai ô này phải về 0 để backend
      // không cộng thêm một lần nữa lên trên kết quả của bậc.
      fixedAmount: usesTiers(component.calculationMethod)
        ? 0
        : orZero(component.fixedAmount),
      percentage: usesTiers(component.calculationMethod)
        ? 0
        : orZero(component.percentage),
      roundMode: ROUND_MODE,
      minFee: orZero(component.minFee),
      maxFee: orZero(component.maxFee),
      payerType: component.payerType,
      beneficiaryType: EXECUTABLE_BENEFICIARY,
      tiers: usesTiers(component.calculationMethod)
        ? component.tiers.map((tier, index) => ({
            // Backend vẫn nhận giá trị bắt đầu; form suy nó ra để hai con số
            // không bao giờ lệch nhau.
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
  bankCode: form.bankCode || undefined,
  paymentMethod: form.paymentMethod || undefined,
  merchantId: form.merchantId || undefined,
  // Phạm vi loại trừ nhau: gửi kèm tiêu chí của phạm vi không được chọn sẽ tạo ra bản gán
  // hẹp hơn ý người vận hành, mà màn hình lại không hiện ô đó để họ thấy.
  // Cặp chủ thể phải cùng có hoặc cùng vắng: backend từ chối bản gán khai nửa cặp.
  subjectType:
    form.assignmentScope === 'SUBJECT' && form.subjectId
      ? WALLET_SUBJECT_TYPE
      : undefined,
  subjectId:
    form.assignmentScope === 'SUBJECT' ? form.subjectId || undefined : undefined,
  customerGroup:
    form.assignmentScope === 'SEGMENT'
      ? form.customerGroup || undefined
      : undefined,
  effectiveFromDate: form.validFrom
    ? toAssignmentMoment(form.validFrom)
    : undefined,
  effectiveToDate: form.validTo ? toAssignmentMoment(form.validTo) : undefined
})

/** Thân request cập nhật chính sách; khác bản tạo ở chỗ không bọc trong `policy`. */
export const toPolicyUpdateRequest = (form: FeeConfigFormValues) =>
  toSetupRequest(form).policy

/**
 * Một thành phần phí ở dạng request tạo lẻ.
 *
 * Dùng khi sửa: dịch vụ phí không có endpoint cập nhật trọn gói, nên màn phải
 * dựng lại từng thành phần một.
 */
export const toComponentCreateRequest = (
  form: FeeConfigFormValues,
  index: number,
  feePolicyId: string
) => {
  const component = toSetupRequest(form).components[index]
  const { tiers: _tiers, ...rest } = component
  return { ...rest, feePolicyId }
}

export const toTierCreateRequests = (
  form: FeeConfigFormValues,
  index: number,
  feeComponentId: string
) =>
  toSetupRequest(form).components[index].tiers.map((tier) => ({
    ...tier,
    feeComponentId
  }))
