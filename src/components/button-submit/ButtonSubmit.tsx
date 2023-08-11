import { Button, ButtonProps } from 'antd'
import { t } from 'i18next'

const ButtonSubmit = (props: ButtonProps) => {
  return (
    <Button
      {...props}
      type='primary'
      htmlType='submit'
      className='mw-100'
    >
      {t`buttons.save`}
    </Button>
  )
}
export default ButtonSubmit
