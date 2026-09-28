import { apiMerchant } from './apiService'

export interface MerchantAccessEnvelope<T> {
  data: T
  message?: string
  success?: boolean
}

export interface MerchantAccessPage<T> {
  content: T[]
  totalElements: number
  number: number
  size: number
}

export interface MerchantUserDto {
  id: string
  email: string
  fullName: string
  phone?: string
  status: 'PENDING' | 'ACTIVE' | 'LOCKED'
  groupIds?: string[]
  merchantIds?: string[]
  subMerchantIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface MerchantGroupDto {
  id: string
  merchantId?: string | null
  code: string
  name: string
  description?: string
  system?: boolean
  permissions?: string[]
  createdAt?: string
  updatedAt?: string
}

export type MerchantGroupUserDto = Pick<
  MerchantUserDto,
  'id' | 'email' | 'fullName' | 'status'
>

export interface MerchantPermissionDto {
  code: string
  category:
    | 'TRANSACTION'
    | 'REFUND'
    | 'DISPUTE'
    | 'ORDER'
    | 'FINANCE'
    | 'ADMINISTRATION'
    | 'WALLET'
}

export interface MerchantOptionDto {
  id: string
  code: string
  name: string
}
export interface SubMerchantOptionDto {
  id: string
  merchantId: string
  name: string
}

export interface MerchantUserQuery {
  page: number
  size: number
  query?: string
  merchantId?: string
  status?: MerchantUserDto['status']
}

export interface MerchantGroupQuery {
  page: number
  size: number
  query?: string
  merchantId?: string
  systemOnly?: boolean
}

export interface MerchantUserCreateRequest {
  email: string
  fullName: string
  phone?: string
  groupIds?: string[]
  merchantIds?: string[]
  subMerchantIds?: string[]
}

export interface MerchantGroupRequest {
  merchantId?: string | null
  code: string
  name: string
  description?: string
  permissions: string[]
}

export const accessApi = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    listMerchantUsers: builder.query<
      MerchantAccessPage<MerchantUserDto>,
      MerchantUserQuery
    >({
      query: (params) => ({ url: '/merchant-users', params }),
      transformResponse: (
        response: MerchantAccessEnvelope<MerchantAccessPage<MerchantUserDto>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    getMerchantUser: builder.query<MerchantUserDto, string>({
      query: (id) => `/merchant-users/${id}`,
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      providesTags: ['merchant']
    }),
    createMerchantUser: builder.mutation<
      MerchantUserDto,
      MerchantUserCreateRequest
    >({
      query: (body) => ({ url: '/merchant-users', method: 'POST', body }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    updateMerchantUser: builder.mutation<
      MerchantUserDto,
      { id: string; body: { fullName: string; phone?: string } }
    >({
      query: ({ id, body }) => ({
        url: `/merchant-users/${id}`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    assignMerchantUserGroups: builder.mutation<
      MerchantUserDto,
      { id: string; ids: string[] }
    >({
      query: ({ id, ids }) => ({
        url: `/merchant-users/${id}/groups`,
        method: 'PUT',
        body: { ids }
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    assignMerchantUserMerchants: builder.mutation<
      MerchantUserDto,
      { id: string; ids: string[] }
    >({
      query: ({ id, ids }) => ({
        url: `/merchant-users/${id}/merchants`,
        method: 'PUT',
        body: { ids }
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    assignMerchantUserSubMerchants: builder.mutation<
      MerchantUserDto,
      { id: string; ids: string[] }
    >({
      query: ({ id, ids }) => ({
        url: `/merchant-users/${id}/sub-merchants`,
        method: 'PUT',
        body: { ids }
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    lockMerchantUser: builder.mutation<
      MerchantUserDto,
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `/merchant-users/${id}/lock`,
        method: 'POST',
        body: { reason }
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    resetMerchantUserPassword: builder.mutation<MerchantUserDto, string>({
      query: (id) => ({
        url: `/merchant-users/${id}/reset-password`,
        method: 'POST'
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    unlockMerchantUser: builder.mutation<MerchantUserDto, string>({
      query: (id) => ({ url: `/merchant-users/${id}/unlock`, method: 'POST' }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantUserDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    listMerchantGroups: builder.query<
      MerchantAccessPage<MerchantGroupDto>,
      MerchantGroupQuery
    >({
      query: (params) => ({ url: '/merchant-permission-groups', params }),
      transformResponse: (
        response: MerchantAccessEnvelope<MerchantAccessPage<MerchantGroupDto>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    listMerchantGroupUsers: builder.query<
      MerchantAccessPage<MerchantGroupUserDto>,
      { id: string; page: number; size: number }
    >({
      query: ({ id, page, size }) => ({
        url: `/merchant-permission-groups/${id}/users`,
        params: { page, size }
      }),
      transformResponse: (
        response: MerchantAccessEnvelope<
          MerchantAccessPage<MerchantGroupUserDto>
        >
      ) => response.data,
      providesTags: ['merchant']
    }),
    createMerchantGroup: builder.mutation<
      MerchantGroupDto,
      MerchantGroupRequest
    >({
      query: (body) => ({
        url: '/merchant-permission-groups',
        method: 'POST',
        body
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantGroupDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    createMerchantSystemGroup: builder.mutation<
      MerchantGroupDto,
      MerchantGroupRequest
    >({
      query: (body) => ({
        url: '/merchant-system-permission-groups',
        method: 'POST',
        body
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantGroupDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    updateMerchantGroup: builder.mutation<
      MerchantGroupDto,
      { id: string; body: MerchantGroupRequest }
    >({
      query: ({ id, body }) => ({
        url: `/merchant-permission-groups/${id}`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantGroupDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    updateMerchantGroupPermissions: builder.mutation<
      MerchantGroupDto,
      { id: string; permissions: string[] }
    >({
      query: ({ id, permissions }) => ({
        url: `/merchant-permission-groups/${id}/permissions`,
        method: 'PUT',
        body: { permissions }
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantGroupDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    updateMerchantSystemGroup: builder.mutation<
      MerchantGroupDto,
      { id: string; body: MerchantGroupRequest }
    >({
      query: ({ id, body }) => ({
        url: `/merchant-system-permission-groups/${id}`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: MerchantAccessEnvelope<MerchantGroupDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    deleteMerchantGroup: builder.mutation<void, string>({
      query: (id) => ({
        url: `/merchant-permission-groups/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['merchant']
    }),
    listMerchantPermissions: builder.query<MerchantPermissionDto[], void>({
      query: () => '/merchant-permissions',
      transformResponse: (
        response: MerchantAccessEnvelope<MerchantPermissionDto[]>
      ) => response.data
    }),
    listAccessMerchants: builder.query<MerchantOptionDto[], void>({
      query: () => ({ url: '/merchants', params: { page: 1, size: 100 } }),
      transformResponse: (
        response: MerchantAccessEnvelope<MerchantAccessPage<MerchantOptionDto>>
      ) => response.data.content,
      providesTags: ['merchant']
    }),
    listAccessSubMerchants: builder.query<SubMerchantOptionDto[], void>({
      query: () => ({ url: '/sub-merchants', params: { page: 1, size: 100 } }),
      transformResponse: (
        response: MerchantAccessEnvelope<
          MerchantAccessPage<SubMerchantOptionDto>
        >
      ) => response.data.content,
      providesTags: ['merchant']
    })
  })
})

export const {
  useListMerchantUsersQuery,
  useGetMerchantUserQuery,
  useCreateMerchantUserMutation,
  useUpdateMerchantUserMutation,
  useAssignMerchantUserGroupsMutation,
  useAssignMerchantUserMerchantsMutation,
  useAssignMerchantUserSubMerchantsMutation,
  useLockMerchantUserMutation,
  useUnlockMerchantUserMutation,
  useResetMerchantUserPasswordMutation,
  useListMerchantGroupsQuery,
  useListMerchantGroupUsersQuery,
  useCreateMerchantGroupMutation,
  useCreateMerchantSystemGroupMutation,
  useUpdateMerchantGroupMutation,
  useUpdateMerchantGroupPermissionsMutation,
  useUpdateMerchantSystemGroupMutation,
  useDeleteMerchantGroupMutation,
  useListMerchantPermissionsQuery,
  useListAccessMerchantsQuery,
  useListAccessSubMerchantsQuery
} = accessApi
