import { useState } from 'react'

import { KeyIcon } from '@components/icons'
import { MerchantGatewayPage } from '../../shared/MerchantGatewayPage'
import { MerchantGatewayToolbar } from '../../shared/MerchantGatewayToolbar'
import type { ListState } from '../../shared/merchantGateway.types'
import { KeyConnectionDialog } from '../components/KeyConnectionDialog'
import { KeyConnectionTable } from '../components/KeyConnectionTable'
import { KeyConnectionToolbar } from '../components/KeyConnectionToolbar'
import { useKeyConnections } from '../hooks/useKeyConnections'
import type { KeyConnectionFormValues } from '../schemas/keyConnection.schema'
import type { KeyConnectionRow } from '../types/keyConnection.type'

interface KeyConnectionPageProps {
  initialListState?: ListState
}

const KeyConnectionPage = ({ initialListState }: KeyConnectionPageProps) => {
  const [dialogRow, setDialogRow] = useState<KeyConnectionRow | null | undefined>(
    undefined
  )
  const connections = useKeyConnections({ initialListState })
  const isFiltered =
    connections.filters.query !== '' ||
    connections.filters.scope !== 'ALL' ||
    connections.filters.status !== 'ALL'

  const handleSave = (record: KeyConnectionFormValues & { id?: string }): void => {
    connections.save(record)
    setDialogRow(undefined)
  }

  return (
    <>
      <MerchantGatewayPage
        createLabel='Thêm mới Key'
        description='Quản lý Client ID, secret đã che và webhook kết nối giữa merchant với FlexPay.'
        onCreate={() => setDialogRow(null)}
        screen='MERCHANT_KEY_CONNECTION'
        title='Key kết nối'
        titleIcon={<KeyIcon aria-hidden />}
        total={connections.total}
      >
        <MerchantGatewayToolbar
          search={
            <KeyConnectionToolbar
              filters={connections.filters}
              onSearch={connections.setFilters}
            />
          }
        >
          <span className='sr-only'>Bộ lọc key kết nối</span>
        </MerchantGatewayToolbar>
        <KeyConnectionTable
          filtered={isFiltered}
          onEdit={setDialogRow}
          onPageChange={connections.setPage}
          onRetry={connections.retry}
          onToggleStatus={connections.toggleStatus}
          page={connections.page}
          pageSize={connections.pageSize}
          rows={connections.rows}
          state={connections.listState}
          total={connections.total}
        />
      </MerchantGatewayPage>
      <KeyConnectionDialog
        open={dialogRow !== undefined}
        row={dialogRow ?? null}
        onCancel={() => setDialogRow(undefined)}
        onSave={handleSave}
      />
    </>
  )
}

export default KeyConnectionPage
