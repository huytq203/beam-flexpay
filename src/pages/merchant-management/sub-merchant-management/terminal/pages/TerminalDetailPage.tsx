import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { EditOutlined, LockFilled, LockKeyOpenIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  TimeLineComponent
} from '@components/index'

import { EntityLockDialog } from '../../shared/EntityLockDialog'
import { ManagementPageHeader } from '../../shared/ManagementPageHeader'
import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import { InheritedPaymentSummary } from '../components/InheritedPaymentSummary'
import { TerminalNotFound } from '../components/TerminalNotFound'
import { TerminalOverview } from '../components/TerminalOverview'
import { changeTerminalStatus, useTerminal } from '../hooks/useTerminals'

export default function TerminalDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const record = useTerminal(id)
  const [lockOpen, setLockOpen] = useState(false)
  const listPath = SCREENS.MERCHANT_TERMINAL.path
  const goToList = (): void => {
    void navigate(listPath)
  }

  if (!record) return <TerminalNotFound onBack={goToList} />

  const isCascadeSuspended = record.status === 'SUSPENDED_BY_SUB'
  const isUnlock = record.status !== 'ACTIVE'
  const handleStatusChange = (reason: string): void => {
    changeTerminalStatus(record.id, reason)
    setLockOpen(false)
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <ManagementPageHeader
        title={record.name}
        description={`${record.tid} · ${record.subMerchantName}`}
        actions={
          <div className='flex flex-wrap items-center gap-2'>
            <ManagementStatusTag status={record.status} />
            {!isCascadeSuspended && (
              <Can
                screen='MERCHANT_TERMINAL'
                action='edit'
              >
                <Link
                  aria-label='Sửa Terminal'
                  className='inline-flex min-h-8 items-center gap-1.5 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary'
                  to={`${listPath}/edit/${record.id}`}
                >
                  <EditOutlined aria-hidden /> Sửa Terminal
                </Link>
              </Can>
            )}
            <Can
              screen='MERCHANT_TERMINAL'
              action='update'
            >
              <ButtonComponent
                aria-label={isUnlock ? 'Mở khóa Terminal' : 'Khóa Terminal'}
                content={isUnlock ? 'Mở khóa' : 'Khóa'}
                danger={!isUnlock}
                htmlType='button'
                icon={
                  isUnlock ? (
                    <LockKeyOpenIcon
                      aria-hidden
                      size={17}
                    />
                  ) : (
                    <LockFilled aria-hidden />
                  )
                }
                onClick={() => setLockOpen(true)}
                type='default'
              />
            </Can>
          </div>
        }
      />

      {isCascadeSuspended && (
        <section
          className='rounded-lg border border-danger-strong/30 bg-danger/5 p-4'
          role='alert'
        >
          <h2 className='font-display text-sm font-semibold text-danger-strong'>
            Terminal đang tạm ngưng theo Sub-merchant
          </h2>
          <p className='mt-1 text-sm text-foreground'>
            Cần mở khóa Sub-merchant cha trước; Terminal không thể mở khóa
            riêng.
          </p>
        </section>
      )}

      <CardComponent className='border border-border bg-background shadow-none'>
        <TerminalOverview record={record} />
      </CardComponent>
      <InheritedPaymentSummary
        methods={record.inheritedPaymentMethods}
        limit={record.inheritedLimitLabel}
      />
      <CardComponent className='border border-border bg-background shadow-none'>
        <section
          aria-labelledby='terminal-history-title'
          className='space-y-4'
        >
          <div className='border-b border-border pb-2'>
            <h2
              id='terminal-history-title'
              className='font-display text-sm font-semibold text-foreground'
            >
              Lịch sử cập nhật
            </h2>
            <p className='mt-1 text-xs text-muted-foreground'>
              Theo dõi các lần khởi tạo và cập nhật thông tin Terminal.
            </p>
          </div>
          <TimeLineComponent
            items={[
              {
                id: 'updated',
                title: 'Cập nhật thông tin gần nhất',
                time: record.updatedAt,
                color: 'blue'
              },
              {
                id: 'created',
                title: 'Khởi tạo Terminal',
                time: record.createdAt,
                color: 'green'
              }
            ]}
          />
        </section>
      </CardComponent>

      <EntityLockDialog
        blockedMessage={
          isCascadeSuspended ? 'Cần mở khóa Sub-merchant cha trước' : undefined
        }
        entityLabel={`${record.name} (${record.tid})`}
        mode={isUnlock ? 'unlock' : 'lock'}
        onCancel={() => setLockOpen(false)}
        onConfirm={handleStatusChange}
        open={lockOpen}
        previousReason={record.lastLockReason}
      />
    </main>
  )
}
