import { useScreenAccess } from '@/app/permissions'
import { ClipboardTextIcon } from '@components/icons'

import type { MerchantUser } from '../types/merchantAccess.types'
import { AccessActionButton } from './AccessActionButton'

interface UserReviewScopeButtonProps {
  user: MerchantUser
  onReview: (user: MerchantUser) => void
}

/** Chỉ hiện khi User có đề xuất chờ duyệt và người xem có quyền duyệt hoặc từ chối. */
export function UserReviewScopeButton({
  user,
  onReview
}: UserReviewScopeButtonProps) {
  const access = useScreenAccess('MERCHANT_USER')
  const canReview = access.can('approveScope') || access.can('rejectScope')
  if (!user.pendingScopeProposalId || !canReview) return null
  return (
    <AccessActionButton
      icon={
        <ClipboardTextIcon
          aria-hidden
          size={15}
        />
      }
      label={`Duyệt đề xuất phạm vi User ${user.name}`}
      onClick={() => onReview(user)}
    />
  )
}
