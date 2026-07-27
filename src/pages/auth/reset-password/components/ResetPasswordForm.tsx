import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  LockOutlined
} from '@ant-design/icons'
import ButtonComponent from '@components/ui/button-component'
import { FormInput } from '@components/form'
import { PATHS } from '@constants/pathConstant'
import { PasswordChecklist } from './PasswordChecklist'
import { AuthColumn, StateDisc } from './AuthColumn'
import {
  BACK_LINK_CLASS,
  FIELD_CLASS,
  INPUT_CLASS,
  LABEL_CLASS,
  PASSWORD_RULES,
  PRIMARY_BUTTON_CLASS
} from '../constant/constants'
import { resetPasswordSchema, type ResetPasswordFormData } from '../schema'

export interface ResetPasswordFormProps {
  isSubmitting: boolean
  submitError: string | null
  onSubmit: (newPassword: string) => void
  onClearError: () => void
}

/** Trạng thái data: token hợp lệ, người dùng nhập mật khẩu mới. */
export function ResetPasswordForm({
  isSubmitting,
  submitError,
  onSubmit,
  onClearError
}: ResetPasswordFormProps) {
  const [isCapsLockOn, setIsCapsLockOn] = useState(false)

  const { control, handleSubmit } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
    defaultValues: { password: '', confirmPassword: '' }
  })

  const password = useWatch({ control, name: 'password' })
  const confirmPassword = useWatch({ control, name: 'confirmPassword' })

  const isPasswordComplete = PASSWORD_RULES.every((rule) => rule.test(password))
  const hasMatchingConfirm =
    isPasswordComplete &&
    confirmPassword.length > 0 &&
    confirmPassword === password

  const handleCapsLock = (
    event: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    setIsCapsLockOn(event.getModifierState?.('CapsLock') ?? false)
  }

  const passwordFieldProps = {
    control,
    type: 'password',
    className: FIELD_CLASS,
    classNameLable: LABEL_CLASS,
    inputClassName: INPUT_CLASS,
    prefix: (
      <LockOutlined
        aria-hidden
        className='text-gray-400'
      />
    ),
    autoComplete: 'new-password',
    onKeyUp: handleCapsLock,
    onKeyDown: handleCapsLock,
    onChange: onClearError
  }

  return (
    <AuthColumn>
      <StateDisc>
        <LockOutlined />
      </StateDisc>

      <div className='reset-heading mb-6 text-center'>
        <h1 className='mb-1 text-[24px] font-extrabold leading-tight tracking-tight text-gray-900'>
          Đặt lại mật khẩu
        </h1>
        <p className='text-[13px] text-gray-500'>
          Tạo mật khẩu mới cho tài khoản quản trị của bạn
        </p>
      </div>

      <form
        onSubmit={handleSubmit((values) => onSubmit(values.password))}
        className='reset-stack flex flex-col gap-3.5'
      >
        <FormInput
          {...passwordFieldProps}
          name='password'
          label='Mật khẩu mới'
          placeholder='Nhập mật khẩu mới'
        />

        {isCapsLockOn && (
          <p
            className='-mt-2 text-[12px] font-medium text-amber-700'
            role='status'
          >
            Đang bật Caps Lock — mật khẩu phân biệt chữ hoa chữ thường.
          </p>
        )}

        <FormInput
          {...passwordFieldProps}
          name='confirmPassword'
          label='Nhập lại mật khẩu mới'
          placeholder='Nhập lại mật khẩu mới'
        />

        {hasMatchingConfirm && (
          <p className='-mt-2 flex items-center gap-1.5 text-[12px] font-medium text-teal-700'>
            <CheckOutlined
              aria-hidden
              className='text-[10px]'
            />
            Hai lần nhập đã khớp
          </p>
        )}

        <PasswordChecklist password={password} />

        {submitError && (
          <p
            role='alert'
            className='rounded-[10px] bg-red-50 px-3 py-2.5 text-[12px] leading-snug text-red-700'
          >
            {submitError}
          </p>
        )}

        <ButtonComponent
          className={PRIMARY_BUTTON_CLASS}
          content='Đặt lại mật khẩu'
          htmlType='submit'
          loading={isSubmitting}
        />

        <Link
          to={PATHS.AUTH.LOGIN}
          className={BACK_LINK_CLASS}
        >
          <ArrowLeftOutlined
            aria-hidden
            className='text-[11px]'
          />
          Về trang đăng nhập
        </Link>
      </form>
    </AuthColumn>
  )
}
