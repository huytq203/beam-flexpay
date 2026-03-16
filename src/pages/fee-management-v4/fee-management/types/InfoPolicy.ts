import { FeeComponentType } from "@pages/fee-management-v4/fee-assignment/schemas/FeeManagement.schema"

export const DEFAULT_TIER = {
    minFee: undefined,
    maxFee: undefined,
    fixedAmount: undefined,
    percentage: undefined,
    maxValue: undefined,
    minValue: undefined
}

export const DEFAULT_VALUES: FeeComponentType = {
    componentType: '',
    baseOn: '',
    payerType: '',
    beneficiaryType: '',
    roundMode: '',
    calculationMethod: 'DIRECT',
    tiers: [DEFAULT_TIER],
    fixedAmount: undefined,
    percentage: undefined,
    minFee: undefined,
    maxFee: undefined
}
