/**
 * Tìm key `header-title` cho một đường dẫn.
 *
 * Thử đường dẫn nguyên văn trước, rồi lần lượt thay MỘT segment bằng `*` từ phải sang trái. Nhờ đó
 * `/wallet-limit/<id>` khớp `/wallet-limit/*` còn `/wallet-limit/<id>/edit` khớp `/wallet-limit/*\/edit`;
 * chỉ thay segment cuối thì kiểu sau không bao giờ khớp và header hiện nguyên key i18n.
 */
export const resolveHeaderTitleKey = (
  pathname: string,
  hasTitle: (key: string) => boolean
): string | null => {
  if (hasTitle(pathname)) return pathname

  const segments = pathname.split('/')
  for (let index = segments.length - 1; index > 0; index -= 1) {
    if (!segments[index] || segments[index] === '*') continue
    const candidate = segments
      .map((segment, position) => (position === index ? '*' : segment))
      .join('/')
    if (hasTitle(candidate)) return candidate
  }

  return null
}
