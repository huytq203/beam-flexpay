import { useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import { useGetSubMerchantDetailQuery } from '@/app/services/merchantHierarchyApi'
import {
  CardComponent,
  PickerTrigger,
  SubMerchantPickerDialog
} from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { ManagementPageHeader } from '../../sub-merchant-management/shared/ManagementPageHeader'
import { SettlementChangesPanel } from '../components/SettlementChangesPanel'
import { SettlementConfigForm } from '../components/SettlementConfigForm'

export default function SettlementConfigPage() {
  const access = useScreenAccess('MERCHANT_SETTLEMENT_CONFIG')
  const [searchParams, setSearchParams] = useSearchParams()
  const [picking, setPicking] = useState(false)
  const subId = searchParams.get('subId') ?? undefined
  const canView = access.can('view')
  const sub = useGetSubMerchantDetailQuery(subId ?? '', {
    skip: !subId || !canView
  })

  if (!canView)
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  const pick = (id?: string) => {
    setSearchParams(id ? { subId: id } : {})
    setPicking(false)
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <ManagementPageHeader
          description='Chế độ quyết toán, tần suất và số ngày chờ của từng Sub-merchant. Thay đổi làm nới lỏng cần người có quyền phê duyệt.'
          title='Cấu hình quyết toán'
        />
        <div className='mt-4 max-w-md'>
          <PickerTrigger
            id='settlement-sub'
            label='Sub-merchant'
            onClear={() => pick(undefined)}
            onOpen={() => setPicking(true)}
            placeholder='Chọn Sub-merchant'
            value={sub.data ? `${sub.data.code} — ${sub.data.name}` : undefined}
          />
        </div>
      </CardComponent>
      {subId ? (
        <>
          <CardComponent className='border border-border bg-background shadow-none'>
            <SettlementConfigForm
              key={subId}
              subId={subId}
            />
          </CardComponent>
          <CardComponent className='border border-border bg-background shadow-none'>
            <SettlementChangesPanel
              key={subId}
              subId={subId}
            />
          </CardComponent>
        </>
      ) : (
        <CardComponent className='border border-border bg-background shadow-none'>
          <p className='text-sm text-muted-foreground'>
            Chọn Sub-merchant để xem cấu hình
          </p>
        </CardComponent>
      )}
      <SubMerchantPickerDialog
        onCancel={() => setPicking(false)}
        onSelect={(value) => pick(value.id)}
        open={picking}
        selectedId={subId}
      />
    </main>
  )
}
