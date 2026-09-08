import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

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
  /** Tên các tham số lọc được phép xuất hiện trên URL. */
  keys: readonly K[]
  defaultSize?: number
  /** Tham số do hook khác quản lý nhưng vẫn phải xoá khi bấm "Xóa bộ lọc". */
  extraClearKeys?: readonly string[]
}

export interface UseUrlFiltersResult<K extends string> {
  filters: Partial<Record<K, string>>
  /** Ghi đè toàn bộ bộ lọc và đưa về trang 1. */
  applyFilters: (next: Partial<Record<K, string | null | undefined>>) => void
  /** Xoá mọi tham số lọc, phân trang và các khoá phụ. */
  clearFilters: () => void
  page: number
  size: number
  setPage: (next: number) => void
  setPageSize: (next: number) => void
}

/**
 * Bộ lọc và phân trang sống trên query string thay vì state cục bộ, nên F5,
 * bấm back hay dán link cho đồng nghiệp đều ra đúng một bảng.
 *
 * Chỉ những khoá khai trong `keys` mới được ghi lên URL — tham số lạ người dùng
 * tự gõ vào sẽ bị bỏ qua thay vì đẩy thẳng xuống API.
 */
export const useUrlFilters = <K extends string>({
  keys,
  defaultSize = DEFAULT_SIZE,
  extraClearKeys = []
}: UseUrlFiltersOptions<K>): UseUrlFiltersResult<K> => {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => {
    const result: Partial<Record<K, string>> = {}
    for (const key of keys) {
      const value = searchParams.get(key)
      if (value !== null && value !== '') result[key] = value
    }
    return result
  }, [searchParams, keys])

  const applyFilters = useCallback(
    (next: Partial<Record<K, string | null | undefined>>) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          for (const key of keys) {
            const value = next[key]
            if (value === null || value === undefined || value === '') {
              params.delete(key)
            } else {
              params.set(key, value)
            }
          }
          params.delete(PAGE_PARAM)
          return params
        },
        { replace: true }
      )
    },
    [keys, setSearchParams]
  )

  const clearFilters = useCallback(() => {
    setSearchParams(
      (current) => {
        const params = new URLSearchParams(current)
        for (const key of [...keys, ...extraClearKeys, PAGE_PARAM, SIZE_PARAM]) {
          params.delete(key)
        }
        return params
      },
      { replace: true }
    )
  }, [keys, extraClearKeys, setSearchParams])

  const setParam = useCallback(
    (key: string, value: number, fallback: number) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          if (value === fallback) {
            params.delete(key)
          } else {
            params.set(key, String(value))
          }
          return params
        },
        { replace: true }
      )
    },
    [setSearchParams]
  )

  const setPage = useCallback(
    (next: number) => setParam(PAGE_PARAM, next, DEFAULT_PAGE),
    [setParam]
  )

  const setPageSize = useCallback(
    (next: number) => {
      setSearchParams(
        (current) => {
          const params = new URLSearchParams(current)
          if (next === defaultSize) {
            params.delete(SIZE_PARAM)
          } else {
            params.set(SIZE_PARAM, String(next))
          }
          // Đổi số dòng mỗi trang thì trang cũ không còn nghĩa.
          params.delete(PAGE_PARAM)
          return params
        },
        { replace: true }
      )
    },
    [defaultSize, setSearchParams]
  )

  return {
    filters,
    applyFilters,
    clearFilters,
    page: readPositiveInt(searchParams.get(PAGE_PARAM), DEFAULT_PAGE),
    size: readPositiveInt(searchParams.get(SIZE_PARAM), defaultSize),
    setPage,
    setPageSize
  }
}
