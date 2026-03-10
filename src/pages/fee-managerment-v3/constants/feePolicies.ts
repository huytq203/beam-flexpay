export interface feePolicies {
  id?: string,
  name: string,
  serviceType: string,
  description: string
  feeDomain: string
  currency: string
  validFrom: string
  validTo: string
  status: string
  priority: number
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}
export interface FeePoliciesResponse {
  content: feePolicies[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface feeSearch {
  keyword: string | null|undefined,
  serviceType: string | null|undefined,
  feeDomain: string | null|undefined,
  status: string | null|undefined
}
export enum statusType{
  INIT='Khởi tạo',
  ACTIVE='Hoạt động',
  INACTIVE='Không hoạt động',
  LOCKED='Khóa'
}