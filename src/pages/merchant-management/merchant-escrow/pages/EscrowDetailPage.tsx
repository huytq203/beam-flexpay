import { useParams } from 'react-router-dom'
import { useGetEscrowOverviewQuery } from '@/app/services/merchantEscrowApi'
import { ButtonComponent, CardComponent, TabComponent } from '@components/index'
import { EscrowConfigHistoryTab } from '../components/EscrowConfigHistoryTab'
import { EscrowContributionsTab } from '../components/EscrowContributionsTab'
import { EscrowLedgerTab } from '../components/EscrowLedgerTab'
import { EscrowObligationWait } from '../components/EscrowObligationWait'
import { EscrowStandingCard } from '../components/EscrowStandingCard'

/** Chi tiết ký quỹ của một Master. Task 4 gắn thêm panel cấu hình bên dưới thẻ tình trạng. */
export default function EscrowDetailPage() {
  const { masterId = '' } = useParams<{ masterId: string }>()
  const query = useGetEscrowOverviewQuery(masterId, { skip: !masterId })

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
      <CardComponent className='border border-border bg-background shadow-none'>
        <TabComponent
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
