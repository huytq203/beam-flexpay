import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import {
  isFreshListNavigation,
  readListState,
  writeListState,
  type ListState
} from '@utils/list-state-storage'

export const PAGE_PARAM = 'page'
export const SIZE_PARAM = 'size'

const DEFAULT_PAGE = 1
const DEFAULT_SIZE = 10

const readPositiveInt = (raw: string | null, fallback: number): number => {
  if (!raw) return fallback
  const parsed = Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export interface UseUrlFiltersOptions<K extends string> {
  /** Tên các tham số lọc được phép dùng. */
  keys: readonly K[]
  defaultSize?: number
  /** Tham số do hook khác quản lý nhưng vẫn phải xoá khi bấm "Xóa bộ lọc". */
  extraClearKeys?: readonly string[]
  /**
   * Khoá chứa dữ liệu cá nhân (SĐT, CCCD, số tài khoản): không bao giờ lên URL
   * (lịch sử trình duyệt, log nginx), chỉ giữ trong sessionStorage của tab.
   */
  sensitiveKeys?: readonly K[]
  /** Khoá lưu bản sao; mặc định là đường dẫn của màn. */
  storageKey?: string
}

export interface UseUrlFiltersResult<K extends string> {
  filters: Partial<Record<K, string>>
  /** Ghi đè toàn bộ bộ lọc và đưa về trang 1. */
  applyFilters: (next: Partial<Record<K, string | null | undefined>>) => void
  /** Xoá mọi tham số lọc, phân trang, các khoá phụ và bản sao đã lưu. */
  clearFilters: () => void
  page: number
  size: number
  setPage: (next: number) => void
  setPageSize: (next: number) => void
  /** Đổi trang và số dòng trong một lần (sự kiện `onChange` của bảng). */
  setPagination: (page: number, size: number) => void
}

/** Chuỗi chỉ gồm các khóa được theo dõi, dùng để so URL với bản sao. */
const trackedQuery = (
  params: URLSearchParams,
  tracked: readonly string[]
): string =>
  tracked
    .filter((item) => params.has(item))
    .map((item) => `${item}=${params.get(item) ?? ''}`)
    .join('&')

const mergeQuery = (base: URLSearchParams, saved: string): URLSearchParams => {
  const params = new URLSearchParams(base)
  new URLSearchParams(saved).forEach((value, item) => params.set(item, value))
  return params
}

const EMPTY_STATE: ListState = { query: '', sensitive: {} }

const isEmpty = (value: string | null | undefined): boolean =>
  value === null || value === undefined || value === ''

/**
 * Bộ lọc và phân trang sống trên query string, nên F5, bấm back hay dán link
 * đều ra đúng một bảng. Mỗi lần đổi còn lưu một bản sao vào sessionStorage:
 * vào lại màn mà URL trống (qua menu, breadcrumb, nút "Quay lại") thì dùng
 * ngay bản sao đó — bảng gọi API đúng trang cũ thay vì tải lại từ trang 1.
 *
 * Chỉ những khoá khai trong `keys` mới được dùng — tham số lạ người dùng tự gõ
 * vào sẽ bị bỏ qua thay vì đẩy thẳng xuống API.
 */
export const useUrlFilters = <K extends string>({
  keys,
  defaultSize = DEFAULT_SIZE,
  extraClearKeys = [],
  sensitiveKeys = [],
  storageKey
}: UseUrlFiltersOptions<K>): UseUrlFiltersResult<K> => {
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()
  const key = storageKey ?? location.pathname
  const isFresh = isFreshListNavigation(location.state)
  const [stored, setStored] = useState<ListState>(() =>
    isFresh ? EMPTY_STATE : readListState(key)
  )
  // Bấm lại menu của chính màn đang mở thì component không mount lại: lần điều
  // hướng mới (key mới) vẫn phải bỏ bản sao, nên so theo `location.key`.
  const [freshKey, setFreshKey] = useState(isFresh ? location.key : null)
  const [sensitive, setSensitive] = useState<Partial<Record<K, string>>>(() => {
    const result: Partial<Record<K, string>> = {}
    if (isFresh) return result
    // URL mang bộ lọc khác bản sao (vd. mở link đồng nghiệp gửi) thì URL thắng:
    // không gắn ô nhạy cảm của lần lọc trước vào bộ lọc mới.
    const tracked = [...keys, PAGE_PARAM, SIZE_PARAM]
    if (
      trackedQuery(searchParams, tracked) !== '' &&
      trackedQuery(searchParams, tracked) !==
        trackedQuery(new URLSearchParams(stored.query), tracked)
    )
      return result
    for (const item of sensitiveKeys) {
      const value = stored.sensitive[item]
      if (value) result[item] = value
    }
    return result
  })

  if (isFresh && freshKey !== location.key) {
    setFreshKey(location.key)
    setStored(EMPTY_STATE)
    setSensitive({})
  }

  useEffect(() => {
    if (isFresh) writeListState(key, EMPTY_STATE)
  }, [isFresh, key, location.key])

  // Nơi gọi thường truyền mảng literal mới mỗi render; ghim theo nội dung để
  // `filters` giữ tham chiếu ổn định và dùng được làm dependency.
  const keysSignature = keys.join('|')
  const sensitiveSignature = sensitiveKeys.join('|')
  const urlKeys = useMemo(
    () =>
      keysSignature
        .split('|')
        .filter(
          (item) => item && !sensitiveSignature.split('|').includes(item)
        ) as K[],
    [keysSignature, sensitiveSignature]
  )
  // react-router ghi URL trong transition nên trễ một nhịp so với state nhạy
  // cảm; giữ bản đích cho tới khi URL đổi để bảng không gọi API với tham số
  // lẫn cũ lẫn mới (vd. từ khóa mới nhưng còn trang 3).
  const [pending, setPending] = useState<{ base: string; next: string } | null>(
    null
  )
  const currentQuery = searchParams.toString()
  if (pending && pending.base !== currentQuery) setPending(null)
  const urlParams = useMemo(
    () =>
      pending && pending.base === currentQuery
        ? new URLSearchParams(pending.next)
        : searchParams,
    [pending, currentQuery, searchParams]
  )

  const hasTracked = [...urlKeys, PAGE_PARAM, SIZE_PARAM].some((item) =>
    urlParams.has(item)
  )
  const needsRestore = !hasTracked && stored.query !== ''

  // Lần render đầu đã dùng bản sao, không chờ URL được ghi lại xong mới gọi API.
  // Gộp vào URL hiện tại để không xóa tham số khác (vd. ?tab=) đang có.
  const effective = useMemo(
    () => (needsRestore ? mergeQuery(urlParams, stored.query) : urlParams),
    [needsRestore, stored.query, urlParams]
  )

  useEffect(() => {
    if (needsRestore)
      setSearchParams(mergeQuery(searchParams, stored.query), { replace: true })
  }, [needsRestore, stored.query, searchParams, setSearchParams])

  const commit = (
    next: URLSearchParams,
    nextSensitive: Partial<Record<K, string>> = sensitive
  ): void => {
    for (const item of sensitiveKeys) next.delete(item)
    const state: ListState = {
      query: next.toString(),
      sensitive: Object.fromEntries(
        Object.entries(nextSensitive).filter(
          (entry): entry is [string, string] => typeof entry[1] === 'string'
        )
      )
    }
    writeListState(key, state)
    setStored(state)
    setSensitive(nextSensitive)
    setPending({ base: currentQuery, next: state.query })
    setSearchParams(next, { replace: true })
  }

  const filters = useMemo(() => {
    const result: Partial<Record<K, string>> = {}
    for (const item of urlKeys) {
      const value = effective.get(item)
      if (!isEmpty(value) && value !== null) result[item] = value
    }
    return { ...result, ...sensitive }
  }, [effective, urlKeys, sensitive])

  const applyFilters = (
    next: Partial<Record<K, string | null | undefined>>
  ): void => {
    const params = new URLSearchParams(effective)
    const nextSensitive: Partial<Record<K, string>> = {}
    for (const item of keys) {
      const value = next[item]
      if (sensitiveKeys.includes(item)) {
        if (!isEmpty(value) && value) nextSensitive[item] = value
      } else if (isEmpty(value) || !value) params.delete(item)
      else params.set(item, value)
    }
    params.delete(PAGE_PARAM)
    commit(params, nextSensitive)
  }

  const clearFilters = (): void => {
    const params = new URLSearchParams(effective)
    for (const item of [...keys, ...extraClearKeys, PAGE_PARAM, SIZE_PARAM])
      params.delete(item)
    commit(params, {})
  }

  const setPage = (next: number): void => {
    const params = new URLSearchParams(effective)
    if (next === DEFAULT_PAGE) params.delete(PAGE_PARAM)
    else params.set(PAGE_PARAM, String(next))
    commit(params)
  }

  const setPageSize = (next: number): void => {
    const params = new URLSearchParams(effective)
    if (next === defaultSize) params.delete(SIZE_PARAM)
    else params.set(SIZE_PARAM, String(next))
    // Đổi số dòng mỗi trang thì trang cũ không còn nghĩa.
    params.delete(PAGE_PARAM)
    commit(params)
  }

  const setPagination = (nextPage: number, nextSize: number): void => {
    const params = new URLSearchParams(effective)
    if (nextPage === DEFAULT_PAGE) params.delete(PAGE_PARAM)
    else params.set(PAGE_PARAM, String(nextPage))
    if (nextSize === defaultSize) params.delete(SIZE_PARAM)
    else params.set(SIZE_PARAM, String(nextSize))
    commit(params)
  }

  return {
    filters,
    applyFilters,
    clearFilters,
    page: readPositiveInt(effective.get(PAGE_PARAM), DEFAULT_PAGE),
    size: readPositiveInt(effective.get(SIZE_PARAM), defaultSize),
    setPage,
    setPageSize,
    setPagination
  }
}
