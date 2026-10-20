import { COMPONENT_TYPE_LABELS } from '@constants/feeLabels'
import {
  getComponentTypesForCategory,
  VAT_COMPONENT_TYPE,
  type FeeBusinessCategory
} from '../constants/feeConfigFields'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { CALCULATION_METHOD_VALUES } from './feeComponentDefaults'
import {
  CALCULATION_METHOD_LABEL,
  summariseBaseType
} from './feeComponentSummary'

interface FieldOption {
  value: string
  label: string
}

const labelOf = (type: string): string => COMPONENT_TYPE_LABELS[type] ?? type

interface ComponentTypeOptionsInput {
  businessCategory: FeeBusinessCategory
  serviceType: string
  /** VAT chỉ chọn được khi phía trên đã có phí gốc của nhóm (hoặc chính nó đang là VAT). */
  allowVat: boolean
  initialComponentType?: string | null
}

export const buildComponentTypeOptions = ({
  businessCategory,
  serviceType,
  allowVat,
  initialComponentType
}: ComponentTypeOptionsInput): FieldOption[] => {
  const options = getComponentTypesForCategory(businessCategory, serviceType)
    .filter((value) => value !== VAT_COMPONENT_TYPE || allowVat)
    .map((value) => ({ value, label: labelOf(value) }))
  // Thành phần cũ đã lưu loại không còn trong danh sách (ví dụ Phí giao dịch cơ bản của chính
  // sách hoàn tiền) vẫn phải hiện đúng tên khi mở sửa, nhưng không cho chọn cho thành phần mới.
  if (
    initialComponentType &&
    !options.some(({ value }) => value === initialComponentType)
  ) {
    options.unshift({
      value: initialComponentType,
      label: labelOf(initialComponentType)
    })
  }
  return options
}

export const buildBaseTypeOptions = (
  baseTypes: readonly string[],
  precedingComponents: readonly FeeComponentFormValues[],
  payerType: string
): FieldOption[] =>
  baseTypes.map((type) => {
    const summary = summariseBaseType(type, precedingComponents, payerType)
    const detail = summary.isSum
      ? `tổng ${summary.formulas.length} thành phần`
      : summary.formulas[0]
    return { value: type, label: `${summary.label} — ${detail}` }
  })

/** VAT luôn tính trực tiếp theo %, không có lựa chọn công thức. */
export const buildMethodOptions = (isVat: boolean): FieldOption[] =>
  (isVat ? [CalculationMethod.DIRECT] : CALCULATION_METHOD_VALUES).map(
    (value) => ({ value, label: CALCULATION_METHOD_LABEL[value] })
  )
