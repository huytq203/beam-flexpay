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
      >
        {/* Loại ví */}
        <Form.Item
          name='walletType'
          label={t('internalGroup.walletType')}
        >
          <Input />
        </Form.Item>
        {/* Nhóm ví */}
        <Form.Item
          name='groupType'
          label={t('internalGroup.groupType')}
        >
          <Select />
        </Form.Item>
        {/* Tên nhóm ví */}
        <Form.Item
          name='groupType'
          label={t('internalGroup.groupType')}
        >
          <Input />
        </Form.Item>
        {/* Số ví nội bộ */}
        <Form.Item
          label={t('internalGroup.walletNumber')}
          name='walletNumber'
        >
          <Input />
        </Form.Item>
        {/* Tên ví nội bộ */}
        <Form.Item
          label={t('internalGroup.walletName')}
          rules={[
            {
              required: true,
              message: t('internalGroup.groupNameRequired').toString()
            },
            {
              min: 5,
              message: t('internalGroup.groupNameMin').toString()
            },
            {
              max: 20,
              message: t('internalGroup.groupNameMax').toString()
            }
          ]}
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

export default InternalWalletForm
