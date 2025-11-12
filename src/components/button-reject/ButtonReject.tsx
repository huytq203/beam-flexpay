import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { XCircle } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonRejectProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonReject = (props: ButtonRejectProps) => {
  const { module } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)
  const { t } = useTranslation()

  /**
   * function get reject permission
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleReject = module + ':reject'
    if (permissions.includes('admin*') || permissions.includes(moduleReject))
      return true
    else return false
  }, [permissions])

  return !isHasPermission() ? null : (
    <Tooltip title={t('tooltips.reject')}>
      <Button
        icon={<XCircle size={SIZE_ICON} />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonReject
