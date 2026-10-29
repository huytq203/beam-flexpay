import { CardComponent } from '@components/index'
import { formatCurrency } from '@utils/formatNumber'
import {
  formatUTCToLocalDate,
  formatUTCToLocalDateTime
} from '@utils/helper-functions/date'
import {
  ESCROW_OVERDUE_ACTION_LABEL as OVERDUE_ACTION_LABEL,
  ESCROW_REQUIREMENT_MODE_LABEL as MODE_LABEL,
  ESCROW_STATE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowOverview } from '../types/merchantEscrow.types'

const yesNo = (value: boolean) => (value ? 'Có' : 'Không')

const Field = ({ label, value }: { label: string; value: string }) => (
  <div className='min-w-40'>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='text-sm font-medium tabular-nums'>{value}</dd>
  </div>
)

/**
 * Thẻ tình trạng ký quỹ của một Master.
 * `UNKNOWN` = Wallet Core không trả được số dư: số dư/thiếu/dư/% đều null và phải hiện
 * "Chưa đọc được số dư". Tuyệt đối không đổi null thành 0 ₫, vì 0 ₫ nghĩa là "chưa nạp đồng nào"
 * và sẽ khiến người dùng tưởng Master đang thiếu hết tiền.
 */
export function EscrowStandingCard({ overview }: { overview: EscrowOverview }) {
  const unknown = overview.state === 'UNKNOWN'
  const money = (value: number | null) =>
    unknown || value === null
      ? ESCROW_STATE_LABEL.UNKNOWN
      : formatCurrency(value)
  const { current, pending } = overview

  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <header className='mb-3 flex flex-wrap items-center gap-2'>
        <h2 className='font-display text-base font-semibold'>
          {overview.masterCode} - {overview.masterName}
        </h2>
        <span className='rounded-md bg-muted px-2 py-1 text-xs font-medium'>
          {ESCROW_STATE_LABEL[overview.state]}
        </span>
        {overview.overdue && (
          <span className='rounded-md bg-danger-strong/10 px-2 py-1 text-xs font-medium text-danger-strong'>
            Quá hạn
          </span>
        )}
      </header>
      {pending && (
        <div
          role='status'
          className='mb-3 rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm'
        >
          Có thay đổi đang chờ duyệt (phiên bản {pending.version})
        </div>
      )}
      <dl className='flex flex-wrap gap-x-8 gap-y-3'>
        <Field
          label='Mức yêu cầu'
          value={formatCurrency(overview.requiredAmount)}
        />
        <Field
          label='Số dư ký quỹ'
          value={money(overview.balance)}
        />
        <Field
          label='Còn thiếu'
          value={money(overview.shortfall)}
        />
        <Field
          label='Đang dư'
          value={money(overview.surplus)}
        />
        <Field
          label='Tỷ lệ đạt'
          value={
            unknown || overview.percent === null
              ? ESCROW_STATE_LABEL.UNKNOWN
              : `${overview.percent}%`
          }
        />
        <Field
          label='Hạn ký quỹ'
          value={formatUTCToLocalDate(overview.deadlineAt) || 'Chưa đặt'}
        />
        <Field
          label='Số ngày còn lại'
          value={overview.daysLeft === null ? '' : String(overview.daysLeft)}
        />
      </dl>
      {current && (
        <section
          aria-label='Cấu hình đang áp dụng'
          className='mt-4 border-t border-border pt-3'
        >
          <h3 className='mb-2 text-sm font-semibold'>
            Cấu hình đang áp dụng (phiên bản {current.version}
            {current.effectiveFrom
              ? `, hiệu lực từ ${formatUTCToLocalDateTime(current.effectiveFrom)}`
              : ''}
            )
          </h3>
          <dl className='flex flex-wrap gap-x-8 gap-y-3'>
            <Field
              label='Cách xác định mức'
              value={
                current.requirementMode
                  ? MODE_LABEL[current.requirementMode]
                  : 'Chưa cấu hình'
              }
            />
            <Field
              label='Cho phép chuyển khoản'
              value={yesNo(current.allowTransfer)}
            />
            <Field
              label='Cho phép cấn trừ vào lệnh rút'
              value={yesNo(current.allowSetoff)}
            />
            <Field
              label='Xử lý khi quá hạn'
              value={
                current.overdueAction
                  ? OVERDUE_ACTION_LABEL[current.overdueAction]
                  : 'Chưa cấu hình'
              }
            />
          </dl>
        </section>
      )}
    </CardComponent>
  )
}
