import { ResponseType } from '@type/api'
import { CustomerFindAllApiArg } from '@type/application'
import {
  AccountPayload,
  CustomerInterface,
  IGetSecurityConfig
} from '@type/customer'
import { fnTransformResponse } from '@utils/helperFunctions'
import _ from 'lodash'
import { apiService } from './apiService'

export const customerApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<AccountPayload, CustomerFindAllApiArg>({
      query: (params) => {
        let args = ''
        for (const key in params) {
          if (key === 'status') {
            _.forEach((params as any)[key], (value: string) => {
              args += 'status=' + value + '&'
            })
          } else {
            args += key + '=' + (params as any)[key] + '&'
          }
        }
        return '/customer?' + args
      },
      transformResponse: fnTransformResponse,
      providesTags: ['customerService']
    }),
    getCustomer: builder.query<ResponseType<CustomerInterface>, string>({
      query: (payload) => ({
        url: `/customer/${payload}`,
        method: 'GET'
      }),
      providesTags: ['customerService']
    }),
    getCustomerByAccountNumber: builder.query<CustomerInterface, string>({
      query: (payload) => ({
        url: `/customer/by-account-number/${payload}`,
        method: 'GET'
      }),
      providesTags: ['customerService'],
      transformResponse: (res: any) => res.data
    }),
    createAccount: builder.mutation({
      query: (payload) => ({
        url: `/customer/create/personal`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['customerService'],
      transformResponse: (res: any) => res.data
    }),
    getSecuritySetting: builder.query<IGetSecurityConfig, string>({
      query: (id) => ({
        url: '/customer/get-security-setting',
        params: { accountNumber: id }
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<IGetSecurityConfig>
      ): IGetSecurityConfig {
        return baseQueryReturnValue.data
      }
    }),
    changeSecuritySetting: builder.mutation({
      query: (data) => ({
        url: '/customer/change-security-method',
        method: 'PATCH',
        body: data
      })
    }),
    changeCustomerPassword: builder.mutation({
      query: (data) => ({
        url: '/customer/change-password',
        method: 'PATCH',
        body: data
      })
    }),
    toggleActive: builder.mutation({
      query: (payload) => ({
        url: `/customer/${payload.userId}/toggle-active`,
        method: 'PATCH',
        body: payload
      })
    }),
    exportExcel: builder.query({
      queryFn: async (payload, api, extraOptions, baseQuery) => {
        const { pageCount, ...search } = payload
        const queryList = Array.from({ length: payload.pageCount }).map(
          (u, index) => {
            return baseQuery({
              url: '/customer/export/csv',
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
              const newString = (r.data as string).replace(
                `"=""ID""","=""Thời gian tạo""","=""Loại""","=""Giới tính""","=""Họ tên""","=""Ngày sinh""","=""Avatar""","=""SĐT""","=""STK""","=""CCCD/CMND/Hộ chiếu""","=""Ngày cấp""","=""Nơi cấp""","=""Địa chỉ""","=""Xã /phường""","=""Quận/ huyện""","=""Tỉnh/Thành phố""","=""Email""","=""Mã giới thiệu""","=""Trạng thái""","=""Trạng thái tài khoản"""`,
                ''
              )
              arrayBlob = arrayBlob + newString
            }
          })
        })
        const downloadItem = document.createElement('a')
        const url = window.URL || window.webkitURL
        const blobPDF = url.createObjectURL(
          new Blob(['\uFEFF' + arrayBlob], {
            type: 'text/csv;charset=utf-8, {header:true}'
          })
        )
        downloadItem.href = blobPDF
        downloadItem.target = '_blank'
        downloadItem.download = `customers.csv`
        downloadItem.click()
        return { data: true }
      }
    }),
    cancelAccount: builder.mutation({
      query: ({ customerId }) => ({
        url: '/customer/' + customerId,
        method: 'DELETE'
      })
    })
  })
})

export const {
  useGetCustomersQuery,
  useCreateAccountMutation,
  useGetCustomerQuery,
  useGetSecuritySettingQuery,
  useChangeSecuritySettingMutation,
  useToggleActiveMutation,
  useChangeCustomerPasswordMutation,
  useExportExcelQuery,
  useGetCustomerByAccountNumberQuery,
  useLazyGetCustomerByAccountNumberQuery,
  useCancelAccountMutation,
  useLazyGetCustomersQuery,
  useLazyGetCustomerQuery,
  useLazyExportExcelQuery
} = customerApi
