import type { MerchantGatewayToolbarProps } from './merchantGateway.types'

export function MerchantGatewayToolbar({
  children,
  search
}: MerchantGatewayToolbarProps) {
  return (
    <section aria-label='Tìm kiếm và lọc cấu hình merchant' className='w-full' role='search'>
      {search}
      {children}
    </section>
  )
}
