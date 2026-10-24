import { ButtonComponent, TooltipComponent } from '@components/index'
import { ROLE_LABEL } from '../constants/rolePermissionMatrix.constants'
import type {
  AdminRole,
  AdminRoleSyncStatus
} from '../types/rolePermissionMatrix.types'
import { formatVnDateTime } from '../utils/matrixFormat.utils'
import { SyncStateTag } from './SyncStateTag'

interface Props {
  role: AdminRole
  status?: AdminRoleSyncStatus
  canManage: boolean
  canEdit: boolean
  opening: boolean
  onEdit: () => void
  onSync: () => void
}

const EDIT_LOCKED_HINT =
  'Chỉ Super Admin mới được sửa quyền của vai trò Super Admin'

export function RoleStatusCard({
  role,
  status,
  canManage,
  canEdit,
  opening,
  onEdit,
  onSync
}: Props) {
  const name = ROLE_LABEL[role] ?? role
  const editButton = (
    <ButtonComponent
      aria-label={`Sửa quyền ${name}`}
      content='Sửa quyền'
      disabled={!canEdit}
      htmlType='button'
      loading={opening}
      onClick={onEdit}
      size='small'
    />
  )
  return (
    <li className='flex min-w-0 flex-col gap-2 rounded-md border border-border p-3'>
      <div className='flex items-center justify-between gap-2'>
        <span className='text-sm font-semibold'>{name}</span>
        {status ? (
          <SyncStateTag state={status.state} />
        ) : (
          <span className='text-xs text-muted-foreground'>
            Chưa có trạng thái
          </span>
        )}
      </div>
      {status && (
        <dl className='grid grid-cols-2 gap-x-2 text-xs text-muted-foreground'>
          <dt>Authority sẽ cấp</dt>
          <dd className='text-right text-foreground'>
            {status.authorities.length}
          </dd>
          <dt>Sẽ thêm / sẽ gỡ</dt>
          <dd className='text-right text-foreground'>
            {status.added.length} / {status.removed.length}
          </dd>
          <dt>Đồng bộ gần nhất</dt>
          <dd className='text-right text-foreground'>
            {formatVnDateTime(status.lastSyncedAt)}
          </dd>
        </dl>
      )}
      {canManage && (
        <div className='mt-auto flex flex-wrap gap-2'>
          {canEdit ? (
            editButton
          ) : (
            <TooltipComponent title={EDIT_LOCKED_HINT}>
              <span>{editButton}</span>
            </TooltipComponent>
          )}
          <ButtonComponent
            aria-label={`Đồng bộ ${name}`}
            content='Đồng bộ Keycloak'
            htmlType='button'
            onClick={onSync}
            size='small'
            variant='outlined'
          />
        </div>
      )}
    </li>
  )
}
