import { GUTTER } from '@constants/appConstant'
import { Button, Col, Descriptions, Form, Input, Modal, Row } from 'antd'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  toggleOpen: (value: boolean) => void
}

const NapasRefundModal = ({ open, toggleOpen }: Props) => {
  const { t: trans } = useTranslation()

  return (
    <Modal
      footer={false}
      width={800}
      centered
      title={trans`napas-transaction.refund`}
      open={open}
      onCancel={() => toggleOpen(false)}
    >
      <Form>
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            lg={12}
          >
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.transactionTime`}
            >
              12:00:00 12/12/2022
            </Form.Item>
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.payMobiTransactionCode`}
            >
              12:00:00 12/12/2022
            </Form.Item>
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.transactionCodeBank`}
            >
              12:00:00 12/12/2022
            </Form.Item>
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.walletExecute`}
            >
              12:00:00 12/12/2022
            </Form.Item>
          </Col>
          <Col
            xs={24}
            lg={12}
          >
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.transactionDesc`}
            >
              12:00:00 12/12/2022
            </Form.Item>
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.bank`}
            >
              12:00:00 12/12/2022
            </Form.Item>
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.value`}
            >
              12:00:00 12/12/2022
            </Form.Item>
            <Form.Item
              labelAlign='left'
              labelCol={{ xs: 12 }}
              label={trans`napas-transaction.status`}
            >
              12:00:00 12/12/2022
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label={trans`napas-transaction.refundReason`}
          name='reason'
        >
          <Input.TextArea
            placeholder={trans`napas-transaction.refundReason` ?? ''}
          />
        </Form.Item>
      </Form>
      <Row
        justify={'center'}
        gutter={GUTTER}
      >
        <Col>
          <Button type='primary'>{trans`napas-transaction.refund`}</Button>
        </Col>
        <Col>
          <Button onClick={() => toggleOpen(false)}>
            {trans`buttons.cancel`}
          </Button>
        </Col>
      </Row>
    </Modal>
  )
}

export default React.memo(NapasRefundModal)
