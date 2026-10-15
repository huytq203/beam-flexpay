import { useState } from 'react'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  useVerifyBankAccountLinkMutation,
  type BankAccountDto
} from '@/app/services/merchantBankAccountApi'
import {
  ButtonComponent,
  DialogModal,
  TextArea,
  feedback
} from '@components/index'

interface BankAccountVerifyDialogProps {
  row: BankAccountDto
  onClose: () => void
}

// Đây là thao tác duy nhất đưa TK mới tạo từ Chờ xác minh sang Đã liên kết.
export function BankAccountVerifyDialog({
  row,
  onClose
}: BankAccountVerifyDialogProps) {
  const [reason, setReason] = useState('')
  const [verify, state] = useVerifyBankAccountLinkMutation()

  const submit = async (linked: boolean) => {
    const text = reason.trim()
    if (!text) {
      feedback.warning('Vui lòng nhập lý do')
      return
    }
    try {
      await verify({
        id: row.id,
        linked,
        reason: text,
        ...(linked ? {} : { failureReason: text })
      }).unwrap()
      feedback.success(
        linked
          ? 'Đã xác minh liên kết tài khoản'
          : 'Đã ghi nhận xác minh thất bại'
      )
      onClose()
    } catch (error) {
      feedback.error(
        getApiErrorDetail(error, 'Không thể xác minh liên kết tài khoản')
      )
    }
  }

  return (
    <DialogModal
      open
      title='Xác minh liên kết'
      onCancel={onClose}
      onOk={() => void submit(true)}
      footer={[
        <ButtonComponent
          key='fail'
          danger
          loading={state.isLoading}
          onClick={() => void submit(false)}
          content='Xác minh thất bại'
        />,
        <ButtonComponent
          key='ok'
          type='primary'
          loading={state.isLoading}
          onClick={() => void submit(true)}
          content='Xác minh thành công'
        />
      ]}
    >
      <p className='mb-3 text-sm'>
        Đối chiếu tài khoản <strong>{row.accountName}</strong> trước khi xác
        nhận. Tên chủ tài khoản phải khớp pháp nhân đã xác thực KYB.
      </p>
      <TextArea
        aria-label='Lý do'
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        rows={3}
        maxLength={500}
        placeholder='Nhập lý do'
      />
    </DialogModal>
  )
}
