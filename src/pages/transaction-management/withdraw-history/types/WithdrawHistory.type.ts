
export enum PaymentMethodEnum {
  ATM = 'ATM',
  CC = 'CC',
  VA = 'VA',
  QR_CODE = 'QR_CODE',
  WALLET_BALANCE = 'WALLET_BALANCE',
  LINKED_ACCOUNT = 'LINKED_ACCOUNT',
}

export type PaymentMethodKey = keyof typeof PaymentMethodEnum;


export const PaymentMethod = {
  [PaymentMethodEnum.ATM]: 'Thẻ ATM',
  [PaymentMethodEnum.CC]: 'Thẻ tín dụng',
  [PaymentMethodEnum.VA]: 'Tài khoản ảo',
  [PaymentMethodEnum.QR_CODE]: 'QR Code',
  [PaymentMethodEnum.WALLET_BALANCE]: 'Tài khoản ví',
  [PaymentMethodEnum.LINKED_ACCOUNT]: 'Tài khoản liên kết',
}

