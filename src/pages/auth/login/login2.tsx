import { ButtonComponent } from '@components/common'
import { FormInput } from '@components/form'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useUserLoginMutation } from '@services/cmsService'
import { useLazyGetUrlLoginQuery } from '@services/cmsUser'
import { notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { COlOR } from '@components/layout/components/Navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import "./style2.scss"
// Define validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Vui lòng nhập email')
    .email('Vui lòng nhập đúng định dạng email')
    .transform(val => val.trim()),
  password: z
    .string()
    .min(1, 'Vui lòng nhập mật khẩu')
    .transform(val => val.trim())
})

type LoginFormData = z.infer<typeof loginSchema>

const Login2 = () => {
    const navigate = useNavigate()
    const [login, { isLoading }] = useUserLoginMutation()
    const [getUrlLogin] = useLazyGetUrlLoginQuery()
    const { t } = useTranslation()

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    useEffect(() => {
        window.events.emit('auth-set-title', t('login.title').toString())
        window.events.emit('auth-set-description', t`login.description`)
    }, [])

    const onFinish = async (values: LoginFormData) => {
        try {
            const result = await login({ userLoginDto: values })

            if ('data' in result && result.data) {
                // Navigate to verify code page with tracking ID and email
                navigate(
                    `/auth/verify-code?trackingId=${
                        result.data.trackingId
                    }&email=${encodeURIComponent(values.email)}`
                )
            }
        } catch (error:any) {
            // notification.error({
            //     message: t`login.failed`,
            //     description: t`login.messages.server_error`
            // })
            alert(error?.data?.message)
        }
    }

    const ssoLogin = async () => {
        try {
            const res = (await getUrlLogin({})) as {
                data: { data: string; statusCode: number }
            }
            if ([200, 201].includes(res?.data?.statusCode) && res?.data?.data) {
                window.location.href = res?.data?.data
            } else {
                notification.error({ message: t`login.sso-failed` })
            }
        } catch (error) {
            notification.error({ message: t`login.sso-failed` })
        }
    }

    return (
        <>
            <form 
                onSubmit={handleSubmit(onFinish)}
                // className="relative w-full max-w-[20rem] px-8 py-10 flex flex-col items-center bg-white/30 backdrop-blur-lg border border-white/30 rounded-xl shadow-2xl transition-all duration-300 ease-out hover:backdrop-blur-xl hover:bg-white/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)]" 
            >
                <div className="flex w-full flex-1 justify-center flex-col gap-3"> 
                    <div className="rounded-full overflow-hidden flex justify-center items-center">
                        <img className='rounded-full bg-[#ffffff] w-12 h-12 object-contain' src="/images/BEAM.png" alt="" />
                    </div>
                    <div className="flex justify-center items-center mb-5">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-700 italic">
                            Đăng nhập
                        </h1>
                    </div>
                    <div className="flex flex-col ">
                        <FormInput 
                            className='mb-1' 
                            control={control} 
                            name={"email"} 
                            placeholder={'name@example.com...'} 
                            prefix={<UserOutlined />} 
                        />
                        
                        <FormInput 
                            className='flex' 
                            type='password' 
                            control={control} 
                            name={"password"} 
                            placeholder={'********'} 
                            prefix={<LockOutlined />} 
                        />
                      
                        <div className="flex justify-end items-center">
                            <Link 
                                style={{ color: COlOR }} 
                                className='underline text' 
                                to='/auth/forget-password'
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>
                    <div className="flex">
                        <ButtonComponent 
                            className="flex-1" 
                            content='Đăng nhập' 
                            htmlType='submit'
                            loading={isLoading}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <span className="text-gray-900 text-sm italic">Hoặc đăng nhập với</span>
                        <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                    <div className="flex">
                        <ButtonComponent 
                            className={'font-bold flex-1 text-[#37d6c4]'} 
                            type='default' 
                            content='Đăng nhập với Microsoft'
                            onClick={ssoLogin}
                            loading={isLoading}
                        />
                    </div>
                </div>
            </form>
        </>
    )
}

export default Login2