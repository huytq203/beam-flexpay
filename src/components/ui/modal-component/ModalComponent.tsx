import React, { ReactNode } from 'react'
import { Modal } from 'antd'
interface ModalComponentProps {
  open: boolean
  onOk: () => void
  onCancel: () => void
  confirmLoading?: boolean
  modalText?: ReactNode
  title?: string
  width?:string,
}
const ModalComponent = ({
  title,
  open,
  onOk,
  onCancel,
  confirmLoading,
  modalText,
  width,
}: ModalComponentProps) => {
  return (
    <Modal
      title={title || "title"}
      open={open}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      width={width||'90%'}
      style={{
        top: 20, // đẩy modal lên gần top
      }}
      styles={{
        header: {
          background: 'none'
        },
        content: {
          background: '#fafafa' // màu bạn muốn
        },

        body: {
          maxHeight: '70vh', // chiều cao tối đa body
          overflowY: 'auto' // scroll khi tràn
        }
      }}
    >
      <p>{modalText}</p>
    </Modal>
  )
}

export default ModalComponent
