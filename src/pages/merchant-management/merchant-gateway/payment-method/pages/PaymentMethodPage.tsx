import { useMemo, useState } from 'react'
import { useGetGatewayPaymentMethodsQuery, type GatewayMerchant } from '@/app/services/merchantGatewayApi'
import { PaymentMethodEditor } from '../components/PaymentMethodEditor'
import { PaymentMerchantPickerDialog } from '../components/PaymentMerchantPickerDialog'
import { PaymentMethodFilters, type PaymentMethodFilterValues } from '../components/PaymentMethodFilters'
import { PaymentMethodListCard } from '../components/PaymentMethodListCard'

const emptyFilters: PaymentMethodFilterValues = { name: '', code: '', level: '', status: '' }

const PaymentMethodPage = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string }>()
  const [filters, setFilters] = useState<PaymentMethodFilterValues>(emptyFilters)
  const query = useGetGatewayPaymentMethodsQuery({ page, size })
  const rows = useMemo(() => (query.data?.content ?? []).filter((row) => {
    const name = filters.name.trim().toLocaleLowerCase('vi')
    const code = filters.code.trim().toLocaleLowerCase('vi')
    return (!name || row.merchantName.toLocaleLowerCase('vi').includes(name))
      && (!code || row.merchantCode.toLocaleLowerCase('vi').includes(code))
      && (!filters.level || row.appliedLevel === filters.level)
      && (!filters.status || row.active === (filters.status === 'ACTIVE'))
  }), [query.data?.content, filters])
  const editFromTable = (merchantId: string) => {
    const row = query.data?.content.find((item) => item.merchantId === merchantId)
    setEditing({ id: merchantId, name: row?.merchantName ?? merchantId })
  }
  const createForMerchant = (merchant: GatewayMerchant) => {
    setPickerOpen(false)
    setEditing({ id: merchant.id, name: merchant.name })
  }

  return <main className='flex min-w-0 flex-col gap-3'>
    <div className='flex flex-wrap items-end justify-between gap-3'>
      <div>
        <h1 className='font-display text-xl font-semibold text-foreground'>Hình thức chấp nhận thanh toán</h1>
        <p className='mt-1 text-sm text-muted-foreground'>Cấu hình các kênh thanh toán theo Merchant.</p>
      </div>
    </div>
    <PaymentMethodFilters onSearch={setFilters} />
    <PaymentMethodListCard rows={rows} total={query.data?.totalElements ?? 0} page={page} size={size} loading={query.isFetching} error={query.isError} onRefresh={() => void query.refetch()} onPageChange={(nextPage, nextSize) => { setPage(nextSize !== size ? 1 : nextPage); setSize(nextSize) }} onEdit={editFromTable} onCreate={() => setPickerOpen(true)} />
    <PaymentMerchantPickerDialog open={pickerOpen} onSelect={createForMerchant} onCancel={() => setPickerOpen(false)} />
    {editing && <PaymentMethodEditor merchantId={editing.id} merchantName={editing.name} onClose={() => setEditing(undefined)} />}
  </main>
}

export default PaymentMethodPage
