import { ResponseType } from "@type/api";
import { RoleData, RoleResponse } from "@type/roleManagementV2";
import { ResponseUserInfor, UserInfor } from "@type/userManagement";
import { authApiService } from "./apiService";

export const roleApi = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getRole: build.query({
            query: (params) => ({
                url: `roles`,
                method: "GET",
                params: params
            }),
            providesTags: ['roleManagement'],
            transformResponse: (res: ResponseType<RoleData>) => res.data
        }),
        getRoleByKey: build.query({
            query: (params) => ({
                url: `roles/search`,
                method: "GET",
                params: params
            }),
            providesTags: ['roleManagement'],
            transformResponse: (res: ResponseType<RoleData>) => res.data
        }),
        postRole: build.mutation({
            query: (body) => ({
                url: `roles`,
                method: 'POST',
                body: body
            }),
            invalidatesTags: ['roleManagement']
        }),
        putRole: build.mutation({
            query: ({ id, body }) => ({
                url: `roles/${id}`,
                method: 'PUT',
                body: body
            }),
            invalidatesTags: ['roleManagement']
        }),
        deleteRole: build.mutation({
            query: (id) => ({
                url: `roles/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['roleManagement']
        }),
        getMemberOfRole: build.query({
            query: (roleId) => ({
                url: `roles/${roleId}/members`,
                method: 'GET',
            }),
            providesTags: ['roleManagement'],
            transformResponse: (res: ResponseType<ResponseUserInfor>) => res.data
        }),
    })
})
export const {
    useGetRoleQuery,
    usePostRoleMutation,
    usePutRoleMutation,
    useLazyGetRoleByKeyQuery,
    useDeleteRoleMutation,
    useLazyGetMemberOfRoleQuery
} = roleApi