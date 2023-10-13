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

function InternalWalletForm({ record, isShow, onCancel, title }: props) {
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
        initialValues={{walletType: "Ví nội bộ"}}
      >
        {/* Loại ví */}
        <Form.Item
          name='walletType'
          label={t('internal-wallet.walletType')}
        >
          <Input readOnly />
        </Form.Item>
        {/* Nhóm ví */}
        <Form.Item
          name='groupType'
          label={t('internal-wallet.groupType')}
        >
          <Select placeholder={t`internal-wallet.placeholders.group_id`.toString()}/>
        </Form.Item>
        {/* Tên nhóm ví */}
        <Form.Item
          name='groupType'
          label={t('internal-wallet.groupNameTitle')}
        >
          <Input placeholder={t`internal-wallet.placeholders.group_name`.toString()} />
        </Form.Item>
        {/* Số ví nội bộ */}
        <Form.Item
          label={t('internal-wallet.walletNumber')}
          name='walletNumber'
        >
          <Input  placeholder={t`internal-wallet.placeholders.wallet_number`.toString()}/>
        </Form.Item>
        {/* Tên ví nội bộ */}
        <Form.Item
          label={t('internal-wallet.walletName')}
          rules={[
            {
              required: true,
              message: t('internal-wallet.groupNameRequired').toString()
            },
            {
              min: 5,
              message: t('internal-wallet.groupNameMin').toString()
            },
            {
              max: 20,
              message: t('internal-wallet.groupNameMax').toString()
            }
          ]}
        >
          <Input placeholder={t`internal-wallet.placeholders.wallet_name`.toString()} />
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

export default InternalWalletForm
