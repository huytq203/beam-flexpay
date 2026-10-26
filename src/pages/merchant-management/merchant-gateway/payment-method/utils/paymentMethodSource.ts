import type { ScopedPaymentMethodConfig } from '@/app/services/merchantPaymentMethodApi'

export type ConfigOrigin = 'OWN' | 'MASTER' | 'SYSTEM_DEFAULT'

/** Giá trị hiệu lực đến từ đâu so với cấp đang xem. */
export const configOrigin = (
  config: ScopedPaymentMethodConfig
): ConfigOrigin => {
  const { source, inherited } = config.enabledMethods
  if (source === 'SYSTEM_DEFAULT') return 'SYSTEM_DEFAULT'
  if (inherited || (config.level === 'SUB' && source === 'MASTER'))
    return 'MASTER'
  return 'OWN'
}

/**
 * Chỉ gửi `version` khi giá trị hiệu lực đến từ chính cấp đang sửa: Sub đang
 * kế thừa nhận version của Master, gửi lại sẽ bị 5507.
 */
export const ownVersion = (config: ScopedPaymentMethodConfig) =>
  configOrigin(config) === 'OWN' && typeof config.version === 'number'
    ? config.version
    : undefined

export const ORIGIN_LABELS: Record<
  'MASTER' | 'SUB',
  Record<ConfigOrigin, string>
> = {
  MASTER: {
    OWN: 'Cấu hình riêng của Master',
    MASTER: 'Theo mặc định hệ thống',
    SYSTEM_DEFAULT: 'Theo mặc định hệ thống'
  },
  SUB: {
    OWN: 'Ghi đè riêng cho Sub-merchant',
    MASTER: 'Kế thừa từ Master',
    SYSTEM_DEFAULT: 'Kế thừa mặc định hệ thống (Master chưa cấu hình)'
  }
}
