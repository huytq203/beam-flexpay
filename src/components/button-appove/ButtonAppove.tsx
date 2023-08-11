import { CheckOutlined } from '@ant-design/icons'
import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonAppoveProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonAppove = (props: ButtonAppoveProps) => {
  const { label, module } = props
  const { t } = useTranslation()

  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    return false
  }, [permissions])

  return (
    <Button
      icon={<CheckOutlined />}
      hidden={isHasPermission()}
      {...props}
    >
      {label ? t(label) : t('buttons.approve')}
    </Button>
  )
}

export default ButtonAppove
