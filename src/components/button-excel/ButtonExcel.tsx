import { FileExcelOutlined } from '@ant-design/icons'
import { SIZE_ICON } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
//import { MicrosoftExcelLogo } from '@phosphor-icons/react'
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
    style={{
      display: 'flex',
      alignItems: 'center',
    }}
      //icon={<MicrosoftExcelLogo  size={SIZE_ICON} />}
      hidden={isHasPermission()}
      {...props}
    >
      <span>{label ? trans(label) : trans('buttons.excel')}</span>
    </Button>
  )
}

export default ButtonExcel
