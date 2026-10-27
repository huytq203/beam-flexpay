import {
  FUNCTION_GROUPS,
  GROUP_OTHER
} from '../constants/rolePermissionMatrix.constants'
import type {
  AdminFunctionRow,
  AdminRole,
  AdminRolePermissionCell,
  MatrixGroup,
  MatrixTableRow
} from '../types/rolePermissionMatrix.types'

const normalise = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

/** Tra ô theo `role` của ô, không theo chỉ số (spec khuyến nghị). */
export const findCell = (
  row: AdminFunctionRow,
  role: AdminRole
): AdminRolePermissionCell | undefined =>
  row.cells.find((cell) => cell.role === role)

export const matchesSearch = (
  row: AdminFunctionRow,
  search: string
): boolean => {
  const term = normalise(search.trim())
  if (!term) return true
  return (
    normalise(row.displayName).includes(term) ||
    row.code.toLowerCase().includes(term)
  )
}

/**
 * Gom các dòng BE trả về thành nhóm để dễ đọc 68 dòng. Không thêm, bớt hay đổi dòng:
 * mã chưa biết rơi vào nhóm "Khác". Nhóm xếp theo dòng có `sortOrder` nhỏ nhất.
 */
export const groupMatrixRows = (rows: AdminFunctionRow[]): MatrixGroup[] => {
  const groups = new Map<string, MatrixGroup>()
  const sorted = [...rows].sort((a, b) => a.sortOrder - b.sortOrder)
  for (const row of sorted) {
    const group =
      FUNCTION_GROUPS.find((item) => item.match(row.code)) ?? GROUP_OTHER
    const existing = groups.get(group.key)
    if (existing) existing.rows.push(row)
    else
      groups.set(group.key, { key: group.key, label: group.label, rows: [row] })
  }
  return [...groups.values()]
}

/** Dòng phẳng cho bảng: tiêu đề nhóm rồi các dòng chức năng của nhóm. */
export const toTableRows = (groups: MatrixGroup[]): MatrixTableRow[] => {
  let index = 0
  return groups.flatMap((group) => [
    {
      rowType: 'group' as const,
      key: `group:${group.key}`,
      label: group.label,
      count: group.rows.length
    },
    ...group.rows.map((row) => ({
      rowType: 'function' as const,
      key: row.code,
      index: ++index,
      row
    }))
  ])
}
