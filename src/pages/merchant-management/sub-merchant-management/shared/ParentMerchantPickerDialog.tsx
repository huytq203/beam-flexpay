import { useState } from 'react'
import {
  useGetHierarchyParentsQuery,
  type ApiParentMerchant
} from '@/app/services/merchantHierarchyApi'
import { MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  Input,
  ModalComponent,
  Table
} from '@components/index'
import useDebounce from '@hooks/useDebounce'
import { createParentMerchantPickerColumns } from './parentMerchantPicker.columns'

interface ParentMerchantPickerDialogProps {
  open: boolean
  selectedId?: string
  /** Bỏ trống để tra cứu cả Merchant không còn hoạt động (dùng cho bộ lọc). */
  status?: string
  onSelect: (merchant: ApiParentMerchant) => void
  onCancel: () => void
}

// Tìm kiếm gửi lên server theo trang: select tải sẵn 100 bản ghi không bao giờ
// tìm tới Merchant thứ 101 trở đi.
export function ParentMerchantPickerDialog({
  open,
  selectedId,
  status,
  onSelect,
  onCancel
}: ParentMerchantPickerDialogProps) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const debouncedName = useDebounce(name.trim(), 400)
  const debouncedCode = useDebounce(code.trim(), 400)
  const query = useGetHierarchyParentsQuery(
    {
      page,
      size,
      status,
      name: debouncedName || undefined,
      code: debouncedCode || undefined
    },
    { skip: !open }
  )

  return (
    <ModalComponent
      open={open}
      title='Chọn Merchant cha'
      width={{ xs: 'calc(100vw - 24px)', md: 880 }}
      footer={null}
      onCancel={onCancel}
    >
      {status === 'ACTIVE' && (
        <p className='mb-3 text-sm text-muted-foreground'>
          Chỉ hiển thị Merchant đang hoạt động.
        </p>
      )}
      <div className='mb-3 grid gap-2 sm:grid-cols-2'>
        <Input
          aria-label='Tìm theo tên Merchant'
          allowClear
          prefix={
            <MagnifyingGlassIcon
              aria-hidden
              size={16}
            />
          }
          placeholder='Tìm theo tên Merchant'
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setPage(1)
          }}
        />
        <Input
          aria-label='Tìm theo mã Merchant'
          allowClear
          prefix={
            <MagnifyingGlassIcon
              aria-hidden
              size={16}
            />
          }
          placeholder='Tìm theo mã Merchant'
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
          Không thể tải danh sách Merchant.
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      <Table<ApiParentMerchant>
        rowKey='id'
        size='small'
        loading={query.isFetching}
        onRefresh={query.refetch}
        dataSource={query.isError ? [] : (query.data?.content ?? [])}
        columns={createParentMerchantPickerColumns({
          page,
          size,
          selectedId,
          onSelect
        })}
        scroll={{ x: 720 }}
        rowClassName={(merchant) =>
          merchant.id === selectedId ? 'bg-accent' : ''
        }
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
