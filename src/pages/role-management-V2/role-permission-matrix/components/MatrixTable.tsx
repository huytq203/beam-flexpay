import { useMemo } from 'react'
import { ButtonComponent, Input, Table } from '@components/index'
import { createMatrixColumns } from '../columns/rolePermissionMatrix.columns'
import type {
  AdminRole,
  MatrixGroup
} from '../types/rolePermissionMatrix.types'
import { toTableRows } from '../utils/matrixGroups.utils'
import { MatrixLegend } from './MatrixLegend'

interface Props {
  roles: AdminRole[]
  groups: MatrixGroup[]
  search: string
  onSearch: (value: string) => void
  isLoading: boolean
  isError: boolean
  onRetry: () => void
}

/** Bảng chỉ đọc: dựng từ `roles` và `cells` của BE, gom nhóm để dễ đọc. */
export function MatrixTable({
  roles,
  groups,
  search,
  onSearch,
  isLoading,
  isError,
  onRetry
}: Props) {
  const columns = useMemo(() => createMatrixColumns(roles), [roles])
  const rows = useMemo(() => toTableRows(groups), [groups])
  const total = groups.reduce((sum, group) => sum + group.rows.length, 0)

  return (
    <section
      aria-label='Ma trận phân quyền'
      className='flex flex-col gap-3'
    >
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-sm font-semibold'>Ma trận phân quyền</h2>
        <Input
          allowClear
          aria-label='Tìm chức năng'
          className='max-w-xs'
          placeholder='Tìm theo tên hoặc mã chức năng'
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>
      <MatrixLegend />
      {isError ? (
        <div role='alert'>
          <p>Không tải được ma trận phân quyền.</p>
          <ButtonComponent
            content='Thử lại'
            htmlType='button'
            onClick={onRetry}
          />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={rows}
          loading={isLoading}
          locale={{
            emptyText: search
              ? 'Không có chức năng khớp từ khóa'
              : 'Chưa có dữ liệu'
          }}
          pagination={false}
          rowKey='key'
          scroll={{ x: 'max-content' }}
          size='small'
          footer={() => `${total} chức năng`}
        />
      )}
    </section>
  )
}
