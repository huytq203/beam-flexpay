import { useState } from 'react'
import {
  ButtonComponent,
  DialogModal,
  ReasonDialog,
  TooltipComponent
} from '@components/index'
import {
  ArrowCounterClockwiseIcon,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@components/icons'
import { ManualPayoutForm } from '@components/payout/ManualPayoutForm'
import { ManualPayoutOutcome } from '@components/payout/manualPayout.utils'
import { PERMISSION, useAccess } from '@/app/permissions'
import { cn } from '@/lib/utils/cn'
import {
  PayoutMode,
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
/** Lệnh chi hoàn tiền ra ngân hàng: duyệt chi ở đây như lệnh rút (Bước 3, 30/10). */
const REFUND_BANK_PAYOUT = 'REFUND_BANK_PAYOUT'
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
  // Kết quả chi thủ công đang mở dialog chốt; `null` khi đóng.
  const [manualOutcome, setManualOutcome] =
    useState<ManualPayoutOutcome | null>(null)
  const [manualError, setManualError] = useState<string | null>(null)
  const { has } = useAccess()
  const code = transactionCode ?? ''
  const isRefundPayout = transactionType === REFUND_BANK_PAYOUT
  const isWithdrawal = transactionType === CASH_OUT || isRefundPayout

  const { withdrawal, status, isLoading, isFetching, isError, refetch } =
    useWithdrawalStatus(code, !isWithdrawal)
  const {
    approve,
    reject,
    confirmManualPayout,
    isApproving,
    isRejecting,
    isConfirmingManual,
    isDeciding
  } = useWithdrawalDecision(code)

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
  // Lệnh chi hoàn: kế toán có quyền duyệt chi (PAYOUT:APPROVE) thao tác được như ở màn Hoàn tiền trước đây
  // (chốt 30/10); lệnh rút thường vẫn chỉ EWALLET:FULL.
  const canAct =
    has(PERMISSION.EWALLET_FULL) ||
    (isRefundPayout && has(PERMISSION.PAYOUT_APPROVE))
  const canDecide = isPending && canAct
  // Chỉ đọc cờ BE trả về, không tự suy từ trạng thái/ngân hàng (chốt 28/10).
  // Quyền khớp nút "Xử lý chi tiền" vì cùng gọi `update-status`.
  // Chỉ lệnh chi THỦ CÔNG chốt tay ở khối này. Lệnh API bị treo (BE cũng báo awaitingManualConfirmation) chốt qua
  // nút "Xử lý" giao dịch treo như lệnh rút thường — không để hai lối cho cùng một thao tác.
  const canConfirmManual =
    withdrawal.awaitingManualConfirmation === true &&
    withdrawal.payoutMode === PayoutMode.MANUAL &&
    canAct
  const isApiSettling =
    withdrawal.payoutMode === PayoutMode.API &&
    withdrawal.awaitingManualConfirmation !== true &&
    isWithdrawalSettling(status)
  const openManual = (outcome: ManualPayoutOutcome) => {
    setManualError(null)
    setManualOutcome(outcome)
  }
  const closeManual = () => {
    if (isConfirmingManual) return
    setManualOutcome(null)
    setManualError(null)
  }
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
                {/* Chế độ chi do BE trả (không tự suy): API thì duyệt xong hệ thống gọi ngân hàng ngay,
                    thủ công thì sau khi duyệt kế toán chuyển khoản ngoài rồi chốt Chi thành công/thất bại. */}
                {isRefundPayout && withdrawal.payoutMode && (
                  <TooltipComponent
                    title={
                      withdrawal.payoutMode === PayoutMode.API
                        ? 'Duyệt xong hệ thống gọi ngân hàng chi ngay và tự cập nhật kết quả.'
                        : 'Ngân hàng chưa có API: duyệt xong chuyển khoản ngoài rồi cập nhật Chi thành công hoặc Chi thất bại.'
                    }
                  >
                    <span className='rounded-sm border border-border px-2 py-0.5 text-xs leading-5 text-muted-foreground'>
                      {withdrawal.payoutMode === PayoutMode.API
                        ? 'Duyệt API'
                        : 'Duyệt thủ công'}
                    </span>
                  </TooltipComponent>
                )}
                <ButtonComponent
                  htmlType='button'
                  type='primary'
                  content={isRefundPayout ? 'Duyệt chi' : 'Duyệt'}
                  icon={<CheckCircleOutlined />}
                  className='pointer-coarse:h-11!'
                  loading={isApproving}
                  disabled={isDeciding}
                  onClick={() => setOpenDecision('approve')}
                />
              </>
            )}
            {canConfirmManual && (
              <>
                <ButtonComponent
                  htmlType='button'
                  type='primary'
                  danger
                  content='Chi thất bại'
                  icon={<CloseCircleOutlined />}
                  className='pointer-coarse:h-11!'
                  disabled={isDeciding}
                  onClick={() => openManual(ManualPayoutOutcome.FAILED)}
                />
                <ButtonComponent
                  htmlType='button'
                  type='primary'
                  content='Chi thành công'
                  icon={<CheckCircleOutlined />}
                  className='pointer-coarse:h-11!'
                  disabled={isDeciding}
                  onClick={() => openManual(ManualPayoutOutcome.SUCCESS)}
                />
              </>
            )}
          </div>
        </div>

        {canConfirmManual && (
          <p className='m-0 max-w-[68ch] min-w-0 text-[13px] leading-5 break-words text-foreground'>
            Ngân hàng thụ hưởng chưa có kết nối API: hệ thống không tự chi. Hãy
            chuyển khoản tay rồi chốt kết quả bằng Chi thành công hoặc Chi thất
            bại.
          </p>
        )}
        {isApiSettling && (
          <p className='m-0 max-w-[68ch] min-w-0 text-[13px] leading-5 break-words text-muted-foreground'>
            Hệ thống đang chi qua ngân hàng, không cần chốt tay.
          </p>
        )}

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
        title={
          isRefundPayout ? 'Duyệt chi lệnh hoàn tiền' : 'Duyệt lệnh rút vượt ngưỡng'
        }
        description={
          isRefundPayout && withdrawal.payoutMode !== PayoutMode.API
            ? `Duyệt xong hãy chuyển ${grossLabel} cho khách ngoài hệ thống rồi cập nhật kết quả. Thao tác này không hoàn tác được.`
            : `Duyệt xong hệ thống sẽ chi ${grossLabel} cho khách. Thao tác này không hoàn tác được.`
        }
        label='Lý do duyệt'
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
        title={isRefundPayout ? 'Từ chối chi lệnh hoàn tiền' : 'Từ chối lệnh rút'}
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

      <DialogModal
        open={manualOutcome !== null}
        title={
          manualOutcome === ManualPayoutOutcome.FAILED
            ? 'Xác nhận chi thất bại'
            : 'Xác nhận chi thành công'
        }
        footer={null}
        width={{ xs: '100%', sm: 560 }}
        closable={{ 'aria-label': 'Đóng' }}
        destroyOnHidden
        onOk={closeManual}
        onCancel={closeManual}
      >
        {manualOutcome && (
          <ManualPayoutForm
            outcome={manualOutcome}
            receiptTransactionCode={code}
            isSubmitting={isConfirmingManual}
            error={manualError}
            consequence={
              manualOutcome === ManualPayoutOutcome.SUCCESS
                ? `Xác nhận đã chuyển khoản tay ${grossLabel} cho khách. Hệ thống ghi bút toán vào sổ cái; thao tác này không hoàn tác được.`
                : 'Xác nhận chuyển khoản tay không thành. Toàn bộ tiền bị giữ, gồm cả phí, sẽ được trả về ví khách.'
            }
            onSubmit={(values) => {
              setManualError(null)
              void confirmManualPayout(manualOutcome, values).then((error) => {
                if (error) setManualError(error)
                else setManualOutcome(null)
              })
            }}
            onCancel={closeManual}
          />
        )}
      </DialogModal>
    </>
  )
}
