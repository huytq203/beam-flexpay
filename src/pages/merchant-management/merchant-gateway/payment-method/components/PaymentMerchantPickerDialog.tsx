import { useState } from 'react'
import {
  useGetGatewayMerchantsQuery,
  type GatewayMerchant
} from '@/app/services/merchantGatewayApi'
import { MagnifyingGlassIcon } from '@components/icons'
import {
  ButtonComponent,
  Input,
  ModalComponent,
  Table
} from '@components/index'
import useDebounce from '@hooks/useDebounce'
import { createPaymentMerchantPickerColumns } from '../columns/paymentMerchantPicker.columns'

interface PaymentMerchantPickerDialogProps {
  open: boolean
  selectedId?: string
  onSelect: (merchant: GatewayMerchant) => void
  onCancel: () => void
}

export function PaymentMerchantPickerDialog({
  open,
  selectedId,
  onSelect,
  onCancel
}: PaymentMerchantPickerDialogProps) {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const debouncedName = useDebounce(name.trim(), 400)
  const debouncedCode = useDebounce(code.trim(), 400)
  const query = useGetGatewayMerchantsQuery(
    {
      page,
      size,
      name: debouncedName || undefined,
      code: debouncedCode || undefined
    },
    { skip: !open }
  )

  return (
    <ModalComponent
      open={open}
      title='Chọn Merchant'
      width={{ xs: 'calc(100vw - 24px)', md: 800 }}
      footer={null}
      onCancel={onCancel}
    >
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
      <Table<GatewayMerchant>
        rowKey='id'
        size='small'
        loading={query.isFetching}
        onRefresh={query.refetch}
        dataSource={query.isError ? [] : (query.data?.content ?? [])}
        columns={createPaymentMerchantPickerColumns({
          page,
          size,
          selectedId,
          onSelect
        })}
        scroll={{ x: 620 }}
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
