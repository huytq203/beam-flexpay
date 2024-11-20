import { SIZE_ICON } from '@constants/appConstant'
//import { ClockCounterClockwise } from '@phosphor-icons/react'
import { Button, ButtonProps, Tooltip } from 'antd'
import { useTranslation } from 'react-i18next'

interface CustomButtonProps extends ButtonProps {
  label?: string
}

const ButtonHistory = (props: CustomButtonProps) => {
  const { t } = useTranslation()
  return (
    <Tooltip title={t('tooltips.viewHistory')}>
      <Button
        //icon={<ClockCounterClockwise size={SIZE_ICON} />}
        {...props}
      />
    </Tooltip>
  )
}

export default ButtonHistory
