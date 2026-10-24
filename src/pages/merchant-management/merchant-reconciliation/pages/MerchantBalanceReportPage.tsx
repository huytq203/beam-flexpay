import { Navigate } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import { CardComponent } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { ManagementPageHeader } from '../../sub-merchant-management/shared/ManagementPageHeader'
import { BalanceReportPanel } from '../components/BalanceReportPanel'

const CARD = 'border border-border bg-background shadow-none'

export default function MerchantBalanceReportPage() {
  const report = useScreenAccess('MERCHANT_BALANCE_REPORT')
  const reconciliation = useScreenAccess('MERCHANT_RECONCILIATION')
  // BE cũng cho xem báo cáo bằng một trong ba quyền đối soát.
  const canView =
    report.can('view') ||
    reconciliation.can('view') ||
    reconciliation.can('run') ||
    reconciliation.can('confirm')

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
          description='Doanh thu, số dư khả dụng, khoản chờ quyết toán và các khoản đóng băng của một Sub-merchant, kèm giải thích vì sao số tiền rút được ít hơn tổng doanh thu. Số liệu lấy trực tiếp từ sổ cái.'
          title='Báo cáo số dư'
        />
      </CardComponent>
      <CardComponent className={CARD}>
        <BalanceReportPanel />
      </CardComponent>
    </main>
  )
}
