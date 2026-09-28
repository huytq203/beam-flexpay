import { apiMerchant } from './apiService'

export interface ApiEnvelope<T> {
  data: T
  message?: string
  detail?: string
  success?: boolean
  status?: number
}

export interface ApiPage<T> {
  content: T[]
  totalElements: number
  number: number
  size: number
}

export interface InheritedString {
  value?: string
  inherited?: boolean
  source?: 'SYSTEM_DEFAULT' | 'MASTER' | 'SUB' | 'TERMINAL'
  suspended?: boolean
}

export type HierarchyStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED'
export type ApiTerminalType = 'POS' | 'ONLINE' | 'QR'

export interface ApiSubMerchantSummary {
  id: string
  code: string
  name: string
  status: HierarchyStatus
  isDefault?: boolean
  lockSource?: 'DIRECT' | 'CASCADE'
  merchantId: string
  merchantCode?: string
  merchantName?: string
  phone?: InheritedString
  createdAt?: string
}

export interface ApiSubMerchant extends ApiSubMerchantSummary {
  businessField?: string
  legalName?: string
  taxCode?: string
  legalRepresentativeName?: string
  address?: InheritedString
  updatedAt?: string
}

export interface ApiTerminalSummary {
  id: string
  tid: string
  name: string
  terminalType: ApiTerminalType
  address?: string
  status: HierarchyStatus
  lockSource?: 'DIRECT' | 'CASCADE'
  subMerchantId: string
  subMerchantCode?: string
  subMerchantName?: string
  merchantId: string
  contactPhone?: InheritedString
  createdAt?: string
}

export interface ApiTerminal extends ApiTerminalSummary {
  contactPerson?: string
  note?: string
  merchantCode?: string
  merchantName?: string
  parentEditable?: boolean
  typeChangeWarning?: string | null
  updatedAt?: string
}

export interface ApiParentMerchant {
  id: string
  code: string
  name: string
  status: string
  contactPhone?: string
  address?: string
  taxCode?: string
  legalRepresentativeName?: string
}

export interface ParentMerchantQuery {
  page?: number
  size?: number
  name?: string
  code?: string
  status?: string
}

export interface HierarchyPageQuery {
  page: number
  size: number
  merchantId?: string
  subMerchantId?: string
  code?: string
  name?: string
  tid?: string
  terminalType?: ApiTerminalType
  status?: HierarchyStatus
}

export interface SubMerchantPayload {
  merchantId?: string
  name: string
  businessField?: string
  inheritPhone: boolean
  phone?: string
  inheritAddress: boolean
  address?: string
}

export interface TerminalPayload {
  subMerchantId: string
  name: string
  terminalType: ApiTerminalType
  address?: string
  contactPerson?: string
  inheritContactPhone: boolean
  contactPhone?: string
  note?: string
}

const unwrap = <T>(response: ApiEnvelope<T>): T => response.data

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getHierarchyParents: builder.query<ApiPage<ApiParentMerchant>, ParentMerchantQuery>({
      query: ({ page = 1, size = 100, name, code, status }) => ({ url: '/merchants', params: { page, size, name, code, status } }),
      transformResponse: unwrap<ApiPage<ApiParentMerchant>>,
      providesTags: ['merchant']
    }),
    getHierarchyParentById: builder.query<ApiParentMerchant, string>({
      query: (id) => `/merchants/${id}`,
      transformResponse: unwrap<ApiParentMerchant>,
      providesTags: ['merchant']
    }),
    getSubMerchantPage: builder.query<ApiPage<ApiSubMerchantSummary>, HierarchyPageQuery>({
      query: ({ page, size, merchantId, code, name, status }) => ({
        url: '/sub-merchants', params: { page, size, merchantId, code, name, status }
      }),
      transformResponse: unwrap<ApiPage<ApiSubMerchantSummary>>,
      providesTags: ['merchant']
    }),
    getSubMerchantDetail: builder.query<ApiSubMerchant, string>({
      query: (id) => `/sub-merchants/${id}`,
      transformResponse: unwrap<ApiSubMerchant>,
      providesTags: ['merchant']
    }),
    createSubMerchant: builder.mutation<ApiSubMerchant, SubMerchantPayload>({
      query: (body) => ({ url: '/sub-merchants', method: 'POST', body }),
      transformResponse: unwrap<ApiSubMerchant>,
      invalidatesTags: ['merchant']
    }),
    updateSubMerchant: builder.mutation<ApiSubMerchant, { id: string; body: Omit<SubMerchantPayload, 'merchantId'> }>({
      query: ({ id, body }) => ({ url: `/sub-merchants/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<ApiSubMerchant>,
      invalidatesTags: ['merchant']
    }),
    setSubMerchantLocked: builder.mutation<ApiSubMerchant, { id: string; lock: boolean; reason: string }>({
      query: ({ id, lock, reason }) => ({ url: `/sub-merchants/${id}/${lock ? 'lock' : 'unlock'}`, method: 'POST', body: { reason } }),
      transformResponse: unwrap<ApiSubMerchant>,
      invalidatesTags: ['merchant']
    }),
    getTerminalPage: builder.query<ApiPage<ApiTerminalSummary>, HierarchyPageQuery>({
      query: ({ page, size, merchantId, subMerchantId, tid, name, terminalType, status }) => ({
        url: '/terminals', params: { page, size, merchantId, subMerchantId, tid, name, terminalType, status }
      }),
      transformResponse: unwrap<ApiPage<ApiTerminalSummary>>,
      providesTags: ['merchant']
    }),
    getTerminalDetail: builder.query<ApiTerminal, string>({
      query: (id) => `/terminals/${id}`,
      transformResponse: unwrap<ApiTerminal>,
      providesTags: ['merchant']
    }),
    createTerminalApi: builder.mutation<ApiTerminal, TerminalPayload>({
      query: (body) => ({ url: '/terminals', method: 'POST', body }),
      transformResponse: unwrap<ApiTerminal>,
      invalidatesTags: ['merchant']
    }),
    updateTerminalApi: builder.mutation<ApiTerminal, { id: string; body: Partial<TerminalPayload> }>({
      query: ({ id, body }) => ({ url: `/terminals/${id}`, method: 'PUT', body }),
      transformResponse: unwrap<ApiTerminal>,
      invalidatesTags: ['merchant']
    }),
    setTerminalLocked: builder.mutation<ApiTerminal, { id: string; lock: boolean; reason: string }>({
      query: ({ id, lock, reason }) => ({ url: `/terminals/${id}/${lock ? 'lock' : 'unlock'}`, method: 'POST', body: { reason } }),
      transformResponse: unwrap<ApiTerminal>,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useGetHierarchyParentsQuery,
  useGetHierarchyParentByIdQuery,
  useGetSubMerchantPageQuery,
  useGetSubMerchantDetailQuery,
  useCreateSubMerchantMutation,
  useUpdateSubMerchantMutation,
  useSetSubMerchantLockedMutation,
  useGetTerminalPageQuery,
  useGetTerminalDetailQuery,
  useCreateTerminalApiMutation,
  useUpdateTerminalApiMutation,
  useSetTerminalLockedMutation
} = service
