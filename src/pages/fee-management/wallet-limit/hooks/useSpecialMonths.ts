import { useState } from 'react'
import { globalMessage } from '@hooks/useMessage'
import {
  useCreateWalletLimitSpecialMonthMutation,
  useDeleteWalletLimitSpecialMonthMutation,
  useGetWalletLimitSpecialMonthsQuery,
  useRenameWalletLimitSpecialMonthMutation
} from '@services/apiWalletLimit'
import type { SpecialMonthFormValues } from '../schemas/specialMonth.schema'
import { parseWalletLimitError } from '../utils/walletLimit.error'
import {
  ALL_YEARS,
  sortSpecialMonths,
  toMonthKey,
  toYearParam
} from '../utils/specialMonth.utils'

/** Câu lỗi tiếng Việt hiển thị trên form; lỗi từng ô gộp thành một câu. */
const toErrorMessage = (error: unknown): string => {
  const parsed = parseWalletLimitError(error)
  if (parsed.kind !== 'fields') return parsed.message
  return Object.values(parsed.fields).join(' ') || parsed.message
}

export const useSpecialMonths = () => {
  const [year, setYear] = useState(ALL_YEARS)
  /** `yyyy-MM` của tháng đang lọc trên lịch; `null` là hiện mọi tháng của năm. */
  const [monthKey, setMonthKey] = useState<string | null>(null)
  const query = useGetWalletLimitSpecialMonthsQuery(toYearParam(year))
  const allMonths = sortSpecialMonths(query.data ?? [])
  // Danh sách tải một lần và không phân trang nên lọc tháng ở FE là an toàn.
  const months = monthKey
    ? allMonths.filter((month) => toMonthKey(month.monthStart) === monthKey)
    : allMonths
  // Đổi năm thì lịch đổi theo, tháng đang chọn của năm cũ không còn ý nghĩa.
  const changeYear = (next: string): void => {
    setYear(next)
    setMonthKey(null)
  }
  const toggleMonth = (key: string): void =>
    setMonthKey((current) => (current === key ? null : key))
  return {
    year,
    setYear: changeYear,
    query,
    allMonths,
    months,
    monthKey,
    toggleMonth,
    clearMonth: () => setMonthKey(null)
  }
}

/** Trả `null` khi thành công, ngược lại là câu lỗi để hiện trên form. */
export const useAddSpecialMonth = () => {
  const [create, { isLoading }] = useCreateWalletLimitSpecialMonthMutation()
  const addMonth = async (
    values: SpecialMonthFormValues
  ): Promise<string | null> => {
    try {
      await create(values).unwrap()
      globalMessage.success('Đã thêm tháng đặc biệt.')
      return null
    } catch (error) {
      return toErrorMessage(error)
    }
  }
  return { addMonth, isAdding: isLoading }
}

export const useRenameSpecialMonth = () => {
  const [rename, { isLoading }] = useRenameWalletLimitSpecialMonthMutation()
  const renameMonth = async (
    id: string,
    name: string
  ): Promise<string | null> => {
    try {
      await rename({ id, name }).unwrap()
      globalMessage.success('Đã đổi tên tháng đặc biệt.')
      return null
    } catch (error) {
      return toErrorMessage(error)
    }
  }
  return { renameMonth, isRenaming: isLoading }
}

/** Lỗi xóa đã có toast chung từ errorMiddleware nên chỉ báo thành công/thất bại. */
export const useDeleteSpecialMonth = () => {
  const [remove, { isLoading }] = useDeleteWalletLimitSpecialMonthMutation()
  const deleteMonth = async (id: string): Promise<boolean> => {
    try {
      await remove(id).unwrap()
      globalMessage.success('Đã xóa tháng đặc biệt.')
      return true
    } catch {
      return false
    }
  }
  return { deleteMonth, isDeleting: isLoading }
}
