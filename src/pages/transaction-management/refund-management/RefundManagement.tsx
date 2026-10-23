import { useState } from 'react'
import { FunnelIcon } from '@components/icons'
import { CardComponent } from '@components/index'
import { createRefundColumns } from './columns/refund.columns'
import { ApproveRefundDialog } from './components/ApproveRefundDialog'
import { PayoutApproveDialog } from './components/PayoutApproveDialog'
import { RefundDetailDrawer } from './components/RefundDetailDrawer'
import { RefundFilters } from './components/RefundFilters'
import { RefundListCard } from './components/RefundListCard'
import { RejectRefundDialog } from './components/RejectRefundDialog'
import { SettleRefundDialog } from './components/SettleRefundDialog'
import { useRefundActions } from './hooks/useRefundActions'
import { useRefundList } from './hooks/useRefundList'
import { useRefundPermissions } from './hooks/useRefundPermissions'
import type { RefundTarget } from './schemas/refund.schema'

type RefundDialogKind =
  | 'approve'
  | 'reject'
  | 'payoutApprove'
  | 'payoutReject'
  | 'settle'

type RefundDialog = { kind: RefundDialogKind; refund: RefundTarget } | null

const RefundManagement = () => {
  const list = useRefundList()
  const permissions = useRefundPermissions()
  const { refreshPayoutOrder, isRefreshingPayout } = useRefundActions()
  const [drawerId, setDrawerId] = useState<string | null>(null)
  const [dialog, setDialog] = useState<RefundDialog>(null)
  const [payoutId, setPayoutId] = useState<string>()

  const handlePayoutRefresh = async (refund: RefundTarget): Promise<void> => {
    setPayoutId(refund.id)
    await refreshPayoutOrder(refund.id)
    setPayoutId(undefined)
  }

  const columns = createRefundColumns({
    page: list.page,
    pageSize: list.pageSize,
    context: permissions,
    payoutRefreshingId: payoutId,
    onView: permissions.canViewDetail
      ? (refund) => setDrawerId(refund.id)
      : undefined,
    onApprove: (refund) => setDialog({ kind: 'approve', refund }),
    onReject: (refund) => setDialog({ kind: 'reject', refund }),
    onSettle: (refund) => setDialog({ kind: 'settle', refund }),
    onPayoutApprove: (refund) => setDialog({ kind: 'payoutApprove', refund }),
    onPayoutReject: (refund) => setDialog({ kind: 'payoutReject', refund }),
    onPayoutRefresh: handlePayoutRefresh
  })

  const closeDialog = (): void => setDialog(null)
  const openFromDrawer =
    (kind: RefundDialogKind) =>
    (refund: RefundTarget): void =>
      setDialog({ kind, refund })
  const filterKey = JSON.stringify([
    list.filters.keyword,
    list.filters.refundType,
    list.filters.channel,
    list.filters.createdSource,
    list.filters.createdFrom,
    list.filters.createdTo
  ])

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <header className='mb-4 flex items-center gap-2 border-b border-border pb-3'>
          <FunnelIcon
            aria-hidden
            size={18}
            className='text-secondary-foreground'
          />
          <h2 className='font-display text-base font-semibold'>
            Bộ lọc tìm kiếm
          </h2>
        </header>
        <RefundFilters
          key={filterKey}
          filters={list.filters}
          onStatusChange={list.setStatus}
          onApply={list.applyFilters}
          onClear={list.clearFilters}
        />
      </CardComponent>
      <RefundListCard
        list={list}
        columns={columns}
        isBusy={isRefreshingPayout}
      />
      {drawerId && (
        <RefundDetailDrawer
          refundId={drawerId}
          context={permissions}
          canViewFullAccountNumber={permissions.canViewFullAccountNumber}
          isPayoutRefreshing={isRefreshingPayout}
          onClose={() => setDrawerId(null)}
          onApprove={openFromDrawer('approve')}
          onReject={openFromDrawer('reject')}
          onSettle={openFromDrawer('settle')}
          onPayoutApprove={openFromDrawer('payoutApprove')}
          onPayoutReject={openFromDrawer('payoutReject')}
          onPayoutRefresh={handlePayoutRefresh}
        />
      )}
      {dialog?.kind === 'approve' && (
        <ApproveRefundDialog
          refund={dialog.refund}
          username={permissions.username}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'reject' && (
        <RejectRefundDialog
          refund={dialog.refund}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'payoutApprove' && (
        <PayoutApproveDialog
          refund={dialog.refund}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'payoutReject' && (
        <RejectRefundDialog
          payout
          refund={dialog.refund}
          onClose={closeDialog}
        />
      )}
      {dialog?.kind === 'settle' && (
        <SettleRefundDialog
          refund={dialog.refund}
          onClose={closeDialog}
        />
      )}
    </main>
  )
}

export default RefundManagement
