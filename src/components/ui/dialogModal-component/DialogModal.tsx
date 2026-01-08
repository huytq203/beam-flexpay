import { Modal } from "antd";
import { ModalProps } from "antd/lib";

export interface ModalConfirmProps extends ModalProps{
  open: boolean;
  title?: string | React.ReactNode;
  content: React.ReactNode;
  confirmLoading?: boolean;
  onOk: () => void | Promise<void>;
  onCancel: () => void;
  icon?: React.ReactNode;
  okText?: string | React.ReactNode;
  cancelText?: string | React.ReactNode;
  className?: string;
  footer?: React.ReactNode
}

const DialogModal: React.FC<ModalConfirmProps> = ({
  open,
  title = "Xác nhận",
  content,
  confirmLoading = false,
  onOk,
  onCancel,
  icon,
  okText,
  cancelText,
  className,
  footer,
  ...props
}) => {
  return (
    <Modal
      open={open}
      title={title}
      centered
      onOk={onOk}
      destroyOnClose
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      className={className}
      footer={footer}
      styles={{
        ...props.styles, // Merge styles từ props trước
        body: {
          ...props.styles?.body,
          maxHeight: '70vh',
          overflowY: 'auto'
        }
      }}
    >
      {icon}
      {content}
    </Modal>
  );
};

export default DialogModal;
