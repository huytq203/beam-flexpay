import type { ApiTerminalSummary } from '@/app/services/merchantHierarchyApi'
import { DialogModal, TextArea } from '@components/index'

interface TerminalLockDialogProps {
  terminal: ApiTerminalSummary | null
  reason: string
  loading: boolean
  onReasonChange: (value: string) => void
  onClose: () => void
  onConfirm: () => void
}

export function TerminalLockDialog({ terminal, reason, loading, onReasonChange, onClose, onConfirm }: TerminalLockDialogProps) {
  return <DialogModal open={terminal !== null} title={terminal?.status === 'ACTIVE' ? 'Khóa Terminal' : 'Mở khóa Terminal'} onCancel={onClose} onOk={onConfirm} okButtonProps={{ loading }} okText='Xác nhận'>
    <p className='mb-3 text-sm'>Terminal <strong>{terminal?.name}</strong> ({terminal?.tid})</p>
    <TextArea aria-label='Lý do' value={reason} onChange={(event) => onReasonChange(event.target.value)} rows={3} maxLength={500} placeholder='Nhập lý do (tối thiểu 10 ký tự)' />
  </DialogModal>
}
