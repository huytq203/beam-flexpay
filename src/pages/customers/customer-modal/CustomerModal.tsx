import {
  useLazyCustomerFindOneQuery
} from '@services/cmsService'
import { viewMode } from '@type/customer'
import { Button, Col, Modal, Row } from 'antd'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CustomerFreeze from '../customer-freeze/CustomerFreeze'
import CustomerReason from '../customer-reason/CustomerReason'
import CustomerTabs from '../customer-tabs/CustomerTabs'
import { TransactionFindAllApiArg } from '@type/application'

type CustomerModalType = {
  mode: viewMode
  visible: boolean
  onCancel: () => void
  id: string
  refetch: () => void
}

function CustomerModal(props: CustomerModalType) {
  const { mode, visible, onCancel, id, refetch } = props

  const { t } = useTranslation()

  const [trigger, { data: customer }] = useLazyCustomerFindOneQuery()
  // const [historySearch, setHistorySearch] = useState<TransactionFindAllApiArg>({
  //     page: 1,
  //     take: 10,
  //     accountNumber: customer?.accountNumber
  //   })
  console.log('CustomerModal triggered with id:', id)
  console.log('CustomerModal customer data:', customer)
  const render = () => {
    switch (mode) {
      case viewMode.lock:
      case viewMode.unlock:
        return (
          <CustomerReason
            mode={mode}
            userId={id}
            refetch={refetch}
            closeModal={onCancel}
          />
        )
      case viewMode.freeze:
        return (
          <CustomerFreeze
            account={customer}
            closeModal={onCancel}
          />
        )
      default:
        return (
          <>
            
            {/* <CustomerInformation customer={customer} /> */}
            <CustomerTabs customer={customer} />
            <Row justify='end'>
              <Col span={2}>
                <Button
                  type='primary'
                  onClick={onCancel}
                >
                  {t('buttons.close')}
                </Button>
              </Col>
            </Row>
          </>
        )
    }
  }

  useEffect(() => {
    if (visible && id) trigger({ id })
  }, [visible, id, trigger])

  return (
    <Modal
      title={t(`customer-modal.${mode.toString()}`)}
      open={visible}
      onCancel={onCancel}
      centered
      okText={t(`account.modal.buttons.${mode.toString()}`)}
      cancelText={t('account.modal.buttons.cancel')}
      footer={null}
      width={
        mode === viewMode.view ||
        mode === viewMode.create ||
        mode === viewMode.update ||
        mode === viewMode.freeze
          ? 1000
          : 520
      }
      maskClosable={false}
      destroyOnClose={true}
    >
      {render()}
    </Modal>
  )
}

export default CustomerModal
