export enum BankEnum {
    VCB = 'VCB',
    MB = 'MB',
    VPB = 'VPB',
}

export const BankLabel: Record<BankEnum, string> = {
    [BankEnum.VCB]: 'Vietcombank',
    [BankEnum.MB]: 'MB Bank',
    [BankEnum.VPB]: 'VPBank',
} as const;
