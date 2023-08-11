import { ResponseType } from '@type/api'
import {
  RefundListDataType,
  RefundListPayloadType,
  RefundSearchParamsType
} from '@type/refund'
import { apiService } from './apiService'

export const refundApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getRefundList: builder.query<RefundListPayloadType, RefundSearchParamsType>(
      {
        query: (params) => ({
          url: '/refund',
          method: 'GET',
          params: params
        }),
        transformResponse(
          baseQueryReturnValue: ResponseType<RefundListPayloadType>
        ): RefundListPayloadType {
          return baseQueryReturnValue.data
        }
      }
    ),
    makeRefund: builder.mutation({
      query: (params) => ({
        url: `/refund/refund/${params}`,
        method: 'POST'
      })
    }),
    getRefundDetail: builder.query<RefundListDataType, string>({
      query: (params) => ({
        url: `/refund/${params}`,
        method: 'GET'
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<RefundListDataType>
      ): RefundListDataType {
        return baseQueryReturnValue.data
      }
    }),
    exportRefundCSV: builder.query({
      queryFn: async (params, api, extraOptions, baseQuery) => {
        const { pageCount, ...search } = params
        const queryList = Array.from({ length: params.pageCount }).map(
          (u, index) => {
            return baseQuery({
              url: `/refund/export/csv`,
              method: 'GET',
              params: {
                ...search,
                page: index + 1
              },
              responseHandler: (response: any) => response.text()
            })
          }
        )
        let arrBlob = ''
        await Promise.all(queryList).then((res) => {
          res.map((item, index) => {
            if (index === 0) {
              arrBlob = arrBlob + item.data
            } else {
              const newString = (item.data as string).replace(
                `"=""Thời gian""","=""Mã giao dịch""","=""Tài khoản merchant""","=""Merchant""","=""Phương thức thanh toán""","=""Trạng thái""","=""Số tiền""","=""Mô tả"""`,
                ''
              )
              arrBlob = arrBlob + newString
            }
          })
        })
        const downloadItem = document.createElement('a')
        const blobItem = URL.createObjectURL(
          new Blob(['\uFEFF' + arrBlob], {
            type: 'text/csv;charset=utf-8, {header:true}'
          })
        )
        downloadItem.href = blobItem
        downloadItem.target = '_blank'
        downloadItem.download = 'refund.csv'
        downloadItem.click()
        return { data: null }
      }
    })
  })
})

export const {
  useGetRefundListQuery,
  useMakeRefundMutation,
  useGetRefundDetailQuery,
  useExportRefundCSVQuery,
  useLazyExportRefundCSVQuery
} = refundApi
