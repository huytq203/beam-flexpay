import { useMemo, useState } from 'react'
import { useScreenAccess } from '@/app/permissions'
import {
  useGetRolePermissionMatrixQuery,
  useGetRolePermissionSyncStatusQuery
} from '@/app/services/rolePermissionMatrixApi'
import { feedback } from '@components/index'
import { useAppSelector } from '@hooks/hook'
import type {
  AdminRole,
  AdminRolePermissionMatrix
} from '../types/rolePermissionMatrix.types'
import { canEditRole, toCallerRoles } from '../utils/matrixCaller.utils'
import { getMatrixErrorMessage } from '../utils/matrixError.utils'
import { groupMatrixRows, matchesSearch } from '../utils/matrixGroups.utils'

interface EditingState {
  role: AdminRole
  matrix: AdminRolePermissionMatrix
}

/** Nối dữ liệu, quyền và trạng thái hộp thoại cho trang ma trận phân quyền. */
export function useRolePermissionMatrixPage() {
  const access = useScreenAccess('ROLE_PERMISSION_MATRIX')
  const canView = access.can('view')
  const canManage = access.can('update')
  const matrixQuery = useGetRolePermissionMatrixQuery(undefined, {
    skip: !canView
  })
  const syncQuery = useGetRolePermissionSyncStatusQuery(undefined, {
    skip: !canView
  })
  const claimRoles = useAppSelector((state) => state.auth.profile.roles)
  const callerRoles = useMemo(
    () => toCallerRoles(claimRoles ?? []),
    [claimRoles]
  )
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<EditingState>()
  const [opening, setOpening] = useState<AdminRole>()
  const [syncing, setSyncing] = useState<AdminRole>()

  const matrix = matrixQuery.data
  const groups = useMemo(
    () =>
      groupMatrixRows(
        (matrix?.functions ?? []).filter((row) => matchesSearch(row, search))
      ),
    [matrix, search]
  )

  // BE không có khoá lạc quan: tải lại ma trận ngay trước khi sửa để không ghi đè thay đổi của người khác.
  const startEdit = async (role: AdminRole): Promise<void> => {
    setOpening(role)
    try {
      const fresh = await matrixQuery.refetch().unwrap()
      setEditing({ role, matrix: fresh })
    } catch (failure) {
      feedback.error(
        getMatrixErrorMessage(
          failure,
          'Không tải được ma trận mới nhất nên chưa thể sửa'
        )
      )
    } finally {
      setOpening(undefined)
    }
  }

  return {
    canView,
    canManage,
    callerRoles,
    matrix,
    matrixQuery,
    syncQuery,
    syncStatuses: syncQuery.data ?? [],
    groups,
    search,
    setSearch,
    editing,
    opening,
    syncing,
    startEdit,
    closeEdit: (): void => setEditing(undefined),
    startSync: (role: AdminRole): void => setSyncing(role),
    closeSync: (): void => setSyncing(undefined),
    canEditRole: (role: AdminRole): boolean => canEditRole(role, callerRoles)
  }
}
