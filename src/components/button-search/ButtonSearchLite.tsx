import { SearchOutlined } from '@ant-design/icons'
import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'

interface ButtonSearchProps extends ButtonProps {}

const ButtonSearchLite = (props: ButtonSearchProps) => {
  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    return false
  }, [permissions])

  return (
    <Button
      type='primary'
      icon={<SearchOutlined />}
      hidden={isHasPermission()}
      {...props}
    />
  )
}

export default ButtonSearchLite
