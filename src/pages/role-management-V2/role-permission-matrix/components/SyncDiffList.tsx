import type { AdminRoleSyncStatus } from '../types/rolePermissionMatrix.types'
import { SyncStateTag } from './SyncStateTag'

const AuthorityList = ({ title, items }: { title: string; items: string[] }) =>
  items.length ? (
    <div>
      <p className='text-xs font-medium'>
        {title} ({items.length})
      </p>
      <ul className='max-h-32 overflow-y-auto text-xs text-muted-foreground'>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  ) : null

/** Chênh lệch authority sẽ đẩy; chuỗi authority kỹ thuật hiển thị nguyên văn. */
export function SyncDiffList({ status }: { status: AdminRoleSyncStatus }) {
  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <span className='text-xs'>Trạng thái hiện tại:</span>
        <SyncStateTag state={status.state} />
      </div>
      <AuthorityList
        items={status.added}
        title='Authority sẽ thêm'
      />
      <AuthorityList
        items={status.removed}
        title='Authority sẽ gỡ'
      />
      <AuthorityList
        items={status.unmappedFunctions}
        title='Chức năng chưa ứng với authority nào'
      />
    </div>
  )
}
