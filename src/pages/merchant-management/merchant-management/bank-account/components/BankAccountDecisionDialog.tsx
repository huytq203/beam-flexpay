import { useState } from 'react'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  useApproveBankAccountChangeMutation,
  useRejectBankAccountChangeMutation,
  type BankAccountDto
} from '@/app/services/merchantBankAccountApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import { BankAccountChangeSummary } from './BankAccountChangeSummary'
import { BankAccountNotice } from './BankAccountNotice'
import { BankAccountSummary } from './BankAccountSummary'

export type BankAccountDecisionType = 'approve' | 'reject'

interface BankAccountDecisionDialogProps {
  type: BankAccountDecisionType
  row: BankAccountDto
  onClose: () => void
}

const approveNote = (changeType: 'UPDATE_ACCOUNT' | 'SET_DEFAULT'): string =>
  changeType === 'UPDATE_ACCOUNT'
    ? 'Phê duyệt sẽ áp dụng thông tin mới và đánh dấu tài khoản “Đã liên kết”. Hãy đối chiếu với chứng từ trước khi duyệt. Người gửi yêu cầu không được tự duyệt.'
    : 'Phê duyệt sẽ đặt tài khoản này làm mặc định và bỏ dấu mặc định của tài khoản cũ cùng cấp. Người gửi yêu cầu không được tự duyệt.'

const REJECT_NOTE =
  'Từ chối giữ nguyên tài khoản như hiện tại và cho phép gửi yêu cầu thay đổi mới.'

/** Bước checker của maker-checker: chỉ cần quyền duyệt, không cần OTP. */
export function BankAccountDecisionDialog({
  type,
  row,
  onClose
}: BankAccountDecisionDialogProps) {
  const [reason, setReason] = useState('')
  const [approve, approveState] = useApproveBankAccountChangeMutation()
  const [reject, rejectState] = useRejectBankAccountChangeMutation()
  const change = row.pendingChangeRequest
  const isApprove = type === 'approve'

  if (!change) return null

  const submit = async () => {
    const text = reason.trim()
    if (!isApprove && !text) {
      feedback.warning('Vui lòng nhập lý do từ chối')
      return
    }
    try {
      const body = { changeRequestId: change.id, reason: text || undefined }
      if (isApprove) await approve(body).unwrap()
      else await reject(body).unwrap()
      feedback.success(
        isApprove
          ? 'Đã phê duyệt yêu cầu thay đổi'
          : 'Đã từ chối yêu cầu thay đổi'
      )
      onClose()
    } catch (error) {
      feedback.error(
        getApiErrorDetail(error, 'Không thể xử lý yêu cầu thay đổi')
      )
    }
  }

  return (
    <DialogModal
      open
      title={
        isApprove
          ? 'Phê duyệt thay đổi tài khoản'
          : 'Từ chối thay đổi tài khoản'
      }
      onCancel={onClose}
      onOk={() => void submit()}
      okText={isApprove ? 'Phê duyệt' : 'Từ chối'}
      okButtonProps={{
        danger: !isApprove,
        loading: approveState.isLoading || rejectState.isLoading
      }}
    >
      <div className='mb-3 flex flex-col gap-2'>
        <BankAccountSummary row={row} />
        <BankAccountChangeSummary
          row={row}
          change={change}
        />
        <BankAccountNotice tone={isApprove ? 'warning' : 'info'}>
          {isApprove ? approveNote(change.changeType) : REJECT_NOTE}
        </BankAccountNotice>
      </div>
      <TextArea
        aria-label='Lý do'
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        maxLength={500}
        placeholder={
          isApprove ? 'Ghi chú (không bắt buộc)' : 'Nhập lý do từ chối'
        }
      />
    </DialogModal>
  )
}
