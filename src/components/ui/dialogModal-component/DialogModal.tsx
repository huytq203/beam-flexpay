import { Modal } from "antd";

export interface ModalConfirmProps {
  open: boolean;
  title?: string|React.ReactNode;
  content?: React.ReactNode;
  confirmLoading?: boolean;
  onOk: () => void | Promise<void>;
  onCancel: () => void;
  icon?: React.ReactNode;
  okText?: string|React.ReactNode;
  cancelText?: string|React.ReactNode;
  className?: string;
  footer?:React.ReactNode
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
  footer
}) => {
  return (
    <Modal
      open={open}
      title={title}
      centered
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText} 
      className={className}
      footer={footer}
    >
      {icon}
      {content}
    </Modal>
  );
};

export default DialogModal;
