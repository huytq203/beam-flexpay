import {
  applicableFeeRuleQuerySchema,
  type ApplicableFeeRuleExportQuery,
  type ApplicableFeeRuleFilter,
  type ApplicableFeeRuleQuery
} from '@/app/schemas/applicable-fee-rule.schema'
import { useGetApplicableFeeRulesQuery } from '@/app/services/apiApplicableFeeRule'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportApplicableFeeRulesMutation } from '@services/apiExportCsv'
import { useCallback, useMemo, useState } from 'react'
import type { ApplicableFeeRuleTableRow } from '../configs/FeeSetting.column'
import { createApplicableFeeRuleRowKey } from '../utils/applicable-fee-rule'

/** Ô lọc để trống là "không lọc" — không gửi chuỗi rỗng xuống API. */
const dropEmpty = (filter: ApplicableFeeRuleFilter): ApplicableFeeRuleFilter =>
  Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== '' && v != null)
  )

interface UseFeeSettingRulesParams {
  walletId: string
  walletLabel: string
}

export const useFeeSettingRules = ({
  walletId,
  walletLabel
}: UseFeeSettingRulesParams) => {
  const { page, size, setPage, setPageSize } = usePagination()
  const [filter, setFilter] = useState<ApplicableFeeRuleFilter>({})

  const parsedQuery = applicableFeeRuleQuerySchema.safeParse({
    merchantId: walletId,
    feeDomain: 'EWALLET',
    ...filter,
    page,
    size
  })
  const fallbackQuery: ApplicableFeeRuleQuery = {
    feeDomain: 'EWALLET',
    page,
    size
  }
  const queryArgs = parsedQuery.success ? parsedQuery.data : fallbackQuery

  const { data, isLoading, isFetching, isError, refetch } =
    useGetApplicableFeeRulesQuery(queryArgs, { skip: !parsedQuery.success })

  /**
   * Danh sách chính sách để đổ vào ô lọc lấy từ tập quy tắc của riêng ví này,
   * không phải danh mục chính sách toàn hệ thống — chọn một chính sách không
   * áp cho ví thì chỉ nhận về bảng rỗng.
   */
  const { data: policyOptionsData } = useGetApplicableFeeRulesQuery(
    { merchantId: walletId, feeDomain: 'EWALLET', page: 1, size: 100 },
    { skip: !walletId }
  )

  const policyOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const rule of policyOptionsData?.content ?? []) {
      seen.set(rule.feePolicyId, rule.feePolicyName)
    }
    return [...seen].map(([value, label]) => ({ value, label }))
  }, [policyOptionsData])

  const [triggerExport, { reset: resetExport }] =
    useExportApplicableFeeRulesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'cau-hinh-phi'
  })

  /** Endpoint xuất không nhận page/size — file lấy trọn bộ lọc, không theo trang. */
  const exportParams = useMemo<ApplicableFeeRuleExportQuery>(
    () => ({ merchantId: walletId, feeDomain: 'EWALLET', ...filter }),
    [walletId, filter]
  )

  const handleExport = useCallback(() => {
    void exportFile(exportParams)
  }, [exportFile, exportParams])

  const handleSearch = useCallback(
    (next: ApplicableFeeRuleFilter) => {
      setFilter(dropEmpty(next))
      setPage(1)
    },
    [setPage]
  )

  const dataSource = useMemo<ApplicableFeeRuleTableRow[]>(
    () =>
      (data?.content ?? []).map((rule, index) => ({
        ...rule,
        rowKey: createApplicableFeeRuleRowKey(rule),
        no: (page - 1) * size + index + 1,
        accountLabel: walletLabel
      })),
    [data, page, size, walletLabel]
  )

  return {
    isWalletIdValid: parsedQuery.success,
    dataSource,
    totalElements: data?.totalElements ?? 0,
    hasFilter: Object.keys(filter).length > 0,
    policyOptions,
    isLoading,
    isFetching,
    isError,
    refetch,
    page,
    size,
    setPage,
    setPageSize,
    handleSearch,
    handleExport,
    isExporting
  }
}
