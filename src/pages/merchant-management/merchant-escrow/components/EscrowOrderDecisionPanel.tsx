import { useState } from 'react'
import { Can } from '@/app/permissions'
import { useAppSelector } from '@hooks/hook'
import { ButtonComponent, DialogModal, TextArea } from '@components/index'
import { CredentialFormError } from '../../merchant-gateway/key-connection/components/CredentialFormError'
import { CredentialOtpDialog } from '../../merchant-gateway/key-connection/components/CredentialOtpDialog'
import { useEscrowOrderDecision } from '../hooks/useEscrowOrderDecision'
import type { EscrowOrderView } from '../types/merchantEscrow.types'
import { EscrowOrderImpactTable } from './EscrowOrderImpactTable'

/** Ô lý do/ghi chú: chưa có giới hạn ở BE, chặn 500 ký tự như các ô lý do khác của module. */
const REASON_MAX = 500

type Dialog = 'approve' | 'reject' | 'return' | null

interface ReasonBoxProps {
  id: string
  label: string
  value: string
  error: string
  onChange: (value: string) => void
}

const ReasonBox = ({ id, label, value, error, onChange }: ReasonBoxProps) => (
  <div className='flex flex-col gap-1'>
    <label
      htmlFor={id}
      className='text-sm font-medium'
    >
      {label}
    </label>
    <TextArea
      id={id}
      rows={3}
      maxLength={REASON_MAX}
      showCount
      value={value}
      status={error ? 'error' : undefined}
      onChange={(event) => onChange(event.target.value)}
    />
    {error && (
      <p
        role='alert'
        className='text-xs text-danger-strong'
      >
        {error}
      </p>
    )}
  </div>
)

/**
 * Khối thao tác của người phê duyệt trong drawer lệnh nạp (SRS 3.6.29 mục IV). Chỉ hiện khi người xem
 * có quyền duyệt lệnh và lệnh đang Chờ phê duyệt — lệnh đã quyết định là bất biến (FR-MER-0629-07).
 */
export function EscrowOrderDecisionPanel({ view }: { view: EscrowOrderView }) {
  if (view.order.status !== 'PENDING_APPROVAL') return null
  return (
    <Can
      screen='MERCHANT_ESCROW_ORDER'
      action='approve'
    >
      <DecisionActions view={view} />
    </Can>
  )
}

