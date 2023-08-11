import { GUTTER } from '@constants/appConstant'
import { Button, Col, Form, Input, Modal, Row, Select } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function TransactionAccountingConfigurationForm({
  record,
  isShow,
  onCancel,
  title
}: props) {
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
    >
      <Form
        layout='vertical'
        form={form}
      >
        {/* Loại giao dịch - select */}
        <Form.Item
          name='transactionType'
          label={t('internalGroup.transactionType')}
        >
          <Input />
        </Form.Item>
        {/* Nguồn tiền - select */}
        <Form.Item
          name='funds'
          label={t('internalGroup.funds')}
        >
          <Select />
        </Form.Item>

        {/* Dịch vụ - select */}
        <Form.Item
          name='service'
          label={t('internalGroup.service')}
        >
          <Select />
        </Form.Item>
        {/* Đối tác - select */}
        <Form.Item
          name='partner'
          label={t('internalGroup.partner')}
        >
          <Select />
        </Form.Item>
        {/* Ghi nợ - input */}
        {/* Loại ví - select */}
        <Form.Item
          name='walletType'
          label={t('internalGroup.walletType')}
        >
          <Select />
        </Form.Item>
        {/* Số ví điện tử - select - required */}
        <Form.Item
          name='walletNumber'
          label={t('internalGroup.walletNumber')}
          rules={[{ required: true }]}
        >
          <Select />
        </Form.Item>
        {/* hạch toán - select - required */}
        <Form.Item
          name='accounting'
          label={t('internalGroup.accounting')}
          rules={[{ required: true }]}
        >
          <Select />
        </Form.Item>
        {/* ghi có - text */}
        <Form.Item
          name='credit'
          label={t('internalGroup.credit')}
        >
          <Input />
        </Form.Item>
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

export default TransactionAccountingConfigurationForm
