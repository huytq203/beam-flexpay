export enum bankCodeType {
  VCB = 'VCB',
  VPB = 'VPB'
}

export const bankCodeTypeLable={
    [bankCodeType.VCB]: 'Vietcombank',
    [bankCodeType.VPB]: 'VPBank',
}
export enum serviceType {
  EWALLET_DEPOSIT = 'EWALLET_DEPOSIT',
  EWALLET_WITHDRAWAL = 'EWALLET_WITHDRAWAL',
  EWALLET_TRANSFER_INTERNAL = 'EWALLET_TRANSFER_INTERNAL',
  EWALLET_TRANSFER_EXTERNAL = 'EWALLET_TRANSFER_EXTERNAL',
  EWALLET_CASHBACK = 'EWALLET_CASHBACK',
  MERCHANT_VA_BILL_COLLECTION = 'MERCHANT_VA_BILL_COLLECTION',
  PAYOUT_BANK_TRANSFER = 'PAYOUT_BANK_TRANSFER'
}

export const serviceTypeLable={
    [serviceType.EWALLET_DEPOSIT]: 'Nạp tiền ví',
    [serviceType.EWALLET_WITHDRAWAL]: 'Rút tiền ví',
    [serviceType.EWALLET_TRANSFER_INTERNAL]: 'Chuyển tiền nội bộ',
    [serviceType.EWALLET_TRANSFER_EXTERNAL]: 'Chuyển tiền liên ngân hàng',
    [serviceType.EWALLET_CASHBACK]: 'Hoàn tiền',
    [serviceType.MERCHANT_VA_BILL_COLLECTION]: 'Thu hộ VA',
    [serviceType.PAYOUT_BANK_TRANSFER]: 'Chi hộ chuyển khoản ngân hàng'
}
export enum paymentMethodType {
  ATM = 'ATM',
  QR_CODE = 'QR_CODE',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  LINKED_ACCOUNT = 'LINKED_ACCOUNT ',
  VA = 'VA',

}

export const paymentMethodTypeLable={
    [paymentMethodType.ATM]: 'ATM',
    [paymentMethodType.QR_CODE]: 'Quét mã QR',
    [paymentMethodType.CREDIT_CARD]: 'Thẻ tín dụng',
    [paymentMethodType.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
    [paymentMethodType.LINKED_ACCOUNT]: 'Tài khoản liên kết ',
    [paymentMethodType.VA]: 'Virtual Account (tài khoản ảo)',
}
export enum cardTypeType {
  VISA = 'VISA',
  NAPAS = 'NAPAS',

}

export const cardTypeTypeLable={
    [cardTypeType.VISA]: 'VISA',
    [cardTypeType.NAPAS]: 'Napas',
}
export enum customerGroupType {
  VIP ='VIP',
  PREMIUM ='PREMIUM',
  MERCHANT ='MERCHANT',
  STANDARD ='STANDARD',
}

export const customerGroupTypeLable={
    [customerGroupType.VIP]: 'VIP',
    [customerGroupType.PREMIUM]: 'User Premium',
    [customerGroupType.MERCHANT]: 'User Premium',
    [customerGroupType.STANDARD]: 'User thường',
}
export enum statusType {
  INIT ='INIT',
  ACTIVE ='ACTIVE',
  INACTIVE ='INACTIVE',
  EXPIRED ='EXPIRED',
  REJECTED='REJECTED'
}

export const statusTypeLable={
    [statusType.INIT]: 'Khởi tạo',
    [statusType.ACTIVE]: 'Hoạt động',
    [statusType.INACTIVE]: 'Không hoạt động',
    [statusType.EXPIRED]: 'Hết hạn',
    [statusType.REJECTED]: 'Từ chối',
}


export const STATUS_CONFIG: Record<statusType, { label: string; className: string, shimmerColor: string }> = {
  [statusType.INIT]: {
    label: 'Khởi tạo',
    className: 'info-status',
    shimmerColor: 'rgba(245, 158, 11, 0.1)',
  },
  [statusType.ACTIVE]: {
    label: 'Hoạt động',
    className: 'success-status ',
    shimmerColor: 'rgba(0, 229, 160, 0.1)',
  },
  [statusType.INACTIVE]: {
    label: 'Không hoạt động',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)',
  },
  [statusType.EXPIRED]: {
    label: 'Hết hạn',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)',
  },
  [statusType.REJECTED]: {
    label: 'Từ chối',
    className: 'danger-status',
    shimmerColor: 'rgba(239, 68, 68, 0.1)',
  }
}

