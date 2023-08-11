import { EditGroupPermission } from '@pages/role-management/manage-group-permission/update-group-permission/UpdateGroupPermission'
import { viewMode } from '@type/productType'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import CreateProductType from './CreateProductType'
import UpdateProductTypeModal from './UpdateProductTypeModal'

import { ViewProductTypeModal } from './ViewProductTypeModal'

interface IProps {
  mode?: any
  open: boolean
  onCancel: () => void
  id: string
  refetch: () => void
}

function ProductTypeModal({
  mode = viewMode.create,
  open,
  onCancel,
  id
}: IProps) {
  const { t } = useTranslation()

  const getTitle = () => {
    if (mode === viewMode.create) return t`productType.form.create-title`
    else if (mode === viewMode.view) return t`productType.form.view-title`
    else return t`productType.form.edit-title`
  }

  const render = () => {
    if (mode === viewMode.create) {
      return (
        <CreateProductType
          open={false}
          onClose={onCancel}
        />
      )
    } else if (mode === viewMode.view) {
      return (
        <ViewProductTypeModal
          onCancel={onCancel}
          id={id}
        />
      )
    } else {
      return (
        <UpdateProductTypeModal
          open={false}
          onClose={onCancel}
          id={id}
        />
      )
    }
  }
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      centered
      title={getTitle()}
      footer={null}
      width={
        mode === viewMode.delete ||
        mode === viewMode.update ||
        mode === viewMode.view
          ? 500
          : 1000
      }
      className='modal-product-type'
      maskClosable={false}
      mask
      destroyOnClose={true}
    >
      {render()}
    </Modal>
  )
}
export default ProductTypeModal
