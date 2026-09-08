import { useState } from 'react'
import dayjs from 'dayjs'
import type { WithdrawalDetail } from '@services/apiJournal'
import { getWithdrawalStatusPresentation } from '@utils/withdrawal-approval'
import { formatCurrency } from '@utils/formatNumber'

interface FigureProps {
  label: string
  value: number | null | undefined
  currency: string
  emphasis?: boolean
}

/** Số tiền hiển thị nguyên chữ số, không rút gọn — xem `Design/DESIGN.md`. */
const Figure = ({ label, value, currency, emphasis }: FigureProps) => (
  <div className='flex min-w-0 flex-col gap-0.5'>
    <dt className='text-xs leading-4 text-muted-foreground'>{label}</dt>
    <dd
      className={`m-0 min-w-0 text-sm leading-5 break-words tabular-nums ${
        emphasis ? 'font-semibold text-foreground' : 'text-foreground'
      }`}
    >
      {value == null
        ? '--'
        : formatCurrency(value, { symbol: currency, position: 'after' })}
    </dd>
  </div>
)

/**
 * `failureReason` của user-wallet là chuỗi kỹ thuật thô — có cả exception và URL
 * nội bộ của cổng ngân hàng. Người đối soát cần nguyên văn làm bằng chứng, nên
 * không được cắt mất; nhưng nó cũng không được là bức tường chữ đập vào mắt
 * trước tiên. Dài thì gập lại, mở ra bằng một cú bấm.
 */
const LONG_REASON_THRESHOLD = 160

const FailureReasonText = ({ reason }: { reason: string }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = reason.length > LONG_REASON_THRESHOLD

  return (
    <>
      <p
        className={`m-0 min-w-0 text-sm leading-5 break-words text-foreground ${
          isLong && !isExpanded ? 'line-clamp-2' : ''
        }`}
      >
        {reason}
      </p>
      {isLong && (
        <button
          type='button'
          className='self-start rounded-sm text-xs leading-4 font-medium text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
          onClick={() => setIsExpanded((expanded) => !expanded)}
        >
          {isExpanded ? 'Thu gọn' : 'Xem đầy đủ'}
        </button>
      )}
    </>
  )
}

export interface WithdrawalSummaryProps {
  withdrawal: WithdrawalDetail
  /** Chi tiết lệnh rút không trả đơn vị tiền; lấy từ bút toán của màn gọi. */
  currency: string
}

/**
 * Số tiền của lệnh rút cộng dấu vết của lần quyết định gần nhất.
 *
 * Lý do lệnh dừng luôn hiển thị cùng người thao tác và thời điểm: một quyết định
 * chạm vào tiền thật mà không nêu được ai làm và vì sao là thứ `PRODUCT.md` cấm.
 */
export const WithdrawalSummary = ({
  withdrawal,
  currency
}: WithdrawalSummaryProps) => {
  const fundsLabel = getWithdrawalStatusPresentation(withdrawal.status)?.fundsLabel
  const decisionNote = withdrawal.failureReason

  return (
    <div className='flex min-w-0 flex-col gap-3'>
      <dl className='m-0 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4'>
        <Figure
          label='Số tiền chi'
          value={withdrawal.amount}
          currency={currency}
        />
        <Figure label='Phí' value={withdrawal.fee} currency={currency} />
        <Figure
          label='Tổng trừ ví'
          value={withdrawal.grossAmount}
          currency={currency}
          emphasis
        />
        {fundsLabel && (
          <div className='flex min-w-0 flex-col gap-0.5'>
            <dt className='text-xs leading-4 text-muted-foreground'>
              Tiền của khách
            </dt>
            <dd className='m-0 min-w-0 text-sm leading-5 break-words text-foreground'>
              {fundsLabel}
            </dd>
          </div>
        )}
      </dl>

      {decisionNote && (
        <div className='flex min-w-0 flex-col gap-1 border-t border-border pt-3'>
          <p className='m-0 text-xs leading-4 text-muted-foreground'>
            Lý do lệnh dừng
          </p>
          <FailureReasonText reason={decisionNote} />
          {(withdrawal.updatedBy || withdrawal.updatedAt) && (
            <p className='m-0 text-xs leading-4 text-muted-foreground'>
              {withdrawal.updatedBy ?? 'Không rõ người thao tác'}
              {withdrawal.updatedAt && (
                <>
                  {' · '}
                  <span className='tabular-nums'>
                    {dayjs(withdrawal.updatedAt).format('DD/MM/YYYY HH:mm:ss')}
                  </span>
                </>
              )}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
