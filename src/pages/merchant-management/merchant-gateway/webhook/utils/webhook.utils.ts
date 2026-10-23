import type { WebhookScope } from '@/app/services/merchantWebhookApi'
import { WEBHOOK_URL_MAX } from '../constants/webhook.constants'

/**
 * Kiểm tra hình thức URL giống BE (https, cổng 443 hoặc bỏ trống, không
 * user-info, không fragment, tối đa 500 ký tự). Trả về câu lỗi, rỗng nếu hợp lệ.
 * Địa chỉ đích được BE kiểm lúc gửi nên FE không đoán.
 */
export const validateWebhookUrl = (value: string): string => {
  const url = value.trim()
  if (!url) return 'Vui lòng nhập URL nhận IPN'
  if (url.length > WEBHOOK_URL_MAX) return `URL tối đa ${WEBHOOK_URL_MAX} ký tự`
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return 'URL không hợp lệ'
  }
  if (parsed.protocol !== 'https:') return 'URL phải dùng https'
  if (parsed.username || parsed.password)
    return 'URL không được chứa tên đăng nhập hoặc mật khẩu'
  if (parsed.hash || url.includes('#')) return 'URL không được chứa dấu #'
  if (parsed.port && parsed.port !== '443') return 'Chỉ dùng cổng 443'
  return ''
}

export const scopeKey = ({ merchantId, subMerchantId }: WebhookScope): string =>
  `${merchantId}:${subMerchantId ?? ''}`
