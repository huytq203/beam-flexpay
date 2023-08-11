import { viewMode } from '@type/customer'
import { ISaleFeeType } from '@type/saleFeeType'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { CreateProductDiscountModal } from './CreateProductDiscountModal'
import { NotifyProductDiscountModal } from './NotifyProductDiscountModal'
import { UpdateProductDiscountModal } from './UpdateProductDiscountModal'
import { ViewProductDiscountModal } from './ViewProductDiscountModal'
interface IProps {
  mode?: viewMode
  open: boolean
  onCancel: () => void
  id: string
  selectedItem: ISaleFeeType
}

function ProductDiscountModal({
  mode = viewMode.create,
  open,
  onCancel,
  selectedItem,
  id
}: IProps) {
  const { t } = useTranslation()

  const getTitle = () => {
    if (mode === viewMode.create)
      return t`management.discount.form.create-title`
    else if (mode === viewMode.updateDiscount)
      return t`management.discount.form.edit-title`
    else return t`management.discount.form.notify-title`
  }

  const render = () => {
    if (mode === viewMode.create) {
      return (
        <CreateProductDiscountModal
          open={false}
          onClose={onCancel}
        />
      )
    } else if (mode === viewMode.updateDiscount) {
      return (
        <UpdateProductDiscountModal
          open={false}
          onClose={onCancel}
          id={id}
        />
      )
    } else {
      return (
        <NotifyProductDiscountModal
          selectedItem={selectedItem}
          onCancel={onCancel}
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
      width={1000}
      maskClosable={false}
      mask
      destroyOnClose={true}
    >
      <Divider className='mt-20' />
      {render()}
    </Modal>
  )
}
export default ProductDiscountModal
