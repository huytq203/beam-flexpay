import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import { cn } from '@lib/utils/cn'
import useOpenWalletDetail, {
  canResolveWallet,
  walletDetailPath
} from './useOpenWalletDetail'

interface WalletLinkProps {
  /** Id ví nếu dòng dữ liệu có sẵn: đi thẳng tới chi tiết ví. */
  walletId?: string | null
  /** Chủ ví (id hoặc SĐT) khi dòng dữ liệu không có id ví: tra ví rồi mới chuyển. */
  ownerId?: string | null
  username?: string | null
  className?: string
  children: ReactNode
}

const LINK_CLASS =
  'text-blue-600 underline-offset-2 hover:underline hover:text-blue-700'

/** Biến tên/SĐT của tài khoản thành đường dẫn tới màn chi tiết ví. */
const WalletLink = ({
  walletId,
  ownerId,
  username,
  className,
  children
}: WalletLinkProps) => {
  const { can } = useScreenAccess('EWALLET_MANAGEMENT')
  const { openByOwner, isOpening } = useOpenWalletDetail()

  if (!can('viewDetail')) return <>{children}</>

  if (walletId) {
    return (
      <Link
        to={walletDetailPath(walletId)}
        className={cn(LINK_CLASS, className)}
      >
        {children}
      </Link>
    )
  }

  if (!canResolveWallet({ ownerId, username })) return <>{children}</>

  return (
    <button
      type='button'
      disabled={isOpening}
      onClick={() => void openByOwner({ ownerId, username })}
      className={cn(
        'cursor-pointer border-0 bg-transparent p-0 text-inherit',
        LINK_CLASS,
        isOpening && 'cursor-wait opacity-60',
        className
      )}
    >
      {children}
    </button>
  )
}

export default WalletLink
