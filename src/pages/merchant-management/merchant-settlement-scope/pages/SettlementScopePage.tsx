import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import {
  CardComponent,
  TabComponent,
  type PickedEntity
} from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { ManagementPageHeader } from '../../sub-merchant-management/shared/ManagementPageHeader'
import { EffectiveAtPanel } from '../components/EffectiveAtPanel'
import { MasterConfigListPanel } from '../components/MasterConfigListPanel'
import { ScopeConfigPanel } from '../components/ScopeConfigPanel'
import { ScopeHistoryPanel } from '../components/ScopeHistoryPanel'
import { ScopeTargetPicker } from '../components/ScopeTargetPicker'
import { SCOPE_TAB_KEYS } from '../constants/settlementScope.constants'

export default function SettlementScopePage() {
  const access = useScreenAccess('MERCHANT_SETTLEMENT_SCOPE')
  const [master, setMaster] = useState<PickedEntity>()

  if (!access.can('view'))
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  const masterTab = (
    <div className='flex flex-col gap-4'>
      <div className='max-w-md'>
        <ScopeTargetPicker
          kind='master'
          value={master}
          onChange={setMaster}
        />
      </div>
      {master ? (
        <ScopeConfigPanel
          key={master.id}
          masterId={master.id}
        />
      ) : (
        <MasterConfigListPanel
          onOpen={(row) =>
            setMaster({
              id: row.merchantId,
              code: row.merchantCode,
              name: row.merchantName
            })
          }
        />
      )}
    </div>
  )

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <ManagementPageHeader
          description='Khối quyết toán riêng của Master, mặc định toàn hệ thống và lịch sử thay đổi. Sub-merchant kế thừa theo từng trường: Sub, rồi Master, rồi Hệ thống.'
          title='Quyết toán cấp Master và hệ thống'
        />
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <TabComponent
          defaultActiveKey={SCOPE_TAB_KEYS.master}
          destroyOnHidden
          items={[
            {
              key: SCOPE_TAB_KEYS.master,
              label: 'Master',
              children: masterTab
            },
            {
              key: SCOPE_TAB_KEYS.system,
              label: 'Mặc định hệ thống',
              children: <ScopeConfigPanel />
            },
            {
              key: SCOPE_TAB_KEYS.history,
              label: 'Lịch sử thay đổi',
              children: <ScopeHistoryPanel initialMaster={master} />
            },
            {
              key: SCOPE_TAB_KEYS.at,
              label: 'Tra cứu theo thời điểm',
              children: <EffectiveAtPanel />
            }
          ]}
        />
      </CardComponent>
    </main>
  )
}
