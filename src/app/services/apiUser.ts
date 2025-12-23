import { ResponseUserInfor } from "@type/roleManagement";
import { ResponseType } from "@type/api";
import { authApiService } from "./authApiService";

export const userApi = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getUser: build.query({
            query: (params) => ({
                url: `users/managers`,
                method: 'GET',
                params:params
            }),
            transformResponse: (res: ResponseType<ResponseUserInfor>) => res.data
        })
    })
})
export const {
    useGetUserQuery
} = userApi