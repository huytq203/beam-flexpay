import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { PencilSimple } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonUpdate = (props: CustomButtonProps) => {
  const { module } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)
  const { t } = useTranslation()

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleCreate = module + ':update'
    if (permissions.includes('admin*') || permissions.includes(moduleCreate))
      return true
    else return false
  }, [permissions])

  return !isHasPermission() ? null : (
    <Tooltip title={t('tooltips.update')}>
      <Button
        icon={<PencilSimple size={SIZE_ICON} />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonUpdate
