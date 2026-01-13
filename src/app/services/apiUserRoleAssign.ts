import { useGetUserQuery } from "./apiUserManagement";
import { authApiService } from "./authApiService";

export const userRoleApi = authApiService.injectEndpoints({
    endpoints: (builder) => ({
        assignRoleUser: builder.mutation({
            query: ({ id, body }) => ({
                url: `/users/${id}/roles`,
                method: 'POST',
                body: body
            })
        }),
        deleteRoleUser: builder.mutation({
            query: ({ id, body }) => ({
                url: `/users/${id}/roles`,
                method: 'DELETE',
                body: body
            })
        }),
        getUserRole: builder.query({
            query: (id) => ({
                url: `/users/${id}/roles`,
                method: 'GET'
            })
        })
    })
})
export const {
    useAssignRoleUserMutation,
    useDeleteRoleUserMutation,
    useLazyGetUserRoleQuery,
    useGetUserRoleQuery
} = userRoleApi