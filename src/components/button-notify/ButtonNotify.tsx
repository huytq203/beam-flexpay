import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { BsFillBellFill } from 'react-icons/bs'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonNotify = (props: CustomButtonProps) => {
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
      icon={<BsFillBellFill />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonNotify
