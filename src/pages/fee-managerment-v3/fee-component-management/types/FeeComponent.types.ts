// Fee Component Types
export interface FeeComponent {
    id?: string
    feePolicyId?: string
    componentType: string
    baseOn: string
    baseComponentType?: string | null
    calculationMethod: string | number
    fixedAmount?: number
    percentage?: number
    roundMode: string
    minFee?: number
    maxFee?: number
    payerType: string
    payerObjectType?: string | null
    payerObjectId?: string | null
    beneficiaryType: string
    beneficiaryObjectType?: string | null
    beneficiaryObjectId?: string | null
    createdAt?: string
    updatedAt?: string
}

export interface FeeTier {
    id?: string
    feeComponentId?: string
    minValue?: number | null
    maxValue?: number | null
    roundMode?: string
    minFee?: number | null
    maxFee?: number | null
    fixedAmount?: number | null
    percentage?: number | null
}

export interface FeeComponentResponse {
    content: FeeComponent[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

// Enums
export enum componentType {
    TRANSACTION_FEE = 'Phí giao dịch',
    SERVICE_FEE = 'Phí dịch vụ',
    VAT = 'VAT'
}

export enum baseOn {
    AMOUNT = 'Số tiền giao dịch',
    FIXED = 'Cố định',
    OTHER_COMPONENT = 'Thành phần khác'
}

export enum calculationMethodEnum {
    DIRECT = 'Trực tiếp',
    PROGRESSIVE_TIER = 'Lũy tiến',
    FLAT_TIER = 'Bậc thang'
}

export enum payerType {
    SENDER = 'Người gửi',
    RECEIVER = 'Người nhận',
    MERCHANT = 'Merchant',
    SYSTEM = 'Hệ thống'
}

export enum beneficiaryType {
    MERCHANT = 'Merchant',
    BANK = 'Ngân hàng',
    SYSTEM = 'Hệ thống',
    PARTNER = 'Đối tác',
    TAX = 'Cơ quan thuế'
}

export enum roundMode {
    UP = 'Làm tròn lên',
    DOWN = 'Làm tròn xuống',
    NEAREST   = 'Làm gần nhất',
    NONE = 'Không làm tròn'
}
