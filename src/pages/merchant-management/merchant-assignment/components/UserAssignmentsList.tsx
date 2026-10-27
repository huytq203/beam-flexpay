import { useListUserAssignmentsQuery } from '@/app/services/merchantAssignmentApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, TagComponent } from '@components/index'
import { formatOrderDateTime } from '../../merchant-order/utils/merchantOrder.utils'
import { ASSIGNMENT_LEVEL_LABELS } from '../constants/merchantAssignment.constants'

/** BE chặn `size` ở 100; người phụ trách hơn 100 dòng thì báo phần còn lại. */
const USER_ASSIGNMENT_SIZE = 100

/** Các Master/Sub mà một người đang phụ trách (`GET /users/{id}/assignments`). */
export function UserAssignmentsList({ userId }: { userId: string }) {
  const query = useListUserAssignmentsQuery({
    adminUserId: userId,
    page: 1,
    size: USER_ASSIGNMENT_SIZE
  })
  const rows = query.data?.content ?? []
  const hidden = (query.data?.totalElements ?? 0) - rows.length

  return (
    <section
      aria-label='Đang phụ trách'
      className='space-y-2'
    >
      <h3 className='font-medium text-foreground'>Đang phụ trách</h3>
      {query.isLoading && (
        <p className='text-muted-foreground'>Đang tải danh sách…</p>
      )}
      {query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-2 text-danger-strong'
        >
          {getApiErrorDetail(query.error, 'Không thể tải danh sách phụ trách.')}
          <ButtonComponent
            size='small'
            type='default'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      {query.isSuccess && rows.length === 0 && (
        <p className='text-muted-foreground'>
          Người này chưa phụ trách Merchant nào.
        </p>
      )}
      {rows.length > 0 && (
        <ul className='max-h-52 space-y-1 overflow-y-auto'>
          {rows.map((row) => (
            <li
              key={`${row.level}:${row.subMerchantId ?? row.merchantId}`}
              className='flex items-start justify-between gap-2 rounded-md border border-border px-2 py-1'
            >
              <div className='min-w-0'>
                <div className='truncate font-medium text-foreground'>
                  {row.level === 'SUB' && row.subMerchantName
                    ? `${row.subMerchantName} (${row.subMerchantCode})`
                    : `${row.merchantName} (${row.merchantCode})`}
                </div>
                <div className='text-xs text-muted-foreground'>
                  {row.level === 'SUB' && `Thuộc ${row.merchantName} · `}
                  Gán lúc {formatOrderDateTime(row.assignedAt)}
                </div>
              </div>
              <TagComponent color={row.level === 'MASTER' ? 'blue' : 'default'}>
                {
                  ASSIGNMENT_LEVEL_LABELS[
                    row.level === 'MASTER' ? 'master' : 'sub'
                  ]
                }
              </TagComponent>
            </li>
          ))}
        </ul>
      )}
      {hidden > 0 && (
        <p className='text-xs text-muted-foreground'>
          Còn {hidden} dòng gán nữa chưa hiển thị.
        </p>
      )}
    </section>
  )
}
