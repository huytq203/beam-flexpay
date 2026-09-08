import { beneficiaryTypeEnum } from '../constants/FeeManagement.constant'
import type { FeeComponent } from '../types/FeeComponent.types'

/**
 * Nhóm thành phần phí theo bên được hưởng. Đây là trục đối soát: một giao dịch
 * rút tiền thu của người dùng một khoản duy nhất, nhưng khoản đó được chia cho
 * ngân hàng và FlexPay theo từng thành phần riêng.
 */
export interface FeeBeneficiaryGroup {
  beneficiaryType: string
  // label: string
  /** Nền + chữ của thẻ tiêu đề nhóm. Chữ luôn là tông đậm để đủ tương phản. */
  tone: string
  items: FeeComponent[]
}

const GROUP_LABEL: Readonly<Record<string, string>> = {
  [beneficiaryTypeEnum.BANK]: 'Ngân hàng hưởng',
  [beneficiaryTypeEnum.SYSTEM]: 'FlexPay hưởng',
  [beneficiaryTypeEnum.MERCHANT]: 'Merchant hưởng',
  [beneficiaryTypeEnum.PARTNER]: 'Đối tác hưởng',
  [beneficiaryTypeEnum.TAX]: 'Cơ quan thuế hưởng'
}

const GROUP_TONE: Readonly<Record<string, string>> = {
  [beneficiaryTypeEnum.BANK]: 'bg-blue-50 text-blue-800',
  [beneficiaryTypeEnum.SYSTEM]: 'bg-teal-50 text-teal-800',
  [beneficiaryTypeEnum.MERCHANT]: 'bg-emerald-50 text-success-strong',
  [beneficiaryTypeEnum.PARTNER]: 'bg-violet-50 text-violet-800',
  [beneficiaryTypeEnum.TAX]: 'bg-amber-50 text-warning-strong'
}

/** Ngân hàng đứng đầu — đó là phần cần tách ra để đối soát. */
const GROUP_ORDER: readonly string[] = [
  beneficiaryTypeEnum.BANK,
  beneficiaryTypeEnum.SYSTEM,
  beneficiaryTypeEnum.MERCHANT,
  beneficiaryTypeEnum.PARTNER,
  beneficiaryTypeEnum.TAX
]

const UNKNOWN_TONE = 'bg-slate-100 text-slate-700'

export const groupFeeComponentsByBeneficiary = (
  components: readonly FeeComponent[] | undefined
): FeeBeneficiaryGroup[] => {
  if (!components?.length) return []

  const buckets = new Map<string, FeeComponent[]>()
  for (const component of components) {
    const key = component.beneficiaryType || 'UNKNOWN'
    const bucket = buckets.get(key)
    if (bucket) {
      bucket.push(component)
    } else {
      buckets.set(key, [component])
    }
  }

  const known = GROUP_ORDER.filter((key) => buckets.has(key))
  const rest = [...buckets.keys()]
    .filter((key) => !GROUP_ORDER.includes(key))
    .sort()

  return [...known, ...rest].map((beneficiaryType) => ({
    beneficiaryType,
    // label: GROUP_LABEL[beneficiaryType] ?? 'Chưa xác định bên hưởng',
    tone: GROUP_TONE[beneficiaryType] ?? UNKNOWN_TONE,
    items: buckets.get(beneficiaryType) ?? []
  }))
}
