export type Translate = (
  key: string,
  options?: Record<string, string>
) => string

/** Chữ cuối của họ tên: "Trần Huy" thành "Huy". Chuỗi trống cho ra chuỗi rỗng. */
export function givenName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  return parts[parts.length - 1] ?? ''
}

/** Tên hiển thị để chào: họ tên đầy đủ, không có thì phần trước @ của email. */
export function displayName(fullName: string, email: string): string {
  return givenName(fullName || email.split('@')[0] || '')
}

export type DayPeriod = 'morning' | 'noon' | 'afternoon' | 'evening'

export function dayPeriod(hour: number): DayPeriod {
  if (hour < 11) return 'morning'
  if (hour < 14) return 'noon'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

/** Chọn ngẫu nhiên một trong ba mẫu chào; không có tên thì dùng ba mẫu không tên. */
export function buildGreeting(
  t: Translate,
  name: string,
  hour: number,
  random: () => number
): string {
  const period = t(`capy.period.${dayPeriod(hour)}`)
  const variants = name
    ? [
        t('capy.greet.timed', { period, name }),
        t('capy.greet.plain', { name }),
        t('capy.greet.cheer', { name })
      ]
    : [
        t('capy.greet.anonTimed', { period }),
        t('capy.greet.anonPlain'),
        t('capy.greet.anonCheer')
      ]
  const index = Math.min(
    variants.length - 1,
    Math.floor(random() * variants.length)
  )
  return variants[index]
}
