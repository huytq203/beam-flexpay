import { apiService } from './apiService'
import { ResponseType } from '@type/api'

export const authService = apiService.injectEndpoints({
  endpoints: (build) => ({
    getBankList: build.query({
      query: (params) => ({
        // fake url
        url: '/customer',
        method: 'GET',
        params: params
      })
    }),
    getBankDetail: build.query({
      query: ({ bankId }) => ({
        // fake url
        url: '/customer/' + bankId,
        method: 'GET'
      })
    }),
    createConfiguration: build.mutation({
      query: (params) => ({
        // fake url
        url: '/customer/',
        method: 'POST',
        body: params
      }),
      transformResponse: (res: ResponseType<any>) => res.statusCode
    }),
    updateConfiguration: build.mutation({
      query: (params) => ({
        // fake url
        url: '/customer/',
        method: 'POST',
        body: params
      }),
      transformResponse: (res: ResponseType<any>) => res.statusCode
    })
  })
})

export const { useGetBankListQuery } = authService
