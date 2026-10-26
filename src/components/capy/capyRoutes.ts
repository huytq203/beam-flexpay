import { AUTHENTICATION, FORBIDDENERROR } from '@constants/routersConstant'

/**
 * Các route Capy không bao giờ xuất hiện. Capy gắn trong `AppLayout` nên đã không có ở các màn
 * dùng `AuthLayout`; danh sách này chặn thêm cho chắc. Mọi route khác sau đăng nhập đều có Capy.
 */
export const CAPY_BLOCKED_PATHS: readonly string[] = [
  AUTHENTICATION,
  FORBIDDENERROR
]

export function isCapyRoute(pathname: string): boolean {
  return !CAPY_BLOCKED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  )
}
