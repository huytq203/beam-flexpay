const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/

/** `LocalDateTime` của BE là giờ Việt Nam, không kèm múi giờ: đổi định dạng, không đổi múi giờ. */
export const formatVnDateTime = (value?: string | null): string => {
  if (!value) return '—'
  const match = LOCAL_DATE_TIME.exec(value)
  if (!match) return value
  const [, year, month, day, hour, minute] = match
  return `${day}/${month}/${year} ${hour}:${minute}`
}
