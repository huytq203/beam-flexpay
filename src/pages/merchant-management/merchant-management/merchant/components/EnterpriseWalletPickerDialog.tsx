import { useState } from 'react'
import type { ColumnsType } from 'antd/es/table'

import { MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  Input,
  ModalComponent,
  Table
} from '@components/index'
import useDebounce from '@hooks/useDebounce'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { useGetSelectableWalletsQuery } from '@services/apiMerchant'
import type { SelectableWallet } from '@type/merchant'

interface EnterpriseWalletPickerDialogProps {
  open: boolean
  selectedId: string
  onSelect: (wallet: SelectableWallet) => void
  onCancel: () => void
}

const walletTypeLabel = (type?: SelectableWallet['businessType']) =>
  type === 'HOUSEHOLD'
    ? 'Hộ kinh doanh'
    : type === 'ENTERPRISE'
      ? 'Doanh nghiệp'
      : 'Chưa xác định'

export function EnterpriseWalletPickerDialog({
  open,
  selectedId,
  onSelect,
  onCancel
}: EnterpriseWalletPickerDialogProps) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword.trim(), 400)

  // BE chỉ trả ví đã xác minh, chưa gắn merchant; page 1-based.
  const { data, isFetching, isError, error, refetch } =
    useGetSelectableWalletsQuery(
      { page, size, query: debouncedKeyword || undefined },
      { skip: !open }
    )

  const columns: ColumnsType<SelectableWallet> = [
    {
      title: 'Chủ ví',
      dataIndex: 'legalName',
      render: (name: string | undefined, wallet) => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-foreground'>
            {name || wallet.registeredEmail}
          </span>
          <span className='text-xs text-muted-foreground'>
            {wallet.registeredEmail}
          </span>
        </div>
      )
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'taxCode',
      width: 170,
      render: (taxCode?: string) => taxCode || '—'
    },
    {
      title: 'Loại ví',
      dataIndex: 'businessType',
      width: 150,
      render: walletTypeLabel
    },
    {
      title: 'Người đại diện',
      dataIndex: 'legalRepresentativeName',
      width: 180,
      render: (name?: string) => name || '—'
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 110,
      render: (_, wallet) => (
        <ButtonComponent
          htmlType='button'
          type={wallet.id === selectedId ? 'primary' : 'default'}
          content={wallet.id === selectedId ? 'Đã chọn' : 'Chọn'}
          aria-label={`Chọn ví ${wallet.legalName || wallet.registeredEmail}`}
          onClick={() => onSelect(wallet)}
        />
      )
    }
  ]

  return (
    <ModalComponent
      open={open}
      title='Chọn ví điện tử doanh nghiệp / hộ kinh doanh'
      width={900}
      footer={null}
      onCancel={onCancel}
    >
      <div className='mb-4 space-y-2'>
        <Input
          aria-label='Tìm ví doanh nghiệp'
          placeholder='Tìm theo tên, mã số thuế, email hoặc người đại diện'
          value={keyword}
          allowClear
          prefix={
            <MagnifyingGlassIcon
              size={16}
              aria-hidden
            />
          }
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
        />
        <p className='text-xs text-muted-foreground'>
          Chỉ hiển thị ví đã xác minh và chưa gắn merchant. Loại ví được cập
          nhật theo ví bạn chọn.
        </p>
      </div>

      {isError && (
        <div
          role='alert'
          className='mb-3 flex flex-wrap items-center gap-2 text-sm text-danger-strong'
        >
          {getApiErrorDetail(error, 'Không tải được danh sách ví.')}
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        </div>
      )}

      <Table<SelectableWallet>
        size='small'
        rowKey='id'
        dataSource={isError ? [] : (data?.content ?? [])}
        columns={columns}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        rowClassName={(wallet) => (wallet.id === selectedId ? 'bg-accent' : '')}
        pagination={{
          current: page,
          pageSize: size,
          total: data?.totalElements ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextSize) => {
            if (nextSize !== size) {
              setSize(nextSize)
              setPage(1)
            } else {
              setPage(nextPage)
            }
          }
        }}
      />
    </ModalComponent>
  )
}
