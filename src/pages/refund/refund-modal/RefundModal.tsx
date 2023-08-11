import ItemDetail from '@components/item-detail/ItemDetail'
import { viewMode } from '@type/customer'
import { RefundListDataType } from '@type/refund'
import { Button, Col, Divider, Modal, Row, Typography } from 'antd'
import { t } from 'i18next'
import React from 'react'
import ConfirmRefund from '../confirm-refund/ConfirmRefund'
import OrderDetail from '../order-detail/OrderDetail'

interface IOrderDetail {
  open: boolean
  onCancel: () => void
  width?: number | string
  title?: string
  mode: viewMode
  selectedItem?: RefundListDataType
  refetch: () => void
}

function RefundModal({
  open,
  onCancel,
  title,
  selectedItem,
  mode = viewMode.view,
  refetch
}: IOrderDetail) {
  const render = () => {
    if (mode === viewMode.view)
      return (
        <OrderDetail
          selectedItem={selectedItem}
          onCancel={onCancel}
        />
      )
    else
      return (
        <ConfirmRefund
          refetch={refetch}
          selectedItem={selectedItem}
          onCancel={onCancel}
        />
      )
  }

  return (
    <Modal
      centered
      destroyOnClose
      title={title}
      onCancel={onCancel}
      open={open}
      width={mode === viewMode.view ? 1000 : 700}
      footer={null}
    >
      {render()}
    </Modal>
  )
}

export default RefundModal
