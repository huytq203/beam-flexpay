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

/** Dùng URL còn hạn trong response; hết hạn thì làm mới response một lần. */
export const resolveLiveDocumentUrl = async (
  current: MerchantDocumentLink | null | undefined,
  refreshCurrent: () => Promise<MerchantDocumentLink | null | undefined>
): Promise<string> => {
  const liveUrl = getLiveMerchantDocumentUrl(current)
  if (liveUrl) return liveUrl
  const refreshedUrl = getLiveMerchantDocumentUrl(await refreshCurrent())
  if (refreshedUrl) return refreshedUrl
  throw new Error('Document read link is unavailable')
}
