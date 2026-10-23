import { useState } from 'react'
import { ButtonComponent } from '@components/index'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  MagnifyingGlassIcon,
  ShieldCheckIcon
} from '@components/icons'
import { RefundNote } from '@pages/transaction-management/refund-management/components/RefundNote'
import { REVIEW_PANEL_ID } from '../constants/transactionReview.constant'
import { useTransactionPermissions } from '../hooks/useTransactionPermissions'
import { useTransactionSnapshot } from '../hooks/useTransactionSnapshot'
import {
  getReviewView,
  isReviewCandidate
} from '../utils/transactionReview.utils'
import { ApproveReviewDialog } from './ApproveReviewDialog'
import { MarkReviewDialog } from './MarkReviewDialog'
import { RejectReviewDialog } from './RejectReviewDialog'

interface TransactionReviewPanelProps {
  transactionCode: string
  transactionType: string
  /** Trạng thái bút toán wallet-core; lệnh đang Review vẫn hiện là PENDING/AUTHORIZED. */
  journalStatus: string
  className?: string
}

type OpenDialog = 'mark' | 'approve' | 'reject' | null

/**
 * Review lệnh nạp ngay trong chi tiết giao dịch. Nút hiện theo `allowedActions` của
 * snapshot `refresh`; người chỉ có `TRANSACTION:REVIEW` không gọi được `refresh` nên
 * chỉ được Đánh dấu Review (CẦN XÁC NHẬN BE về trải nghiệm của nhóm quyền này).
 */
export function TransactionReviewPanel({
  transactionCode,
  transactionType,
  journalStatus,
  className
}: TransactionReviewPanelProps) {
  const { canFull, canReview, username } = useTransactionPermissions()
  const { snapshot, markedBy, hasMarked, isRefreshing, refreshError, refresh } =
    useTransactionSnapshot(transactionCode)
  const [dialog, setDialog] = useState<OpenDialog>(null)

  if (!isReviewCandidate(transactionType, journalStatus)) return null
  if (!canFull && !canReview) return null

  const view = getReviewView({
    canFull,
    canReview,
    username,
    snapshot,
    markedBy
  })
  const close = () => setDialog(null)

  return (
    <section
      id={REVIEW_PANEL_ID}
      aria-label='Review lệnh nạp'
      className={className}
    >
      <div className='flex flex-col gap-3 rounded-xl border border-border bg-white p-3'>
        <div className='flex flex-wrap items-center gap-2'>
          {canFull && (
            <ButtonComponent
              htmlType='button'
              type='default'
              icon={<MagnifyingGlassIcon size={16} />}
              content='Kiểm tra trạng thái'
              loading={isRefreshing}
              onClick={() => void refresh()}
            />
          )}
          {view.showMark && (
            <ButtonComponent
              htmlType='button'
              icon={<ShieldCheckIcon size={16} />}
              content='Đánh dấu Review'
              onClick={() => setDialog('mark')}
            />
          )}
          {view.showReject && (
            <ButtonComponent
              danger
              htmlType='button'
              type='default'
              icon={<CloseCircleOutlined />}
              content='Từ chối'
              onClick={() => setDialog('reject')}
            />
          )}
          {view.showApprove && (
            <ButtonComponent
              htmlType='button'
              icon={<CheckCircleOutlined />}
              content='Duyệt'
              onClick={() => setDialog('approve')}
            />
          )}
        </div>
        <ReviewStateNote
          canFull={canFull}
          hasSnapshot={snapshot !== undefined}
          hasMarked={hasMarked}
          markedBy={markedBy}
          view={view}
          refreshError={refreshError}
        />
      </div>

      {dialog === 'mark' && (
        <MarkReviewDialog
          transactionCode={transactionCode}
          canRefresh={canFull}
          onClose={close}
        />
      )}
      {dialog === 'approve' && (
        <ApproveReviewDialog
          transactionCode={transactionCode}
          requireBankConfirmation={view.approveNeedsBank}
          canRefresh={canFull}
          onClose={close}
        />
      )}
      {dialog === 'reject' && (
        <RejectReviewDialog
          transactionCode={transactionCode}
          requireBankConfirmation={view.rejectNeedsBank}
          canRefresh={canFull}
          onClose={close}
        />
      )}
    </section>
  )
}

interface ReviewStateNoteProps {
  canFull: boolean
  hasSnapshot: boolean
  hasMarked: boolean
  markedBy: string | null | undefined
  view: ReturnType<typeof getReviewView>
  refreshError: string | null
}

function ReviewStateNote({
  canFull,
  hasSnapshot,
  hasMarked,
  markedBy,
  view,
  refreshError
}: ReviewStateNoteProps) {
  if (refreshError) return <RefundNote tone='danger'>{refreshError}</RefundNote>
  if (view.isStatusUnreadable) {
    return (
      <RefundNote tone='info'>
        {hasMarked
          ? 'Đã đánh dấu Review. Cần người khác duyệt hoặc từ chối.'
          : 'Tài khoản này chưa đọc được trạng thái chi tiết vì thiếu quyền kiểm tra lại giao dịch.'}
      </RefundNote>
    )
  }
  if (!hasSnapshot) {
    return canFull ? (
      <RefundNote tone='info'>
        Bấm Kiểm tra trạng thái để lấy các thao tác được phép từ hệ thống.
      </RefundNote>
    ) : null
  }
  if (view.isUnderReview) {
    return (
      <RefundNote
        tone='warning'
        title='Chờ review:'
      >
        khách vẫn thấy đang xử lý.
        {markedBy ? ` Đánh dấu bởi ${markedBy}.` : ''}
        {view.isMarker
          ? ' Bạn là người đánh dấu Review, cần người khác duyệt hoặc từ chối.'
          : ''}
      </RefundNote>
    )
  }
  return (
    <RefundNote
      tone='info'
      title='Đang treo:'
    >
      lệnh nạp chưa có kết quả cuối.
    </RefundNote>
  )
}
