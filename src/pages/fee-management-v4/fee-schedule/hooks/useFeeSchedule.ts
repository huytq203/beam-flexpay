import {
  applicableFeeRuleQuerySchema,
  type ApplicableFeeRuleExportQuery,
  type ApplicableFeeRuleQuery
} from '@/app/schemas/applicable-fee-rule.schema'
import { useGetApplicableFeeRulesQuery } from '@/app/services/apiApplicableFeeRule'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportApplicableFeeRulesMutation } from '@services/apiExportCsv'
import { createApplicableFeeRuleRowKey } from '@utils/fee-rule-key'
import { useMemo, useState } from 'react'
import type { FeeScheduleRow } from '../columns/FeeSchedule.column'

export type FeeDomainFilter = 'BANK' | 'EWALLET' | 'MERCHANT'

/** Ngân hàng là mặc định: màn này tồn tại để đối soát phần ngân hàng hưởng. */
const DEFAULT_DOMAIN: FeeDomainFilter = 'BANK'

export const useFeeSchedule = () => {
  const { page, size, setPage, setPageSize } = usePagination()
  const [feeDomain, setFeeDomain] = useState<FeeDomainFilter>(DEFAULT_DOMAIN)

  const parsedQuery = applicableFeeRuleQuerySchema.safeParse({
    feeDomain,
    page,
    size
  } satisfies ApplicableFeeRuleQuery)

  const { data, isLoading, isFetching, isError, refetch } =
    useGetApplicableFeeRulesQuery(
      parsedQuery.success ? parsedQuery.data : { feeDomain, page, size },
      { skip: !parsedQuery.success }
    )

  const [triggerExport, { reset: resetExport }] =
    useExportApplicableFeeRulesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'bieu-phi-hieu-luc'
  })

  const dataSource = useMemo<FeeScheduleRow[]>(
    () =>
      (data?.content ?? []).map((rule, index) => ({
        ...rule,
        rowKey: createApplicableFeeRuleRowKey(rule),
        no: (page - 1) * size + index + 1
      })),
    [data, page, size]
  )

  const handleChangeDomain = (next: FeeDomainFilter) => {
    setFeeDomain(next)
    setPage(1)
  }

  const handleExport = () => {
    const params: ApplicableFeeRuleExportQuery = { feeDomain }
    exportFile(params)
  }

  return {
    feeDomain,
    handleChangeDomain,
    dataSource,
    total: data?.totalElements ?? 0,
    isLoading,
    isFetching,
    isError,
    refetch,
    page,
    size,
    setPage,
    setPageSize,
    handleExport,
    isExporting
  }
}
