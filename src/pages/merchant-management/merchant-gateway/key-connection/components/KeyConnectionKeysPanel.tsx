import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useGetGatewayCredentialsQuery,
  useGetGatewayMerchantsQuery,
  type ApiCredential,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import { KeyIcon, PlusOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ExportCsvButton,
  Table
} from '@components/index'
import { createApiCredentialColumns } from '../columns/apiCredential.columns'
import { BeamPublicKeysDialog } from './BeamPublicKeysDialog'
import { CreateCredentialDialog } from './CreateCredentialDialog'
import { CredentialActionHost } from './CredentialActionHost'
import { CredentialDetailDrawer } from './CredentialDetailDrawer'
import { CredentialDetails } from './CredentialDetails'
import { CredentialExpandIcon } from './CredentialExpandIcon'
import { CredentialSecretDialog } from './CredentialSecretDialog'
import { KeyConnectionFilters } from './KeyConnectionFilters'
import { useKeyConnectionExport } from '../hooks/useKeyConnectionExport'
import { useKeyConnectionFilters } from '../hooks/useKeyConnectionFilters'
import type { CredentialAction } from '../types/credential.types'

const KeyConnectionKeysPanel = () => {
  const {
    merchant,
    status,
    draftMerchant,
    draftStatus,
    setDraftMerchant,
    setDraftStatus,
    page,
    size,
    search,
    clearSearch,
    changePage
  } = useKeyConnectionFilters()
  const [isCreating, setIsCreating] = useState(false)
  const [isViewingBeamKeys, setIsViewingBeamKeys] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [action, setAction] = useState<CredentialAction | null>(null)
  const [secret, setSecret] = useState<CredentialSecret | null>(null)

  const merchants = useGetGatewayMerchantsQuery({ page: 1, size: 100 })
  const filters = { merchantId: merchant?.id, status }
  const query = useGetGatewayCredentialsQuery({ page, size, ...filters })
  const { exportCsv, isExporting } = useKeyConnectionExport(filters)
  const total = query.data?.totalElements ?? 0

  const merchantName = (id: string) =>
    merchants.data?.content.find((item) => item.id === id)?.name ?? id
  const openAction =
    (type: CredentialAction['type']) => (credential: ApiCredential) =>
      setAction({ type, credential })

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <KeyConnectionFilters
          merchant={draftMerchant}
          status={draftStatus}
          canClear={Boolean(merchant || status || draftMerchant || draftStatus)}
          onMerchantChange={setDraftMerchant}
          onStatusChange={setDraftStatus}
          onClear={clearSearch}
          onSearch={search}
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <div>
            <h1 className='flex items-center gap-2 text-base font-semibold text-foreground'>
              <KeyIcon aria-hidden /> Danh sách key kết nối
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              {total} key · Cấp tại Master, Sub-merchant và Terminal sử dụng kế
              thừa
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <ButtonComponent
              type='default'
              content='Public key BEAM'
              htmlType='button'
              onClick={() => setIsViewingBeamKeys(true)}
            />
            <Can
              screen='MERCHANT_KEY_CONNECTION'
              action='view'
            >
              <ExportCsvButton
                onExport={exportCsv}
                loading={isExporting}
                disabled={total === 0}
              />
            </Can>
            <Can
              screen='MERCHANT_KEY_CONNECTION'
              action='create'
            >
              <ButtonComponent
                content='Tạo key'
                htmlType='button'
                icon={<PlusOutlined aria-hidden />}
                onClick={() => setIsCreating(true)}
              />
            </Can>
          </div>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải key kết nối.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<ApiCredential>
          rowKey='id'
          size='small'
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          pagination={{
            current: page,
            pageSize: size,
            total,
            onChange: changePage
          }}
          expandable={{
            expandedRowRender: (record) => (
              <CredentialDetails credential={record} />
            ),
            expandIcon: (props) => <CredentialExpandIcon {...props} />
          }}
          columns={createApiCredentialColumns({
            page,
            size,
            merchantName,
            onRotate: openAction('rotate'),
            onRevoke: openAction('revoke'),
            onView: (credential) => setDetailId(credential.id)
          })}
        />
      </CardComponent>
      {isCreating && (
        <CreateCredentialDialog
          initialMerchant={merchant}
          onClose={() => setIsCreating(false)}
          onCreated={(created) => {
            setIsCreating(false)
            setSecret(created)
          }}
        />
      )}
      {isViewingBeamKeys && (
        <BeamPublicKeysDialog onClose={() => setIsViewingBeamKeys(false)} />
      )}
      <CredentialDetailDrawer
        credentialId={detailId}
        onClose={() => setDetailId(null)}
        onAction={(type, credential) => setAction({ type, credential })}
      />
      <CredentialActionHost
        action={action}
        onClose={() => setAction(null)}
        onSecret={setSecret}
      />
      <CredentialSecretDialog
        secret={secret}
        onClose={() => setSecret(null)}
      />
    </main>
  )
}

export default KeyConnectionKeysPanel
