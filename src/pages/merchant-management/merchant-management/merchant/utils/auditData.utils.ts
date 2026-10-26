/** Định dạng chuỗi JSON thô của audit log; chuỗi không phải JSON giữ nguyên. */
export const formatAuditJson = (raw: string | null): string => {
  if (!raw) return '—'
  try {
    return JSON.stringify(JSON.parse(raw), null, 2)
  } catch {
    return raw
  }
}
