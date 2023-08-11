import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { AiOutlineBranches } from 'react-icons/ai'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonUpdateGroupPermission = (props: CustomButtonProps) => {
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
      icon={<AiOutlineBranches />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonUpdateGroupPermission
