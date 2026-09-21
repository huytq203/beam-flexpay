import type { MerchantGatewayToolbarProps } from './merchantGateway.types'

export function MerchantGatewayToolbar({
  children,
  search
}: MerchantGatewayToolbarProps) {
  return (
    <section aria-label='Tìm kiếm và lọc cấu hình merchant' className='flex flex-wrap gap-2' role='search'>
      {search}
      {children}
    </section>
  )
}
