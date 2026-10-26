import { DialogModal } from '@components/index'
import { ROLE_LABEL } from '../constants/rolePermissionMatrix.constants'
import { useRoleSync } from '../hooks/useRoleSync'
import type {
  AdminRole,
  AdminRoleSyncStatus
} from '../types/rolePermissionMatrix.types'
import { ReasonInput } from './ReasonInput'
import { SyncDiffList } from './SyncDiffList'
import { SyncResultNotice } from './SyncResultNotice'

interface Props {
  role: AdminRole
  status?: AdminRoleSyncStatus
  onClose: () => void
}

export function RoleSyncDialog({ role, status, onClose }: Props) {
  const sync = useRoleSync(role)
  const name = ROLE_LABEL[role] ?? role
  const done = Boolean(sync.result)
  const current = sync.result ?? status

  return (
    <DialogModal
      open
      title={`Đồng bộ Keycloak: ${name}`}
      okText='Đồng bộ'
      cancelText={done ? 'Đóng' : 'Hủy'}
      okButtonProps={{
        loading: sync.isLoading,
        style: done ? { display: 'none' } : undefined
      }}
      onCancel={onClose}
      onOk={() => void sync.run()}
    >
      <div className='flex flex-col gap-3 text-sm'>
        <p className='text-xs text-muted-foreground'>
          Đẩy tập authority suy ra từ ma trận của vai trò này sang Keycloak. Kết
          quả trả ngay: yêu cầu thành công chưa có nghĩa đã đồng bộ, chỉ trạng
          thái "Đã đồng bộ" mới là đã khớp.
        </p>
        {current && <SyncDiffList status={current} />}
        {!done && (
          <ReasonInput
            error={sync.reasonError}
            id='role-sync-reason'
            onChange={sync.setReason}
            value={sync.reason}
          />
        )}
        {sync.result && <SyncResultNotice status={sync.result} />}
        {sync.error && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {sync.error}
          </p>
        )}
      </div>
    </DialogModal>
  )
}