function DecisionActions({ view }: { view: EscrowOrderView }) {
  const { order, impact } = view
  // `sub` của access token là UUID admin mà BE ghi vào `authorId` (AuthenticatedActorProvider).
  const currentUserId = useAppSelector((state) => state.auth.profile.jwtId)
  const [dialog, setDialog] = useState<Dialog>(null)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const close = () => {
    setDialog(null)
    setText('')
    setError('')
  }
  const {
    otp,
    approveOrder,
    rejectOrder,
    returnForEdit,
    isReturning,
    returnError
  } = useEscrowOrderDecision(order.id, close)

  const open = (next: Dialog) => {
    setText('')
    setError('')
    setDialog(next)
  }

  // STT 16, FR-MER-0629-01: người lập tự duyệt chỉ bị cảnh báo. Quyết định 08/10 tách vai trò bằng
  // phân quyền và tham số "Bắt buộc tách vai trò" chưa có, nên KHÔNG vô hiệu nút.
  const selfApproval = Boolean(
    currentUserId && order.authorId && order.authorId === currentUserId
  )
  // FR-MER-0629-04: BE đã tính sẵn điểm chặn tại thời điểm xem; duyệt lúc này chắc chắn bị từ chối,
  // nên khóa nút Duyệt để không tốn một mã OTP. Từ chối và Trả lại vẫn làm được.
  const blocked = impact.blockers.length > 0

  const submitApprove = () => {
    setDialog(null)
    void approveOrder(text)
  }
  const submitReject = () => {
    // STT 18/FR-0629-05 bắt buộc lý do; quyết định 27/10 bỏ mức tối thiểu 10 ký tự.
    if (!text.trim()) return setError('Cần nhập lý do từ chối')
    setDialog(null)
    void rejectOrder(text)
  }
  const submitReturn = async () => {
    if (!text.trim()) return setError('Cần nhập nội dung cần bổ sung')
    if (await returnForEdit(text)) close()
  }

  return (
    <section
      aria-label='Phê duyệt lệnh'
      className='flex flex-col gap-3 border-t border-border pt-3'
    >
      {selfApproval && (
        <p
          role='note'
          className='rounded-lg border border-warning/40 bg-warning/10 p-3 text-sm text-warning-strong'
        >
          Bạn là người lập lệnh này; duyệt sẽ được ghi nhận là tự duyệt (QT-06).
        </p>
      )}
      {blocked && (
        <p className='text-sm text-danger-strong'>
          Lệnh đang có điểm chặn duyệt (xem bảng tác động). Có thể từ chối hoặc
          trả lại để người lập xử lý.
        </p>
      )}
      <CredentialFormError message={otp.formError} />
      <div className='flex flex-wrap justify-end gap-2'>
        <ButtonComponent
          type='default'
          htmlType='button'
          content='Trả lại để bổ sung'
          onClick={() => open('return')}
        />
        <ButtonComponent
          type='default'
          danger
          htmlType='button'
          content='Từ chối'
          disabled={otp.isPreparing}
          onClick={() => open('reject')}
        />
        <ButtonComponent
          htmlType='button'
          content='Duyệt'
          loading={otp.isPreparing}
          disabled={blocked}
          onClick={() => open('approve')}
        />
      </div>

      <DialogModal
        open={dialog === 'approve'}
        title='Duyệt lệnh nạp ký quỹ'
        okText='Xin mã OTP và duyệt'
        zIndex={1050}
        onOk={submitApprove}
        onCancel={close}
      >
        {/* STT 17: hộp xác nhận hiện lại bảng ảnh hưởng tính tại thời điểm xem (FR-MER-0629-02). */}
        <div className='flex flex-col gap-3'>
          <EscrowOrderImpactTable impact={impact} />
          <ReasonBox
            id='escrow-approve-note'
            label='Ghi chú duyệt'
            value={text}
            error=''
            onChange={setText}
          />
        </div>
      </DialogModal>

      <DialogModal
        open={dialog === 'reject'}
        title='Từ chối lệnh nạp ký quỹ'
        okText='Xin mã OTP và từ chối'
        zIndex={1050}
        okButtonProps={{ danger: true }}
        onOk={submitReject}
        onCancel={close}
      >
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-muted-foreground'>
            Từ chối là kết thúc: phần giữ chỗ số dư Sub được hoàn lại và mã tham
            chiếu chuyển khoản được giải phóng.
          </p>
          <ReasonBox
            id='escrow-reject-reason'
            label='Lý do từ chối'
            value={text}
            error={error}
            onChange={(value) => {
              setText(value)
              setError('')
            }}
          />
        </div>
      </DialogModal>

      <DialogModal
        open={dialog === 'return'}
        title='Trả lại lệnh để bổ sung'
        okText='Trả lại'
        zIndex={1050}
        confirmLoading={isReturning}
        onOk={() => void submitReturn()}
        onCancel={close}
      >
        <div className='flex flex-col gap-3'>
          <p className='text-sm text-muted-foreground'>
            Lệnh quay về người lập để sửa và gửi lại; phần giữ chỗ và mã tham
            chiếu VẪN được giữ (STT 19).
          </p>
          <ReasonBox
            id='escrow-return-reason'
            label='Nội dung cần bổ sung'
            value={text}
            error={error}
            onChange={(value) => {
              setText(value)
              setError('')
            }}
          />
          <CredentialFormError message={returnError} />
        </div>
      </DialogModal>

      <CredentialOtpDialog otp={otp} />
    </section>
  )
}
