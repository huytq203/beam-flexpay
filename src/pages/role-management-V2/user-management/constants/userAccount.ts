export const Status = {
    ACTIVE: "Hoạt động",
    INACTIVE: "Không hoạt động",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

export enum RoleUserAccount {
    ACCOUNTANT = 'Tài khoản kế toán',
    OPERATOR = 'Tài khoản tổ chức',
    SUPER_ADMIN = 'Tài khoản admin',
    TEST = 'Tài khoản test',
}