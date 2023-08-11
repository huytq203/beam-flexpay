import { ResponseType } from '@type/api'
import { BankResponse, PublicBankInterface } from '@type/bank'
import { apiService } from './apiService'

export const bankAPI = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getBanks: builder.query({
      query: (payload) => ({
        url: '/bank',
        method: 'GET',
        params: payload
      }),
      transformResponse: (res: ResponseType<BankResponse>) => res.data
    }),
    getPublicBanks: builder.query({
      query: () => ({
        url: '/bank/find-all-active',
        method: 'GET'
      }),
      transformResponse: (res: ResponseType<PublicBankInterface[]>) => res.data
    }),
    getDetailBank: builder.query({
      query: ({ bankId, ...payload }) => ({
        url: '/bank/' + bankId,
        method: 'GET',
        params: payload
      })
    }),
    createBankAccount: builder.mutation({
      query: (payload) => ({
        url: '/bank',
        method: 'POST',
        body: payload
      }),
      transformResponse: (res: ResponseType<any>) => res.statusCode
    }),
    updateBankAccount: builder.mutation({
      query: (payload) => ({
        url: '/bank/' + payload.id,
        method: 'PUT',
        body: payload.formData
      }),
      transformResponse: (res: ResponseType<any>) => res.statusCode
    }),
    deleteBankAccount: builder.query({
      query: (id) => ({
        url: '/bank/' + id,
        method: 'DELETE'
      }),
      transformResponse: (res: ResponseType<any>) => res.statusCode
    }),
    exportCsv: builder.query({
      queryFn: async (payload, api, extraOptions, baseQuery) => {
        const { pageCount, ...search } = payload
        const queryList = Array.from({ length: payload.pageCount }).map(
          (u, index) => {
            return baseQuery({
              url: '/bank/export/csv',
              method: 'GET',
              headers: {
                responseType: 'blob'
              },
              params: {
                ...search,
                page: index + 1
              },
              responseHandler: (response: any) => response.text()
            })
          }
        )
        let arrayBlob = ''
        await Promise.all(queryList).then((res) => {
          res.forEach((r, index) => {
            if (index === 0) {
              arrayBlob = arrayBlob + r.data
            } else {
              const replaceValue = `"=""ID""","=""Tên ngân hàng""","=""Tên viết tắt""","=""Mã ngân hàng""","=""Loại ngân hàng""","=""Địa chỉ""","=""website""","=""Logo""","=""Logo rút gọn""","=""Thời gian tạo""","=""Trạng thái""","=""Điều kênh""","=""Thứ tự hiển thị"""`
              const newString = (r.data as string).replace(replaceValue, '')
              arrayBlob = arrayBlob + newString
            }
          })
        })

        const downloadItem = document.createElement('a')
        const url = window.URL || window.webkitURL
        const blobCSV = url.createObjectURL(
          new Blob(['\uFEFF' + arrayBlob], {
            type: 'text/csv;charset=utf-8, {header:true}'
          })
        )
        downloadItem.href = blobCSV
        downloadItem.target = '_blank'
        downloadItem.download = `bankList.csv`
        downloadItem.click()
        return { data: null }
      }
    })
  })
})

export const {
  useLazyGetPublicBanksQuery,
  useGetBanksQuery,
  useLazyGetBanksQuery,
  useLazyGetDetailBankQuery,
  useGetDetailBankQuery,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useLazyDeleteBankAccountQuery,
  useLazyExportCsvQuery
} = bankAPI
