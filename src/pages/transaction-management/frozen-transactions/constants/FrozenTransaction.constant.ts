export enum typeLock{
    ADMIN_LOCK='ADMIN_LOCK',
    PAYMENT='PAYMENT',
}
export const typeLockLabel: Record<typeLock, string> = {
    [typeLock.ADMIN_LOCK]: 'Đóng băng bởi Admin',
    [typeLock.PAYMENT]: 'Thanh toán',
}