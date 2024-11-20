import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
//import { Trash } from '@phosphor-icons/react'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'

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
      //icon={<Trash size= {SIZE_ICON} />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonDelete
