import type { ApiTerminalSummary } from '@/app/services/merchantHierarchyApi'
import { DialogModal, TextArea } from '@components/index'

interface TerminalDeleteDialogProps {
  terminal: ApiTerminalSummary | null
  reason: string
  loading: boolean
  onReasonChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function TerminalDeleteDialog({
  terminal,
  reason,
  loading,
  onReasonChange,
  onClose,
  onConfirm
}: TerminalDeleteDialogProps) {
  return (
    <DialogModal
      open={terminal !== null}
      title='Xóa Terminal tạo nhầm'
      onCancel={onClose}
      onOk={onConfirm}
      okButtonProps={{ loading, danger: true }}
      okText='Xóa'
    >
      <p className='mb-3 text-sm'>
        Terminal <strong>{terminal?.name}</strong> ({terminal?.tid}) sẽ bị xóa.
        Terminal đã có giao dịch không xóa được, hãy dùng Khóa.
      </p>
      <TextArea
        aria-label='Lý do'
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        rows={3}
        maxLength={500}
        placeholder='Nhập lý do'
      />
    </DialogModal>
  )
}
