import { useState } from 'react'
import { ButtonComponent, ReasonDialog } from '@components/index'
import {
  ArrowCounterClockwiseIcon,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@components/icons'
import { PERMISSION, useAccess } from '@/app/permissions'
import { cn } from '@/lib/utils/cn'
import {
  WITHDRAWAL_NOTE_MAX_LENGTH,
  WITHDRAWAL_NOTE_MIN_LENGTH,
  WITHDRAWAL_REASON_MAX_LENGTH,
  WITHDRAWAL_REASON_MIN_LENGTH
} from '@type/withdrawalApproval.type'
import {
  getWithdrawalStatusPresentation,
  isWithdrawalPendingApproval,
  isWithdrawalSettling
} from '@utils/withdrawal-approval'
import { formatCurrency } from '@utils/formatNumber'
import { WithdrawalStatusTag } from './WithdrawalStatusTag'
import { WithdrawalSummary } from './WithdrawalSummary'
import { useWithdrawalDecision } from './useWithdrawalDecision'
import { useWithdrawalStatus } from './useWithdrawalStatus'

const CASH_OUT = 'CASH_OUT'
const SHELL = 'rounded-lg border border-border bg-background p-4'

export interface WithdrawalDecisionPanelProps {
  transactionCode?: string | null
  /** Panel chỉ áp dụng cho lệnh rút; loại giao dịch khác không render gì. */
  transactionType?: string | null
  /** Đơn vị tiền lấy từ bút toán — API lệnh rút không trả trường này. */
  currency?: string
  className?: string
}

/**
 * Khối trạng thái + quyết định của một lệnh rút vượt ngưỡng.
 *
 * Tự đọc trạng thái từ user-wallet thay vì nhận qua prop, vì trạng thái bút
 * toán mà màn giao dịch đang hiển thị không nói được lệnh có đang chờ duyệt hay
 * không. Dùng chung cho màn chi tiết giao dịch và modal lịch sử rút tiền.
 */
export const WithdrawalDecisionPanel = ({
  transactionCode,
  transactionType,
  currency = 'VND',
  className
}: WithdrawalDecisionPanelProps) => {
  const [openDecision, setOpenDecision] = useState<'approve' | 'reject' | null>(
    null
  )
  const { has } = useAccess()
  const code = transactionCode ?? ''
  const isWithdrawal = transactionType === CASH_OUT

  const { withdrawal, status, isLoading, isFetching, isError, refetch } =
    useWithdrawalStatus(code, !isWithdrawal)
  const { approve, reject, isApproving, isRejecting, isDeciding } =
    useWithdrawalDecision(code)

  if (!isWithdrawal || !code) return null

  if (isLoading) {
    return (
      <div className={cn(SHELL, 'flex flex-col gap-3', className)}>
        <div className='h-5 w-48 animate-pulse rounded-sm bg-muted' />
        <div className='h-4 w-full max-w-lg animate-pulse rounded-sm bg-muted' />
      </div>
    )
  }

  if (isError) {
    return (
      <div
        className={cn(
          SHELL,
          'flex flex-wrap items-center justify-between gap-3',
          className
        )}
      >
        <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-danger-strong'>
          Không đọc được trạng thái lệnh rút. Chưa thể biết lệnh có đang chờ
          duyệt hay không.
        </p>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Thử lại'
          icon={<ArrowCounterClockwiseIcon size={16} />}
          loading={isFetching}
          onClick={refetch}
        />
      </div>
    )
  }

  // BE chưa trả `status` (bản deploy cũ) — không đoán, cũng không chiếm chỗ.
  if (!withdrawal || !status) return null

  const presentation = getWithdrawalStatusPresentation(status)
  const isPending = isWithdrawalPendingApproval(status)
  const canDecide = isPending && has(PERMISSION.EWALLET_FULL)
  const grossLabel =
    withdrawal.grossAmount == null
      ? 'toàn bộ số tiền của lệnh'
      : formatCurrency(withdrawal.grossAmount, {
          symbol: currency,
          position: 'after'
        })

  return (
    <>
      <section className={cn(SHELL, 'flex flex-col gap-4', className)}>
        <div className='flex flex-wrap items-start justify-between gap-x-4 gap-y-3'>
          <div className='flex min-w-0 flex-col gap-1.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='m-0 text-[15px] leading-5 font-semibold text-foreground'>
                Lệnh rút tiền
              </h3>
              <WithdrawalStatusTag status={status} />
            </div>
            {presentation && (
              <p className='m-0 max-w-[68ch] min-w-0 text-[13px] leading-5 break-words text-muted-foreground'>
                {presentation.guidance}
              </p>
            )}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <ButtonComponent
              htmlType='button'
              type='default'
              aria-label='Tải lại trạng thái lệnh rút'
              content='Tải lại'
              icon={<ArrowCounterClockwiseIcon size={16} />}
              className='pointer-coarse:h-11!'
              loading={isFetching}
              disabled={isDeciding}
              onClick={refetch}
            />
            {canDecide && (
              <>
                <ButtonComponent
                  htmlType='button'
                  type='primary'
                  danger
                  content='Từ chối'
                  icon={<CloseCircleOutlined />}
                  className='pointer-coarse:h-11!'
                  loading={isRejecting}
                  disabled={isDeciding}
                  onClick={() => setOpenDecision('reject')}
                />
                <ButtonComponent
                  htmlType='button'
                  type='primary'
                  content='Duyệt'
                  icon={<CheckCircleOutlined />}
                  className='pointer-coarse:h-11!'
                  loading={isApproving}
                  disabled={isDeciding}
                  onClick={() => setOpenDecision('approve')}
                />
              </>
            )}
          </div>
        </div>

        <WithdrawalSummary
          withdrawal={withdrawal}
          currency={currency}
        />

        {isWithdrawalSettling(status) && (
          <p
            aria-live='polite'
            className='m-0 min-w-0 border-t border-border pt-3 text-xs leading-4 break-words text-muted-foreground'
          >
            Bấm Tải lại để xem trạng thái mới nhất.
          </p>
        )}
      </section>

      <ReasonDialog
        open={openDecision === 'approve'}
        title='Duyệt lệnh rút vượt ngưỡng'
        description={`Duyệt xong hệ thống sẽ chi ${grossLabel} cho khách. Thao tác này không hoàn tác được.`}
        label='Căn cứ duyệt'
        hint={`${WITHDRAWAL_NOTE_MIN_LENGTH}–${WITHDRAWAL_NOTE_MAX_LENGTH} ký tự, lưu vào audit log`}
        placeholder='Ví dụ: đã đối chiếu hồ sơ khách hàng và nguồn tiền, đồng ý chi'
        okText='Xác nhận duyệt'
        minLength={WITHDRAWAL_NOTE_MIN_LENGTH}
        maxLength={WITHDRAWAL_NOTE_MAX_LENGTH}
        confirmLoading={isApproving}
        onConfirm={(note) => {
          void approve(note).then((done) => done && setOpenDecision(null))
        }}
        onCancel={() => setOpenDecision(null)}
      />

      <ReasonDialog
        open={openDecision === 'reject'}
        title='Từ chối lệnh rút'
        description='Toàn bộ tiền bị giữ, gồm cả phí, sẽ được trả về ví khách ngay.'
        label='Lý do từ chối'
        hint={`Tối đa ${WITHDRAWAL_REASON_MAX_LENGTH} ký tự, hiển thị được với khách`}
        placeholder='Ví dụ: tài khoản nhận không khớp tên chủ thẻ'
        okText='Xác nhận từ chối'
        danger
        minLength={WITHDRAWAL_REASON_MIN_LENGTH}
        maxLength={WITHDRAWAL_REASON_MAX_LENGTH}
        confirmLoading={isRejecting}
        onConfirm={(reason) => {
          void reject(reason).then((done) => done && setOpenDecision(null))
        }}
        onCancel={() => setOpenDecision(null)}
      />
    </>
  )
}
