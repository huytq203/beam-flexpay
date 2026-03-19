export enum BankEnum {
    VCB='VCB',
    VPB='VPB',
}
export const BankLabel: Record<BankEnum, string> = {
    [BankEnum.VCB]: 'Vietcombank',
    [BankEnum.VPB]: 'VPBank',
}as const

export enum LinkTypeEnum {
    ACCOUNT='ACCOUNT',
    CARD='CARD',
}
export const LinkTypeLabel: Record<LinkTypeEnum, string> = {
    [LinkTypeEnum.ACCOUNT]: 'Tài khoản',
    [LinkTypeEnum.CARD]: 'Thẻ',
}as const