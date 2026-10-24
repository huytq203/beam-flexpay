import { Navigate } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import { CardComponent, TabComponent } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { ManagementPageHeader } from '../../sub-merchant-management/shared/ManagementPageHeader'
import { PausesPanel } from '../components/PausesPanel'
import { ResultsPanel } from '../components/ResultsPanel'
import { RECONCILIATION_TAB_KEYS } from '../constants/reconciliation.constants'

const CARD = 'border border-border bg-background shadow-none'

export default function MerchantReconciliationPage() {
  const access = useScreenAccess('MERCHANT_RECONCILIATION')
  // BE cho xem với một trong ba quyền xem, chạy hoặc xác nhận.
  const canView =
    access.can('view') || access.can('run') || access.can('confirm')

  if (!canView)
    return (
      <Navigate
        replace
        to={FORBIDDENERROR}
      />
    )

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className={CARD}>
        <ManagementPageHeader
          description='Đối soát chín phương trình số dư của Sub-merchant giữa sổ cái và chi tiết quyết toán. Khi lệch, Sub bị tạm dừng quyết toán: không tạo được lệnh rút mới và không giải phóng sớm khoản tạm giữ cho tới khi được xác nhận đã xử lý. Màn này không sửa số dư.'
          title='Đối soát số dư'
        />
      </CardComponent>
      <CardComponent className={CARD}>
        <TabComponent
          defaultActiveKey={RECONCILIATION_TAB_KEYS.pauses}
          destroyOnHidden
          items={[
            {
              key: RECONCILIATION_TAB_KEYS.pauses,
              label: 'Đang tạm dừng quyết toán',
              children: <PausesPanel />
            },
            {
              key: RECONCILIATION_TAB_KEYS.results,
              label: 'Kết quả đối soát',
              children: <ResultsPanel />
            }
          ]}
        />
      </CardComponent>
    </main>
  )
}
