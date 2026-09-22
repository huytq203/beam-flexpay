import { ArrowSquareOutIcon, BankIcon, BellIcon, CreditCardIcon, KeyIcon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { CardComponent } from '@components/index'

const CONFIGURATIONS = [
  { screen: 'MERCHANT_BANK_ACCOUNT' as const, label: 'Tài khoản ngân hàng', path: SCREENS.MERCHANT_BANK_ACCOUNT.path, icon: BankIcon },
  { screen: 'MERCHANT_KEY_CONNECTION' as const, label: 'Key kết nối', path: SCREENS.MERCHANT_KEY_CONNECTION.path, icon: KeyIcon },
  { screen: 'MERCHANT_PAYMENT_METHOD' as const, label: 'Hình thức thanh toán', path: SCREENS.MERCHANT_PAYMENT_METHOD.path, icon: CreditCardIcon },
  { screen: 'MERCHANT_NOTIFICATION' as const, label: 'Cấu hình thông báo', path: SCREENS.MERCHANT_NOTIFICATION.path, icon: BellIcon }
]

export function OperatingConfigurationSection() {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='operating-config-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='operating-config-title'>Cấu hình vận hành</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Quản lý cấu hình chuyên biệt tại đúng phân hệ, không chỉnh sửa lẫn trong hồ sơ.</p>
        </header>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4'>
          {CONFIGURATIONS.map(({ screen, label, path, icon: Icon }) => (
            <Can action='view' key={screen} screen={screen}>
              <Link className='group flex min-h-12 items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-primary' to={path}>
                <Icon aria-hidden className='shrink-0 text-secondary-foreground' size={19} />
                <span className='min-w-0 flex-1'>{label}</span>
                <ArrowSquareOutIcon aria-hidden className='shrink-0 text-muted-foreground group-hover:text-secondary-foreground' size={16} />
              </Link>
            </Can>
          ))}
        </div>
      </section>
    </CardComponent>
  )
}
