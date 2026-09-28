import { useState } from 'react'
import {
  useGetSubMerchantPageQuery,
  type ApiSubMerchantSummary,
  type HierarchyStatus
} from '@/app/services/merchantHierarchyApi'
import { MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  Input,
  ModalComponent,
  Table
} from '@components/index'
import useDebounce from '@hooks/useDebounce'
import { createSubMerchantPickerColumns } from './subMerchantPicker.columns'

interface SubMerchantPickerDialogProps {
  open: boolean
  selectedId?: string
  /** Giới hạn trong một Merchant cha; bỏ trống để tìm trên mọi Merchant. */
  merchantId?: string
  /** Bỏ trống để tra cứu cả Sub-merchant đã khóa (dùng cho bộ lọc). */
  status?: HierarchyStatus
  onSelect: (subMerchant: ApiSubMerchantSummary) => void
  onCancel: () => void
}

export function SubMerchantPickerDialog({
  open,
  selectedId,
  merchantId,
  status,
  onSelect,
  onCancel
}: SubMerchantPickerDialogProps) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const debouncedName = useDebounce(name.trim(), 400)
  const debouncedCode = useDebounce(code.trim(), 400)
  const query = useGetSubMerchantPageQuery(
    {
      page,
      size,
      merchantId,
      status,
      name: debouncedName || undefined,
      code: debouncedCode || undefined
    },
    { skip: !open }
  )

  return (
    <ModalComponent
      open={open}
      title='Chọn Sub-merchant'
      width={{ xs: 'calc(100vw - 24px)', md: 880 }}
      footer={null}
      onCancel={onCancel}
    >
      {status === 'ACTIVE' && (
        <p className='mb-3 text-sm text-muted-foreground'>
          Chỉ hiển thị Sub-merchant đang hoạt động.
        </p>
      )}
      <div className='mb-3 grid gap-2 sm:grid-cols-2'>
        <Input
          aria-label='Tìm theo tên Sub-merchant'
          allowClear
          prefix={
            <MagnifyingGlassIcon
              aria-hidden
              size={16}
            />
          }
          placeholder='Tìm theo tên Sub-merchant'
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setPage(1)
          }}
        />
        <Input
          aria-label='Tìm theo mã Sub-merchant'
          allowClear
          prefix={
            <MagnifyingGlassIcon
              aria-hidden
              size={16}
            />
          }
          placeholder='Tìm theo mã Sub-merchant'
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            setPage(1)
          }}
        />
      </div>
      {query.isError && (
        <div
          role='alert'
          className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          Không thể tải danh sách Sub-merchant.
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<ApiSubMerchantSummary>
        rowKey='id'
        size='small'
        loading={query.isFetching}
        onRefresh={query.refetch}
        dataSource={query.isError ? [] : (query.data?.content ?? [])}
        columns={createSubMerchantPickerColumns({
          page,
          size,
          selectedId,
          onSelect
        })}
        scroll={{ x: 720 }}
        rowClassName={(sub) => (sub.id === selectedId ? 'bg-accent' : '')}
        pagination={{
          current: page,
          pageSize: size,
          total: query.data?.totalElements ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextSize) => {
            setPage(nextSize !== size ? 1 : nextPage)
            setSize(nextSize)
          }
        }}
      />
    </ModalComponent>
  )
}
