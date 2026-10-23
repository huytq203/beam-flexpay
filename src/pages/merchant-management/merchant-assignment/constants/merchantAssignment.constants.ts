/** BE giới hạn `reason` tối đa 255 ký tự (audit). */
export const ASSIGNMENT_REASON_MAX = 255

export const ASSIGNMENT_LEVEL_LABELS = {
  master: 'Master',
  sub: 'Sub-merchant'
} as const

/** Giải thích phạm vi để người dùng hiểu gán ở cấp nào thì chạm tới đâu. */
export const ASSIGNMENT_LEVEL_HINTS = {
  master:
    'Gán Master: người được gán chạm tới Master này, mọi outlet (Sub-merchant) và terminal bên dưới.',
  sub: 'Gán Sub-merchant: chỉ riêng outlet này và terminal của nó. Không đi ngược lên Master và không mở các outlet khác. Danh sách chỉ gồm người được gán trực tiếp, không gồm người được gán qua Master.'
} as const

export const ADMIN_PICKER_SORT_BY = 'createdTimestamp'
