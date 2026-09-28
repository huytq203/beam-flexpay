import type { PickedEntity } from '@components/index'
import type { MerchantRole, MerchantUser } from '../types/merchantAccess.types'

export const getRole = (roles: readonly MerchantRole[], id: string) =>
  roles.find((role) => role.id === id)

export const maskPhone = (phone: string): string =>
  phone.length >= 6 ? `${phone.slice(0, 3)}***${phone.slice(-3)}` : '—'

export const formatAccessDate = (value: string | null): string => {
  if (!value) return 'Chưa đăng nhập'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

export const userMatchesMerchant = (
  user: MerchantUser,
  merchantId?: string
): boolean => !merchantId || user.merchantIds.includes(merchantId)

export const roleAvailableToUser = (
  role: MerchantRole,
  user: MerchantUser
): boolean =>
  role.merchantId === null ||
  (user.merchantIds.length === 1 && user.merchantIds.includes(role.merchantId))

// Nhãn ưu tiên bản ghi vừa chọn trong dialog; bản ghi nằm ngoài trang tra cứu
// sẵn vẫn hiện đúng thay vì rơi về id.
export const resolvePicked = (
  id: string | undefined,
  picked: PickedEntity | undefined,
  lookup: (
    id: string
  ) => { id: string; name: string; code?: string } | undefined
): PickedEntity | undefined => {
  if (!id) return undefined
  if (picked?.id === id) return picked
  const found = lookup(id)
  return { id, code: found?.code ?? id, name: found?.name ?? '' }
}

/** So sánh phạm vi không phụ thuộc thứ tự chọn: đổi thứ tự không phải là đổi phạm vi. */
export const isSameIdSet = (
  left: readonly string[],
  right: readonly string[]
): boolean => {
  const rightSet = new Set(right)
  return (
    new Set(left).size === rightSet.size && left.every((id) => rightSet.has(id))
  )
}
