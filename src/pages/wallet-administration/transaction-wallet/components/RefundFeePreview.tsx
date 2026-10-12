import type { ReactNode } from 'react'
import { cn } from '@lib/utils/cn'
import { RefundNote } from '@pages/transaction-management/refund-management/components/RefundNote'
import { formatVnd } from '@pages/transaction-management/refund-management/utils/refund.utils'
import type { RefundPreview } from '@pages/transaction-management/refund-management/schemas/refund.schema'
import type { RefundFeePreviewState } from '../hooks/useRefundFeePreview'

interface FeeRowProps {
  label: string
  value: string
  tone?: 'plus' | 'minus'
  strong?: boolean
}

const TONE_CLASS = {
  plus: 'text-success-strong',
  minus: 'text-danger-strong'
} as const

function FeeRow({ label, value, tone, strong }: FeeRowProps) {
  return (
    <div className='flex items-baseline justify-between gap-3'>
      <dt className={cn(strong ? 'font-semibold' : 'text-muted-foreground')}>
        {label}
      </dt>
      <dd
        className={cn(
          'text-right tabular-nums',
          strong && 'font-semibold',
          tone && TONE_CLASS[tone]
        )}
      >
        {value}
      </dd>
    </div>
  )
}

const hasAmount = (value?: number | null): value is number =>
  value !== null && value !== undefined && value !== 0

function PreviewDetails({ preview }: { preview: RefundPreview }) {
  const allocations = preview.componentAllocations ?? []
  return (
    <details className='text-xs'>
      <summary className='cursor-pointer text-muted-foreground'>
        Xem chi tiết
      </summary>
      <dl className='mt-2 flex flex-col gap-1'>
        <FeeRow
          label='Phí giao dịch gốc phía nhận'
          value={formatVnd(preview.originalReceiverFee)}
        />
        <FeeRow
          label='Hoàn phí phía nhận'
          value={formatVnd(preview.receiverFeeReversal)}
        />
        <FeeRow
          label='Phí xử lý phía nhận'
          value={formatVnd(preview.receiverProcessingFee)}
        />
        <FeeRow
          label='Bên trả tiền (merchant/quỹ) bị trừ'
          value={formatVnd(preview.netDebit)}
        />
      </dl>
      {allocations.length > 0 && (
        <ul className='mt-2 flex flex-col gap-1'>
          {allocations.map((item) => (
            <li
              key={item.componentId}
              className='flex justify-between gap-3'
            >
              <span className='text-muted-foreground'>
                {item.componentType ?? 'Thành phần phí'}
                {item.payerType ? ` (${item.payerType})` : ''}
              </span>
              <span className='text-right tabular-nums'>
                {formatVnd(item.reversedFee)} / {formatVnd(item.originalFee)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </details>
  )
}

function PreviewData({ preview }: { preview: RefundPreview }) {
  return (
    <div className='flex flex-col gap-2'>
      <dl className='flex flex-col gap-1'>
        <FeeRow
          label='Phí giao dịch gốc'
          value={formatVnd(preview.originalSenderFee ?? 0)}
        />
        <FeeRow
          label='Hoàn phí giao dịch gốc'
          value={`+${formatVnd(preview.senderFeeReversal ?? 0)}`}
          tone='plus'
        />
        {hasAmount(preview.senderProcessingFee) && (
          <FeeRow
            label='Phí xử lý hoàn tiền'
            value={`−${formatVnd(preview.senderProcessingFee)}`}
            tone='minus'
          />
        )}
        <FeeRow
          label='Khách thực nhận'
          value={formatVnd(preview.netCredit)}
          strong
        />
      </dl>
      <PreviewDetails preview={preview} />
    </div>
  )
}

function renderBody(state: RefundFeePreviewState): ReactNode {
  if (state.errorMessage) {
    return <RefundNote tone='danger'>{state.errorMessage}</RefundNote>
  }
  if (state.isIdle) {
    return (
      <p className='text-muted-foreground'>
        Nhập số tiền hoàn để xem phí hoàn tiền.
      </p>
    )
  }
  if (state.isLoading || !state.preview) {
    return <p className='text-muted-foreground'>Đang tính phí hoàn tiền...</p>
  }
  return <PreviewData preview={state.preview} />
}

export function RefundFeePreview({ state }: { state: RefundFeePreviewState }) {
  return (
    <section
      aria-label='Phí hoàn tiền'
      aria-busy={state.isStale}
      className='rounded-xl border border-border p-3 text-sm'
    >
      <h3 className='mb-2 font-medium'>Phí hoàn tiền</h3>
      <div className={cn(state.isStale && 'opacity-50 transition-opacity')}>
        {renderBody(state)}
      </div>
    </section>
  )
}

/** Gợi ý dưới ô số tiền; chưa có số xem trước thì giữ câu cũ. */
export function RefundableHint({ preview }: { preview?: RefundPreview }) {
  const refundable = preview?.refundableAmount
  return (
    <p className='-mt-2 text-xs text-muted-foreground'>
      {refundable === null || refundable === undefined
        ? 'Hệ thống kiểm tra số còn được hoàn khi gửi yêu cầu.'
        : `Số tiền còn được hoàn: ${formatVnd(refundable)}`}
    </p>
  )
}
