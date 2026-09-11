import { MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, Input, ModalComponent, Table } from '@components/index'
import useDebounce from '@hooks/useDebounce'
import { useGetMerchantQuery } from '@services/apiMerchant'
import type { ContentMerchant } from '@type/merchant'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'

interface MerchantPickerDialogProps {
  open: boolean
  selectedId: string
  onSelect: (merchant: ContentMerchant) => void
  onCancel: () => void
}

const columns: ColumnsType<ContentMerchant> = [
  {
    title: 'Đơn vị',
    dataIndex: 'name',
    render: (name: string, row) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-semibold text-foreground'>{name}</span>
        <span className='text-xs text-muted-foreground'>{row.code}</span>
      </div>
    )
  },
  {
    title: 'Liên hệ',
    dataIndex: 'contactEmail',
    render: (email: string, row) => (
      <div className='flex flex-col gap-0.5 text-[13px]'>
        <span className='text-foreground'>{email || '—'}</span>
        <span className='tabular-nums text-muted-foreground'>
          {row.contactPhone || '—'}
        </span>
      </div>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 130,
    render: (status: string) => (
      <span className='text-[13px] text-foreground'>{status}</span>
    )
  }
]

/**
 * Chọn đơn vị chấp nhận thanh toán bằng bảng thay vì ô select.
 *
 * Danh sách đơn vị dài và người vận hành nhận ra đơn vị bằng mã và thông tin
 * liên hệ, không bằng mỗi cái tên — một dòng select cụt không đủ để chọn đúng.
 */
export const MerchantPickerDialog = ({
  open,
  selectedId,
  onSelect,
  onCancel
}: MerchantPickerDialogProps) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 400)

  const { data, isFetching } = useGetMerchantQuery(
    {
      page,
      size,
      keyword: debouncedKeyword || undefined,
      sortBy: 'createdAt',
      sortDirection: 'DESC'
    },
    { skip: !open }
  )

  const rows = (data?.content ?? []).map((item: ContentMerchant) => ({
    ...item,
    key: item.id
  }))

  return (
    <ModalComponent
      open={open}
      title='Chọn đơn vị chấp nhận thanh toán'
      width={880}
      footer={null}
      onCancel={onCancel}
    >
      <div className='mb-3'>
        <Input
          placeholder='Tìm theo tên hoặc mã đơn vị'
          value={keyword}
          allowClear
          prefix={<MagnifyingGlassIcon size={16} aria-hidden />}
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <Table<ContentMerchant>
        size='small'
        rowKey='key'
        dataSource={rows}
        columns={columns}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        rowClassName={(row) =>
          row.id === selectedId ? 'bg-accent cursor-pointer' : 'cursor-pointer'
        }
        onRow={(row) => ({ onClick: () => onSelect(row) })}
        pagination={{
          current: page,
          pageSize: size,
          total: data?.totalElements ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextSize) => {
            if (nextSize !== size) {
              setSize(nextSize)
              setPage(1)
              return
            }
            setPage(nextPage)
          }
        }}
      />

      <p className='mt-2 text-[13px] text-muted-foreground'>
        Bấm một dòng để chọn đơn vị đó.
      </p>

      <div className='mt-3 flex justify-end'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Đóng'
          onClick={onCancel}
        />
      </div>
    </ModalComponent>
  )
}
