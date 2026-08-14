import {
  applicableFeeRulePageSchema,
  type ApplicableFeeRulePage,
  type ApplicableFeeRuleQuery
} from '@/app/schemas/applicable-fee-rule.schema'
import { apiFeeService } from '@services/apiService'
import type { ResponseType } from '@type/api'

export const applicableFeeRuleApi = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getApplicableFeeRules: build.query<
      ApplicableFeeRulePage,
      ApplicableFeeRuleQuery
    >({
      query: (params) => ({
        url: '/fee/applicable-rules',
        method: 'GET',
        params
      }),
      transformResponse: (
        response: ResponseType<ApplicableFeeRulePage>
      ): ApplicableFeeRulePage =>
        applicableFeeRulePageSchema.parse(response.data)
    })
  })
})

export const { useGetApplicableFeeRulesQuery } = applicableFeeRuleApi
