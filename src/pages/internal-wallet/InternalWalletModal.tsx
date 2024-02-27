import { viewMode } from "@type/customer";
import { InternalWallet } from "@type/internalWallet";
import { Modal, ModalProps } from "antd";
import InternalWalletForm from "./components/InternalWalletForm";
import InternalWalletTransaction from "./InternalWalletTransaction";

interface InternalWalletModalType extends ModalProps {
  title: string
  selectedInternalWallet?: InternalWallet
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
}

const InternalWalletModal = (props: InternalWalletModalType) => {


  const render = () => {
    switch (props.mode) {
      case viewMode.create:
        return (
          <InternalWalletForm
            selectedInternalWallet={props.selectedInternalWallet}
            mode={props.mode}
            onCancel={props.onCancel}
          />
        )
      case viewMode.update:
        return (
          <InternalWalletForm
            selectedInternalWallet={props.selectedInternalWallet}
            mode={props.mode}
            onCancel={props.onCancel}
          />
        )
      case viewMode.view:
        return (
          <InternalWalletTransaction
            selectedInternalWallet={props.selectedInternalWallet}
            onCancel={props.onCancel}
          />
        )
    }
  }

  return (
    <Modal
      open={props.isShow}
      footer={null}
      title={props.title}
      onCancel={props.onCancel}
      width={900}
      destroyOnClose
      children={render()}
    />
  )
}

export default InternalWalletModal
