import { openNotification } from '@configs/fetchBaseQueryCustom'
import { GUTTER } from '@constants/appConstant'
import { useCreateInternalWalletGroupMutation } from '@services/apiInternalWallet'
import { Button, Col, Form, Input, Row, Spin } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { useEffect, useState } from 'react'
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

  const [createInternalWalletGroup] = useCreateInternalWalletGroupMutation()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (value: any) => {
    try {
      setLoading(true)
      const response = await createInternalWalletGroup(value) as {data: {statusCode: number}}
      if(response.data.statusCode === 201 ||  response.data.statusCode === 200 ){
        openNotification(t`internal-wallet.messages.create-group-success`, 'success')
        onCancel()
      } else {
        openNotification(t`internal-wallet.messages.create-group-failed`, 'error')
      }
    } catch (err) {
      openNotification(t`internal-wallet.messages.create-group-failed`, 'error')
    } finally {
      setLoading(false)
    }
  }

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
      <Spin spinning={loading}>
      <Form
        layout='vertical'
        form={form}
        initialValues={{ walletType: 'Ví nội bộ' }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='walletType'
          label={t('internal-wallet.walletType')}
        >
          <Input readOnly />
        </Form.Item>
        {/* Nhóm ví */}
        <Form.Item
          name='group_number'
          label={t('internal-wallet.groupType')}
        >
          <Input
            placeholder={t`internal-wallet.placeholders.group_id`.toString()}
          />
        </Form.Item>
        {/* Tên nhóm */}
        <Form.Item
          label={t('internal-wallet.groupName')}
          name='name'
        >
          <Input
            placeholder={t`internal-wallet.placeholders.group_name`.toString()}
          />
        </Form.Item>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
              loading={loading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              htmlType='submit'
              loading={loading}
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form>
      </Spin>
    </Modal>
  )
}

export default InternalGroupForm
