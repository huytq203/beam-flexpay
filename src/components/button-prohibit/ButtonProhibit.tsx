import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { ProhibitIcon } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonProhibitProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonProhibit = (props: ButtonProhibitProps) => {
  const { module } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)
  const { t } = useTranslation()

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleCreate = module + ':approve'
    if (permissions.includes('admin*') || permissions.includes(moduleCreate))
      return true
    else return false
  }, [permissions])

  return !isHasPermission() ? null : (
    //<Tooltip title={t('tooltips.approve')}>
    <Button
      icon={<ProhibitIcon size={SIZE_ICON} />}
      {...props}
    />
    //</Tooltip>
  )
}

export default ButtonProhibit
