export const Status = {
    ACTIVE: "Hoạt động",
    INACTIVE: "Không hoạt động",
} as const;

export type Status = (typeof Status)[keyof typeof Status];

/**
 * BE nhận `emailVerified` / `status` kiểu Boolean và bỏ qua filter khi param
 * vắng mặt, nên form dùng chuỗi 'true' | 'false' và "không chọn" = lấy tất cả.
 */
export const BooleanFilter = {
    TRUE: 'true',
    FALSE: 'false'
} as const;

export type BooleanFilter = (typeof BooleanFilter)[keyof typeof BooleanFilter];

export const EMAIL_VERIFIED_OPTIONS = [
    { value: BooleanFilter.TRUE, label: 'Đã xác thực' },
    { value: BooleanFilter.FALSE, label: 'Chưa xác thực' }
] as const;

export const USER_STATUS_OPTIONS = [
    { value: BooleanFilter.TRUE, label: Status.ACTIVE },
    { value: BooleanFilter.FALSE, label: Status.INACTIVE }
] as const;

export const CREATE_USER_STATUS_OPTIONS = [
    { value: BooleanFilter.TRUE, label: Status.ACTIVE },
    { value: BooleanFilter.FALSE, label: Status.INACTIVE }
] as const;

export const CREATE_ADMIN_USER_FORM_ID = 'create-admin-user-form';

/** Trùng ràng buộc @Size(max = 255) của BE. */
export const KEYWORD_MAX_LENGTH = 255;

export enum RoleUserAccount {
    ACCOUNTANT = 'Tài khoản kế toán',
    OPERATOR = 'Tài khoản tổ chức',
    SUPER_ADMIN = 'Tài khoản admin',
    TEST = 'Tài khoản test',
}
