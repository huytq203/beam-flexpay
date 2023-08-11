import { FileExcelOutlined } from '@ant-design/icons'
import { useAppSelector } from '@hooks/hook'
import { Button, ButtonProps } from 'antd'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface ButtonExcelProps extends ButtonProps {
  module: string
  label?: string
}

const ButtonExcel = (props: ButtonExcelProps) => {
  const { label, module } = props
  const { t: trans } = useTranslation()

  const { permissions } = useAppSelector((state) => state.auth.profile)

  /**
   * function get view permission
   */
  const isHasPermission = useCallback((): boolean => {
    return false
  }, [permissions])

  return (
    <Button
      icon={<FileExcelOutlined />}
      hidden={isHasPermission()}
      {...props}
    >
      {label ? trans(label) : trans('buttons.excel')}
    </Button>
  )
}

export default ButtonExcel
