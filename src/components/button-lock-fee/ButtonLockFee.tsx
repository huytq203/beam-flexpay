import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { Lock } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonLockFeeProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonLockFee = (props: ButtonLockFeeProps) => {
  const { module } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)
  const { t } = useTranslation()

  /**
   * function get lock permission
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleLock = module + ':lock'
    if (permissions.includes('admin*') || permissions.includes(moduleLock))
      return true
    else return false
  }, [permissions])

  return !isHasPermission() ? null : (
    <Tooltip title={t('tooltips.lock')}>
      <Button
        icon={<Lock size={SIZE_ICON} />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonLockFee
