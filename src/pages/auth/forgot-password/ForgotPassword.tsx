/**
 * THESIS: khôi phục mật khẩu là một đường gửi bảo mật rõ ràng, không phải một
 * card với hai nút ngang hàng; trạng thái tiếp theo được thấy ngay tại chỗ.
 * OWN-WORLD: nền trắng, mực teal đậm, một đường dẫn email màu teal và bề mặt
 * input xanh rất nhạt; không dùng card nổi hay chrome trang trí.
 * STORY: nhập email đã đăng ký → gửi liên kết → kiểm tra hộp thư hoặc gửi lại.
 * FIRST VIEWPORT: mobile brand → minh họa đường gửi → tiêu đề → form một trường
 * → CTA toàn chiều rộng → lối quay lại đăng nhập.
 * FORM: một cột thao tác bảo mật, kế thừa surface auth hiện có.
 */

import {
  ArrowLeftOutlined,
  CheckOutlined,
  LockOutlined,
  MailOutlined
} from '@ant-design/icons'
import { PATHS } from '@constants/pathConstant'
import { useUserForgotPasswordMutation } from '@services/cmsService'
import { Button, Form, Input, notification } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

interface ForgotPasswordForm {
  email: string
}

const headingClass =
  'mb-8 text-center [&_h1]:mb-1 [&_h1]:text-[26px] [&_h1]:leading-tight [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:text-gray-900 [&_p]:mx-auto [&_p]:max-w-[390px] [&_p]:text-[13px] [&_p]:leading-relaxed [&_p]:text-gray-400'

const primaryButtonClass =
  '!h-[42px] !rounded-[10px] !text-[14px] !font-semibold focus-visible:!outline-3 focus-visible:!outline-offset-3 focus-visible:!outline-teal-200'

const secondaryActionClass =
  'mx-auto w-full mt-[18px] flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-[13px] font-medium text-teal-600 transition-colors duration-200 hover:bg-teal-50 hover:text-teal-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-200'

