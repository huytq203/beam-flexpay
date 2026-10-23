import { useState } from 'react'
import type { GatewayMerchant } from '@/app/services/merchantGatewayApi'
import type { PaymentMethodListRow } from '@/app/services/merchantPaymentMethodApi'
import type { PickedEntity } from '@components/index'
import { PaymentMethodEditor } from '../components/PaymentMethodEditor'
import { PaymentMerchantPickerDialog } from '../components/PaymentMerchantPickerDialog'
import { PaymentMethodFilters } from '../components/PaymentMethodFilters'
import { PaymentMethodListCard } from '../components/PaymentMethodListCard'
import { usePaymentMethodListData } from '../hooks/usePaymentMethodListData'

interface EditingTarget {
  id: string
  name: string
  sub?: PickedEntity
}

const toEditingTarget = (row: PaymentMethodListRow): EditingTarget => ({
  id: row.merchantId,
  name: row.merchantName,
  sub: row.subMerchantId
    ? {
        id: row.subMerchantId,
        code: row.subMerchantCode ?? '',
        name: row.subMerchantName ?? row.subMerchantId
      }
    : undefined
})

const PaymentMethodPage = () => {
  const list = usePaymentMethodListData()
  const { url, page, size, query } = list
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editing, setEditing] = useState<EditingTarget>()
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
            Cấu hình các kênh thanh toán theo Merchant và Sub-merchant.
          </p>
        </div>
      </div>
      <PaymentMethodFilters
        initialValues={list.filters}
        onSearch={url.applyFilters}
        onClear={url.clearFilters}
      />
      <PaymentMethodListCard
        rows={list.rows}
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
        onEdit={(row) => setEditing(toEditingTarget(row))}
        onCreate={() => setPickerOpen(true)}
        onExport={list.exportCsv}
        exporting={list.isExporting}
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
          initialSub={editing.sub}
          onClose={() => setEditing(undefined)}
        />
      )}
    </main>
  )
}

export default PaymentMethodPage
