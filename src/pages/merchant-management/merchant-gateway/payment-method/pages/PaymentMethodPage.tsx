import { useState } from 'react'
import {
  useGetGatewayPaymentMethodsQuery,
  type GatewayMerchant
} from '@/app/services/merchantGatewayApi'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { PaymentMethodEditor } from '../components/PaymentMethodEditor'
import { PaymentMerchantPickerDialog } from '../components/PaymentMerchantPickerDialog'
import {
  PaymentMethodFilters,
  type PaymentMethodFilterValues
} from '../components/PaymentMethodFilters'
import { PaymentMethodListCard } from '../components/PaymentMethodListCard'

const FILTER_KEYS = ['name', 'code', 'level', 'status'] as const

const PaymentMethodPage = () => {
  const url = useUrlFilters({ keys: FILTER_KEYS })
  const { page, size } = url
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string }>()
  const filters: PaymentMethodFilterValues = {
    name: url.filters.name ?? '',
    code: url.filters.code ?? '',
    level: url.filters.level ?? '',
    status: url.filters.status ?? ''
  }
  const query = useGetGatewayPaymentMethodsQuery({ page, size })
  const name = filters.name.trim().toLocaleLowerCase('vi')
  const code = filters.code.trim().toLocaleLowerCase('vi')
  const rows = (query.data?.content ?? []).filter(
    (row) =>
      (!name || row.merchantName.toLocaleLowerCase('vi').includes(name)) &&
      (!code || row.merchantCode.toLocaleLowerCase('vi').includes(code)) &&
      (!filters.level || row.appliedLevel === filters.level) &&
      (!filters.status || row.active === (filters.status === 'ACTIVE'))
  )
  const editFromTable = (merchantId: string) => {
    const row = query.data?.content.find(
      (item) => item.merchantId === merchantId
    )
    setEditing({ id: merchantId, name: row?.merchantName ?? merchantId })
  }
  const createForMerchant = (merchant: GatewayMerchant) => {
    setPickerOpen(false)
    setEditing({ id: merchant.id, name: merchant.name })
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            Hình thức chấp nhận thanh toán
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Cấu hình các kênh thanh toán theo Merchant.
          </p>
        </div>
      </div>
      <PaymentMethodFilters
        initialValues={filters}
        onSearch={url.applyFilters}
        onClear={url.clearFilters}
      />
      <PaymentMethodListCard
        rows={rows}
        total={query.data?.totalElements ?? 0}
        page={page}
        size={size}
        loading={query.isFetching}
        error={query.isError}
        onRefresh={() => void query.refetch()}
        onPageChange={(nextPage, nextSize) => {
          if (nextSize !== size) url.setPageSize(nextSize)
          else url.setPage(nextPage)
        }}
        onEdit={editFromTable}
        onCreate={() => setPickerOpen(true)}
      />
      <PaymentMerchantPickerDialog
        open={pickerOpen}
        onSelect={createForMerchant}
        onCancel={() => setPickerOpen(false)}
      />
      {editing && (
        <PaymentMethodEditor
          merchantId={editing.id}
          merchantName={editing.name}
          onClose={() => setEditing(undefined)}
        />
      )}
    </main>
  )
}

export default PaymentMethodPage
