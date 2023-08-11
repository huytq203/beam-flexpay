import { StopOutlined } from '@ant-design/icons'
import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonFreeze = (props: CustomButtonProps) => {
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
      icon={<StopOutlined />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonFreeze
