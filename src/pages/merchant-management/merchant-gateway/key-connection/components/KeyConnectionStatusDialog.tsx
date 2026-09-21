import { DialogModal } from '@components/index'

import type { KeyConnectionRow } from '../types/keyConnection.type'

interface KeyConnectionStatusDialogProps {
  row: KeyConnectionRow | null
  onCancel: () => void
  onConfirm: (id: string) => void
}

export function KeyConnectionStatusDialog({
  row,
  onCancel,
  onConfirm
}: KeyConnectionStatusDialogProps) {
  if (!row) return null

  const nextStatus = row.status === 'ACTIVE' ? 'ngưng hoạt động' : 'kích hoạt'

  return (
    <DialogModal
      destroyOnHidden
      onCancel={onCancel}
      onOk={() => onConfirm(row.id)}
      open
      title='Xác nhận cập nhật trạng thái'
    >
      Bạn có chắc muốn {nextStatus} key của {row.merchantName}?
    </DialogModal>
  )
}
