import {
  BankCmsFindAllActiveApiArg,
  BankCmsFindAllActiveApiResponse,
  BankCmsFindAllApiArg,
  BankCmsFindAllApiResponse,
  BankCmsFindOneApiArg,
  BankCmsFindOneApiResponse,
  BankCmsGetExportCsvApiArg,
  BankCmsGetExportCsvApiResponse,
  BankCmsGetExportExcelApiArg,
  BankCmsGetExportExcelApiResponse,
  BankCmsUpdateApiArg,
  BankCmsUpdateApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin Bank'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      bankFindAll: build.query<BankCmsFindAllApiResponse, BankCmsFindAllApiArg>(
        {
          query: (queryArg) => ({
            url: `/bank`,
            params: {
              order: queryArg.order,
              page: queryArg.page,
              take: queryArg.take,
              query: queryArg.query,
              active: queryArg.active,
              name: queryArg.name,
              key: queryArg.key,
              orderBy: queryArg.orderBy
            }
          }),
          transformResponse: fnTransformResponse,
          providesTags: ['[Admin] Admin Bank']
        }
      ),
      bankFindAllActive: build.query<
        BankCmsFindAllActiveApiResponse,
        BankCmsFindAllActiveApiArg
      >({
        query: () => ({ url: `/bank/find-all-active` }),
        providesTags: ['[Admin] Admin Bank']
      }),
      bankUpdate: build.mutation<BankCmsUpdateApiResponse, BankCmsUpdateApiArg>(
        {
          query: (queryArg) => ({
            url: `/bank/${queryArg.id}`,
            method: 'PUT',
            body: queryArg.updateBankDto
          }),
          invalidatesTags: ['[Admin] Admin Bank']
        }
      ),
      bankFindOne: build.query<BankCmsFindOneApiResponse, BankCmsFindOneApiArg>(
        {
          query: (queryArg) => ({ url: `/bank/${queryArg.id}` }),
          transformResponse: fnTransformResponse,
          providesTags: ['[Admin] Admin Bank']
        }
      ),
      bankGetExportExcel: build.query<
        BankCmsGetExportExcelApiResponse,
        BankCmsGetExportExcelApiArg
      >({
        query: (queryArg) => ({
          url: `/bank/export/excel`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            active: queryArg.active,
            name: queryArg.name,
            key: queryArg.key,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Bank']
      }),
      bankGetExportCsv: build.query<
        BankCmsGetExportCsvApiResponse,
        BankCmsGetExportCsvApiArg
      >({
        query: (queryArg) => ({
          url: `/bank/export/csv`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            active: queryArg.active,
            name: queryArg.name,
            key: queryArg.key,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Bank']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useBankFindAllQuery,
  useBankFindAllActiveQuery,
  useBankUpdateMutation,
  useBankFindOneQuery,
  useBankGetExportExcelQuery,
  useBankGetExportCsvQuery,
  useLazyBankGetExportCsvQuery
} = injectedRtkApi
