/**
 * Lấy câu thông báo tiếng Việt (`detail`) từ lỗi RTK Query của BE merchant.
 * `message` của BE là tên enum nên không dùng để hiển thị cho người dùng.
 */
export const getApiErrorDetail = (error: unknown, fallback: string): string => {
  if (!error || typeof error !== 'object' || !('data' in error)) return fallback
  const data = error.data
  if (!data || typeof data !== 'object' || !('detail' in data)) return fallback
  const { detail } = data
  return typeof detail === 'string' && detail.trim() ? detail : fallback
}
