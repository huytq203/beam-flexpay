export interface ScopeDiff {
  kept: string[]
  added: string[]
  removed: string[]
}

export const diffIds = (
  current: readonly string[],
  next: readonly string[]
): ScopeDiff => ({
  kept: current.filter((id) => next.includes(id)),
  added: next.filter((id) => !current.includes(id)),
  removed: current.filter((id) => !next.includes(id))
})

/**
 * Danh sách User của BE gộp cả Merchant cha của Sub-merchant vào `merchantIds`, còn đề xuất chỉ
 * chứa Merchant được chọn riêng. Cộng cha của các Sub vào đề xuất để hai bên so cùng một cách,
 * nếu không Merchant cha sẽ hiện sai là bị gỡ.
 */
export const withSubMerchantParents = (
  merchantIds: readonly string[],
  subMerchantIds: readonly string[],
  getParentId: (subMerchantId: string) => string | undefined
): string[] => {
  const parents = subMerchantIds
    .map(getParentId)
    .filter((id): id is string => Boolean(id))
  return Array.from(new Set([...merchantIds, ...parents]))
}
