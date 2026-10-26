import { Can } from '@/app/permissions'
import {
  useGetGatewayCredentialQuery,
  type ApiCredential
} from '@/app/services/merchantGatewayApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  ButtonComponent,
  DrawerComponent,
  TabComponent,
  TagComponent
} from '@components/index'
import { CREDENTIAL_STATUS } from '../constants/credential.constants'
import type { CredentialActionType } from '../types/credential.types'
import { CredentialDetails } from './CredentialDetails'
import { SignatureHistoryTable } from './SignatureHistoryTable'
import { SignatureTestPanel } from './SignatureTestPanel'

interface CredentialDetailDrawerProps {
  credentialId: string | null
  onClose: () => void
  onAction: (type: CredentialActionType, credential: ApiCredential) => void
}

function DrawerActions({
  credential,
  onAction
}: {
  credential: ApiCredential
  onAction: CredentialDetailDrawerProps['onAction']
}) {
  // Key đã thu hồi/hết hạn không còn thay đổi được (BE trả 5303/5304).
  if (credential.status !== 'ACTIVE' && credential.status !== 'SUSPENDED')
    return null
  return (
    <Can
      screen='MERCHANT_KEY_CONNECTION'
      action='edit'
    >
      <div className='flex flex-wrap gap-2'>
        <ButtonComponent
          type='default'
          size='small'
          content='Sửa IP Whitelist'
          onClick={() => onAction('ip', credential)}
        />
        <ButtonComponent
          type='default'
          size='small'
          content={
            credential.status === 'ACTIVE' ? 'Tạm dừng' : 'Kích hoạt lại'
          }
          onClick={() => onAction('status', credential)}
        />
        <ButtonComponent
          type='default'
          size='small'
          content='Đổi cơ chế xác thực'
          onClick={() => onAction('convert', credential)}
        />
      </div>
    </Can>
  )
}

export function CredentialDetailDrawer({
  credentialId,
  onClose,
  onAction
}: CredentialDetailDrawerProps) {
  const query = useGetGatewayCredentialQuery(credentialId ?? '', {
    skip: !credentialId
  })
  const credential = query.data

  return (
    <DrawerComponent
      open={credentialId !== null}
      onClose={onClose}
      width='min(100vw, 880px)'
      destroyOnHidden
      title={
        <span className='flex items-center gap-2'>
          Chi tiết key kết nối
          {credential && (
            <TagComponent color={CREDENTIAL_STATUS[credential.status]?.color}>
              {CREDENTIAL_STATUS[credential.status]?.label}
            </TagComponent>
          )}
        </span>
      }
    >
      {query.isLoading && (
        <p className='text-sm text-muted-foreground'>Đang tải chi tiết key…</p>
      )}
      {query.isError && (
        <div
          role='alert'
          className='flex items-center justify-between gap-2 text-sm text-danger-strong'
        >
          {getApiErrorDetail(query.error, 'Không thể tải chi tiết key.')}
          <ButtonComponent
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void query.refetch()}
          />
        </div>
      )}
      {credential && (
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <div className='min-w-0'>
              <p className='font-semibold'>
                {credential.name || 'Key chưa đặt tên'}
              </p>
              <p className='break-all font-mono text-xs text-muted-foreground'>
                {credential.clientId}
              </p>
            </div>
            <DrawerActions
              credential={credential}
              onAction={onAction}
            />
          </div>
          <TabComponent
            items={[
              {
                key: 'info',
                label: 'Thông tin',
                children: <CredentialDetails credential={credential} />
              },
              {
                key: 'history',
                label: 'Lịch sử xác thực chữ ký',
                children: <SignatureHistoryTable credentialId={credential.id} />
              },
              {
                key: 'test',
                label: 'Kiểm tra chữ ký',
                children: <SignatureTestPanel credential={credential} />
              }
            ]}
          />
        </div>
      )}
    </DrawerComponent>
  )
}
