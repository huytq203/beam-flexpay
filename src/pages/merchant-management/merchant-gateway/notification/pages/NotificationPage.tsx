import { useState } from 'react'

import { BroadcastIcon } from '@components/icons'

import { MerchantGatewayPage } from '../../shared/MerchantGatewayPage'
import { MerchantGatewayToolbar } from '../../shared/MerchantGatewayToolbar'
import type { ListState } from '../../shared/merchantGateway.types'
import { NotificationDialog } from '../components/NotificationDialog'
import { NotificationTable } from '../components/NotificationTable'
import { NotificationToolbar } from '../components/NotificationToolbar'
import { useNotifications } from '../hooks/useNotifications'
import type { NotificationFormValues } from '../schemas/notification.schema'
import type { NotificationRow } from '../types/notification.type'

interface Props { initialListState?: ListState }

const NotificationPage = ({ initialListState }: Props) => {
  const [dialogRow, setDialogRow] = useState<NotificationRow | null | undefined>(undefined)
  const data = useNotifications({ initialListState })
  const filtered = data.filters.query !== '' || data.filters.event !== 'ALL' || data.filters.channel !== 'ALL' || data.filters.status !== 'ALL'
  const save = (values: NotificationFormValues & { id?: string }) => { data.save(values); setDialogRow(undefined) }

  return <>
    <MerchantGatewayPage createLabel='Thêm thông báo' description='Thiết lập kênh nhận thông báo giao dịch theo merchant và sự kiện.' isError={data.listState === 'error'} isLoading={data.listState === 'loading'} onCreate={() => setDialogRow(null)} screen='MERCHANT_NOTIFICATION' title='Thông báo' titleIcon={<BroadcastIcon aria-hidden />} total={data.total}>
      <MerchantGatewayToolbar search={<NotificationToolbar filters={data.filters} onSearch={data.setFilters} />}><span className='sr-only'>Bộ lọc thông báo</span></MerchantGatewayToolbar>
      <NotificationTable filtered={filtered} onEdit={setDialogRow} onPageChange={data.setPage} onRetry={data.retry} onToggleStatus={data.toggleStatus} page={data.page} pageSize={data.pageSize} rows={data.rows} state={data.listState} total={data.total} />
    </MerchantGatewayPage>
    <NotificationDialog open={dialogRow !== undefined} row={dialogRow ?? null} onCancel={() => setDialogRow(undefined)} onSave={save} />
  </>
}

export default NotificationPage
