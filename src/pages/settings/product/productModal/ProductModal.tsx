import { EditGroupPermission } from '@pages/role-management/manage-group-permission/update-group-permission/UpdateGroupPermission'
import { ViewProductTypeModal } from '@pages/settings/product-type/ProductTypeModal/ViewProductTypeModal'
import { viewMode } from '@type/productType'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { CreateProductModal } from './CreateProductModal'
import { UpdateProductModal } from './UpdateProductModal'
import ViewProductModal from './ViewProductModal'

interface IProps {
  mode?: any
  open: boolean
  onCancel: () => void
  id: string
}

function ProductModal({ mode = viewMode.create, open, onCancel, id }: IProps) {
  const { t } = useTranslation()

  const getTitle = () => {
    if (mode === viewMode.create) return t`product.form.create-title`
    else if (mode === viewMode.view) return t`product.form.view-title`
    else return t`product.form.edit-title`
  }
  const render = () => {
    if (mode === viewMode.create) {
      return (
        <CreateProductModal
          open={false}
          onClose={onCancel}
        />
      )
    } else if (mode === viewMode.update) {
      return (
        <UpdateProductModal
          open={false}
          onClose={onCancel}
          id={id}
        />
      )
    } else {
      return (
        <ViewProductModal
          onCancel={onCancel}
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
      className='modal-product'
      maskClosable={false}
      mask
      destroyOnClose={true}
    >
      {render()}
    </Modal>
  )
}
export default ProductModal
