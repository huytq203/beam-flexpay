import { ButtonComponent } from '@components/index'
import { SYNC_NOT_EFFECTIVE_NOTICE } from '../constants/rolePermissionMatrix.constants'
import type {
  AdminRole,
  AdminRoleSyncStatus
} from '../types/rolePermissionMatrix.types'
import { RoleStatusCard } from './RoleStatusCard'

interface Props {
  roles: AdminRole[]
  statuses: AdminRoleSyncStatus[]
  isLoading: boolean
  isError: boolean
  canManage: boolean
  canEditRole: (role: AdminRole) => boolean
  opening?: AdminRole
  onRetry: () => void
  onEdit: (role: AdminRole) => void
  onSync: (role: AdminRole) => void
}

/** Trạng thái đồng bộ Keycloak từng vai trò kèm thao tác sửa và đồng bộ. */
export function RoleStatusPanel({
  roles,
  statuses,
  isLoading,
  isError,
  canManage,
  canEditRole,
  opening,
  onRetry,
  onEdit,
  onSync
}: Props) {
  return (
    <section
      aria-label='Trạng thái đồng bộ vai trò'
      className='flex flex-col gap-3'
    >
      <h2 className='text-sm font-semibold'>Vai trò và trạng thái đồng bộ</h2>
      <p
        role='note'
        className='rounded-md border border-border bg-warning/10 p-3 text-xs text-warning-strong'
      >
        {SYNC_NOT_EFFECTIVE_NOTICE}
      </p>
      {isError && (
        <div role='alert'>
          <p>Không tải được trạng thái đồng bộ.</p>
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={onRetry}
          />
        </div>
      )}
      {isLoading && !statuses.length ? (
        <p className='text-xs text-muted-foreground'>Đang tải trạng thái...</p>
      ) : (
        <ul className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
          {roles.map((role) => (
            <RoleStatusCard
              key={role}
              canEdit={canEditRole(role)}
              canManage={canManage}
              onEdit={() => onEdit(role)}
              onSync={() => onSync(role)}
              opening={opening === role}
              role={role}
              status={statuses.find((item) => item.role === role)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}
