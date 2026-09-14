import { MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, Input, MaskText, ModalComponent, Table } from '@components/index'
import useDebounce from '@hooks/useDebounce'
import { useGetAccountQuery } from '@services/apiWalletAccount.api'
import type { ContentAccountWallet } from '@type/responseAccountWallet'
import { formatFeeNumber } from '@utils/fee-format'
import type { ColumnsType } from 'antd/es/table'
import { useState } from 'react'

interface UserPickerDialogProps {
  open: boolean
  selectedOwnerId: string
  onSelect: (account: ContentAccountWallet) => void
  onCancel: () => void
}

const USER_SEARCH_DEBOUNCE_MS = 600

const columns: ColumnsType<ContentAccountWallet> = [
  {
    title: 'Chủ ví',
    dataIndex: 'ownerFullName',
    render: (fullName: string | null, row) => (
      <div className='flex flex-col gap-0.5'>
        <span className='font-semibold text-foreground'>
          {fullName || row.ownerUsername}
        </span>
        <MaskText
          value={row.ownerUsername}
          className='text-xs text-muted-foreground'
        />
      </div>
    )
  },
  {
    title: 'Định danh',
    dataIndex: 'ekycStatus',
    width: 150,
    render: (status: string | null) => (
      <span className='text-[13px] text-foreground'>
        {status === 'VERIFIED' ? 'Đã định danh' : 'Chưa định danh'}
      </span>
    )
  },
  {
    title: 'Số dư',
    dataIndex: 'balance',
    width: 150,
    align: 'right',
    render: (balance: number) => (
      <span className='tabular-nums text-[13px] text-foreground'>
        {formatFeeNumber(balance ?? 0)} đ
      </span>
    )
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 120,
    render: (status: string) => (
      <span className='text-[13px] text-foreground'>{status}</span>
    )
  }
]

/**
 * Chọn một ví để gán biểu phí riêng.
 *
 * <p>Bảng đọc từ danh sách tài khoản của sổ cái lõi, đúng nguồn màn Quản lý ví
 * điện tử đang dùng. Lưu `ownerId` chứ không lưu `id` của tài khoản: `ownerId`
 * mới là mã mà ví gửi lên dịch vụ phí trong mỗi báo giá. Hai trường này cùng là
 * UUID và nằm cùng một dòng, nên chọn nhầm thì bản gán không bao giờ khớp ai.
 */
export const UserPickerDialog = ({
  open,
  selectedOwnerId,
  onSelect,
  onCancel
}: UserPickerDialogProps) => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [username, setUsername] = useState('')
  const debouncedUsername = useDebounce(username, USER_SEARCH_DEBOUNCE_MS)

  const { data, isFetching } = useGetAccountQuery(
    {
      page,
      size,
      ownerType: 'USER',
      username: debouncedUsername || undefined
    },
    { skip: !open }
  )

  const rows = (data?.content ?? []).map((item: ContentAccountWallet) => ({
    ...item,
    key: item.id
  }))

  return (
    <ModalComponent
      open={open}
      title='Chọn ví được gán biểu phí riêng'
      width={880}
      footer={null}
      onCancel={onCancel}
    >
      <div className='mb-3'>
        <Input
          placeholder='Tìm theo số điện thoại'
          value={username}
          allowClear
          prefix={<MagnifyingGlassIcon size={16} aria-hidden />}
          onChange={(event) => {
            setUsername(event.target.value)
            setPage(1)
          }}
        />
      </div>

      <Table<ContentAccountWallet>
        size='small'
        rowKey='key'
        dataSource={rows}
        columns={columns}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        rowClassName={(row) =>
          row.ownerId === selectedOwnerId
            ? 'bg-accent cursor-pointer'
            : 'cursor-pointer'
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
        Bấm một dòng để chọn ví đó.
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
