import { useState } from 'react'
import { ReceiptIcon } from '@components/icons'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { JournalSummary } from '@components/transaction/JournalSummary'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { createMerchantTransactionColumns } from '../columns/merchantTransaction.columns'
import { MerchantTransactionDetailDrawer } from '../components/MerchantTransactionDetailDrawer'
import { MerchantTransactionFilters } from '../components/MerchantTransactionFilters'
import { useMerchantTransactionList } from '../hooks/useMerchantTransactionList'

const MerchantTransactionPage = () => {
  const list = useMerchantTransactionList()
  const [selected, setSelected] = useState<UnifiedContentJournal | null>(null)
  const { query } = list

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <MerchantTransactionFilters
          draft={list.draft}
          onChange={list.setDraft}
          onApply={list.apply}
          onReset={list.reset}
        />
      </CardComponent>
      <JournalSummary
        ariaLabel='Tóm tắt giao dịch merchant'
        summary={query.data?.summary}
        isLoading={query.isLoading}
        activeStatus={list.filters.status}
        onStatusChange={list.changeStatus}
      />
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 border-b border-border pb-3'>
          <h1 className='flex items-center gap-2 text-base font-semibold text-foreground'>
            <ReceiptIcon aria-hidden /> Danh sách giao dịch merchant
          </h1>
          <p className='mt-1 text-xs text-muted-foreground'>
            {query.data?.totalElements ?? 0} giao dịch
          </p>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải giao dịch.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<UnifiedContentJournal>
          rowKey='id'
          size='small'
          scroll={{ x: 1300 }}
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          locale={{ emptyText: 'Không có giao dịch nào khớp bộ lọc' }}
          pagination={{
            current: list.page,
            pageSize: list.size,
            total: query.data?.totalElements ?? 0,
            onChange: list.changePage
          }}
          columns={createMerchantTransactionColumns({
            page: list.page,
            size: list.size,
            onOpenDetail: setSelected
          })}
        />
      </CardComponent>
      <MerchantTransactionDetailDrawer
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  )
}

export default MerchantTransactionPage
