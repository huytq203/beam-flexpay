import { ButtonComponent } from '@components/common'
import { FormInput } from '@components/form'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useUserLoginMutation } from '@services/authEndpoints'
import { useLazyGetUrlLoginQuery } from '@services/cmsUser'
import { notification } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import "./style2.scss"
import { useMessage } from '@hooks/useMessage'
import { TokenType, setRefreshTokenCookie } from '@configs/fetchBaseQuery.types'
// Define validation schema
const loginSchema = z.object({
    username: z
        .string()
        .min(1, 'Vui lòng nhập email')
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
    const { infoMess, successMess, warningMess, errorMess } = useMessage()

    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
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
                navigate('/')
                // Truyền refreshExpiresIn từ API (đơn vị giây) vào setRefreshTokenCookie
                const refreshToken = result?.data?.[TokenType.REFRESH_TOKEN] || ''
                const refreshExpiresIn = result?.data?.[TokenType.REFRESH_EXPIRES_IN] || 1800
                setRefreshTokenCookie(refreshToken, refreshExpiresIn)

            } else if ('error' in result) {
                const error = result.error as any
                const errorMessage = error?.data?.message || t`login.failed`
                errorMess(errorMessage)
            }
        } catch (error: any) {
            const errorMessage = error?.data?.message || error?.message || t`login.messages.server_error`
            errorMess(errorMessage)

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
        } catch (error: any) {
            notification.error({ message: t`login.sso-failed` })
            alert(error?.data?.message)
        }
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(onFinish)}
                className='border px-5 py-10 rounded-md shadow-xl md:border-none md:shadow-none md:px-16 md:w-full md:py-0 overflow-auto'
            // className="relative w-full max-w-[20rem] px-8 py-10 flex flex-col items-center bg-white/30 backdrop-blur-lg border border-white/30 rounded-xl shadow-2xl transition-all duration-300 ease-out hover:backdrop-blur-xl hover:bg-white/30 hover:shadow-[0_25px_60px_rgba(0,0,0,0.25)]" 
            >
                <div className="flex w-full flex-1 justify-center flex-col gap-3 ">
                    <div className="flex justify-center items-center mb-2">
                        <div className="rounded-full bg-white p-1 shadow  transition-all duration-300">
                            <img className='w-16 h-16 object-contain' src="/images/BEAM.png" alt="" />
                        </div>
                    </div>
                    <div className="flex justify-center items-center mb-3">
                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-gray-600 italic">
                            Đăng nhập
                        </h1>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="space-y-1">
                            <FormInput
                                inputClassName='w-full !h-9 bg-transparent '
                                control={control}
                                name={"username"}
                                placeholder={'Email của bạn'}
                                prefix={<UserOutlined className="text-gray-400" />}
                            />
                        </div>

                        <div className="space-y-1">
                            <FormInput
                                inputClassName='w-full  !h-9 bg-transparent '
                                type='password'
                                control={control}
                                name={"password"}
                                placeholder={'Mật khẩu'}
                                prefix={<LockOutlined className="text-gray-400" />}
                            />
                        </div>

                        <div className="flex justify-end items-center h- -mt-2">
                            <Link
                                className='text-[0.75rem] font-medium text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline'
                                to='/auth/forget-password'
                            >
                                Quên mật khẩu?
                            </Link>
                        </div>
                    </div>

                    <div className="flex mt-2">
                        <ButtonComponent
                            className="flex-1 !h-10"
                            content='Đăng nhập'
                            htmlType='submit'
                            loading={isLoading}
                        />
                    </div>

                    <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        <span className="text-gray-500 text-sm font-medium px-2">Hoặc</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    </div>

                    <div className="flex">
                        <ButtonComponent
                            className='flex-1 !h-10 md:!border-1 !border-gray-300 hover:!border-blue-400 !bg-white hover:!bg-blue-50 !text-gray-500 hover:!text-blue-600 !font-semibold !transition-all !duration-300 !shadow-sm hover:!shadow-md'
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