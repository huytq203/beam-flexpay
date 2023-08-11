import { SearchOutlined } from '@ant-design/icons'
import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonSearchProps extends ButtonProps {
  label?: string
}

const ButtonSearch = (props: ButtonSearchProps) => {
  const { t: trans } = useTranslation()
  const { permissions } = useAppSelector((state) => state.auth.profile)

  const { label } = props

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    return false
  }, [permissions])

  return (
    <Button
      icon={<SearchOutlined />}
      hidden={isHasPermission()}
      type='primary'
      {...props}
    >
      {label ? trans(label) : trans('buttons.search')}
    </Button>
  )
}

export default ButtonSearch
