import { useParams, useSearchParams } from 'react-router-dom'
import { useGetEscrowOverviewQuery } from '@/app/services/merchantEscrowApi'
import { ButtonComponent, CardComponent, TabComponent } from '@components/index'
import { EscrowConfigHistoryTab } from '../components/EscrowConfigHistoryTab'
import { EscrowConfigPanel } from '../components/EscrowConfigPanel'
import { EscrowContributionsTab } from '../components/EscrowContributionsTab'
import { EscrowLedgerTab } from '../components/EscrowLedgerTab'
import { EscrowObligationWait } from '../components/EscrowObligationWait'
import { EscrowOrdersTab } from '../components/EscrowOrdersTab'
import { EscrowStandingCard } from '../components/EscrowStandingCard'

/** Chi tiết ký quỹ của một Master: thẻ tình trạng, panel cấu hình (sửa/đề xuất chờ duyệt) và các tab. */
export default function EscrowDetailPage() {
  const { masterId = '' } = useParams<{ masterId: string }>()
  const query = useGetEscrowOverviewQuery(masterId, { skip: !masterId })
  // Tab đang mở nằm trên URL (`?tab=orders`) để danh sách dẫn thẳng vào tab lệnh nạp và F5 giữ tab.
  const [searchParams, setSearchParams] = useSearchParams()
  const tab = searchParams.get('tab') ?? 'ledger'

  if (query.isError) {
    return (
      <div
        role='alert'
        className='flex items-center justify-between gap-2 rounded-lg border border-danger-strong/30 p-3 text-sm text-danger-strong'
      >
        Không tải được thông tin ký quỹ.
        <ButtonComponent
          size='small'
          type='default'
          content='Thử lại'
          onClick={() => void query.refetch()}
        />
      </div>
    )
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      {query.data && <EscrowStandingCard overview={query.data} />}
      <EscrowConfigPanel masterId={masterId} />
      <CardComponent className='border border-border bg-background shadow-none'>
        <TabComponent
          // TabComponent bỏ qua `activeKey` (chỉ chạy dạng không điều khiển), nên tab từ URL chỉ dùng
          // làm tab mở đầu; đổi tab thì ghi lại vào URL.
          defaultActiveKey={tab}
          onChange={(key) =>
            setSearchParams(
              (params) => {
                params.set('tab', key)
                return params
              },
              { replace: true }
            )
          }
          items={[
            {
              key: 'ledger',
              label: 'Sổ cái',
              children: <EscrowLedgerTab masterId={masterId} />
            },
            {
              key: 'contributions',
              label: 'Đóng góp',
              children: <EscrowContributionsTab masterId={masterId} />
            },
            {
              key: 'orders',
              label: 'Lệnh nạp ký quỹ',
              children: (
                <EscrowOrdersTab
                  masterId={masterId}
                  overview={query.data}
                />
              )
            },
            {
              key: 'history',
              label: 'Lịch sử cấu hình',
              children: <EscrowConfigHistoryTab masterId={masterId} />
            },
            {
              key: 'wait',
              label: 'Số ngày chờ nghĩa vụ',
              children: <EscrowObligationWait masterId={masterId} />
            }
          ]}
        />
      </CardComponent>
    </main>
  )
}
