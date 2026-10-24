import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { formatVnd } from '../../merchant-settlement/utils/money'
import type { SubBalanceReport } from '../types/reconciliation.types'
import { BalanceLineCard } from './BalanceLineCard'

const GRID = 'grid gap-3 md:grid-cols-2'

/** Doanh thu = khả dụng + chờ quyết toán + tổng đóng băng; chờ quyết toán không phải tiền bị giữ. */
export function BalanceReportView({ report }: { report: SubBalanceReport }) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='rounded-lg border border-border p-4'>
        <div className='text-xs text-muted-foreground'>
          {report.subCode} — {report.subName}
        </div>
        <div className='mt-1 text-sm font-medium'>Tổng doanh thu</div>
        <div className='tabular-nums text-2xl font-semibold'>
          {formatVnd(report.revenueBalance)} đ
        </div>
        <p className='mt-1 text-xs text-muted-foreground'>
          Tổng doanh thu = số dư khả dụng + chờ quyết toán + tổng đóng băng. Số
          liệu lấy từ sổ cái lúc {formatUTCToLocalDateTime(report.asOf)}.
        </p>
      </div>
      <div className={GRID}>
        <BalanceLineCard line={report.available} />
        <BalanceLineCard line={report.pending} />
      </div>
      <section
        aria-label='Các khoản đóng băng'
        className='flex flex-col gap-3'
      >
        <div className='flex flex-wrap items-baseline gap-2'>
          <h2 className='text-sm font-semibold'>Tổng đóng băng</h2>
          <span className='tabular-nums text-sm font-semibold'>
            {formatVnd(report.frozenTotal)} đ
          </span>
          <span className='text-xs text-muted-foreground'>
            gồm bốn khoản bên dưới; không gồm khoản chờ quyết toán
          </span>
        </div>
        <div className={GRID}>
          <BalanceLineCard line={report.ruleHold} />
          <BalanceLineCard line={report.orderFreeze} />
          <BalanceLineCard line={report.withdrawalInProcess} />
          <BalanceLineCard line={report.waitingEscrow} />
        </div>
      </section>
    </div>
  )
}
