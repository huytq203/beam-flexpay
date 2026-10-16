import { useGetEKYCSearchQuery } from '@services/apiEKYC'
import { useExportCsv } from '@hooks/useExportCsv'
import { useUrlFilters } from '@hooks/useUrlFilters'
import { useExportVerifiedKycProfilesMutation } from '@services/apiExportCsv'
import type { EKYCGroup, EKYCListItem } from '@type/apiResponseEKYC'
import {
  EKYC_FILTER_KEYS,
  EKYC_SENSITIVE_KEYS,
  type EkycFilterKey
} from '../constants/ekycFilter.constants'
import { toEkycApiFilter } from '../utils/ekycFilters'

const SORT_BY = 'createdAt'
const SORT_DIRECTION = 'DESC'

const useConfirmEKYC = () => {
  const {
    filters,
    applyFilters,
    clearFilters,
    page,
    size: pageSize,
    setPage,
    setPageSize
  } = useUrlFilters<EkycFilterKey>({
    keys: EKYC_FILTER_KEYS,
    sensitiveKeys: EKYC_SENSITIVE_KEYS
  })
  const filter = toEkycApiFilter(filters)

  const payload = {
    page: page,
    size: pageSize,
    sortBy: SORT_BY,
    sortDirection: SORT_DIRECTION,
    ...filter
  }

  const {
    data: dataEKYC,
    isLoading,
    isFetching,
    isError,
    refetch
  } = useGetEKYCSearchQuery(payload)

  const [triggerExport, { reset: resetExport }] =
    useExportVerifiedKycProfilesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'danh-sach-ho-so-ekyc'
  })

  const dataSource = dataEKYC?.content.map((group, index) =>
    mapEKYCGroupToListItem(group, (page - 1) * pageSize + index + 1)
  )

  const handleSearch = applyFilters
  const handleReset = clearFilters

  const handleExport = () => {
    void exportFile(filter)
  }

  return {
    filters,
    dataSource,
    isLoading,
    isFetching,
    isError,
    refetch,
    page,
    pageSize,
    setPage,
    setPageSize,
    total: dataEKYC?.totalElements,
    handleSearch,
    handleReset,
    handleExport,
    isExporting
  }
}

/**
 * Một dòng lưới = một người. Trạng thái là của PHIÊN mới nhất (latestStatus); kết quả xác thực
 * chung cuộc là profileStatus của dòng. KHÔNG dùng attempts[0].documentProfileStatus: đó là hồ sơ
 * đang giữ số CCCD, có thể của tài khoản khác.
 * Thông tin giấy tờ ưu tiên hồ sơ của người, chưa có hồ sơ thì lấy OCR của lần mới nhất.
 */
export const mapEKYCGroupToListItem = (
  group: EKYCGroup,
  no: number
): EKYCListItem => {
  const latestAttempt =
    group.attempts.find((attempt) => attempt.createdAt === group.latestAt) ??
    [...group.attempts].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    )[0]

  return {
    ...latestAttempt,
    userId: group.userId,
    username: group.username,
    status: group.latestStatus,
    fullName: group.fullName ?? latestAttempt?.fullName,
    idNumber: group.idNumber ?? latestAttempt?.idNumber,
    dateOfBirth: group.dateOfBirth ?? latestAttempt?.dateOfBirth,
    gender: group.gender ?? latestAttempt?.gender,
    profileId: group.profileId ?? null,
    profileStatus: group.profileStatus ?? null,
    reviewStatus: group.reviewStatus,
    pendingReview:
      group.pendingReview ?? group.latestStatus === 'PENDING_REVIEW',
    faceScore: group.faceScore ?? null,
    verifiedAt: group.verifiedAt ?? null,
    createdAt: latestAttempt?.createdAt ?? group.latestAt,
    groupKey: group.groupKey,
    attemptCount: group.attemptCount,
    latestStatus: group.latestStatus,
    latestAt: group.latestAt,
    email: group.email,
    occupation: group.occupation,
    position: group.position,
    currentAddress: group.currentAddress,
    attempts: group.attempts,
    no,
    key: group.groupKey
  }
}

export default useConfirmEKYC
