import { useLazySsoLoginQuery } from '@services/cmsUser'
import { getParamsFromURL } from '@utils/helperFunctions'
import { Spin, notification } from 'antd'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'

const VerifyAzure = () => {
    const code = getParamsFromURL('code')
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [ssoLogin] = useLazySsoLoginQuery()

    const handleLogin = useCallback(async () => {
        try {
            const res = await ssoLogin(code) as { data: { data: any, statusCode: number } }
            if ([200, 201].includes(res?.data?.statusCode)) {

            } else {
                setTimeout(() => {
                    navigate(PATHS.AUTH.LOGIN)
                }, 400)
            }

        } catch (error) {
            notification.error({ message: t`login.sso-failed` })
        }
    }, [])

    useEffect(() => {
        if (code) {
            handleLogin()
        } else {
            navigate('/')
        }
    }, [])
    return (
        <Spin
            spinning={true}
            tip={t`login.sso-loading`}
        />
    )
}

export default VerifyAzure
