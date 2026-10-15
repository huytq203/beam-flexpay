/** Điều kiện mật khẩu — nguồn sự thật duy nhất cho cả validate lẫn checklist UI. */
export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'ít nhất 10 ký tự',
    test: (value: string) => value.length >= 8
  },
  {
    id: 'upper',
    label: 'Có chữ in hoa (A–Z)',
    test: (value: string) => /[A-Z]/.test(value)
  },
  {
    id: 'lower',
    label: 'Có chữ thường (a–z)',
    test: (value: string) => /[a-z]/.test(value)
  },
  {
    id: 'digit',
    label: 'Có chữ số (0–9)',
    test: (value: string) => /\d/.test(value)
  },
  {
    id: 'special',
    label: 'Có ký tự đặc biệt (!@#$…)',
    test: (value: string) => /[^A-Za-z0-9]/.test(value)
  }
] as const

export type PasswordRule = (typeof PASSWORD_RULES)[number]

export const FIELD_CLASS =
  'flex flex-col [&>p]:mt-1.5 [&>p]:text-[12px] [&>p]:leading-snug [&>p]:text-red-600!'

export const INPUT_CLASS =
  'w-full h-[42px]! rounded-[10px]! bg-gray-50/80! border-gray-200! text-[13px]! transition-colors! duration-200! hover:bg-white! focus:bg-white!'

export const LABEL_CLASS = 'mb-1.5 text-[13px] font-semibold text-gray-800'

/** Nút chính: nền teal thương hiệu, chữ teal đậm để đạt tương phản đọc được. */
export const PRIMARY_BUTTON_CLASS =
  'w-full! h-[42px]! rounded-[10px]! border-none! bg-[#2bd9d0]! text-teal-950! text-[14px]! font-semibold! shadow-none! hover:bg-[#22c2ba]! hover:text-teal-950! disabled:opacity-60!'

export const BACK_LINK_CLASS =
  'flex items-center justify-center gap-1.5 text-[13px] font-medium text-teal-700 transition-colors duration-200 hover:text-teal-900'

export const HEADING_CLASS =
  'mb-2 text-[22px] font-extrabold leading-tight tracking-tight text-gray-900'

export const SUBTEXT_CLASS = 'text-[13px] leading-relaxed text-gray-600'
