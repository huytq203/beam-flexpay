import { formatCurrency } from '@utils/formatNumber'
import type { EscrowOrderImpact } from '../types/merchantEscrow.types'

const money = (value: number | null | undefined) =>
  value === null || value === undefined ? '—' : formatCurrency(value)

/** `dt` và `dd` liền nhau để trình đọc màn hình và test đọc cặp nhãn–giá trị. */
const Field = ({ label, value }: { label: string; value: string }) => (
  <div className='flex justify-between gap-4 border-b border-border py-1.5 text-sm last:border-b-0'>
    <dt className='text-muted-foreground'>{label}</dt>
    <dd className='text-right font-medium break-all tabular-nums'>{value}</dd>
  </div>
)

/** Số liệu BE tính lại tại thời điểm xem (FR-MER-0629-02), giống nội dung người duyệt thấy. */
export function EscrowOrderImpactTable({
  impact
}: {
  impact: EscrowOrderImpact
}) {
  return (
    <section className='flex flex-col gap-2'>
      <h3 className='text-sm font-semibold'>Tác động nếu được duyệt (tính lại lúc xem)</h3>
      <dl>
        <Field
          label='Mức yêu cầu'
          value={money(impact.requiredAmount)}
        />
        <Field
          label='Số dư ký quỹ trước duyệt'
          value={money(impact.balanceBefore)}
        />
        <Field
          label='Số dư ký quỹ sau duyệt'
          value={money(impact.balanceAfter)}
        />
        <Field
          label='Phần còn thiếu sau duyệt'
          value={money(impact.shortfallAfter)}
        />
        <Field
          label='Ký quỹ dư sau duyệt'
          value={money(impact.surplusAfter)}
        />
      </dl>
      {impact.blockers.length > 0 && (
        <ul className='list-disc rounded-md bg-danger/10 py-2 pr-2 pl-6 text-sm text-danger-strong'>
          {impact.blockers.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      {impact.warnings.length > 0 && (
        <ul className='list-disc rounded-md bg-warning/10 py-2 pr-2 pl-6 text-sm text-warning-strong'>
          {impact.warnings.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
