import { FeeDomain } from '@components/fee/feeDomain'
import { allowsMerchantCriteria } from '@utils/fee-execution'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, type UseFormReturn } from 'react-hook-form'
import {
  DEFAULT_PRIORITY,
  getDomainFieldRules,
  getFeeDomainForServiceType,
  getFormFieldRules,
  allowsBankCriteria,
  allowsProviderCriteria
} from '../constants/feeConfigFields'
import { allowsOriginalTypeCriteria } from '../constants/feeRefundOriginalType'
import {
  feeConfigFormSchema,
  type FeeComponentFormValues,
  type FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import {
  allowsGrossAmountBase,
  GROSS_AMOUNT_BASE
} from '../utils/feeComponentBaseOptions'
import type { inputCostFormSchema } from '../schemas/inputCostConfig.schema'

export const buildEmptyForm = (
  feeDomain: FeeDomain = FeeDomain.EWALLET
): FeeConfigFormValues => ({
  feeDomain,
  name: '',
  description: '',
  priority: DEFAULT_PRIORITY,
  serviceType: '',
  bankCode: '',
  providerCode: '',
  originalTransactionType: '',
  paymentMethod: '',
  merchantId: '',
  assignmentScope: 'ALL',
  subjectId: '',
  customerGroup: '',
  validFrom: '',
  validTo: '',
  components: []
})

export interface UseFeeConfigFormResult {
  form: UseFormReturn<FeeConfigFormValues>
  /** Đổi miền phí và dọn những lựa chọn không còn nghĩa ở miền mới. */
  changeDomain: (next: FeeDomain) => void
  /**
   * Đổi loại giao dịch: suy lại miền phí và dọn những ô gán đối tượng không còn nghĩa,
   * ví dụ Merchant khi chuyển từ thu hộ sang nạp tiền ví.
   */
  changeServiceType: (next: string) => void
}

/**
 * Một form duy nhất cho cả ba phần của màn. Gộp lại vì màn lưu bằng hai lời gọi
 * tuần tự: lời gọi thứ hai không quay lui được, nên mọi thứ phải hợp lệ trước
 * khi lời gọi thứ nhất chạy.
 */
export const useFeeConfigForm = (
  defaultValues: FeeConfigFormValues,
  /** Schema theo loại chính sách; mặc định là chính sách phí khách. */
  schema:
    | typeof feeConfigFormSchema
    | typeof inputCostFormSchema = feeConfigFormSchema
): UseFeeConfigFormResult => {
  const form = useForm<FeeConfigFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched'
  })

  /** Số tiền qua đối tác chỉ hợp lệ với nạp/rút ví; đổi loại giao dịch thì trả về số tiền giao dịch. */
  const resetGrossBase = (
    components: FeeComponentFormValues[],
    serviceType: string
  ): FeeComponentFormValues[] =>
    components.map((component) =>
      component.baseOn === GROSS_AMOUNT_BASE &&
      !allowsGrossAmountBase(serviceType, component.feeScope)
        ? { ...component, baseOn: 'AMOUNT', baseComponentType: null }
        : component
    )

  /**
   * Chuyển sang thu hộ / chi hộ thì phí đầu ra chỉ còn Merchant chịu được: đưa payer về MERCHANT ngay
   * trên form để người vận hành thấy, không đợi lúc lưu mới bị chặn hay bị đổi ngầm. Luồng ví giữ nguyên.
   */
  const toMerchantPayers = (
    components: FeeComponentFormValues[],
    serviceType: string
  ): FeeComponentFormValues[] =>
    allowsMerchantCriteria(serviceType)
      ? components.map((component) =>
          component.feeScope === 'OUTPUT_FEE' &&
          component.payerType !== 'MERCHANT'
            ? { ...component, payerType: 'MERCHANT' }
            : component
        )
      : components

  const changeDomain = (next: FeeDomain) => {
    const current = form.getValues()
    const rules = getDomainFieldRules(next)
    const keepServiceType = rules.serviceTypes.includes(current.serviceType)

    form.reset({
      ...current,
      feeDomain: next,
      components: resetGrossBase(
        current.components,
        keepServiceType ? current.serviceType : ''
      ),
      // Loại giao dịch của miền cũ có thể không tồn tại ở miền mới; giữ lại là
      // gửi lên một tổ hợp backend không nhận.
      serviceType: keepServiceType ? current.serviceType : '',
      providerCode:
        keepServiceType && allowsProviderCriteria(current.serviceType)
          ? current.providerCode
          : '',
      originalTransactionType:
        keepServiceType && allowsOriginalTypeCriteria(current.serviceType)
          ? current.originalTransactionType
          : '',
      // ĐVCNTT không hiện ở miền khác, giữ lại là gửi lên một tiêu chí người
      // dùng không còn nhìn thấy để sửa.
      merchantId: rules.showMerchant ? current.merchantId : '',
      // Ví được gán riêng chỉ có nghĩa ở miền Ví; giữ lại là gửi lên một tiêu
      // chí người dùng không còn nhìn thấy để sửa.
      subjectId: rules.showSubject ? current.subjectId : '',
      customerGroup: rules.showSegment ? current.customerGroup : '',
      // Miền mới có thể không cho chọn đối tượng đặc biệt; giữ lại là gửi lên
      // một phạm vi người dùng không còn nhìn thấy để sửa.
      assignmentScope:
        rules.showSubject || rules.showSegment ? current.assignmentScope : 'ALL'
    })
  }

  const changeServiceType = (next: string) => {
    const current = form.getValues()
    // Chính sách Bank/NCC cũ giữ miền của nó; mọi chính sách khác theo loại giao dịch.
    const domain =
      current.feeDomain === FeeDomain.BANK
        ? FeeDomain.BANK
        : getFeeDomainForServiceType(next)
    const rules = getFormFieldRules(domain, next)

    form.reset({
      ...current,
      feeDomain: domain,
      serviceType: next,
      components: toMerchantPayers(resetGrossBase(current.components, next), next),
      // Chuyển ví không có ngân hàng; giữ lại là gửi một tiêu chí không còn ô nào để sửa.
      bankCode: allowsBankCriteria(next) ? current.bankCode : '',
      // NCC chỉ có nghĩa với nạp/rút ví; giữ lại là gửi một tiêu chí không còn ô nào để sửa.
      providerCode: allowsProviderCriteria(next) ? current.providerCode : '',
      // Loại giao dịch gốc chỉ có ở phí hoàn tiền; giữ lại là gửi một tiêu chí không còn ô nào để sửa.
      originalTransactionType: allowsOriginalTypeCriteria(next)
        ? current.originalTransactionType
        : '',
      // Luật mới còn ô nào thì giữ giá trị ô đó (kể cả phạm vi + merchantId khi chuyển giữa thu hộ
      // và chi hộ); ô không còn thì xoá, để khỏi gửi tiêu chí không ai nhìn thấy để sửa.
      merchantId: rules.showMerchant ? current.merchantId : '',
      subjectId: rules.showSubject ? current.subjectId : '',
      customerGroup: rules.showSegment ? current.customerGroup : '',
      assignmentScope:
        rules.showSubject || rules.showSegment ? current.assignmentScope : 'ALL'
    })
  }

  return { form, changeDomain, changeServiceType }
}
