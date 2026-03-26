export enum MerchantStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE'
}
export const MerchantLable = {
    [MerchantStatus.ACTIVE]: 'Hoạt động',
    [MerchantStatus.INACTIVE]: 'Không hoạt động'
}
export const STATUS_CONFIG: Record<MerchantStatus, { label: string; className: string, shimmerColor: string }> = {
    [MerchantStatus.ACTIVE]: { label: 'Hoạt động', className: 'success-status', shimmerColor: 'rgba(0, 229, 160, 0.2)', },
    [MerchantStatus.INACTIVE]: { label: 'Không hoạt động', className: 'danger-status', shimmerColor: 'rgba(239, 68, 68, 0.2)', }
}