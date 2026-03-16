export interface feePolicyComponent {
    id: string,
    feePolicyId: string
    componentType: string
    baseOn: string
    baseComponentType: string
    calculationMethod: string
    fixedAmount: number
    percentage: number
    roundMode: string
    minFee: number
    maxFee: number
    payerType: string
    payerObjectType: string
    payerObjectId: string
    beneficiaryType: string
    beneficiaryObjectType: string
    beneficiaryObjectId: string
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
    minValue: number
    maxValue: number
}
export interface FeeComponentResponse {
    content: feePolicyComponent[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}
export interface dataSearch {
    keyword: string
    serviceType: string
    status: string
    feeDomain: string
    page: number
    size: number
    sortBy: string
    sortDirection: string
}

export interface FeeComponentFormValues {
    componentType: string;
    baseOn: string;
    payerType: string;
    beneficiaryType: string;
    roundMode: string;
    calculationMethod: string | number;
    feeExpression?: string;
    tiers?: feePolicyComponent[];
    minValue?: number;
    maxValue?: number;
}

export interface FeePolicyFormValues {
    name: string;
    serviceType: string;
    feeDomain: string;
    currency: string;
    description: string;
    validFrom: string;
    validTo: string;
    status: string;
    priority: number;
    components: FeeComponentFormValues[];
}
