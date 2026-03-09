import { ResponseUserInfor } from "@type/userManagement";
import { ResponseType } from "@type/api";
import { authApiService } from "./apiService";

export const userApi = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getUser: build.query({
            query: (params) => ({
                url: `users/managers`,
                method: 'GET',
                params:params
            }),
            transformResponse: (res: ResponseType<ResponseUserInfor>) => res.data
        }),
        getUserById:build.query({
            query:(id)=>({
                url:`users/managers/${id}`,
                method: 'GET',
            })
        })
    })
})
export const {
    useGetUserQuery,
    useLazyGetUserByIdQuery
} = userApi
