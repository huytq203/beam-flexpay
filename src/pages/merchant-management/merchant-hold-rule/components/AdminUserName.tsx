import { useGetUserByIdQuery } from '@services/apiUserManagement'

/** BE ghi UUID toàn số 0 cho thao tác do hệ thống (seed, job) thực hiện. */
const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Dùng cho các cột "Người tạo", "Người duyệt", nơi BE chỉ trả UUID
 * (Keycloak subject), không trả tên, nên tra danh bạ admin.
 * Tra không ra (user đã xóa, không đủ quyền xem) thì hiện UUID để không mất dấu.
 */
export function AdminUserName({ userId }: { userId?: string | null }) {
  const isSystem = userId === SYSTEM_USER_ID
  const { data, isLoading } = useGetUserByIdQuery(userId ?? '', {
    skip: !userId || isSystem
  })
  if (!userId)
    return <span className='text-muted-foreground'>Không xác định</span>
  if (isSystem) return <span className='text-sm font-medium'>Hệ thống</span>
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
  const fullName = [user.lastName, user.firstName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ')
  return (
    <div className='min-w-0'>
      <div className='truncate text-sm font-medium text-foreground'>
        {fullName || user.username}
      </div>
      <div className='truncate text-xs text-muted-foreground'>
        {user.username}
      </div>
    </div>
  )
}
