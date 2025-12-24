import { ResponseType } from "@type/api";
import { DataRole, ResponseRole } from "@type/roleManagement";
import { authApiService } from "./authApiService";

export const apiRole = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getRole: build.query({
            query: (params) => ({
                url: "/roles",
                method: 'GET',
                params: params
            }),
            transformResponse: (res: ResponseType<DataRole>) => res.data
        })
    })
})
export const {
    useGetRoleQuery
} = apiRole