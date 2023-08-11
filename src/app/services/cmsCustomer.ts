import {
  CustomerChangePasswordApiArg,
  CustomerChangePasswordApiResponse,
  CustomerCreateApiArg,
  CustomerCreateApiResponse,
  CustomerDeleteApiArg,
  CustomerDeleteApiResponse,
  CustomerFindAllApiArg,
  CustomerFindAllApiResponse,
  CustomerFindOneApiArg,
  CustomerFindOneApiResponse,
  CustomerFindOneByAccountNumberApiArg,
  CustomerFindOneByAccountNumberApiResponse,
  CustomerGetCustomerByAccountNumberApiArg,
  CustomerGetCustomerByAccountNumberApiResponse,
  CustomerGetExportCsvApiArg,
  CustomerGetExportCsvApiResponse,
  CustomerGetExportExcelApiArg,
  CustomerGetExportExcelApiResponse,
  CustomerGetSecurityMethodApiArg,
  CustomerGetSecurityMethodApiResponse,
  CustomerToggleActiveApiArg,
  CustomerToggleActiveApiResponse,
  CustomerUpdateApiArg,
  CustomerUpdateApiResponse,
  CustomerVerificationDeleteVerifyApiArg,
  CustomerVerificationDeleteVerifyApiResponse,
  CustomerVerificationFindAllApiArg,
  CustomerVerificationFindAllApiResponse,
  CustomerVerificationFindOneByIdApiArg,
  CustomerVerificationFindOneByIdApiResponse,
  CustomerVerificationUpdateApiArg,
  CustomerVerificationUpdateApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = [
  '[Admin] Admin Customer',
  '[Admin] Admin Customer Verification'
] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      customerFindAll: build.query<
        CustomerFindAllApiResponse,
        CustomerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/customer`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            email: queryArg.email,
            active: queryArg.active,
            name: queryArg.name,
            status: queryArg.status,
            accountNumber: queryArg.accountNumber,
            hasTransactions: queryArg.hasTransactions,
            from: queryArg['from'],
            to: queryArg.to,
            type: queryArg['type'],
            confirmType: queryArg.confirmType,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Customer'],
        transformResponse: fnTransformResponse
      }),
      customerGetSecurityMethod: build.query<
        CustomerGetSecurityMethodApiResponse,
        CustomerGetSecurityMethodApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/get-security-setting`,
          params: { accountNumber: queryArg.accountNumber }
        }),
        providesTags: ['[Admin] Admin Customer'],
        transformResponse: fnTransformResponse
      }),
      customerFindOne: build.query<
        CustomerFindOneApiResponse,
        CustomerFindOneApiArg
      >({
        query: (queryArg) => ({ url: `/customer/${queryArg.id}` }),
        providesTags: ['[Admin] Admin Customer']
      }),
      customerUpdate: build.mutation<
        CustomerUpdateApiResponse,
        CustomerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateCustomerDto
        }),
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerDelete: build.mutation<
        CustomerDeleteApiResponse,
        CustomerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/${queryArg.id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerFindOneByAccountNumber: build.query<
        CustomerFindOneByAccountNumberApiResponse,
        CustomerFindOneByAccountNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/by-account-number/${queryArg.accountNumber}`
        }),
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetCustomerByAccountNumber: build.query<
        CustomerGetCustomerByAccountNumberApiResponse,
        CustomerGetCustomerByAccountNumberApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/customer-balance/${queryArg.accountNumber}`
        }),
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetExportExcel: build.query<
        CustomerGetExportExcelApiResponse,
        CustomerGetExportExcelApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/export/excel`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            email: queryArg.email,
            active: queryArg.active,
            name: queryArg.name,
            status: queryArg.status,
            accountNumber: queryArg.accountNumber,
            hasTransactions: queryArg.hasTransactions,
            from: queryArg['from'],
            to: queryArg.to,
            type: queryArg['type'],
            confirmType: queryArg.confirmType,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Customer']
      }),
      customerGetExportCsv: build.query<
        CustomerGetExportCsvApiResponse,
        CustomerGetExportCsvApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/export/csv`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            email: queryArg.email,
            active: queryArg.active,
            name: queryArg.name,
            status: queryArg.status,
            accountNumber: queryArg.accountNumber,
            hasTransactions: queryArg.hasTransactions,
            from: queryArg['from'],
            to: queryArg.to,
            type: queryArg['type'],
            confirmType: queryArg.confirmType,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Customer']
      }),
      customerCreate: build.mutation<
        CustomerCreateApiResponse,
        CustomerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/create/personal`,
          method: 'POST',
          body: queryArg.createCustomerPersonalDto
        }),
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerToggleActive: build.mutation<
        CustomerToggleActiveApiResponse,
        CustomerToggleActiveApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/${queryArg.id}/toggle-active`,
          method: 'PATCH',
          body: queryArg.toggleActiveDto
        }),
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerChangePassword: build.mutation<
        CustomerChangePasswordApiResponse,
        CustomerChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/customer/change-password`,
          method: 'PATCH',
          body: queryArg.changePasswordDto
        }),
        invalidatesTags: ['[Admin] Admin Customer']
      }),
      customerVerificationFindAll: build.query<
        CustomerVerificationFindAllApiResponse,
        CustomerVerificationFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            phoneNumber: queryArg.phoneNumber,
            status: queryArg.status,
            from: queryArg['from'],
            to: queryArg.to,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Customer Verification']
      }),
      customerVerificationFindOneById: build.query<
        CustomerVerificationFindOneByIdApiResponse,
        CustomerVerificationFindOneByIdApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification/${queryArg.id}`
        }),
        providesTags: ['[Admin] Admin Customer Verification']
      }),
      customerVerificationUpdate: build.mutation<
        CustomerVerificationUpdateApiResponse,
        CustomerVerificationUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateCustomerVerificationDto
        }),
        invalidatesTags: ['[Admin] Admin Customer Verification']
      }),
      customerVerificationDeleteVerify: build.mutation<
        CustomerVerificationDeleteVerifyApiResponse,
        CustomerVerificationDeleteVerifyApiArg
      >({
        query: (queryArg) => ({
          url: `/customer-verification/${queryArg.phone}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['[Admin] Admin Customer Verification']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useCustomerFindAllQuery,
  useCustomerGetSecurityMethodQuery,
  useCustomerFindOneQuery,
  useCustomerUpdateMutation,
  useCustomerDeleteMutation,
  useCustomerFindOneByAccountNumberQuery,
  useCustomerGetCustomerByAccountNumberQuery,
  useCustomerGetExportExcelQuery,
  useCustomerGetExportCsvQuery,
  useCustomerCreateMutation,
  useCustomerToggleActiveMutation,
  useCustomerChangePasswordMutation,
  useCustomerVerificationFindAllQuery,
  useCustomerVerificationFindOneByIdQuery,
  useCustomerVerificationUpdateMutation,
  useCustomerVerificationDeleteVerifyMutation
} = injectedRtkApi