function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)
  const [form] = Form.useForm<ForgotPasswordForm>()
  const [forgotPassword, { isLoading }] = useUserForgotPasswordMutation()
  const [submittedEmail, setSubmittedEmail] = useState('')

  useEffect(() => {
    window.events.emit('auth-set-title', t('forgot.subtitle').toString())
    window.events.emit('auth-set-description', '')
  }, [t])

  useEffect(() => {
    if (submittedEmail) successHeadingRef.current?.focus()
  }, [submittedEmail])

  const handleSubmit = async ({ email }: ForgotPasswordForm) => {
    const normalizedEmail = email.trim()

    try {
      await forgotPassword({
        userForgotPassword: { email: normalizedEmail }
      }).unwrap()
      setSubmittedEmail(normalizedEmail)
      notification.success({
        message: t('forgot.messages.forgotPasswordSuccess')
      })
    } catch {
      notification.error({
        message: t('forgot.messages.forgotPasswordError'),
        description: 'Vui lòng thử lại sau ít phút.'
      })
    }
  }

  const goToLogin = () => navigate(PATHS.AUTH.LOGIN)

  const sendAgain = () => {
    setSubmittedEmail('')
    window.requestAnimationFrame(() => form.getFieldInstance('email')?.focus())
  }

  return (
    <main ref={rootRef} className="w-full max-w-[420px] text-gray-900">
      <header className="mb-6 flex items-center gap-3 text-base font-bold tracking-tight text-teal-700 md:hidden">
        <span className="grid size-10 place-items-center rounded-lg bg-linear-to-br from-teal-100 to-teal-200">
          <img
            src="/images/BEAM.png"
            alt=""
            className="size-7 object-contain"
          />
        </span>
        <span>Beam Ewallet CMS</span>
      </header>

      <section className="w-full">
        <div
          className="relative mx-auto mb-5 h-[70px] w-[104px] min-[421px]:mb-6"
          aria-hidden="true"
        >
          <span className="absolute top-0 left-[22px] z-2 grid size-[58px] place-items-center rounded-2xl border border-teal-100/60 bg-linear-to-br from-teal-50 to-teal-100 text-[23px] text-teal-700">
            {submittedEmail ? <CheckOutlined /> : <MailOutlined />}
          </span>
          <span className="absolute top-[45px] left-0.5 h-px w-[29px] origin-left rotate-25 bg-teal-200" />
          <span className="absolute right-px bottom-2.5 h-px w-8 origin-left -rotate-24 bg-teal-200" />
          <span className="absolute right-0 bottom-[7px] size-[7px] rounded-full border-2 border-teal-300 bg-white" />
        </div>

        {submittedEmail ? (
          <div
            role="status"
            aria-live="polite"
          >
            <div className={headingClass}>
              <h1 ref={successHeadingRef} tabIndex={-1}>
                Kiểm tra hộp thư của bạn
              </h1>
              <p>
                Nếu email khớp với tài khoản đã đăng ký, liên kết đặt lại mật
                khẩu sẽ được gửi đến:
              </p>
            </div>

            <div className="mb-4 flex min-h-[50px] items-center gap-[11px] rounded-[10px] border border-gray-200 bg-gray-50/80 px-3.5 py-3 text-sm text-teal-600">
              <MailOutlined aria-hidden="true" />
              <strong className="min-w-0 overflow-hidden font-semibold text-gray-900 [overflow-wrap:anywhere]">
                {submittedEmail}
              </strong>
            </div>

            <div className="mb-6 flex items-start gap-2.5 text-xs leading-[1.55] text-gray-500">
              <LockOutlined
                aria-hidden="true"
                className="mt-[3px] text-teal-600"
              />
              <p className="m-0">
                Liên kết có thời hạn sử dụng. Nếu chưa thấy email, hãy kiểm tra
                thư rác hoặc thử gửi lại.
              </p>
            </div>

            <Button
              type="primary"
              size="large"
              block
              className={primaryButtonClass}
              onClick={goToLogin}
            >
              Quay lại đăng nhập
            </Button>

            <button
              type="button"
              className={secondaryActionClass}
              onClick={sendAgain}
            >
              Dùng email khác
            </button>
          </div>
        ) : (
          <div>
            <div className={headingClass}>
              <h1>{t('forgot.title')}</h1>
              <p>
                Nhập email đã đăng ký. Chúng tôi sẽ gửi cho bạn liên kết để tạo
                mật khẩu mới.
              </p>
            </div>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleSubmit}
              className="[&_.ant-form-item]:!mb-5 [&_.ant-form-item-label]:!pb-2 [&_.ant-form-item-label>label]:!h-auto [&_.ant-form-item-label>label]:!text-[13px] [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label>label]:!text-gray-700 [&_.ant-input-affix-wrapper]:!h-[42px] [&_.ant-input-affix-wrapper]:!rounded-[10px] [&_.ant-input-affix-wrapper]:!border-gray-200 [&_.ant-input-affix-wrapper]:!bg-gray-50/80 [&_.ant-input-affix-wrapper]:!px-3.5 [&_.ant-input-affix-wrapper]:!shadow-none [&_.ant-input-affix-wrapper]:!transition-colors [&_.ant-input-affix-wrapper]:!duration-200 [&_.ant-input-affix-wrapper:hover]:!bg-white [&_.ant-input-affix-wrapper-focused]:!border-[#2bd9d0] [&_.ant-input-affix-wrapper-focused]:!bg-white [&_.ant-input-affix-wrapper-focused]:!shadow-[0_0_0_3px_rgba(43,217,208,0.14)] [&_.ant-input-prefix]:!me-2.5 [&_.ant-input-prefix]:!text-gray-400 [&_.ant-input]:!bg-transparent [&_.ant-input]:!text-[13px] [&_.ant-input]:!text-gray-900 [&_.ant-input::placeholder]:!text-gray-400 [&_.ant-form-item-explain-error]:!pt-1.5 [&_.ant-form-item-explain-error]:!text-xs"
            >
              <Form.Item
                label="Email tài khoản"
                name="email"
                validateTrigger={['onBlur', 'onSubmit']}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: t('forgot.messages.email').toString()
                  },
                  {
                    type: 'email',
                    message: t('messages.emailCorrectFormat').toString()
                  }
                ]}
              >
                <Input
                  prefix={<MailOutlined aria-hidden="true" />}
                  placeholder="tenban@congty.vn"
                  autoComplete="email"
                  inputMode="email"
                  disabled={isLoading}
                />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                loading={isLoading}
                className={primaryButtonClass}
              >
                {isLoading ? t('forgot.processing') : 'Gửi liên kết đặt lại'}
              </Button>
            </Form>

            <button
              type="button"
              className={secondaryActionClass}
              onClick={goToLogin}
            >
              <ArrowLeftOutlined aria-hidden="true" />
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </section>

      <footer className="mt-8 text-center text-[11px] text-gray-400">
        © {new Date().getFullYear()} Beam Ewallet · Powered by Flexpay
      </footer>
    </main>
  )
}

export default ForgotPassword
