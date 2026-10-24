import { cn } from '@lib/utils/cn'
import type { AdminRoleSyncStatus } from '../types/rolePermissionMatrix.types'

/**
 * Chỉ `state=IN_SYNC` mới là đã đồng bộ. Mọi trạng thái khác là chưa đẩy được;
 * `note` do BE trả (tiếng Việt không dấu) hiển thị nguyên văn.
 */
export function SyncResultNotice({ status }: { status: AdminRoleSyncStatus }) {
  const inSync = status.state === 'IN_SYNC'
  return (
    <div
      role='status'
      className={cn(
        'rounded-md border p-3 text-xs',
        inSync
          ? 'border-success bg-success/10 text-success-strong'
          : 'border-border bg-warning/10 text-warning-strong'
      )}
    >
      <p className='font-medium'>
        {inSync
          ? 'BE xác nhận vai trò đã đồng bộ.'
          : 'Chưa đồng bộ: BE đã nhận yêu cầu nhưng chưa đẩy quyền sang Keycloak, cổng phân quyền vẫn dùng quyền cũ trong token.'}
      </p>
      {status.note && <p className='mt-1'>Ghi chú từ BE: {status.note}</p>}
    </div>
  )
}
