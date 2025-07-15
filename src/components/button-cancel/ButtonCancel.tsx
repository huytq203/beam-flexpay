import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { Bandaids, BandaidsIcon } from '@phosphor-icons/react'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonCancel = (props: CustomButtonProps): JSX.Element | null => {
  const { module, children, ...rest } = props
  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleCreate = module + ':update'
    return permissions.includes('admin*') || permissions.includes(moduleCreate)
  }, [permissions, module])

  if (!isHasPermission()) return null

  return (
    <Button
      icon={<BandaidsIcon size={SIZE_ICON} />}
      danger
      {...rest}
    >
      {children || 'Cancel'}
    </Button>
  )
}

export default ButtonCancel