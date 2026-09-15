import { apiFeeService } from './apiService'
import type { ResponseType } from '@type/api'

export interface CustomerSegment {
  code: string
  name: string
  description?: string | null
  status: string
}

export interface SubjectSegment {
  subjectType: SubjectType
  subjectId: string
  segmentCode: string
  segmentName?: string | null
  updatedBy?: string | null
  updatedAt?: string | null
}

export type SubjectType = 'USER' | 'MERCHANT'

interface SubjectArg {
  subjectType: SubjectType
  subjectId: string
}

/**
 * Phân khúc khách hàng.
 *
 * Danh mục chỉ đọc: nó hiếm khi đổi nên quản lý thẳng trong database, màn hình chỉ cần đổ
 * dropdown để người vận hành không gõ tay — gõ sai một ký tự là bản gán không bao giờ khớp.
 *
 * Gán phân khúc đổi giá của một khách nên vô hiệu cache của chính sách phí luôn: bảng quy tắc
 * đang áp dụng của khách đó thay đổi ngay sau lệnh này.
 */
const customerSegmentApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getCustomerSegments: build.query<CustomerSegment[], void>({
      query: () => ({
        url: '/fee/customer-segments',
        method: 'GET'
      }),
      transformResponse: (response: ResponseType<CustomerSegment[]>) =>
        response.data ?? [],
      providesTags: ['customerSegment']
    }),

    getSubjectSegment: build.query<SubjectSegment | null, SubjectArg>({
      query: ({ subjectType, subjectId }) => ({
        url: `/fee/customer-segments/subjects/${subjectType}/${subjectId}`,
        method: 'GET'
      }),
      transformResponse: (response: ResponseType<SubjectSegment | null>) =>
        response.data ?? null,
      providesTags: ['customerSegment']
    }),

    assignSubjectSegment: build.mutation<
      SubjectSegment,
      SubjectArg & { segmentCode: string }
    >({
      query: ({ subjectType, subjectId, segmentCode }) => ({
        url: `/fee/customer-segments/subjects/${subjectType}/${subjectId}`,
        method: 'PUT',
        body: { segmentCode }
      }),
      transformResponse: (response: ResponseType<SubjectSegment>) =>
        response.data,
      invalidatesTags: [
        'customerSegment',
        'FeePolicy',
        'feeAssign',
        'ApplicableFeeRule'
      ]
    }),

    clearSubjectSegment: build.mutation<void, SubjectArg>({
      query: ({ subjectType, subjectId }) => ({
        url: `/fee/customer-segments/subjects/${subjectType}/${subjectId}`,
        method: 'DELETE'
      }),
      invalidatesTags: [
        'customerSegment',
        'FeePolicy',
        'feeAssign',
        'ApplicableFeeRule'
      ]
    })
  })
})

export const {
  useGetCustomerSegmentsQuery,
  useGetSubjectSegmentQuery,
  useAssignSubjectSegmentMutation,
  useClearSubjectSegmentMutation
} = customerSegmentApi
