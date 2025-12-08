export interface feePolicies {
    id?: number,
    name: string,
    serviceType: string,
    description: string
    feeDomain: string
    currency: string
    validFrom: string
    validTo: string
    status: string
    priority: number
    createdAt:string
    updatedAt :string
    createdBy :string
    updatedBy :string
}
export interface FeePoliciesResponse {
  content: feePolicies[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
