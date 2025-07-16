import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { StampIcon } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonStampProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonStamp = (props: ButtonStampProps) => {
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
        icon={<StampIcon size={SIZE_ICON} />}
        hidden={isHasPermission()}
        {...props}
      />
    //</Tooltip>
  )
}

export default ButtonStamp
