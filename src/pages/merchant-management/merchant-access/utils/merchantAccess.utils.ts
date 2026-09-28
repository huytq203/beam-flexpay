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

export const roleCount = (
  users: readonly MerchantUser[],
  roleId: string
): number => users.filter((user) => user.roleIds.includes(roleId)).length
