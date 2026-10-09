import { Link } from 'react-router-dom'

export interface WalletLimitBreadcrumbItem {
  label: string
  /** Bỏ trống ở mục cuối (trang hiện tại). */
  to?: string
}

interface WalletLimitDetailBreadcrumbProps {
  items: WalletLimitBreadcrumbItem[]
}

export function WalletLimitDetailBreadcrumb({
  items
}: WalletLimitDetailBreadcrumbProps) {
  return (
    <nav aria-label='Breadcrumb'>
      <ol className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className='flex items-center gap-2'
          >
            {index > 0 && <span aria-hidden>/</span>}
            {item.to ? (
              <Link
                to={item.to}
                className='underline underline-offset-4 hover:text-foreground'
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current='page'>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
