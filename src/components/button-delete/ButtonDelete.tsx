import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { AiFillDelete } from 'react-icons/ai'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
  hidden?: boolean
}

const ButtonDelete = (props: CustomButtonProps) => {
  const { module, hidden } = props

  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    const moduleCreate = module + ':delete'
    if (permissions.includes('admin*') || permissions.includes(moduleCreate))
      return true
    else return false
  }, [permissions])

  return !isHasPermission() ? null : (
    <Button
      disabled={hidden}
      danger
      icon={<AiFillDelete />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonDelete
