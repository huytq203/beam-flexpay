import { PlusOutlined } from '@ant-design/icons'
import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface CustomButtonProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonAdd = (props: CustomButtonProps) => {
  const { label, module } = props
  const { t: trans } = useTranslation()

  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get view permission
   */

  const isHasPermission = useCallback((): boolean => {
    const moduleCreate = module + ':create'
    if (permissions.includes('admin*') || permissions.includes(moduleCreate))
      return true
    else return false
  }, [permissions])

  return !isHasPermission() ? null : (
    <Button
      type='primary'
      icon={<PlusOutlined />}
      hidden={isHasPermission()}
      {...props}
    >
      {label ? trans(label) : trans('buttons.add')}
    </Button>
  )
}

export default ButtonAdd
