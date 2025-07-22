import { pageEnum, POLICY_MANAGEMENT_TYPE, viewMode } from '@type/policyManagement'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { DeleteFeePackageModal } from '../delete-modal/DeleteFeePackageModal'
import { AddFeePackageModal } from './AddFeePackageModalV2'
import { UpdateFeePackageModal } from './UpdateFeePackageV2'

type ModalType = {
  mode: viewMode
  open: boolean
  onCancel: () => void
  id: string | number
  toggleFee?: (value: any, type: viewMode) => void
  module?: POLICY_MANAGEMENT_TYPE
  fee?: any
  policyMode?: viewMode
}

export const AddAndUpdateFeePackageModal = ({
  mode,
  open,
  onCancel,
  toggleFee,
  module,
  fee,
  policyMode,
  id
}: ModalType) => {
  const { t } = useTranslation()

  const getTitle = () => {
    switch (mode) {
      case viewMode.create:
        return t`policy-management.depositManagement.modalContent.feePackage.addFeePackage`
      case viewMode.update:
        return t`policy-management.depositManagement.modalContent.feePackage.updateFeePackage`
      case viewMode.delete:
        return t`policy-management.payment.feePackageDeleteTitle`
    }
  }

  const render = () => {
    switch (mode) {
      case viewMode.create:
        return (
          <AddFeePackageModal
            onCancel={onCancel}
            toggleFee={toggleFee}
            module={module}
            mode={mode}
            fee={fee}
          />
        )
      case viewMode.update:
        return (
          <UpdateFeePackageModal
            mode={policyMode}
            id={id}
            onCancel={onCancel}
            toggleFee={toggleFee}
            module={module}
            fee={fee}
          />
        )
      case viewMode.delete:
        return (
          <DeleteFeePackageModal
            onCancel={onCancel}
            toggleFee={toggleFee}
          />
        )
    }
  }

  return (
    <Modal
      onCancel={onCancel}
      open={open}
      footer={null}
      maskClosable={false}
      destroyOnClose
      centered
      width={mode === viewMode.delete ? 500 : 850}
      title={getTitle()}
    >
      {mode !== viewMode.delete ? <Divider className='mt-20' /> : null}
      {render()}
    </Modal>
  )
}
