export enum BankEnum {
    VCB = 'VCB',
    VPB = 'VPB',
}

export const BankLabel: Record<BankEnum, string> = {
    [BankEnum.VCB]: 'Vietcombank',
    [BankEnum.VPB]: 'VPBank',
} as const;
