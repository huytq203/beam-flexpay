import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import { DialogModal } from '@components/index'
import { useDeleteSpecialMonth } from '../hooks/useSpecialMonths'
import { formatMonthLabel } from '../utils/specialMonth.utils'

interface SpecialMonthDeleteDialogProps {
  month: WalletLimitSpecialMonth
  onClose: () => void
}

export function SpecialMonthDeleteDialog({
  month,
  onClose
}: SpecialMonthDeleteDialogProps) {
  const { deleteMonth, isDeleting } = useDeleteSpecialMonth()

  const handleOk = async () => {
    await deleteMonth(month.id)
    onClose()
  }

  return (
    <DialogModal
      open
      mode='DELETE'
      title='Xóa tháng đặc biệt?'
      okText='Xóa tháng'
      confirmLoading={isDeleting}
      onOk={handleOk}
      onCancel={onClose}
    >
      <p>
        Tháng{' '}
        <strong>
          {formatMonthLabel(month.monthStart)} · {month.name}
        </strong>{' '}
        sẽ không còn dùng hạn mức tháng (đặc biệt) từ lần kiểm hạn mức kế tiếp.
      </p>
    </DialogModal>
  )
}
