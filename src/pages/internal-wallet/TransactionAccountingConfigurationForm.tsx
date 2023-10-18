import { GUTTER } from '@constants/appConstant'
import { Button, Col, Divider, Form, Input, Modal, Row, Select, Typography } from 'antd'
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

  const handleSubmit = () => { }

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
      width={1000}
    >
      <Form
        layout='vertical'
        form={form}
      >
        {/* Loại giao dịch - select */}
        <Form.Item
          name='transactionType'
          label={t('internal-wallet.modal.transactionType')}
        >
          <Input />
        </Form.Item>
        {/* Nguồn tiền - select */}
        <Form.Item
          name='funds'
          label={t('internal-wallet.modal.funds')}
        >
          <Select />
        </Form.Item>

        {/* Dịch vụ - select */}
        <Form.Item
          name='service'
          label={t('internal-wallet.modal.service')}
        >
          <Select />
        </Form.Item>
        {/* Đối tác - select */}
        <Form.Item
          name='partner'
          label={t('internal-wallet.modal.partner')}
        >
          <Select />
        </Form.Item>
        {/* Ghi nợ - input */}
        {/* Loại ví - select */}
        <Row gutter={GUTTER}>
          <Col xs={24} lg={12}>
            <div>
              <Typography.Text style={{ fontWeight: 600, fontSize: 14 }}>{t('internal-wallet.modal.debit')}</Typography.Text>
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            </div>
            <Form.Item
              name='walletType'
              label={t('internal-wallet.modal.walletType')}
            >
              <Select />
            </Form.Item>
            {/* Số ví điện tử - select - required */}
            <Form.Item
              name='walletNumber'
              label={t('internal-wallet.modal.walletNumber')}
              rules={[{ required: true }]}
            >
              <Select />
            </Form.Item>
            {/* hạch toán - select - required */}
            <Form.Item
              name='accounting'
              label={t('internal-wallet.modal.accounting')}
              rules={[{ required: true }]}
            >
              <Select />
            </Form.Item>
          </Col>
          <Col xs={24} lg={12}>
            <div>
              <Typography.Text style={{ fontWeight: 600, fontSize: 14 }}>{t('internal-wallet.modal.credit')}</Typography.Text>
              <Divider style={{ marginTop: 8, marginBottom: 8 }} />
            </div>
            <Form.Item
              name='walletType'
              label={t('internal-wallet.modal.walletType')}
            >
              <Select />
            </Form.Item>
            {/* Số ví điện tử - select - required */}
            <Form.Item
              name='walletNumber'
              label={t('internal-wallet.modal.walletNumber')}
              rules={[{ required: true }]}
            >
              <Select />
            </Form.Item>
            {/* hạch toán - select - required */}
            <Form.Item
              name='accounting'
              label={t('internal-wallet.modal.accounting')}
              rules={[{ required: true }]}
            >
              <Select />
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

export default TransactionAccountingConfigurationForm
