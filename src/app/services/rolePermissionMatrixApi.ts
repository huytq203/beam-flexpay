import type { MerchantEnvelope } from '@type/merchant'
import type {
  AdminRolePermissionMatrix,
  AdminRoleSyncStatus,
  SyncRoleArgs,
  UpdateRolePermissionsArgs
} from '@/pages/role-management-V2/role-permission-matrix/types/rolePermissionMatrix.types'
import { apiMerchant } from './apiService'

// BE trả `message` là tên mã lỗi; màn tự chọn câu hiển thị theo `message`.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const SYNC_TAG = [{ type: 'merchant' as const, id: 'role-permission-sync' }]

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getRolePermissionMatrix: builder.query<AdminRolePermissionMatrix, void>({
      query: () => '/role-permissions',
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<AdminRolePermissionMatrix>
    }),
    getRolePermissionSyncStatus: builder.query<AdminRoleSyncStatus[], void>({
      query: () => '/role-permissions/sync-status',
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<AdminRoleSyncStatus[]>,
      providesTags: SYNC_TAG
    }),
    // PUT ghi đè toàn bộ quyền của vai trò và trả cả ma trận mới: thay luôn cache, không GET lại.
    updateRolePermissions: builder.mutation<
      AdminRolePermissionMatrix,
      UpdateRolePermissionsArgs
    >({
      query: ({ role, body }) => ({
        url: `/role-permissions/${role}`,
        method: 'PUT',
        body
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<AdminRolePermissionMatrix>,
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(
            service.util.updateQueryData(
              'getRolePermissionMatrix',
              undefined,
              () => data
            )
          )
        } catch {
          // Lỗi do màn tự hiển thị qua unwrap().
        }
      },
      // Sau khi lưu phải đọc lại sync-status để thấy OUT_OF_SYNC.
      invalidatesTags: SYNC_TAG
    }),
    // `reason` là query param; HTTP 200 chưa có nghĩa đã đồng bộ, màn đọc `state` và `note`.
    syncRolePermissions: builder.mutation<AdminRoleSyncStatus, SyncRoleArgs>({
      query: ({ role, reason }) => ({
        url: `/role-permissions/${role}/sync`,
        method: 'POST',
        params: { reason }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<AdminRoleSyncStatus>,
      invalidatesTags: SYNC_TAG
    })
  })
})

export const {
  useGetRolePermissionMatrixQuery,
  useGetRolePermissionSyncStatusQuery,
  useUpdateRolePermissionsMutation,
  useSyncRolePermissionsMutation
} = service
