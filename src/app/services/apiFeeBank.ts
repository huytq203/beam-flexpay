import { apiFeeService } from './apiService'
export const apiFeeBank = apiFeeService.injectEndpoints({
    endpoints: (build) => ({
        getBank: build.query({
            query: (params) => ({
                url: `/fee/banks`,
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