import { CardComponent } from '@/components'
import { useGetMerchantQuery } from '@services/apiMerchant'
import { CheckCircleIcon, HourglassMediumIcon, LockSimpleIcon, StorefrontIcon } from '@phosphor-icons/react'

const baseQuery = { page: 1, size: 1 }

const CardTotal = () => {
  const total = useGetMerchantQuery(baseQuery)
  const active = useGetMerchantQuery({ ...baseQuery, status: 'ACTIVE' })
  const pending = useGetMerchantQuery({ ...baseQuery, status: 'PENDING_APPROVAL' })
  const locked = useGetMerchantQuery({ ...baseQuery, status: 'LOCKED' })
  const items = [
    { title: 'Tổng số merchant', value: total.data?.totalElements, icon: StorefrontIcon, iconClass: 'bg-secondary text-secondary-foreground' },
    { title: 'Đang hoạt động', value: active.data?.totalElements, icon: CheckCircleIcon, iconClass: 'bg-success/10 text-success-strong' },
    { title: 'Chờ duyệt ĐVCNTT', value: pending.data?.totalElements, icon: HourglassMediumIcon, iconClass: 'bg-warning/10 text-warning-strong' },
    { title: 'Bị khóa', value: locked.data?.totalElements, icon: LockSimpleIcon, iconClass: 'bg-danger/10 text-danger-strong' }
  ]

  return <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
    {items.map(({ title, value, icon: Icon, iconClass }) => <CardComponent key={title} className='h-full border-border bg-background! shadow-none' styles={{ body: { padding: 16 } }}>
      <div className='flex min-h-20 items-start justify-between gap-4'>
        <div><dt className='text-sm font-medium text-muted-foreground'>{title}</dt><dd className='mt-2 text-2xl font-semibold text-foreground tabular-nums'>{value === undefined ? '—' : value.toLocaleString('vi-VN')}</dd></div>
        <span aria-hidden='true' className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${iconClass}`}><Icon size={20} weight='bold' /></span>
      </div>
    </CardComponent>)}
  </dl>
}

export default CardTotal
