import { CardComponent } from '@/components'
import {
  CheckCircleIcon,
  HourglassMediumIcon,
  LockSimpleIcon,
  StorefrontIcon,
} from '@phosphor-icons/react'

const TOTAL_ITEMS = [
  {
    title: 'Tổng số merchant',
    value: 0,
    icon: StorefrontIcon,
    iconClassName: 'bg-secondary text-secondary-foreground',
    sub: '32 trong tháng này',
  },
  {
    title: 'Đang hoạt động',
    value: 0,
    icon: CheckCircleIcon,
    iconClassName: 'bg-success/10 text-success-strong',
    sub: '87.3% tổng số',
  },
  {
    title: 'Chờ duyệt ĐVCNTT',
    value: 0,
    icon: HourglassMediumIcon,
    iconClassName: 'bg-warning/10 text-warning-strong',
    sub: 'Cần xử lý hồ sơ',
  },
  {
    title: 'Bị khóa / Ngừng',
    value: 0,
    icon: LockSimpleIcon,
    iconClassName: 'bg-danger/10 text-danger-strong',
    sub: '32 khóa · 42 ngừng hợp tác',
  },
]

const CardTotal = () => {
  return (
    <dl className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      {TOTAL_ITEMS.map((item) => {
        const Icon = item.icon

        return (
          <CardComponent
            key={item.title}
            className='h-full border-border bg-background! shadow-none'
            styles={{ body: { height: '100%', padding: 16 } }}
          >
            <div className='flex h-full min-h-24 items-start justify-between gap-4'>
              <div className='flex min-w-0 flex-1 flex-col'>
                <dt className='text-sm font-medium text-muted-foreground'>
                  {item.title}
                </dt>
                <dd className='mt-2 text-2xl font-semibold leading-none text-foreground tabular-nums'>
                  {item.value.toLocaleString('vi-VN')}
                </dd>
                <p className='mt-auto pt-3 text-xs leading-4 text-muted-foreground'>
                  {item.sub}
                </p>
              </div>

              <span
                aria-hidden='true'
                className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${item.iconClassName}`}
              >
                <Icon size={20} weight='bold' />
              </span>
            </div>
          </CardComponent>
        )
      })}
    </dl>
  )
}

export default CardTotal
