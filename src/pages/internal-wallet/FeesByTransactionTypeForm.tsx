import { GUTTER } from '@constants/appConstant'
import { Button, Col, Form, Input, Row, Select } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function FeesByTransactionTypeForm({ record, isShow, onCancel, title }: props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const createLoading = false
  const updateLoading = false

  const handleSubmit = () => {}

  useEffect(() => {
    if (isShow && record && record.id) form.setFieldsValue(record)
    if (!isShow) form.resetFields()
  }, [isShow, record])

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      width={800}
    >
      <Form
        layout='vertical'
        form={form}
      >
        <Row
          gutter={GUTTER}
          className='w-100'
        >
          <Col span={12}>
            {/* đối tượng khách hàng - customers - select */}
            <Form.Item
              name='customers'
              label={t('feesByTransactionType.customers')}
            >
              <Select />
            </Form.Item>
            {/* loại giao dịch - transactionType - select */}
            <Form.Item
              name='transactionType'
              label={t('feesByTransactionType.transactionType')}
            >
              <Select />
            </Form.Item>
            {/* nguồn tiền - Funds - select */}
            <Form.Item
              name='funds'
              label={t('feesByTransactionType.funds')}
            >
              <Select />
            </Form.Item>
            {/* dịch vụ - service - select */}
            <Form.Item
              name='service'
              label={t('feesByTransactionType.service')}
            >
              <Select />
            </Form.Item>
            {/* đối tác thu hộ/ chi hộ - collectionAndPaymentPartner - select */}
            <Form.Item
              name='collectionAndPaymentPartner'
              label={t('feesByTransactionType.collectionAndPaymentPartner')}
            >
              <Select />
            </Form.Item>
            {/* ngân hàng liên kết - affiliateBank - select */}
            <Form.Item
              name='affiliateBank'
              label={t('feesByTransactionType.affiliateBank')}
            >
              <Select />
            </Form.Item>
            {/* số tiền - amount - input */}
            <Form.Item
              name='amount'
              label={t('feesByTransactionType.amount')}
            >
              <Input type='number' />
            </Form.Item>
          </Col>
          <Col span={12}>
            {/* hạng ví KHCN/KHDN - ratings - select */}
            <Form.Item
              name='ratings'
              label={t('feesByTransactionType.ratings')}
            >
              <Select />
            </Form.Item>
            {/* cách thức tính phí - chargingMethod - select */}
            <Form.Item
              name='chargingMethod'
              label={t('feesByTransactionType.chargingMethod')}
            >
              <Select />
            </Form.Item>
            {/* phí - fee - input */}
            <Form.Item
              name='fee'
              label={t('feesByTransactionType.fee')}
            >
              <Input type='number' />
            </Form.Item>
            {/* phí tối đa - maximumFee - input */}
            <Form.Item
              name='maximumFee'
              label={t('feesByTransactionType.maximumFee')}
            >
              <Input type='number' />
            </Form.Item>
            {/* phí tối thiểu - minimumFee - input */}
            <Form.Item
              name='minimumFee'
              label={t('feesByTransactionType.minimumFee')}
            >
              <Input type='number' />
            </Form.Item>
            {/* vat - vat - input */}
            <Form.Item
              name='vat'
              label={t('feesByTransactionType.vat')}
            >
              <Input type='number' />
            </Form.Item>
            {/* vat tối đa - maximumVat - input */}
            <Form.Item
              name='maximumVat'
              label={t('feesByTransactionType.maximumVat')}
            >
              <Input type='number' />
            </Form.Item>
            {/* vat tối thiểu - minimumVat - input */}
            <Form.Item
              name='minimumVat'
              label={t('feesByTransactionType.minimumVat')}
            >
              <Input type='number' />
            </Form.Item>
          </Col>
        </Row>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
              loading={createLoading || updateLoading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              onClick={handleSubmit}
              loading={createLoading || updateLoading}
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default FeesByTransactionTypeForm
