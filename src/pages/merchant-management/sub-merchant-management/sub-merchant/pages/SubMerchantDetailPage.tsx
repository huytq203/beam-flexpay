import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { ArrowLeftOutlined, EditOutlined, LockFilled, LockKeyOpenIcon, WarningIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'

import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import { SubMerchantConfigurationSummary } from '../components/SubMerchantConfigurationSummary'
import { SubMerchantHistoryAction } from '../components/SubMerchantHistoryAction'
import { SubMerchantLockDialog } from '../components/SubMerchantLockDialog'
import { SubMerchantMetrics } from '../components/SubMerchantMetrics'
import { SubMerchantOverview } from '../components/SubMerchantOverview'
import { toggleSubMerchantStatus, useSubMerchantRecord } from '../hooks/useSubMerchants'
import type { SubMerchantRow } from '../types/subMerchant.type'

function DetailNotFound({ onBack }: { onBack: () => void }) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section className='flex min-h-64 flex-col items-center justify-center gap-3 text-center' role='alert'>
        <WarningIcon aria-hidden className='text-warning-strong' size={32} />
        <h1 className='font-display text-lg font-semibold text-foreground'>Không tìm thấy Sub-merchant</h1>
        <p className='text-sm text-muted-foreground'>Bản ghi có thể đã bị xóa hoặc đường dẫn không còn hợp lệ.</p>
        <ButtonComponent content='Về danh sách Sub-merchant' htmlType='button' onClick={onBack} type='default' />
      </section>
    </CardComponent>
  )
}

interface DetailHeaderProps {
  record: SubMerchantRow
  onBack: () => void
  onEdit: () => void
  onStatus: () => void
}

function DetailHeader({ record, onBack, onEdit, onStatus }: DetailHeaderProps) {
  const isActive = record.status === 'ACTIVE'
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <header className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
        <div className='flex min-w-0 items-start gap-3'>
          <ButtonComponent aria-label='Quay lại danh sách Sub-merchant' htmlType='button' icon={<ArrowLeftOutlined aria-hidden />} onClick={onBack} type='default' />
          <div className='min-w-0 space-y-1'>
            <div className='flex flex-wrap items-center gap-2'><h1 className='font-display text-xl font-semibold text-foreground'>{record.name}</h1><ManagementStatusTag status={record.status} /></div>
            <p className='text-sm text-muted-foreground'>{record.code} · {record.parentMerchantName}</p>
          </div>
        </div>
        <div className='flex flex-col gap-2 sm:flex-row'>
          <SubMerchantHistoryAction />
          {record.status !== 'SUSPENDED_BY_PARENT' && (
            <Can action='edit' screen='MERCHANT_SUB_MERCHANT'><ButtonComponent className='w-full sm:w-auto' content='Sửa Sub-merchant' htmlType='button' icon={<EditOutlined aria-hidden />} onClick={onEdit} type='default' /></Can>
          )}
          <Can action={isActive ? 'lock' : 'unlock'} screen='MERCHANT_SUB_MERCHANT'><ButtonComponent className='w-full sm:w-auto' content={`${isActive ? 'Khóa' : 'Mở khóa'} Sub-merchant`} danger={isActive} htmlType='button' icon={isActive ? <LockFilled aria-hidden /> : <LockKeyOpenIcon aria-hidden size={17} />} onClick={onStatus} type='default' /></Can>
        </div>
      </header>
    </CardComponent>
  )
}

export default function SubMerchantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const record = useSubMerchantRecord(id)
  const [lockOpen, setLockOpen] = useState(false)
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path

  if (!record) return <DetailNotFound onBack={() => void navigate(basePath)} />

  const handleStatusChange = (reason: string): void => {
    if (toggleSubMerchantStatus(record.id, reason)) setLockOpen(false)
  }

  return (
    <main className='mx-0 flex min-w-0 flex-col gap-3 md:mx-5'>
      <DetailHeader record={record} onBack={() => void navigate(basePath)} onEdit={() => void navigate(`${basePath}/edit/${record.id}`)} onStatus={() => setLockOpen(true)} />
      <SubMerchantMetrics record={record} />
      <div className='grid grid-cols-1 gap-3 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]'>
        <SubMerchantOverview record={record} />
        <SubMerchantConfigurationSummary masked record={record} />
      </div>
      <SubMerchantLockDialog
        record={record}
        onCancel={() => setLockOpen(false)}
        onConfirm={handleStatusChange}
        open={lockOpen}
      />
    </main>
  )
}
