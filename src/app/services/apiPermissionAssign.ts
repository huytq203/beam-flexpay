import { authApiService } from "./apiService";

export const apiPermissionAssign = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getPermissionAssign: build.query({
            query: (roleId) => ({
                url: `roles/${roleId}/permissions`,
                method: "GET",
            }),
            providesTags: ['PermissionAssign']
        }),
        postPermissionAvailable: build.mutation({
            query: ({roleId,body}) => ({
                url: `roles/${roleId}/permissions`,
                method: "POST",
                body:body
            }),
            invalidatesTags: ['PermissionAssign']
        }),
        deletePermissionAssign: build.mutation({
            query: ({roleId,body}) => ({
                url: `roles/${roleId}/permissions`,
                method: "DELETE",
                body:body
            }),
            invalidatesTags: ['PermissionAssign']
        }),
    })
})
export const {
    usePostPermissionAvailableMutation,
    useLazyGetPermissionAssignQuery,
    useDeletePermissionAssignMutation
} = apiPermissionAssign