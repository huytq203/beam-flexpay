import { useTranslation } from 'react-i18next'
import ModalComponent from '@components/ui/modal-component'
import { CapySettingsPanel } from './CapySettingsPanel'

interface CapySettingsDialogProps {
  open: boolean
  onCancel: () => void
}

/** Hộp thoại cài đặt Capy, mở từ mục "Cài đặt" trong menu tài khoản. */
export function CapySettingsDialog({
  open,
  onCancel
}: CapySettingsDialogProps) {
  const { t } = useTranslation()

  return (
    <ModalComponent
      title={t('capy.toggle.label')}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={360}
      destroyOnHidden
    >
      <CapySettingsPanel />
    </ModalComponent>
  )
}
