import { CheckOutlined } from '@ant-design/icons'
import { PASSWORD_RULES } from '../constant/constants'

export interface PasswordChecklistProps {
  password: string
}

/** Bảng điều kiện mật khẩu, tick trực tiếp theo từng ký tự người dùng gõ. */
export function PasswordChecklist({ password }: PasswordChecklistProps) {
  const results = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    isMet: rule.test(password)
  }))
  const metCount = results.filter((rule) => rule.isMet).length

  return (
    <div className='rounded-[10px] bg-teal-50/70 p-3'>
      <p className='mb-2 text-[12px] font-semibold text-teal-900'>
        Mật khẩu cần đạt đủ {PASSWORD_RULES.length} điều kiện
        <span
          className='ml-1 font-normal text-teal-700'
          aria-live='polite'
        >
          ({metCount}/{PASSWORD_RULES.length})
        </span>
      </p>
      <ul className='flex flex-col gap-1.5'>
        {results.map((rule) => (
          <li
            key={rule.id}
            className='flex items-center gap-2'
          >
            <span
              aria-hidden
              className={[
                'flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                rule.isMet
                  ? 'border-[#2bd9d0] bg-[#2bd9d0] text-teal-950'
                  : 'border-gray-300 bg-white text-transparent'
              ].join(' ')}
            >
              <CheckOutlined
                className={[
                  'text-[9px] transition-transform duration-300',
                  rule.isMet ? 'scale-100' : 'scale-50'
                ].join(' ')}
              />
            </span>
            <span
              className={[
                'text-[12px] transition-colors duration-300',
                rule.isMet ? 'font-medium text-teal-800' : 'text-gray-600'
              ].join(' ')}
            >
              {rule.label}
              <span className='sr-only'>
                {rule.isMet ? ' — đã đạt' : ' — chưa đạt'}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
