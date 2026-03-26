export enum statusType {
  INIT = 'INIT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED',
}

export const STATUS_LABEL: Record<statusType, string> = {
  [statusType.INIT]: 'Khởi tạo',
  [statusType.ACTIVE]: 'Hoạt động',
  [statusType.INACTIVE]: 'Không hoạt động',
  [statusType.LOCKED]: 'Khóa',
}

export const STATUS_CONFIG: Record<statusType|'WAITING', { label: string; className: string }> = {
  [statusType.INIT]: {
    label: 'Khởi tạo',
    className: 'info-status',
  },
  [statusType.ACTIVE]: {
    label: 'Hoạt động',
    className: 'success-status',
  },
  [statusType.INACTIVE]: {
    label: 'Không hoạt động',
    className: 'danger-status',
  },
  [statusType.LOCKED]: {
    label: 'Khóa',
    className: 'danger-status',
  },
  WAITING: {
    label: 'Chờ hiệu lực',
    className: 'warning-status',
  }
}



export const Currency = {
  VND: 'VND',
  USD: 'USD'
} as const

export const feeDomain = {
  EWALLET: "Ewallet",
  BANK: "Bank",
  MERCHANT: "Merchant",
}
export const serviceType = {
  EWALLET_DEPOSIT: "Nạp tiền ví",
  EWALLET_WITHDRAWAL: "Rút tiền ví",
  EWALLET_TRANSFER_INTERNAL: "Chuyển tiền nội bộ",
  EWALLET_TRANSFER_EXTERNAL: "Chuyển tiền liên ngân hàng",
  EWALLET_CASHBACK: "Hoàn tiền",
  MERCHANT_VA_BILL_COLLECTION: "Thu hộ VA"
} as const


export enum componentType {
  TRANSACTION_FEE = 'TRANSACTION_FEE',
  SYSTEM_FEE = 'SYSTEM_FEE',
  MERCHANT_FEE = 'MERCHANT_FEE',
  BANK_FEE = 'BANK_FEE',
  PLATFORM_FEE = 'PLATFORM_FEE',
  VAT = 'VAT',
  PROCESSING_FEE = 'PROCESSING_FEE',
  REFUND_FEE = 'REFUND_FEE',

  AMOUNT = 'AMOUNT',
}
export const componentTypeLabel = {
  [componentType.TRANSACTION_FEE]: 'Phí giao dịch cơ bản',
  [componentType.SYSTEM_FEE]: 'Phí hệ thống',
  [componentType.MERCHANT_FEE]: 'Phí merchant',
  [componentType.BANK_FEE]: 'Phí ngân hàng',
  [componentType.PLATFORM_FEE]: 'Phí nền tảng',
  [componentType.VAT]: 'Thuế VAT',
  [componentType.PROCESSING_FEE]: 'Phí xử lý',
  [componentType.REFUND_FEE]: 'Phí hoàn tiền',
  [componentType.AMOUNT]: 'Tính trên số tiền giao dịch',
}

export enum baseOnEnum {
    AMOUNT = 'AMOUNT',
    TRANSACTION_FEE = 'TRANSACTION_FEE',
    SYSTEM_FEE = 'SYSTEM_FEE',
    MERCHANT_FEE = 'MERCHANT_FEE',
    BANK_FEE = 'BANK_FEE',
    PLATFORM_FEE = 'PLATFORM_FEE',
    VAT = 'VAT',
    PROCESSING_FEE = 'PROCESSING_FEE',
    REFUND_FEE = 'REFUND_FEE',
  }

export const baseOnLabel = {
  [baseOnEnum.AMOUNT]: 'Tính trên số tiền giao dịch',
  [baseOnEnum.TRANSACTION_FEE]: 'Phí giao dịch cơ bản',
  [baseOnEnum.SYSTEM_FEE]: 'Phí hệ thống',
  [baseOnEnum.MERCHANT_FEE]: 'Phí merchant',
  [baseOnEnum.BANK_FEE]: 'Phí ngân hàng',
  [baseOnEnum.PLATFORM_FEE]: 'Phí nền tảng',
  [baseOnEnum.VAT]: 'Thuế VAT',
  [baseOnEnum.PROCESSING_FEE]: 'Phí xử lý',
  [baseOnEnum.REFUND_FEE]: 'Phí hoàn tiền',
}


export enum payerTypeEnum {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  SYSTEM = 'SYSTEM',
  SENDER = 'SENDER',
  RECEIVER = 'RECEIVER',
}
export const payerTypeLabel = {
  [payerTypeEnum.USER]: 'Người dùng',
  [payerTypeEnum.MERCHANT]: 'Merchant',
  [payerTypeEnum.SYSTEM]: 'Hệ thống/platform',
  [payerTypeEnum.SENDER]: 'Người gửi',
  [payerTypeEnum.RECEIVER]: 'Người nhận',
}
export enum beneficiaryTypeEnum {
  SYSTEM = 'SYSTEM',
  MERCHANT = 'MERCHANT',
  BANK = 'BANK',
  PARTNER = 'PARTNER',
  TAX = 'TAX',
}
export const beneficiaryTypeLabel = {
  [beneficiaryTypeEnum.SYSTEM]: 'Hệ thống',
  [beneficiaryTypeEnum.MERCHANT]: 'Merchant',
  [beneficiaryTypeEnum.BANK]: 'Ngân hàng',
  [beneficiaryTypeEnum.PARTNER]: 'Đối tác',
  [beneficiaryTypeEnum.TAX]: 'Cơ quan thuế',
}
export enum roundModeEnum {
  UP = 'UP',
  DOWN = 'DOWN',
  HALF_UP = 'HALF_UP',
  HALF_DOWN = 'HALF_DOWN',
  CEILING = 'CEILING',
  FLOOR = 'FLOOR',
}
export const roundModeLabel = {
  [roundModeEnum.UP]: 'Làm tròn lên',
  [roundModeEnum.DOWN]: 'Làm tròn xuống',
  [roundModeEnum.HALF_UP]: 'Làm tròn gần nhất, nửa lên',
  [roundModeEnum.HALF_DOWN]: 'Làm tròn gần nhất, nửa xuống',
  [roundModeEnum.CEILING]: 'Làm tròn trần (về phía +∞)',
  [roundModeEnum.FLOOR]: 'Làm tròn sàn (về phía -∞)',
}

export enum calculationMethodEnum {
  FLAT_TIER = 'FLAT_TIER',
  DIRECT = 'DIRECT',
  PROGRESSIVE_TIER = 'PROGRESSIVE_TIER',
}
export const calculationMethodEnumLabel = {
  [calculationMethodEnum.FLAT_TIER]: 'Bậc lũy tiến',
  [calculationMethodEnum.DIRECT]: 'Tính trực tiếp',
  [calculationMethodEnum.PROGRESSIVE_TIER]: 'Bậc thang toàn phần',
}
export const calculationType = {
  FLAT_TIER: 'Flat Tier',
  DIRECT: 'Direct',
  PROGRESSIVE_TIER: 'Progressive Tier',
}

