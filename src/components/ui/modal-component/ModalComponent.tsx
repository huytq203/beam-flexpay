import React, { ReactNode } from 'react'
import { Modal } from 'antd'
import { ModalProps } from 'antd/lib'
interface ModalComponentProps extends ModalProps {
  open: boolean
  onOk?: () => void
  onCancel: () => void
  confirmLoading?: boolean
  modalText: ReactNode
  title?: string|ReactNode
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
  ...props
}: ModalComponentProps) => {
  return (
    <Modal
      {...props} // Spread tất cả props trước (bao gồm centered)
      title={title || "title"}
      open={open}
      onOk={onOk}
      centered
      destroyOnClose
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      width={width || '90%'}
      styles={{
        ...props.styles, // Merge styles từ props trước
        header: {
          ...props.styles?.header,
          background: 'none'
        },
        content: {
          ...props.styles?.content,
          background: '#fafafa'
        },
        body: {
          ...props.styles?.body,
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      <div>{modalText}</div>
    </Modal>
  )
}

export default ModalComponent
