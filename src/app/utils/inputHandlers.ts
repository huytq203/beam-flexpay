import type { KeyboardEvent } from 'react'

/**
 * Chặn space ở đầu chuỗi và space lặp liên tiếp khi người dùng gõ.
 * Dùng cho các ô nhập lý do (đóng băng / mở băng / khoá / mở khoá).
 */
export const blockLeadingAndRepeatedSpace = <
    T extends HTMLInputElement | HTMLTextAreaElement,
>(
    e: KeyboardEvent<T>,
) => {
    if (e.key !== ' ') return

    const target = e.target as T
    const caret = target.selectionStart ?? 0

    if (caret === 0 || target.value.charAt(caret - 1) === ' ') {
        e.preventDefault()
    }
}
