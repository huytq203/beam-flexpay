import { apiService } from './apiService'
import { ResponseType } from '@type/api'
const baseURL = import.meta.env.VITE_FEE_API_URL
export const apiFeeBank = apiService.injectEndpoints({
    endpoints: (build) => ({
        getBank: build.query({
            query: (params) => ({
                url: `${baseURL}/fee/banks`,
                method: 'GET',
                params: params
            }),
            providesTags: ['feeBank']
        })
    })
})
export const {
    useGetBankQuery
} = apiFeeBank