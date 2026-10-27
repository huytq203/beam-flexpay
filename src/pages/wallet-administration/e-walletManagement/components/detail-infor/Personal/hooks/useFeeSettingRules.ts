import {
  applicableFeeRuleQuerySchema,
  type ApplicableFeeRuleExportQuery,
  type ApplicableFeeRuleFilter,
  type ApplicableFeeRuleQuery,
  type FeeDomain
} from '@/app/schemas/applicable-fee-rule.schema'
import { useGetApplicableFeeRulesQuery } from '@/app/services/apiApplicableFeeRule'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportApplicableFeeRulesMutation } from '@services/apiExportCsv'
import { useCallback, useMemo, useState } from 'react'
import type {
  ApplicableFeeRuleTableRow,
  FeeRuleSubjectType
} from '../configs/FeeSetting.column'
import { groupFeeRulesByPolicy } from '../utils/group-fee-rules'

/** Ô lọc để trống là "không lọc" — không gửi chuỗi rỗng xuống API. */
const dropEmpty = (filter: ApplicableFeeRuleFilter): ApplicableFeeRuleFilter =>
  Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== '' && v != null)
  )

interface UseFeeSettingRulesParams {
  /** Tên hiện ở dòng phụ của cột "Đối tượng áp dụng" cho bản gán riêng (ví hoặc merchant). */
  accountLabel: string
  subjectId?: string
  subjectType: FeeRuleSubjectType
  feeDomain: FeeDomain
  /**
   * Merchant đang xem. Bắt buộc gửi khi xem merchant: thiếu thì backend thêm điều kiện
   * `merchantId IS NULL` và mất mọi bản gán riêng của merchant. Tab ví không truyền.
   */
  merchantId?: string
}

export const useFeeSettingRules = ({
  accountLabel,
  subjectId,
  subjectType,
  feeDomain,
  merchantId
}: UseFeeSettingRulesParams) => {
  const { page, size, setPage, setPageSize } = usePagination()
  const [filter, setFilter] = useState<ApplicableFeeRuleFilter>({})
  const normalizedSubjectId = subjectId?.trim() ?? ''
  const normalizedMerchantId = merchantId?.trim() ?? ''
  // Chỉ lấy quy tắc riêng (ví hoặc merchant) + theo nhóm; quy tắc chung không hiện ở đây.
  // Backend tự tra nhóm của chủ thể từ subjectId, FE không gửi customerGroup.
  // `merchantId` chỉ có khi xem merchant; bỏ hẳn khóa khi rỗng để tab ví gửi y như cũ.
  const subjectScope = useMemo(
    () => ({
      subjectType,
      subjectId: normalizedSubjectId,
      appliedObjectTypes: 'ACCOUNT,CUSTOMER_GROUP',
      feeDomain,
      ...(normalizedMerchantId ? { merchantId: normalizedMerchantId } : {})
    }),
    [subjectType, normalizedSubjectId, feeDomain, normalizedMerchantId]
  )

  const parsedQuery = applicableFeeRuleQuerySchema.safeParse({
    ...subjectScope,
    ...filter,
    page,
    size
  })
  const fallbackQuery: ApplicableFeeRuleQuery = {
    feeDomain,
    page,
    size
  }
  const queryArgs = parsedQuery.success ? parsedQuery.data : fallbackQuery

  const { data, isLoading, isFetching, isError, refetch } =
    useGetApplicableFeeRulesQuery(queryArgs, {
      skip: !normalizedSubjectId || !parsedQuery.success
    })

  /**
   * Danh sách chính sách để đổ vào ô lọc lấy từ tập quy tắc của riêng ví này,
   * không phải danh mục chính sách toàn hệ thống — chọn một chính sách không
   * áp cho ví thì chỉ nhận về bảng rỗng.
   */
  const { data: policyOptionsData } = useGetApplicableFeeRulesQuery(
    { ...subjectScope, page: 1, size: 100 },
    { skip: !normalizedSubjectId }
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
    () => ({ ...subjectScope, ...filter }),
    [subjectScope, filter]
  )

  const handleExport = useCallback(() => {
    if (!normalizedSubjectId) return
    void exportFile(exportParams)
  }, [exportFile, exportParams, normalizedSubjectId])

  const handleSearch = useCallback(
    (next: ApplicableFeeRuleFilter) => {
      setFilter(dropEmpty(next))
      setPage(1)
    },
    [setPage]
  )

  const dataSource = useMemo<ApplicableFeeRuleTableRow[]>(
    () =>
      groupFeeRulesByPolicy(data?.content ?? []).map((rule, index) => ({
        ...rule,
        rowKey: rule.groupKey,
        no: (page - 1) * size + index + 1,
        accountLabel
      })),
    [data, page, size, accountLabel]
  )

  return {
    hasValidSubject: Boolean(normalizedSubjectId) && parsedQuery.success,
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
