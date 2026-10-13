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
 * SYSTEM được giữ để BE tách chi phí đầu vào; payer cũ chưa thực thi được
 * chuẩn hoá về USER/MERCHANT. Phí đầu ra miền Ví luôn về SYSTEM; chi phí đầu
 * vào và các miền khác giữ người hưởng của từng thành phần.
 */
export const toSetupRequest = (
  form: FeeConfigFormValues
): FeePolicySetupRequest => {
  const executablePayer = getExecutablePayer(form.serviceType)
  if (!executablePayer) {
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
      feeScope: component.feeScope,
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
      // Giữ SYSTEM cho cost estimate; chỉ chuẩn hoá payer cũ SENDER/RECEIVER.
      // Hoàn tiền cho chọn USER/MERCHANT; payer ngoài tập cho phép về mặc định.
      payerType:
        component.payerType === 'SYSTEM'
          ? 'SYSTEM'
          : getSelectablePayers(form.serviceType).includes(component.payerType)
            ? component.payerType
            : executablePayer,
      beneficiaryType:
        form.feeDomain === 'EWALLET' && component.payerType !== 'SYSTEM'
          ? 'SYSTEM'
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
    form.assignmentScope === 'SUBJECT'
      ? form.subjectId || undefined
      : undefined,
  customerGroup:
    form.assignmentScope === 'SEGMENT'
      ? form.customerGroup || undefined
      : undefined,
  effectiveFromDate: form.validFrom
    ? toAssignmentMoment(form.validFrom)
    : undefined,
  effectiveToDate: form.validTo ? toAssignmentMoment(form.validTo) : undefined
})
