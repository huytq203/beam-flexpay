import ButtonComponent from '@components/ui/button-component'
import { FormInput } from '@components/form'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useUserLoginMutation } from '@services/authEndpoints'
import { useLazyGetUrlLoginQuery } from '@services/cmsUser'
import { notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMessage } from '@hooks/useMessage'
import { TokenType, setRefreshTokenCookie } from '@configs/fetchBaseQuery.types'
import { useGoogleReCaptcha } from "@utils/recaptcha";
import gsap from 'gsap'
import { AUTHENTICATION, TRANSACTIONMANAGEMENT } from '@constants/routersConstant'
const loginSchema = z.object({
    username: z.string().min(1, 'Vui lòng nhập email').transform(val => val.trim()),
    password: z.string().min(1, 'Vui lòng nhập mật khẩu').transform(val => val.trim()),
})

type LoginFormData = z.infer<typeof loginSchema>


const LoginFormInside = () => {
    const navigate = useNavigate()
    const [login, { isLoading }] = useUserLoginMutation()
    const [_getUrlLogin] = useLazyGetUrlLoginQuery()
    const { t } = useTranslation()
    const { errorMess } = useMessage()
    const cardRef = useRef<HTMLDivElement>(null)
    const { executeRecaptcha } = useGoogleReCaptcha()

    // Readonly toggle to prevent autofill when not focused
    const [readonlyUsername, setReadonlyUsername] = useState(true)
    const [readonlyPassword, setReadonlyPassword] = useState(true)



    const {
        control,
        handleSubmit
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: '', password: '' }
    })

    useEffect(() => {
        window.events.emit('auth-set-title', t('login.title').toString())
        window.events.emit('auth-set-description', t`login.description`)
    }, [])

    useEffect(() => {
        if (!cardRef.current) return
        const ctx = gsap.context(() => {
            gsap.fromTo('.login-logo',
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
            )
            gsap.fromTo('.login-heading',
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, delay: 0.2, ease: 'power2.out' }
            )
            gsap.fromTo('.login-form-fields > *',
                { y: 15, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, delay: 0.35, ease: 'power2.out' }
            )
        }, cardRef)
        return () => ctx.revert()
    }, [])

    const onFinish = async (values: LoginFormData) => {
        try {
            if (!executeRecaptcha) {
                errorMess('Hệ thống bảo mật chưa sẵn sàng, vui lòng đợi giây lát')
                return
            }

            // Gọi API Sinh ra token ngầm
            let recaptchaToken = ''
            try {
                recaptchaToken = await executeRecaptcha('login')
            } catch (err) {
                console.error("Lỗi khi gọi Google ReCAPTCHA:", err)
                errorMess('Không thể xác thực Captcha, vui lòng kiểm tra kết nối mạng.')
                return
            }

            if (!recaptchaToken) {
                errorMess('Vui lòng xác nhận Captcha')
                return;
            }

            // Nếu Backend YÊU CẦU gửi captcha token:
            const result = await login({ userLoginDto: { ...values, captchaToken: recaptchaToken } })

            // Hiện tại ta vẫn gọi config login mặc định
            // const result = await login({ userLoginDto: values })

            if ('data' in result && result.data) {
                navigate(`${TRANSACTIONMANAGEMENT}/transaction-wallet`)
                const refreshToken = result?.data?.[TokenType.REFRESH_TOKEN] || ''
                const refreshExpiresIn = result?.data?.[TokenType.REFRESH_EXPIRES_IN] || 1800
                setRefreshTokenCookie(refreshToken, refreshExpiresIn)
            } else if ('error' in result) {
                // Xử lý lỗi trả về từ Hook mutation API
            }
        } catch (error) {
            console.error(error)
            notification.error({ message: 'Đăng nhập có lỗi phát sinh, vui lòng thử lại.' })
        }
    }

    return (
        <div ref={cardRef} className="w-full max-w-[420px]">
            {/* Mobile brand header */}
            <div className="flex items-center gap-3 mb-6 md:hidden">
                <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                    <img src="/images/BEAM.png" alt="Beam" className="w-7 h-7 object-contain" />
                </div>
                <span className="text-teal-700 font-bold text-base tracking-tight">Beam Ewallet CMS</span>
            </div>

            {/* Logo */}
            <div className="login-logo flex justify-center mb-4">
                <div className="w-[60px] h-[60px] rounded-2xl bg-linear-to-br from-teal-50 to-teal-100 flex items-center justify-center border border-teal-100/60">
                    <img src="/images/BEAM.png" alt="Beam Logo" className="w-[48px] h-[48px] object-contain" />
                </div>
            </div>

            {/* Heading */}
            <div className="login-heading text-center mb-8">
                <h1 className="text-[26px] font-extrabold text-gray-900 tracking-tight leading-tight mb-1">
                    Chào mừng trở lại
                </h1>
                <p className="text-gray-400 text-[13px]">Đăng nhập để tiếp tục vào hệ thống quản trị</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onFinish)} className="login-form-fields flex flex-col gap-4">

                <FormInput
                    trim
                    trimOn="blur"
                    inputClassName="w-full h-[42px]! rounded-[10px]! text-[13px]! bg-gray-50/80! hover:bg-white! focus:bg-white! transition-colors! duration-200! border-gray-200!"
                    control={control}
                    name="username"
                    placeholder="Tên đăng nhập "
                    prefix={<UserOutlined className="text-gray-400" />}
                    autoComplete="off"
                    readOnly={readonlyUsername}
                    onFocus={() => setReadonlyUsername(false)}
                    onBlur={() => setReadonlyUsername(true)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                />

                <FormInput
                    inputClassName="w-full h-[42px]! rounded-[10px]! text-[13px]! bg-gray-50/80! hover:bg-white! focus:bg-white! transition-colors! duration-200! border-gray-200!"
                    control={control}
                    name="password"
                    type='password'
                    placeholder="Mật khẩu"
                    prefix={<LockOutlined className="text-gray-400" />}
                    autoComplete="new-password"
                    readOnly={readonlyPassword}
                    onFocus={() => setReadonlyPassword(false)}
                    onBlur={() => setReadonlyPassword(true)}
                    onCopy={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                />

                <div className="flex justify-end -mt-1">
                    <Link
                        to={`${AUTHENTICATION}/forget-password`}
                        className="text-[12px] font-medium text-teal-600 hover:text-teal-800 transition-colors duration-200"
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <ButtonComponent
                    className="w-full! h-[42px]! rounded-[10px]! font-semibold! text-[14px]!"
                    content="Đăng nhập"
                    htmlType="submit"
                    loading={isLoading}
                />

            </form>
            {/* Footer */}
            <p className="text-center text-[11px] text-gray-400 mt-8">
                © {new Date().getFullYear()} Beam Ewallet · Powered by Flexpay
            </p>

        </div>
    )
}

export default LoginFormInside
