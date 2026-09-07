import { useMemo } from 'react'
import {
  resolveNavLink,
  type ItemTypeCustom
} from '@components/layout/components/Navigation'
import useNavigationEw from './useNavigation'

/** Mục đầu tiên còn lại sau khi lọc quyền chính là màn user được phép vào. */
const firstLeafLink = (items: readonly ItemTypeCustom[]): string | null => {
  for (const item of items) {
    const child = item.children?.[0]
    if (child) return resolveNavLink(item, child)
    if (item.link) return item.link
  }

  return null
}

/**
 * Đường dẫn mặc định sau đăng nhập: màn đầu tiên trên sidebar mà quyền trong
 * JWT cho phép. `null` nghĩa là tài khoản không có quyền vào bất kỳ màn nào.
 */
const useLandingPath = (): string | null => {
  const [navigation] = useNavigationEw()

  return useMemo(() => firstLeafLink(navigation), [navigation])
}

export default useLandingPath
