/**
 * Bản sao trạng thái màn danh sách (bộ lọc, trang) trong sessionStorage: riêng
 * từng tab, tự mất khi đóng tab. Dùng để khôi phục khi quay lại màn qua menu,
 * breadcrumb hay nút "Quay lại" — những đường đi không mang theo query string.
 */
export const LIST_STATE_PREFIX = 'list-state:'

export interface ListState {
  query: string
  /** Ô nhạy cảm (SĐT, CCCD, số tài khoản) không được đưa lên URL. */
  sensitive: Record<string, string>
}

const EMPTY: ListState = { query: '', sensitive: {} }

/**
 * Router state của link trên sidebar: bấm menu là mở màn từ đầu, không khôi phục
 * bộ lọc cũ. Các đường đi khác (Back, breadcrumb, nút "Quay lại") vẫn khôi phục.
 */
export const FRESH_LIST_STATE = { freshList: true } as const

export const isFreshListNavigation = (state: unknown): boolean =>
  typeof state === 'object' &&
  state !== null &&
  'freshList' in state &&
  state.freshList === true

const isRecordOfStrings = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  Object.values(value).every((item) => typeof item === 'string')

export const readListState = (key: string): ListState => {
  try {
    const raw = sessionStorage.getItem(`${LIST_STATE_PREFIX}${key}`)
    if (!raw) return EMPTY
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY
    const query =
      'query' in parsed && typeof parsed.query === 'string' ? parsed.query : ''
    const sensitive =
      'sensitive' in parsed && isRecordOfStrings(parsed.sensitive)
        ? parsed.sensitive
        : {}
    return { query, sensitive }
  } catch {
    return EMPTY
  }
}

export const writeListState = (key: string, state: ListState): void => {
  try {
    const storageKey = `${LIST_STATE_PREFIX}${key}`
    if (!state.query && Object.keys(state.sensitive).length === 0)
      sessionStorage.removeItem(storageKey)
    else sessionStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    // Trình duyệt chặn storage: chỉ mất khả năng khôi phục, màn vẫn chạy.
  }
}

/** Gọi khi đăng xuất để người dùng sau trên cùng máy không thấy bộ lọc cũ. */
export const clearListStates = (): void => {
  try {
    const keys: string[] = []
    for (let index = 0; index < sessionStorage.length; index += 1) {
      const key = sessionStorage.key(index)
      if (key?.startsWith(LIST_STATE_PREFIX)) keys.push(key)
    }
    keys.forEach((key) => sessionStorage.removeItem(key))
  } catch {
    // Không đọc được storage thì cũng không có gì để xóa.
  }
}
