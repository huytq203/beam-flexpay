/** BE ghi UUID toàn số 0 cho thao tác do hệ thống (seed, job) thực hiện. */
export const SYSTEM_USER_ID = '00000000-0000-0000-0000-000000000000'

interface NamedPerson {
  adminUserId: string
  adminFullName?: string | null
  adminUsername?: string | null
}

/**
 * Tên người được gán lấy sẵn từ response. BE trả null khi người đó đã bị xóa khỏi
 * Keycloak hoặc identity không phản hồi: khi đó hiện id để không mất dấu.
 */
export const toAssigneeName = (row: NamedPerson): string =>
  row.adminFullName?.trim() || row.adminUsername || row.adminUserId

/** Người gán: tên BE trả sẵn, thiếu thì id; id toàn số 0 là thao tác của hệ thống. */
export const toAssignedByLabel = (
  assignedBy?: string | null,
  assignedByName?: string | null
): string => {
  if (!assignedBy) return 'Không xác định'
  if (assignedBy === SYSTEM_USER_ID) return 'Hệ thống'
  return assignedByName?.trim() || assignedBy
}
