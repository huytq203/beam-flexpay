import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import {
  CalculationMethod,
  usesTiers,
  type FeeComponentFormValues
} from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import {
  getAmountBaseLabel,
  isAmountBase
} from '@pages/fee-management/fee-config/utils/feeComponentBaseOptions'
import { formatFeeNumber } from '@utils/fee-format'
import type { ReadoutGroup } from './groupReadoutComponents'

export interface BasisLink {
  label: string
  /** Số thứ tự của thẻ trong luồng đang xem; vắng khi thành phần không nằm trong luồng. */
  index?: number
}

export type FeeBasisBase =
  | { kind: 'AMOUNT'; label: string }
  | ({ kind: 'COMPONENT' } & BasisLink)

/** Vế phải của "Phí = mức × cơ sở + phần cố định", đã định dạng sẵn để hiển thị. */
export interface FeeBasisModel {
  free: boolean
  /** Phần nhân với cơ sở tính; vắng khi chỉ thu một khoản cố định. */
  rate?: string
  /** Khoản cố định cộng thêm, không phụ thuộc cơ sở tính. */
  fixed?: string
  base: FeeBasisBase
  /** Các thẻ lấy chính loại phí này làm cơ sở tính. */
  dependents: BasisLink[]
}

const AMOUNT_LABEL = 'Số tiền giao dịch'

const labelOf = (type: string | null | undefined): string =>
  getFeeLabel(type, COMPONENT_TYPE_LABELS, 'Thành phần khác')

const indexOf = (
  groups: readonly ReadoutGroup[],
  type: string | null | undefined
): number | undefined => {
  const position = groups.findIndex((group) => group.componentType === type)
  return position === -1 ? undefined : position + 1
}

const describeRate = (
  members: readonly FeeComponentFormValues[]
): string | undefined => {
  const [first] = members
  if (usesTiers(first.calculationMethod))
    return `Biểu phí ${first.tiers.length} bậc`
  const rates = new Set(members.map((member) => member.percentage ?? 0))
  if (rates.size > 1) return 'Mức phí từng bên'
  const [rate] = rates
  return rate > 0 ? `${formatFeeNumber(rate)}%` : undefined
}

const describeFixed = (
  members: readonly FeeComponentFormValues[]
): string | undefined => {
  const [first] = members
  if (usesTiers(first.calculationMethod)) return undefined
  const amounts = new Set(members.map((member) => member.fixedAmount ?? 0))
  if (amounts.size > 1) return 'khoản cố định từng bên'
  const [amount] = amounts
  return amount > 0 ? `${formatFeeNumber(amount)} đ` : undefined
}

/**
 * Mô tả cách tính của một thẻ phí dưới dạng phép tính đọc được: VAT = 2% × Phí hoàn tiền. Người
 * vận hành thấy ngay phí tính trên số tiền giao dịch hay trên một phí khác, và phí nào phụ thuộc
 * vào phí này, thay vì tự ghép từ các ô rời.
 */
export const buildFeeBasis = (
  group: ReadoutGroup,
  groups: readonly ReadoutGroup[]
): FeeBasisModel => {
  const [first] = group.members
  const base: FeeBasisBase =
    isAmountBase(first.baseOn)
      ? { kind: 'AMOUNT', label: getAmountBaseLabel(first.baseOn) ?? AMOUNT_LABEL }
      : {
          kind: 'COMPONENT',
          label: labelOf(first.baseComponentType),
          ...(indexOf(groups, first.baseComponentType) === undefined
            ? {}
            : { index: indexOf(groups, first.baseComponentType) })
        }
  const dependents = groups
    .map((other, position) => ({ other, index: position + 1 }))
    .filter(
      ({ other }) =>
        other !== group &&
        !isAmountBase(other.members[0].baseOn) &&
        other.members[0].baseComponentType === group.componentType
    )
    .map(({ other, index }) => ({ label: labelOf(other.componentType), index }))

  const free = first.calculationMethod === CalculationMethod.FREE
  const rate = free ? undefined : describeRate(group.members)
  const fixed = free ? undefined : describeFixed(group.members)
  return {
    free: free || (!rate && !fixed),
    ...(rate ? { rate } : {}),
    ...(fixed ? { fixed } : {}),
    base,
    dependents
  }
}
