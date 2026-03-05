import { authApiService } from '@services/apiService'
import { ResponseType } from '@type/api'
import { DataEKYC } from '@type/apiResponseEKYC'



export const apiEKYC = authApiService.injectEndpoints({
    endpoints: (build) => ({
        getEKYC: build.query({
            query: (params) => ({
                url: '/verified-kyc-profiles',
                params: params,
                method: 'GET',
            }),
            transformResponse: (res: ResponseType<DataEKYC>) => res.data,
            providesTags: ['EKYC'],
        }),
        getEKYCById: build.query({
            query: (id: string) => ({
                url: `/verified-kyc-profiles/${id}`,
                method: 'GET',
            }),
            transformResponse: (res: ResponseType<DataEKYC>) => res.data,
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
    useGetEKYCQuery,
    useLazyGetEKYCQuery,
    useGetEKYCByIdQuery,
    useLazyGetEKYCByIdQuery,
    useGetEKYCSearchQuery,
    useLazyGetEKYCSearchQuery
} = apiEKYC