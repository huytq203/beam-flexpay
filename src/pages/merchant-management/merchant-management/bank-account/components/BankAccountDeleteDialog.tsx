import { useState } from 'react'
import {
  useDeleteBankAccountMutation,
  type BankAccountDto
} from '@/app/services/merchantBankAccountApi'
import { DialogModal, TextArea, feedback } from '@components/index'
import { deleteErrorMessage } from '../utils/bankAccountErrors'
import { BankAccountNotice } from './BankAccountNotice'
import { BankAccountSummary } from './BankAccountSummary'

interface BankAccountDeleteDialogProps {
  row: BankAccountDto
  onClose: () => void
}

/** Xóa hẳn chỉ dành cho tài khoản chưa từng dùng; tài khoản đã dùng thì Ngừng. */
export function BankAccountDeleteDialog({
  row,
  onClose
}: BankAccountDeleteDialogProps) {
  const [reason, setReason] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [remove, state] = useDeleteBankAccountMutation()

  const submit = async () => {
    setErrorMessage(null)
    try {
      await remove({ id: row.id, reason: reason.trim() || undefined }).unwrap()
      feedback.success('Đã xóa tài khoản ngân hàng')
      onClose()
    } catch (error) {
      const message = deleteErrorMessage(error)
      setErrorMessage(message)
      feedback.error(message)
    }
  }

  return (
    <DialogModal
      open
      title='Xóa tài khoản ngân hàng'
      onCancel={onClose}
      onOk={() => void submit()}
      okText='Xóa'
      okButtonProps={{ danger: true, loading: state.isLoading }}
    >
      <div className='mb-3 flex flex-col gap-2'>
        <BankAccountSummary row={row} />
        <BankAccountNotice tone='warning'>
          Chỉ xóa được tài khoản chưa từng phát sinh giao dịch, lệnh rút, quyết
          toán hoặc lịch sử thay đổi. Tài khoản đã sử dụng hãy chuyển sang
          “Không hoạt động” trong Sửa để ngừng dùng.
        </BankAccountNotice>
        {errorMessage && (
          <p
            role='alert'
            className='rounded-md border border-danger-strong/30 bg-danger/5 px-3 py-2 text-sm text-danger-strong'
          >
            {errorMessage}
          </p>
        )}
      </div>
      <TextArea
        aria-label='Lý do'
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        maxLength={500}
        placeholder='Lý do xóa (không bắt buộc)'
      />
    </DialogModal>
  )
}
