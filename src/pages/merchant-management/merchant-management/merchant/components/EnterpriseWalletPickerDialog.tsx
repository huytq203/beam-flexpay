import { useState } from 'react'
import type { ColumnsType } from 'antd/es/table'

import { MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent, Input, ModalComponent, Table } from '@components/index'
import useDebounce from '@hooks/useDebounce'
import {
  useListEnterpriseWalletsQuery,
  type EnterpriseWalletDto
} from '@services/merchantEnterpriseWalletApi'

interface EnterpriseWalletPickerDialogProps {
  open: boolean
  selectedId: string
  onSelect: (wallet: EnterpriseWalletDto) => void
  onCancel: () => void
}

const walletTypeLabel = (type?: EnterpriseWalletDto['businessType']) =>
  type === 'HOUSEHOLD' ? 'Hộ kinh doanh' : type === 'ENTERPRISE' ? 'Doanh nghiệp' : 'Chưa xác định'

const verificationStatusLabel: Record<EnterpriseWalletDto['verificationStatus'], string> = {
  DRAFT: 'Bản nháp',
  PENDING_APPROVAL: 'Chờ duyệt',
  VERIFIED: 'Đã xác minh',
  REJECTED: 'Từ chối'
}

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

  const { data, isFetching, isError, refetch } = useListEnterpriseWalletsQuery(
    {
      page: page - 1,
      size,
      query: debouncedKeyword || undefined
    },
    { skip: !open }
  )

  const columns: ColumnsType<EnterpriseWalletDto> = [
    {
      title: 'Chủ ví',
      dataIndex: 'legalName',
      render: (name: string | undefined, wallet) => (
        <div className='flex flex-col gap-0.5'>
          <span className='font-medium text-foreground'>{name || wallet.registeredEmail}</span>
          <span className='text-xs text-muted-foreground'>{wallet.registeredEmail}</span>
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
      title: 'Trạng thái',
      dataIndex: 'verificationStatus',
      width: 140,
      render: (status: EnterpriseWalletDto['verificationStatus']) => verificationStatusLabel[status]
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
          disabled={wallet.verificationStatus !== 'VERIFIED' || !wallet.businessType}
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
          placeholder='Tìm theo tên hoặc email chủ ví'
          value={keyword}
          allowClear
          prefix={<MagnifyingGlassIcon size={16} aria-hidden />}
          onChange={(event) => {
            setKeyword(event.target.value)
            setPage(1)
          }}
        />
        <p className='text-xs text-muted-foreground'>Chỉ ví đã xác minh và có loại ví mới chọn được. Loại ví được cập nhật theo ví bạn chọn.</p>
      </div>

      {isError && (
        <div role='alert' className='mb-3 flex flex-wrap items-center gap-2 text-sm text-danger-strong'>
          Không tải được danh sách ví.
          <ButtonComponent htmlType='button' type='default' content='Thử lại' onClick={() => void refetch()} />
        </div>
      )}

      <Table<EnterpriseWalletDto>
        size='small'
        rowKey='id'
        dataSource={isError ? [] : data?.content ?? []}
        columns={columns}
        loading={isFetching}
        scroll={{ x: 'max-content' }}
        rowClassName={(wallet) => wallet.id === selectedId ? 'bg-accent' : ''}
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
