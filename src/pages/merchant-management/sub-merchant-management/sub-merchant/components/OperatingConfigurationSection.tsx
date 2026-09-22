import { ArrowSquareOutIcon, BankIcon, BellIcon, CreditCardIcon, KeyIcon } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'

import { Can, SCREENS } from '@/app/permissions'
import { CardComponent } from '@components/index'

import type { SubMerchantConfigurationSources } from '../types/subMerchant.type'

const CONFIGURATIONS = [
  { key: 'bank', screen: 'MERCHANT_BANK_ACCOUNT', label: 'Tài khoản ngân hàng', path: SCREENS.MERCHANT_BANK_ACCOUNT.path, icon: BankIcon },
  { key: 'key', screen: 'MERCHANT_KEY_CONNECTION', label: 'Key kết nối', path: SCREENS.MERCHANT_KEY_CONNECTION.path, icon: KeyIcon },
  { key: 'payment', screen: 'MERCHANT_PAYMENT_METHOD', label: 'Hình thức thanh toán', path: SCREENS.MERCHANT_PAYMENT_METHOD.path, icon: CreditCardIcon },
  { key: 'notification', screen: 'MERCHANT_NOTIFICATION', label: 'Cấu hình thông báo', path: SCREENS.MERCHANT_NOTIFICATION.path, icon: BellIcon }
] as const

export function OperatingConfigurationSection({ sources }: { sources?: SubMerchantConfigurationSources }) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section aria-labelledby='operating-config-title' className='space-y-4'>
        <header className='border-b border-border pb-3'>
          <h2 className='font-display text-base font-semibold text-foreground' id='operating-config-title'>Cấu hình vận hành</h2>
          <p className='mt-1 text-xs text-muted-foreground'>Quản lý cấu hình chuyên biệt tại đúng phân hệ, không chỉnh sửa lẫn trong hồ sơ.</p>
        </header>
        <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4'>
          {CONFIGURATIONS.map(({ key, screen, label, path, icon: Icon }) => (
            <div className='rounded-lg border border-border bg-background p-3' key={key}>
              <div className='flex items-center gap-2 text-sm font-medium text-foreground'>
                <Icon aria-hidden className='shrink-0 text-secondary-foreground' size={19} /><span>{label}</span>
              </div>
              <p className='mt-1 text-xs text-muted-foreground'>
                {sources?.[key] === 'OVERRIDDEN' ? 'Cấu hình riêng' : 'Kế thừa từ Master'}
              </p>
              <Can action='view' screen={screen}>
                <Link aria-label={label} className='mt-2 inline-flex items-center gap-1 rounded-md text-sm font-medium text-secondary-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary' to={path}>
                  Quản lý <ArrowSquareOutIcon aria-hidden size={16} />
                </Link>
              </Can>
            </div>
          ))}
        </div>
      </section>
    </CardComponent>
  )
}
