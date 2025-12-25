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
    })
})
export const {
    useGetPermissionQuery
} = permissionApi