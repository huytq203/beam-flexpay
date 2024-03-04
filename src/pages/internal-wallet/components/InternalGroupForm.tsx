import { openNotification } from '@configs/fetchBaseQueryCustom'
import { GUTTER } from '@constants/appConstant'
import { useCreateInternalWalletGroupMutation, useUpdateInternalWalletGroupMutation } from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import { blockArrowValue, blockLetterDecimal } from '@utils/helperFunctions'
import { Button, Col, Form, Input, Row, Spin } from 'antd'
import Modal from 'antd/es/modal/Modal'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  onCancel: VoidFunction
  mode: viewMode
  group?: any
  isShow: boolean
}

function InternalGroupForm({ group, onCancel, title, mode, isShow }: props) {
  const { t } = useTranslation()
  const [form] = Form.useForm()

  const [createInternalWalletGroup] = useCreateInternalWalletGroupMutation()
  const [updateInternalWalletGroup] = useUpdateInternalWalletGroupMutation()

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (value: any) => {
    try {
      setLoading(true)
      console.log('mode === viewMode.create', mode === viewMode.create);

      const response = mode === viewMode.create ? await createInternalWalletGroup(value) as { data: { statusCode: number } } : await updateInternalWalletGroup({ name: value.name, id: group?.id }) as { data: { statusCode: number } }
      if (response.data.statusCode === 201 || response.data.statusCode === 200) {
        openNotification(mode === viewMode.create ? t`internal-wallet.messages.create-group-success` : t`internal-wallet.messages.update-group-success`, 'success')
        onCancel()
      } else {
        openNotification(mode === viewMode.create ? t`internal-wallet.messages.create-group-failed` : t`internal-wallet.messages.update-group-failed`, 'error')
      }
    } finally {
      setLoading(false)
      form.resetFields();
    }
  }

  useEffect(() => {
    if (mode === viewMode.update && group && group?.id) form.setFieldsValue(group)
    if (mode !== viewMode.update || !isShow) form.resetFields()
  }, [group, mode])

  useEffect(() => {
    console.log("form", mode)
  }, [mode])

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      destroyOnClose
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
            <Input readOnly disabled={mode === viewMode.update} />
          </Form.Item>
          {/* Nhóm ví */}
          <Form.Item
            name='walletGroup'
            label={t('internal-wallet.groupType')}
          >
            <Input
              disabled={mode === viewMode.update}
              readOnly={mode === viewMode.update}
              placeholder={t`internal-wallet.placeholders.group_id`.toString()}
              type='text'
              inputMode='numeric'
              style={{ width: '100%' }}
              onKeyDown={blockArrowValue}
              onKeyPress={blockLetterDecimal}
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
