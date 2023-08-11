import { viewMode } from '@type/policyManagement'
import { Modal, ModalProps } from 'antd'
import { useTranslation } from 'react-i18next'

interface ConfirmExistModalType extends ModalProps {
  mode?: viewMode
  onCancel: () => void
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  setVisibleConfirmModal?: React.Dispatch<React.SetStateAction<boolean>>
  visibleConfirmModal?: boolean
  onCloseConfirmModal?: () => void
}

export const ConfirmExistModal = ({
  mode,
  onCancel,
  setVisibleConfirmModal,
  visibleConfirmModal,
  onCloseConfirmModal,
  setOpen,
  ...props
}: ConfirmExistModalType) => {
  const { t: trans } = useTranslation()

  const getTitle = () => {
    switch (mode) {
      case viewMode.create:
        return trans`policy-management.limitAndRegulations.confirmCreateReturnTitle`.toString()
      case viewMode.update:
        return trans`policy-management.limitAndRegulations.confirmUpdateReturnTitle`.toString()
    }
  }

  const getContent = () => {
    switch (mode) {
      case viewMode.create:
        return (
          <div>
            {trans`policy-management.limitAndRegulations.confirmCreateReturnTitle`.toString()}
          </div>
        )
      case viewMode.update:
        return (
          <div>
            {trans`policy-management.limitAndRegulations.confirmUpdateMessage`.toString()}
          </div>
        )
    }
  }

  return (
    <Modal
      title={getTitle()}
      maskClosable={false}
      cancelText={trans`policy-management.limitAndRegulations.no`.toString()}
      okText={trans`policy-management.limitAndRegulations.yes`.toString()}
      onCancel={() => {
        onCloseConfirmModal && onCloseConfirmModal()
      }}
      onOk={() => {
        onCloseConfirmModal && onCloseConfirmModal()
        setTimeout(() => {
          setOpen && setOpen(false)
        }, 50)
      }}
      {...props}
    >
      {getContent()}
    </Modal>
  )
}
