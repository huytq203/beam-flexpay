import React, { ReactNode } from 'react'
import { Modal } from 'antd'
interface ModalComponentProps {
  open: boolean
  onOk: () => void
  onCancel: () => void
  confirmLoading?: boolean
  modalText?: ReactNode
}
const ModalComponent = ({
  open,
  onOk,
  onCancel,
  confirmLoading,
  modalText
}: ModalComponentProps) => {
  return (
    <Modal
      title='Title'
      open={open}
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
       width={'90%'}
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
