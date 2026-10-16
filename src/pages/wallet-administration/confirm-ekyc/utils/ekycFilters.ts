import {
  UNVERIFIED,
  type EkycUrlFilters
} from '../constants/ekycFilter.constants'

export type EKYCFilterType = {
  keyword?: string
  latestStatus?: string
  verified?: boolean
  profileStatus?: string
  hasProfile?: boolean
  createdFrom?: string
  createdTo?: string
}

/** Chuyển bộ lọc lưu trên URL sang tham số BE của `/verified-kyc-profiles`. */
export const toEkycApiFilter = (filters: EkycUrlFilters): EKYCFilterType => ({
  keyword: filters.keyword,
  latestStatus: filters.latestStatus,
  hasProfile: filters.profileStatus === UNVERIFIED ? false : undefined,
  profileStatus:
    filters.profileStatus && filters.profileStatus !== UNVERIFIED
      ? filters.profileStatus
      : undefined,
  createdFrom: filters.createdFrom,
  createdTo: filters.createdTo
})
