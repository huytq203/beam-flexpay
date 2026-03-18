export enum MerchantStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}
export const MerchantLable = {
    [MerchantStatus.ACTIVE]: 'Hoạt động',
    [MerchantStatus.INACTIVE]: 'Không hoạt động'
}
export const STATUS_CONFIG: Record<MerchantStatus, { label: string; className: string }> = {
    [MerchantStatus.ACTIVE]: { label: 'Hoạt động', className: 'success-status', },
    [MerchantStatus.INACTIVE]: { label: 'Không hoạt động', className: 'danger-status', }
}