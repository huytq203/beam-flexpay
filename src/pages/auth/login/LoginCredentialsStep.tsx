import { useEffect, useRef } from 'react'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import ButtonComponent from '@components/ui/button-component'
import { FormInput } from '@components/form'
import { PATHS } from '@constants/pathConstant'
import { useMessage } from '@hooks/useMessage'
import { useGoogleReCaptcha } from '@utils/recaptcha'
import { loginSchema, type LoginFormData } from './schema'

export interface LoginCredentialsStepProps {
  isSubmitting: boolean
  submitError: string | null
  onSubmit: (values: LoginFormData, captchaToken: string) => Promise<void>
}

export function LoginCredentialsStep({
  isSubmitting,
  submitError,
  onSubmit
}: LoginCredentialsStepProps) {
  const { errorMess } = useMessage()
  const { t } = useTranslation()
  const { executeRecaptcha } = useGoogleReCaptcha()
  const rootRef = useRef<HTMLDivElement>(null)
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' }
  })

  useEffect(() => {
    window.events.emit('auth-set-title', t('login.title').toString())
    window.events.emit(
      'auth-set-description',
      t('login.description').toString()
    )
  }, [t])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) return

    const context = gsap.context(() => {
      gsap.fromTo(
        '.login-logo',
        { scale: 0.75, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.45, ease: 'power2.out' }
      )
      gsap.fromTo(
        '.login-content > *',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, stagger: 0.06, ease: 'power2.out' }
      )
    }, root)
    return () => context.revert()
  }, [])

  const handleFormSubmit = async (values: LoginFormData): Promise<void> => {
    if (!executeRecaptcha) {
      errorMess('Hệ thống bảo mật chưa sẵn sàng, vui lòng đợi giây lát')
      return
    }

    try {
      const captchaToken = await executeRecaptcha('login')
      if (!captchaToken) {
        errorMess('Vui lòng xác nhận Captcha')
        return
      }
      await onSubmit(values, captchaToken)
    } catch {
      errorMess('Không thể xác thực Captcha, vui lòng kiểm tra kết nối mạng.')
    }
  }

  return (
    <div
      ref={rootRef}
      className='w-full max-w-[420px]'
    >
      <div className='mb-6 flex items-center gap-3 md:hidden'>
        <div className='flex size-10 items-center justify-center rounded-lg bg-linear-to-br from-teal-100 to-teal-200'>
          <img
            src='/images/BEAM.png'
            alt=''
            className='size-7 object-contain'
          />
        </div>
        <span className='text-base font-bold tracking-tight text-teal-700'>
          Beam Ewallet CMS
        </span>
      </div>

      <div className='login-logo mb-4 flex justify-center'>
        <div className='flex size-[60px] items-center justify-center rounded-2xl border border-teal-100/60 bg-linear-to-br from-teal-50 to-teal-100'>
          <img
            src='/images/BEAM.png'
            alt='Beam Logo'
            className='size-12 object-contain'
          />
        </div>
      </div>

      <div className='login-content'>
        <div className='mb-8 text-center'>
          <h1 className='mb-1 text-[26px] font-extrabold leading-tight tracking-tight text-gray-900'>
            Chào mừng trở lại
          </h1>
          <p className='text-[13px] text-gray-500'>
            Đăng nhập để tiếp tục vào hệ thống quản trị
          </p>
        </div>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className='flex flex-col gap-4'
        >
          <FormInput
            trim
            trimOn='blur'
            inputClassName='h-[42px]! w-full rounded-[10px]! border-gray-200! bg-gray-50/80! text-[13px]! transition-colors! duration-200! hover:bg-white! focus:bg-white!'
            control={control}
            name='username'
            placeholder='Tên đăng nhập'
            prefix={<UserOutlined className='text-gray-400' />}
            autoComplete='off'
            onCopy={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
          />

          <FormInput
            inputClassName='h-[42px]! w-full rounded-[10px]! border-gray-200! bg-gray-50/80! text-[13px]! transition-colors! duration-200! hover:bg-white! focus:bg-white!'
            control={control}
            name='password'
            type='password'
            placeholder='Mật khẩu'
            prefix={<LockOutlined className='text-gray-400' />}
            autoComplete='new-password'
            onCopy={(event) => event.preventDefault()}
            onCut={(event) => event.preventDefault()}
          />

          <div className='-mt-1 flex justify-end'>
            <Link
              to={PATHS.AUTH.FORGOT_PASSWORD}
              className='text-[12px] font-medium text-teal-700 transition-colors hover:text-teal-900'
            >
              Quên mật khẩu?
            </Link>
          </div>

          {submitError && (
            <p
              role='alert'
              className='rounded-[10px] bg-red-50 px-3 py-2.5 text-[12px] text-red-700'
            >
              {submitError}
            </p>
          )}

          <ButtonComponent
            className='h-[42px]! w-full! rounded-[10px]! text-[14px]! font-semibold!'
            content='Đăng nhập'
            htmlType='submit'
            loading={isSubmitting}
          />
        </form>
      </div>

      <p className='mt-8 text-center text-[11px] text-gray-500'>
        © {new Date().getFullYear()} Beam Ewallet · Powered by Flexpay
      </p>
    </div>
  )
}
