import { ResponseType } from '@type/api'
import {
  DetailPermissionPayload,
  GroupPermissionPayload,
  GroupPermissionSearchParams,
  PermissionDataType
} from '@type/permission'
import { apiService } from './apiService'

export const groupPermissionApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListGroupPermission: builder.query<
      GroupPermissionPayload,
      GroupPermissionSearchParams
    >({
      query: (payload) => ({
        url: '/group-permission',
        method: 'GET',
        params: payload
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<GroupPermissionPayload>
      ): GroupPermissionPayload {
        return baseQueryReturnValue.data
      }
    }),
    createGroupPermission: builder.mutation({
      query: (payload) => ({
        url: '/group-permission/permission',
        method: 'POST',
        body: payload
      })
    }),
    updateGroupPermission: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/group-permission/${id}`,
        method: 'PATCH',
        body: payload
      })
    }),
    getDetailGroupPermission: builder.query({
      query: (payload) => ({
        url: `/group-permission/${payload}`,
        method: 'GET'
      }),
      transformResponse: (response: ResponseType<DetailPermissionPayload>) => {
        const { name, createdAt, deletedAt, status, id, updatedAt } =
          response?.data
        const permissionsArr = response?.data?.permissions
        let permissions: string[] = []
        let permissionsId: number[] = []
        permissionsArr.map((el: PermissionDataType) => {
          permissions.push(el.permission)
        })
        permissionsArr.map((el: PermissionDataType) => {
          permissionsId.push(el.id)
        })
        const authResponse = {
          fullPermission: permissionsArr,
          permissionsId,
          permissions,
          name,
          createdAt,
          status,
          id,
          updatedAt,
          deletedAt
        }
        return authResponse
      }
    }),
    deleteGroupPermission: builder.mutation({
      query: (payload) => ({
        url: `/group-permission/${payload}`,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useGetListGroupPermissionQuery,
  useCreateGroupPermissionMutation,
  useUpdateGroupPermissionMutation,
  useGetDetailGroupPermissionQuery,
  useDeleteGroupPermissionMutation,
  useLazyGetListGroupPermissionQuery,
  useLazyGetDetailGroupPermissionQuery
} = groupPermissionApi
