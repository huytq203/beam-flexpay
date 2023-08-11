import { Button, ButtonProps, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'
import { FaEye } from 'react-icons/fa'

interface CustomButtonProps extends ButtonProps {
  label?: string
}

const ButtonView = (props: CustomButtonProps) => {
  const { t } = useTranslation()
  return (
    <Tooltip title={t('tooltips.view')}>
      <Button
        icon={<FaEye />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonView
