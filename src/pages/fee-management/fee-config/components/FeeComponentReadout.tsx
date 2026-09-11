import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import { formatFeeLimit, formatTierRange } from '@utils/fee-format'
import {
  getTierStart,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import {
  CALCULATION_METHOD_LABEL,
  describeFormula
} from '../utils/feeComponentSummary'

interface FeeComponentReadoutProps {
  component: FeeComponentFormValues
}

const HEAD =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

const Fact = ({ label, value }: { label: string; value: string }) => (
  <div className='flex flex-col gap-0.5'>
    <span className={HEAD}>{label}</span>
    <span className='text-[13px] tabular-nums text-foreground'>{value}</span>
  </div>
)

/**
 * Toàn bộ cấu hình của một thành phần phí ở dạng chỉ đọc.
 *
 * Dùng chung cho thẻ trong danh sách và cho phần xem trước cơ sở tính, để hai
 * chỗ không bao giờ mô tả cùng một thành phần theo hai kiểu khác nhau.
 */
export const FeeComponentReadout = ({
  component
}: FeeComponentReadoutProps) => {
  const tiered = usesTiers(component.calculationMethod)

  const basis =
    component.baseOn === 'AMOUNT'
      ? 'Số tiền giao dịch'
      : getFeeLabel(
          component.baseComponentType,
          COMPONENT_TYPE_LABELS,
          'Thành phần khác'
        )

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-wrap gap-x-8 gap-y-3'>
        <Fact
          label='Công thức tính'
          value={
            CALCULATION_METHOD_LABEL[component.calculationMethod] ??
            component.calculationMethod
          }
        />
        <Fact label='Tính trên' value={basis} />
        {!tiered && <Fact label='Mức phí' value={describeFormula(component)} />}
        <Fact label='Sàn' value={formatFeeLimit(component.minFee)} />
        <Fact label='Trần' value={formatFeeLimit(component.maxFee)} />
      </div>

      {tiered && (
        <div className='overflow-x-auto rounded-lg border border-border'>
          <table className='w-full min-w-[420px] border-collapse'>
            <thead>
              <tr className='bg-muted'>
                <th className={`${HEAD} px-3 py-2 text-left`}>Khoảng</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Công thức</th>
                <th className={`${HEAD} px-3 py-2 text-left`}>Sàn · Trần</th>
              </tr>
            </thead>
            <tbody>
              {component.tiers.map((tier, index) => (
                <tr key={index} className='border-t border-border'>
                  <td className='whitespace-nowrap px-3 py-2 text-[13px] tabular-nums text-foreground'>
                    {formatTierRange(
                      getTierStart(component.tiers, index),
                      tier.maxValue
                    )}
                  </td>
                  <td className='px-3 py-2 text-[13px] tabular-nums text-foreground'>
                    {describeFormula({
                      ...component,
                      calculationMethod: 'DIRECT',
                      tiers: [],
                      percentage: tier.percentage,
                      fixedAmount: tier.fixedAmount
                    })}
                  </td>
                  <td className='px-3 py-2 text-[13px] tabular-nums text-muted-foreground'>
                    {formatFeeLimit(tier.minFee)} · {formatFeeLimit(tier.maxFee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
