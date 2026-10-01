export interface MerchantDocumentLink {
  url?: string | null
  urlExpiresAt?: string | null
}

export const getLiveMerchantDocumentUrl = (
  file: MerchantDocumentLink | null | undefined
): string | null => {
  if (!file?.url) return null
  if (!file.urlExpiresAt) return file.url
  const expiresAt = Date.parse(file.urlExpiresAt)
  return Number.isFinite(expiresAt) && expiresAt > Date.now() + 10_000
    ? file.url
    : null
}
