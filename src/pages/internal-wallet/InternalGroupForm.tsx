import { GUTTER } from '@constants/appConstant'
import { Button, Col, Form, Input, Row } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: any | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function InternalGroupForm({ record, isShow, onCancel, title }: props) {
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
          <Input />
        </Form.Item>
        {/* Tên nhóm */}
        <Form.Item
          label={t('internalGroup.groupName')}
          name='groupName'
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

export default InternalGroupForm
