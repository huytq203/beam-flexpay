import { viewMode } from "@type/customer"
import { InternalWallet } from "@type/internalWallet"
import { Modal, ModalProps } from "antd"
import InternalWalletTransaction from "./InternalWalletTransaction"

interface InternalWalletTransactionModalType extends ModalProps {
  title: string
  selectedInternalWallet?: InternalWallet
  isShow: boolean
  onCancel: VoidFunction
  mode: viewMode
}


const InternalWalletTransactionModal = (props: InternalWalletTransactionModalType) => {

  const render = () => {
    switch (props.mode) {
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
      width={1200}
      destroyOnClose
      children={render()}
    />
  )
}

export default InternalWalletTransactionModal