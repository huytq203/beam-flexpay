import { useGetEKYCSearchQuery } from '@services/apiEKYC'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportVerifiedKycProfilesMutation } from '@services/apiExportCsv'
import { useState } from 'react'
import type { EKYCGroup, EKYCListItem } from '@type/apiResponseEKYC'

export type EKYCFilterType = {
  keyword?: string
  latestStatus?: string
  verified?: boolean
  profileStatus?: string
  hasProfile?: boolean
  createdFrom?: string
  createdTo?: string
}

const useConfirmEKYC = () => {
  const { page, pageSize, setPage, setPageSize, sort, sortBy } = usePagination()
  const [filter, setFilter] = useState<EKYCFilterType>({})

  const payload = {
    page: page,
    size: pageSize,
    sortBy: sort,
    sortDirection: sortBy,
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

  const handleSearch = (values: EKYCFilterType) => {
    setFilter(values)
    setPage(1)
  }

  const handleReset = () => {
    setFilter({})
    setPage(1)
  }

  const handleExport = () => {
    void exportFile(filter)
  }

  return {
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
