import { SIZE_ICON } from '@constants/appConstant'
import { Eye } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

interface CustomButtonProps extends ButtonProps {
  label?: string
}

const ButtonView = (props: CustomButtonProps) => {
  const { t } = useTranslation()
  return (
    <Tooltip title={t('tooltips.view')}>
      <Button
        icon={<Eye size={SIZE_ICON} />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonView
