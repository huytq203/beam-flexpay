import {
  SystemSettingCreateApiArg,
  SystemSettingCreateApiResponse,
  SystemSettingFindAllApiArg,
  SystemSettingFindAllApiResponse,
  SystemSettingFindAllFeePrinciplesApiArg,
  SystemSettingFindAllFeePrinciplesApiResponse,
  SystemSettingFindOneByKeyApiArg,
  SystemSettingFindOneByKeyApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] System setting'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      systemSettingFindAll: build.query<
        SystemSettingFindAllApiResponse,
        SystemSettingFindAllApiArg
      >({
        query: () => ({ url: `/system-setting` }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] System setting']
      }),
      systemSettingCreate: build.mutation<
        SystemSettingCreateApiResponse,
        SystemSettingCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/system-setting`,
          method: 'POST',
          body: queryArg.createSystemSettingDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] System setting']
      }),
      systemSettingFindAllFeePrinciples: build.query<
        SystemSettingFindAllFeePrinciplesApiResponse,
        SystemSettingFindAllFeePrinciplesApiArg
      >({
        query: () => ({ url: `/system-setting/fee-principle` }),
        transformResponse: (response: any) => {
          return response.data
        },
        providesTags: ['[Admin] System setting']
      }),
      systemSettingFindOneByKey: build.query<
        SystemSettingFindOneByKeyApiResponse,
        SystemSettingFindOneByKeyApiArg
      >({
        query: (queryArg) => ({
          url: `/system-setting/${queryArg.key}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] System setting']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useSystemSettingFindAllQuery,
  useSystemSettingCreateMutation,
  useSystemSettingFindAllFeePrinciplesQuery,
  useSystemSettingFindOneByKeyQuery
} = injectedRtkApi
