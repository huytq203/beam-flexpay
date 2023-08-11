import { viewMode } from '@type/customer'
import { ISaleFeeType } from '@type/saleFeeType'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import NotifyForm from '../notify-form/NotifyForm'
import SaleFeeForm from '../sales-fee-form/SaleFreeForm'
import UpdateSaleFeeForm from '../update-fee-form/UpdateFeeForm'

interface IProps {
  open: boolean
  onCancel: () => void
  mode: viewMode
  refetch: () => void
  selectedId: string
  selectedItem: ISaleFeeType
}

function SaleFeeModal({
  open,
  onCancel,
  selectedId,
  mode = viewMode.create,
  selectedItem,
  refetch
}: IProps) {
  const { t } = useTranslation()
  const getTitle = () => {
    if (mode == viewMode.create) return t`management.sales-fee.create`
    else if (mode == viewMode.notify)
      return t`management.sales-fee.notify-title`
    else return t`management.sales-fee.view`
  }
  const render = () => {
    if (mode === viewMode.notify)
      return (
        <NotifyForm
          selectedItem={selectedItem}
          onCancel={onCancel}
        />
      )
    else if (mode === viewMode.create)
      return (
        <SaleFeeForm
          refetch={refetch}
          onCancel={onCancel}
        />
      )
    else
      return (
        <UpdateSaleFeeForm
          selectedItem={selectedItem}
          refetch={refetch}
          onCancel={onCancel}
          selectedId={selectedId}
        />
      )
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      title={getTitle()}
      footer={null}
      width={1000}
      centered
      destroyOnClose
    >
      <Divider className='mt-20' />
      {render()}
    </Modal>
  )
}
export default SaleFeeModal
