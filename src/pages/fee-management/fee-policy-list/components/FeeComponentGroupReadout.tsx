import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import {
  BENEFICIARY_TYPE_LABEL,
  PAYER_TYPE_LABEL
} from '@pages/fee-management/fee-config/constants/feeConfigFields'
import type { FeeComponentFormValues } from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import {
  CALCULATION_METHOD_LABEL,
  describeFormula
} from '@pages/fee-management/fee-config/utils/feeComponentSummary'
import { formatFeeLimit } from '@utils/fee-format'

interface FeeComponentGroupReadoutProps {
  /** Từ hai thành phần trở lên, cùng loại phí, công thức và cơ sở tính. */
  members: readonly FeeComponentFormValues[]
  /** Ẩn ô "Tính trên" khi nơi dùng đã có dòng công thức riêng nêu cơ sở tính. */
  hideBasis?: boolean
}

const HEAD =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

const label = (value: string, map: Readonly<Record<string, string>>): string =>
  map[value] ?? value ?? '—'

/**
 * Một loại phí do nhiều bên chịu: công thức và cơ sở tính chỉ hiện một lần, mỗi bên chịu một dòng
 * với mức phí, sàn và trần riêng.
 */
export const FeeComponentGroupReadout = ({
  members,
  hideBasis = false
}: FeeComponentGroupReadoutProps) => {
  const [first] = members
  const basis =
    first.baseOn === 'AMOUNT'
      ? 'Số tiền giao dịch'
      : getFeeLabel(
          first.baseComponentType,
          COMPONENT_TYPE_LABELS,
          'Thành phần khác'
        )

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap gap-x-8 gap-y-3'>
        <div className='flex flex-col gap-0.5'>
          <span className={HEAD}>Công thức tính</span>
          <span className='text-[13px] text-foreground'>
            {CALCULATION_METHOD_LABEL[first.calculationMethod] ??
              first.calculationMethod}
          </span>
        </div>
        {!hideBasis && (
          <div className='flex flex-col gap-0.5'>
            <span className={HEAD}>Tính trên</span>
            <span className='text-[13px] text-foreground'>{basis}</span>
          </div>
        )}
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-[13px]'>
          <thead>
            <tr className='text-left'>
              {[
                'Người chịu phí',
                'Người hưởng phí',
                'Mức phí',
                'Sàn',
                'Trần'
              ].map((heading) => (
                <th
                  key={heading}
                  className={`${HEAD} py-1.5 pr-6`}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr
                key={member.key}
                className='border-t border-border'
              >
                <td className='py-1.5 pr-6'>
                  {label(member.payerType, PAYER_TYPE_LABEL)}
                </td>
                <td className='py-1.5 pr-6'>
                  {label(member.beneficiaryType, BENEFICIARY_TYPE_LABEL)}
                </td>
                <td className='py-1.5 pr-6 tabular-nums'>
                  {describeFormula(member)}
                </td>
                <td className='py-1.5 pr-6 tabular-nums'>
                  {formatFeeLimit(member.minFee)}
                </td>
                <td className='py-1.5 pr-6 tabular-nums'>
                  {formatFeeLimit(member.maxFee)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
