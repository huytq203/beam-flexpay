import { notificationMode } from '@type/notification'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { CreateNotificationModal } from './CreateNotificationModal'

interface IProps {
  open: boolean
  onCancel: () => void
  mode: notificationMode
  id: string
  refetch: () => void
}

function NotificationModal({ open, onCancel, refetch, mode, id }: IProps) {
  const { t } = useTranslation()
  const render = () => {
    switch (mode) {
      case notificationMode.CREATE:
        return (
          <CreateNotificationModal
            mode={mode}
            onCancel={onCancel}
            refetch={refetch}
          />
        )
      case notificationMode.UPDATE:
        return (
          <CreateNotificationModal
            mode={mode}
            onCancel={onCancel}
            refetch={refetch}
            id={id}
          />
        )
      case notificationMode.VIEW:
        return (
          <CreateNotificationModal
            mode={mode}
            onCancel={onCancel}
            refetch={refetch}
            id={id}
          />
        )
        break
      default:
        return
    }
  }

  const title = () => {
    switch (mode) {
      case notificationMode.CREATE:
        return t`notification-management.modal.create-title`
      case notificationMode.UPDATE:
        return t`notification-management.modal.update-title`
      case notificationMode.VIEW:
        return t`notification-management.modal.view-title`
        break
      default:
        return
    }
  }

  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        centered
        title={title()}
        footer={null}
        width={
          mode === notificationMode.DELETE ||
          mode === notificationMode.UPDATE ||
          mode === notificationMode.VIEW
            ? 500
            : 1000
        }
        className='modal-product-type'
        maskClosable={false}
        mask
        destroyOnClose={true}
      >
        <Divider className='mt-10' />
        {render()}
      </Modal>
    </div>
  )
}
export default NotificationModal
