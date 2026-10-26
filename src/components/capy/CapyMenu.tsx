import { useTranslation } from 'react-i18next'
import ButtonComponent from '@components/ui/button-component'

interface CapyMenuProps {
  readonly onGreet: () => void
  readonly onSleep: () => void
  readonly onHide: () => void
}

/** Menu nhỏ hiện khi bấm vào Capy: chào, cho ngủ, hoặc ẩn (giống tắt, được lưu). */
export function CapyMenu({ onGreet, onSleep, onHide }: CapyMenuProps) {
  const { t } = useTranslation()
  return (
    <div
      id='capy-menu'
      className='flex gap-1'
    >
      <ButtonComponent
        type='text'
        size='small'
        onClick={onGreet}
      >
        {t('capy.menu.greet')}
      </ButtonComponent>
      <ButtonComponent
        type='text'
        size='small'
        onClick={onSleep}
      >
        {t('capy.menu.sleep')}
      </ButtonComponent>
      <ButtonComponent
        type='text'
        size='small'
        onClick={onHide}
      >
        {t('capy.menu.hide')}
      </ButtonComponent>
    </div>
  )
}
