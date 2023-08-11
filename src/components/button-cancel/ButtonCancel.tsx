import { Button, ButtonProps } from 'antd'
import { t } from 'i18next'

const ButtonCancel = (props: ButtonProps) => {
  return (
    <Button
      {...props}
      className='mw-100'
    >{t`buttons.cancel`}</Button>
  )
}
export default ButtonCancel
