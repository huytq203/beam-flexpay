import { useState } from 'react'
import {
  useGetGatewayCredentialSignatureHistoryQuery,
  type SignatureHistoryItem
} from '@/app/services/merchantGatewayApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, Table } from '@components/index'
import { createSignatureHistoryColumns } from '../columns/signatureHistory.columns'
import { SIGNATURE_HISTORY_PAGE_SIZE } from '../constants/credential.constants'

// API lịch sử chữ ký dùng `page` tính từ 0; bảng hiển thị trang từ 1.
export function SignatureHistoryTable({
  credentialId
}: {
  credentialId: string
}) {
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(SIGNATURE_HISTORY_PAGE_SIZE)
  const query = useGetGatewayCredentialSignatureHistoryQuery({
    id: credentialId,
    page,
    size
  })

  return (
    <div className='space-y-2'>
      <p className='text-xs text-muted-foreground'>
        Các lần BEAM xác thực chữ ký request của merchant, mới nhất trước.
      </p>
      {query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          {getApiErrorDetail(query.error, 'Không thể tải lịch sử chữ ký.')}
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<SignatureHistoryItem>
        rowKey='id'
        size='small'
        loading={query.isFetching}
        onRefresh={query.refetch}
        dataSource={query.data?.content ?? []}
        locale={{ emptyText: 'Chưa có lần xác thực chữ ký nào' }}
        scroll={{ x: 'max-content' }}
        pagination={{
          current: page + 1,
          pageSize: size,
          total: query.data?.totalElements ?? 0,
          onChange: (nextPage, nextSize) => {
            if (nextSize !== size) {
              setSize(nextSize)
              setPage(0)
            } else setPage(nextPage - 1)
          }
        }}
        columns={createSignatureHistoryColumns(page, size)}
      />
    </div>
  )
}
