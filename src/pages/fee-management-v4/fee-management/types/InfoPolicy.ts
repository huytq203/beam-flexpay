import { DEFAULT_ROUND_MODE } from "../constants/FeeManagement.constant"
import { FeeComponentType } from "../schemas/FeeManagement.schema"

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
    roundMode: DEFAULT_ROUND_MODE,
    calculationMethod: 'DIRECT',
    tiers: [],
    fixedAmount: undefined,
    percentage: undefined,
    minFee: undefined,
    maxFee: undefined
}
