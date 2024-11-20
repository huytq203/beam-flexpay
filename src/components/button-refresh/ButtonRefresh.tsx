import { SIZE_ICON } from '@constants/appConstant'
//import { ArrowsClockwise } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

interface CustomButtonProps extends ButtonProps {
  label?: string
}

const ButtonRefresh = (props: CustomButtonProps) => {
  const { t } = useTranslation()
  return (
    <Tooltip title={t('tooltips.view')}>
      <Button
        //icon={<ArrowsClockwise size={SIZE_ICON} />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonRefresh
