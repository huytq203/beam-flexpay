export interface VatFeeCreateApiArg {
  createVatFeeDto: CreateVatFeeDto
}

export interface VatFeeCreateApiResponse {
  id: string
  message: string
}

export interface VatFeeFindAllApiArg {
  applicationType?: VatFeeApplicationType
  accountGroup?: string
  accountNumber?: string
  status?: boolean
  createdFrom?: string
  createdTo?: string
  appliedFrom?: string
  appliedTo?: string
  page?: number
  take?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
}

export interface VatFeeFindAllApiResponse {
  data: VatFee[]
  meta: {
    page: number
    take: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface VatFeeUpdateApiArg {
  id: string
  updateVatFeeDto: UpdateVatFeeDto
}

export interface VatFeeUpdateApiResponse {
  id: string
  message: string
}

export interface VatFeeRemoveApiArg {
  id: string
}

export interface VatFeeRemoveApiResponse {
  message: string
}

export interface VatFeeFindOneApiArg {
  id: string
}

export interface VatFeeFindOneApiResponse extends VatFee {
  // API trả về data trực tiếp, không có nested 'data' property
}

export interface VatFeeGetAccountGroupsApiResponse extends Array<AccountGroupOption> {
  // API returns array directly, not nested in 'data' property
}

export interface VatFeeGetAccountsApiArg {
  query?: string
  page?: number
  take?: number
  order?: 'ASC' | 'DESC'
  orderBy?: string
}

export interface VatFeeGetAccountsApiResponse {
  data: CustomerSearchResult[]
  meta: {
    page: number
    take: number
    itemCount: number
    pageCount: number
    hasPreviousPage: boolean
    hasNextPage: boolean
  }
}

export interface CreateVatFeeDto {
  applicationType: VatFeeApplicationType
  accountGroup?: string
  accountNumber?: string
  flexibleFeeMpct?: number
  startDate: string
  endDate?: string
}

export interface UpdateVatFeeDto {
  applicationType?: VatFeeApplicationType
  accountGroup?: string
  accountNumber?: string
  flexibleFeeMpct?: number
  startDate?: string
  endDate?: string
}

export interface VatFee {
  id: string
  applicationType: VatFeeApplicationType
  accountGroup?: string
  accountGroupId?: number | null
  accountGroupName?: string | null
  accountNumber?: string
  customerId?: number | null
  fullname?: string | null
  phoneNumber?: string | null
  flexibleFeeMpct?: number
  chargeWithin?: boolean
  startDate: string
  endDate?: string
  active?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AccountGroupOption {
  id: number
  name: string
  code: string
  description?: string
}

export interface AccountOption {
  id: number
  accountNumber: string
  phoneNumber: string
  name: string
  displayName: string
  walletName?: string
}

export interface CustomerSearchResult {
  id: number
  fullName: string
  phoneNumber: string
}

export enum VatFeeApplicationType {
  SYSTEM = 'system',
  INDIVIDUAL = 'individual',
  ACCOUNT_GROUP = 'account_group'
}

export enum VatFeeStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  DISABLED = 'disabled'
}