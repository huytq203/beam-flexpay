import { Modal } from "antd";

export interface ModalConfirmProps {
  open: boolean;
  title?: string;
  content?: React.ReactNode;
  confirmLoading?: boolean;
  onOk: () => void | Promise<void>;
  onCancel: () => void;
}

const DialogModal: React.FC<ModalConfirmProps> = ({
  open,
  title = "Xác nhận",
  content,
  confirmLoading = false,
  onOk,
  onCancel
}) => {
  return (
    <Modal
      open={open}
      title={title}
      centered
      onOk={onOk}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
    >
      {content}
    </Modal>
  );
};

export default DialogModal;
