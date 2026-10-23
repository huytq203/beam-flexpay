import { useGetUserByIdQuery } from '@services/apiUserManagement'
import { toAdminUserName } from '../utils/merchantAssignment.utils'

/**
 * BE chỉ trả UUID (Keycloak subject), không trả tên, nên tra danh bạ admin.
 * Tra không ra (user đã xóa, không đủ quyền xem) thì hiện UUID để không mất dấu.
 */
export function AdminUserName({ userId }: { userId?: string | null }) {
  const { data, isLoading } = useGetUserByIdQuery(userId ?? '', {
    skip: !userId
  })
  if (!userId)
    return <span className='text-muted-foreground'>Không xác định</span>
  if (isLoading) return <span className='text-muted-foreground'>Đang tải…</span>
  const user = data?.data
  if (!user)
    return (
      <span
        className='font-mono text-xs text-muted-foreground'
        title='Không tra được tên trong danh bạ admin'
      >
        {userId}
      </span>
    )
  return (
    <div className='min-w-0'>
      <div className='truncate text-sm font-medium text-foreground'>
        {toAdminUserName(user)}
      </div>
      <div className='truncate text-xs text-muted-foreground'>
        {user.username}
      </div>
    </div>
  )
}
