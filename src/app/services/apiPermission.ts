import { ResponseType } from "@type/api";
import { Permission } from "@type/permissionManagement";
import { authApiService } from "./authApiService";

export const permissionApi = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getPermission: build.query({
            query: (params) => ({
                url: `permissions`,
                method: "GET",
                params: params
            }),
            providesTags: ['roleManagement'],
            transformResponse: (res: ResponseType<Permission>) => res.data
        }),
        getPermissionByKey: build.query({
            query: (params) => ({
                url: `permissions/search`,
                method: "GET",
                params: params
            }),
            providesTags: ['roleManagement'],
            transformResponse: (res: ResponseType<Permission>) => res.data
        }),
        putPermission: build.mutation({
            query: ({permissionName,body}) => ({
                url: `permissions/${permissionName}`,
                method: "PUT",
                body:body
            }),
            invalidatesTags: ['roleManagement'],
        }),
        deletePermission: build.mutation({
            query: (permissionName) => ({
                url: `permissions/${permissionName}`,
                method: "DELETE",
            }),
            invalidatesTags: ['roleManagement'],
        }),
        postPermission: build.mutation({
            query: (body) => ({
                url: `permissions`,
                method: "POST",
                body:body
            }),
            invalidatesTags: ['roleManagement'],
        }),
    })
})
export const {
    useGetPermissionQuery,
    useLazyGetPermissionQuery,
    usePutPermissionMutation,
    useDeletePermissionMutation,
    usePostPermissionMutation,
    useLazyGetPermissionByKeyQuery
} = permissionApi