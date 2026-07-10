import { authApiService } from '@services/apiService'
import { ResponseType } from '@type/api'
import { DataEKYC, ContentEKYC } from '@type/apiResponseEKYC'



export const apiEKYC = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getEKYCById: build.query({
            query: (id: string) => ({
                url: `/verified-kyc-profiles/${id}`,
                method: 'GET',
            }),
            transformResponse: (res: ResponseType<ContentEKYC>) => res.data,
            providesTags: ['EKYC'],
        }),
        getEKYCSearch: build.query({
            query: (params) => ({
                url: '/verified-kyc-profiles/search',
                params: params,
                method: 'GET',
            }),
            transformResponse: (res: ResponseType<DataEKYC>) => res.data,
            providesTags: ['EKYC'],
        })
    }),
})

export const {
    useGetEKYCByIdQuery,
    useGetEKYCSearchQuery
} = apiEKYC