import { ResponseType } from '@type/api'
import { IEkycPayload, IEkycSearch, IEkycType } from '@type/ekyc'
import { apiService } from './apiService'

export const ekycService = apiService.injectEndpoints({
  endpoints: (build) => ({
    getListEkyc: build.query<IEkycPayload, IEkycSearch | any>({
      query: (params) => ({
        url: '/customer-verification',
        params: params
      }),
      transformResponse: (baseQueryReturnValue): IEkycPayload => {
        return (baseQueryReturnValue as ResponseType<IEkycPayload>).data
      },
      providesTags: ['ekycService']
    }),
    detailEkyc: build.query<ResponseType<IEkycType>, string>({
      query: (payload) => ({
        url: `/customer-verification/${payload}`,
        method: 'GET'
      }),
      providesTags: ['ekycService']
    }),
    approveEkyc: build.mutation({
      query: ({ id, ...payload }) => ({
        url: `/customer-verification/${id}`,
        method: 'PUT',
        body: payload
      }),
      invalidatesTags: ['ekycService']
    })
  })
})

export const {
  useGetListEkycQuery,
  useDetailEkycQuery,
  useApproveEkycMutation
} = ekycService
