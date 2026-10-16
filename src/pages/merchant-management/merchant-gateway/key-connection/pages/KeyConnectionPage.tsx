import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useGetGatewayCredentialsQuery,
  useGetGatewayMerchantsQuery,
  type ApiCredential,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import { KeyIcon, PlusOutlined } from '@components/icons'
import { ButtonComponent, CardComponent, Table } from '@components/index'
import { createApiCredentialColumns } from '../columns/apiCredential.columns'
import { CreateCredentialDialog } from '../components/CreateCredentialDialog'
import {
  CredentialActionDialog,
  type CredentialAction
} from '../components/CredentialActionDialog'
import { CredentialDetails } from '../components/CredentialDetails'
import { CredentialExpandIcon } from '../components/CredentialExpandIcon'
import { CredentialSecretDialog } from '../components/CredentialSecretDialog'
import { KeyConnectionFilters } from '../components/KeyConnectionFilters'
import { useKeyConnectionFilters } from '../hooks/useKeyConnectionFilters'

const KeyConnectionPage = () => {
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
  const [action, setAction] = useState<CredentialAction | null>(null)
  const [secret, setSecret] = useState<CredentialSecret | null>(null)

  const merchants = useGetGatewayMerchantsQuery({ page: 1, size: 100 })
  const query = useGetGatewayCredentialsQuery({
    page,
    size,
    merchantId: merchant?.id,
    status
  })

  const merchantName = (id: string) =>
    merchants.data?.content.find((item) => item.id === id)?.name ?? id

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
              {query.data?.totalElements ?? 0} key · Cấp tại Master,
              Sub-merchant và Terminal sử dụng kế thừa
            </p>
          </div>
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
            total: query.data?.totalElements ?? 0,
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
            onRotate: (credential) => setAction({ type: 'rotate', credential }),
            onRevoke: (credential) => setAction({ type: 'revoke', credential })
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
      {action && (
        <CredentialActionDialog
          action={action}
          onClose={() => setAction(null)}
          onRotated={setSecret}
        />
      )}
      <CredentialSecretDialog
        secret={secret}
        onClose={() => setSecret(null)}
      />
    </main>
  )
}

export default KeyConnectionPage
