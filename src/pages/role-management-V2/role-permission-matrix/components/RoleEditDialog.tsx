import { DialogModal } from '@components/index'
import { ROLE_LABEL } from '../constants/rolePermissionMatrix.constants'
import { useRoleEditor } from '../hooks/useRoleEditor'
import type {
  AdminRole,
  AdminRolePermissionMatrix
} from '../types/rolePermissionMatrix.types'
import { ReasonInput } from './ReasonInput'
import { RoleEditRows } from './RoleEditRows'
import { SelfLockoutWarning } from './SelfLockoutWarning'

interface Props {
  matrix: AdminRolePermissionMatrix
  role: AdminRole
  callerRoles: AdminRole[]
  onClose: () => void
}

export function RoleEditDialog({ matrix, role, callerRoles, onClose }: Props) {
  const editor = useRoleEditor({ matrix, role, callerRoles, onDone: onClose })
  const name = ROLE_LABEL[role] ?? role
  const needsConfirm = editor.risk !== 'none' && editor.confirming

  return (
    <DialogModal
      open
      title={`Sửa quyền vai trò ${name}`}
      okText={needsConfirm ? 'Vẫn lưu' : 'Lưu quyền'}
      okButtonProps={{
        danger: needsConfirm,
        disabled: editor.changed.length === 0,
        loading: editor.isLoading
      }}
      onCancel={onClose}
      onOk={() => void editor.save()}
      width={760}
    >
      <div className='flex flex-col gap-3 text-sm'>
        <p className='text-xs text-muted-foreground'>
          Lưu sẽ ghi đè toàn bộ quyền của vai trò này bằng đúng danh sách bên
          dưới. Không có khóa phiên bản: nếu người khác cùng sửa vai trò này,
          bản lưu sau ghi đè bản lưu trước (ma trận vừa được tải lại trước khi
          mở). Đã đổi {editor.changed.length} chức năng.
        </p>
        <RoleEditRows
          changed={editor.changed}
          draft={editor.draft}
          matrix={matrix}
          onAccessType={editor.setAccessType}
          onScope={editor.setScope}
        />
        <ReasonInput
          error={editor.reasonError}
          id='role-edit-reason'
          onChange={editor.setReason}
          value={editor.reason}
        />
        {editor.risk !== 'none' && (
          <SelfLockoutWarning
            confirming={editor.confirming}
            risk={editor.risk}
            roleName={name}
          />
        )}
        {editor.error && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {editor.error}
          </p>
        )}
      </div>
    </DialogModal>
  )
}
