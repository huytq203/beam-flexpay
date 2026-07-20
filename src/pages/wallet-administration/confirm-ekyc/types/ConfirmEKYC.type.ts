import type { JSX } from 'react'
export type SvgOptions = {
    size?: number
    width?: number
    height?: number
    className?: string
}

export  interface props {
    svg: (value: string, options?: SvgOptions) => JSX.Element
}
 
export  const statusMap: Record<string, { color: string; label: string }> = {
    VERIFIED: { color: 'success', label: 'Đã xác thực' },
    PENDING: { color: 'warning', label: 'Chờ duyệt' },
    REJECTED: { color: 'error', label: 'Từ chối' },
    INVALIDATED: { color: 'default', label: 'Đã huỷ' },
};

export const genderMap: Record<string, string> = {
    MALE: 'Nam',
    FEMALE: 'Nữ',
};
