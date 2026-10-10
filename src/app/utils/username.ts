/** So sánh username maker/checker: bỏ khoảng trắng, không phân biệt hoa thường. */
export const normalizeUsername = (value: string | null | undefined): string =>
  (value ?? '').replace(/\s+/g, '').toLowerCase()

export const isSameUsername = (
  first: string | null | undefined,
  second: string | null | undefined
): boolean => {
  const normalized = normalizeUsername(first)
  return normalized !== '' && normalized === normalizeUsername(second)
}
