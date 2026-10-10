/** Lấy `detail` tiếng Việt BE trả về trong lỗi RTK Query; null nếu không có. */
export const getEkycErrorDetail = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('data' in error)) return null
  const data = error.data
  if (!data || typeof data !== 'object' || !('detail' in data)) return null
  return typeof data.detail === 'string' ? data.detail : null
}
