export interface feePolicyComponent{
  id:string,
  feePolicyId:string
  componentType:string
  baseOn:string
  baseComponentType:number
  calculationMethod:string
  fixedAmount:number
  percentage:number
  roundMode:string
  minFee:number
  maxFee:number
  payerType:string
  payerObjectType:string
  payerObjectId:string
  beneficiaryType:string
  beneficiaryObjectType:string
  beneficiaryObjectId:string
  createdAt:string
  updatedAt:string
  createdBy:string
  updatedBy:string
}
export interface FeeComponentResponse {
  content: feePolicyComponent[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}