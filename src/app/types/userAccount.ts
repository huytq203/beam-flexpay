export const Status = {
    ACTIVE: "Hoạt động",
    INACTIVE: "Không hoạt động",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export enum RoleUserAccount {
    ACCOUNTANT = 'Kế toán',
    SUPER_ADMIN = 'Admin',
    OPERATOR = 'Điều hành',
}