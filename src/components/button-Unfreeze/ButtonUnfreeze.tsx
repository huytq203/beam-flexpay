import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import { SunIcon } from '@phosphor-icons/react'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonUnfreeze = (props: CustomButtonProps) => {
  const { module } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)

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
    <Button
      icon={<SunIcon size={SIZE_ICON} />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonUnfreeze
