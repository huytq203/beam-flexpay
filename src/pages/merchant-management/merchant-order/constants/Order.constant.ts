export type ModalKey = "create" | "edit" | "delete" | "detail";
export type ModeAction = 'DELETE' | 'CONFIRM' | 'WARNING'|'UPDATE' |'CREATE';
export const status={
    SUCCESS:'Hoàn thành',
    ACTIVE:'Khởi tạo'
}as const