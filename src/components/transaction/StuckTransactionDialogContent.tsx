import { ButtonComponent } from '@components/index'
import { MagnifyingGlassIcon } from '@components/icons'
import { useTransactionSnapshot } from '@pages/wallet-administration/transaction-wallet/hooks/useTransactionSnapshot'
import type { BankCheck } from '@/app/schemas/transaction-review.schema'
import { StuckTransactionUpdateForm } from './StuckTransactionUpdateForm'
import type { StuckTransactionUpdateFormValues } from './StuckTransaction.schema'
import { BANK_CHECK_LABELS, getFinalActions } from './stuckTransaction.utils'

interface StuckTransactionDialogContentProps {
  transactionCode: string
  isSubmitting: boolean
  submissionError: string | null
  onSubmit: (
    values: StuckTransactionUpdateFormValues,
    optionalFields: readonly string[]
  ) => void
  onCancel: () => void
}

const BankCheckResult = ({ bankCheck }: { bankCheck: BankCheck }) => {
  const label = bankCheck.status
    ? (BANK_CHECK_LABELS[bankCheck.status] ?? bankCheck.status)
    : null
  return (
    <p className='m-0 text-sm leading-5 text-foreground'>
      {label && <span className='font-medium'>{label}</span>}
      {bankCheck.source && ` · ${bankCheck.source}`}
      {bankCheck.reference && ` · Mã tham chiếu ${bankCheck.reference}`}
      {bankCheck.detail && (
        <span className='block text-muted-foreground'>{bankCheck.detail}</span>
      )}
    </p>
  )
}

const Note = ({ children }: { children: string }) => (
  <p className='m-0 text-sm leading-5 text-muted-foreground'>{children}</p>
)

/**
 * Nội dung popup: hỏi snapshot (`refresh`) rồi dựng form theo `allowedActions`. Snapshot
 * dùng chung khoá cache với panel Review nên không phải truyền qua props.
 */
export const StuckTransactionDialogContent = ({
  transactionCode,
  isSubmitting,
  submissionError,
  onSubmit,
  onCancel
}: StuckTransactionDialogContentProps) => {
  const { snapshot, isRefreshing, refreshError, refresh } =
    useTransactionSnapshot(transactionCode)
  const actions = getFinalActions(snapshot?.allowedActions)

  return (
    <div className='flex min-w-0 flex-col gap-4 pt-2'>
      <p className='m-0 min-w-0 text-sm leading-5 break-words text-muted-foreground'>
        Giao dịch{' '}
        <span className='font-medium text-foreground'>{transactionCode}</span> ·
        Kết quả cuối không thể sửa sau khi chốt.
      </p>

      <section
        aria-label='Kết quả kiểm tra'
        className='flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3'
      >
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <h3 className='m-0 text-sm font-semibold text-foreground'>
            Kết quả kiểm tra
          </h3>
          <ButtonComponent
            htmlType='button'
            type='default'
            size='small'
            icon={<MagnifyingGlassIcon size={16} />}
            content='Kiểm tra trạng thái'
            loading={isRefreshing}
            disabled={isSubmitting}
            onClick={() => void refresh()}
          />
        </div>
        {snapshot?.bankCheck && !isRefreshing && (
          <BankCheckResult bankCheck={snapshot.bankCheck} />
        )}
        {isRefreshing && <Note>Đang kiểm tra trạng thái giao dịch...</Note>}
      </section>

      {submissionError && (
        <p
          role='alert'
          className='m-0 rounded-lg border border-danger-strong p-3 text-sm leading-5 text-danger-strong'
        >
          {submissionError}
        </p>
      )}

      {!isRefreshing && refreshError && (
        <p
          role='alert'
          className='m-0 rounded-lg border border-danger-strong p-3 text-sm leading-5 text-danger-strong'
        >
          {refreshError}
        </p>
      )}
      {!isRefreshing && !refreshError && snapshot && actions.length === 0 && (
        <Note>Giao dịch không còn thao tác cập nhật kết quả.</Note>
      )}
      {!isRefreshing && actions.length > 0 && (
        <StuckTransactionUpdateForm
          transactionCode={transactionCode}
          actions={actions}
          isSubmitting={isSubmitting}
          onSubmit={onSubmit}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}
