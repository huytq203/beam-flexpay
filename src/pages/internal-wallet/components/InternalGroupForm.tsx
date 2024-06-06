import { openNotification } from '@configs/fetchBaseQueryCustom'
import { GUTTER } from '@constants/appConstant'
import {
  useCreateInternalWalletGroupMutation,
  useUpdateInternalWalletGroupMutation
} from '@services/apiInternalWallet'
import { viewMode } from '@type/customer'
import { blockArrowValue, blockLetterDecimal } from '@utils/helperFunctions'
import { Button, Col, Form, Input, Popconfirm, Row, Spin } from 'antd'
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
      console.log('mode === viewMode.create', mode === viewMode.create)

      const response =
        mode === viewMode.create
          ? ((await createInternalWalletGroup(value)) as {
              data: { statusCode: number }
            })
          : ((await updateInternalWalletGroup({
              name: value.name,
              id: group?.id
            })) as { data: { statusCode: number } })
      if (
        response.data.statusCode === 201 ||
        response.data.statusCode === 200
      ) {
        openNotification(
          mode === viewMode.create
            ? t`internal-wallet.messages.create-group-success`
            : t`internal-wallet.messages.update-group-success`,
          'success'
        )
        onCancel()
      } else {
        openNotification(
          mode === viewMode.create
            ? t`internal-wallet.messages.create-group-failed`
            : t`internal-wallet.messages.update-group-failed`,
          'error'
        )
      }
    } finally {
      setLoading(false)
      form.resetFields()
    }
  }

  const walletGroupValue = Form.useWatch('walletGroup', {
    form,
    preserve: true
  })
  const nameValue = Form.useWatch('name', { form, preserve: true })

  const onCancelModal = () => {
    if (walletGroupValue && nameValue) {
      Modal.confirm({
        title: "Hủy thêm mới nhóm tài khoản",
        content: t`internal-wallet.messages.confirm-cancel-create-group`,
        okText: t`buttons.yes`,
        cancelText: t`buttons.no`,
        onOk: () => {
          onCancel()
        }
      })
    } else {
      onCancel()
    }
  }

  useEffect(() => {
    if (mode === viewMode.update && group && group?.id)
      form.setFieldsValue(group)
    if (mode !== viewMode.update || !isShow) form.resetFields()
  }, [group, mode])

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
            <Input
              readOnly
              disabled={mode === viewMode.update}
            />
          </Form.Item>
          {/* Nhóm ví */}
          <Form.Item
            name='walletGroup'
            label={t('internal-wallet.groupType')}
            rules={[
              {
                required: true,
                message:
                  t`internal-wallet.messages.group-type-required`.toString()
              },
              {
                validator: (_, value) =>
                  isNaN(value)
                    ? Promise.reject(
                        t`internal-wallet.messages.numeric-group-number`.toString()
                      )
                    : Promise.resolve()
              }
            ]}
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
            rules={[
              {
                required: true,
                message:
                  t`internal-wallet.messages.group-name-required`.toString()
              }
            ]}
          >
            <Input
              placeholder={t`internal-wallet.placeholders.group_name`.toString()}
              onBlur={() => {
                form.setFieldsValue({
                  name: form.getFieldValue('name')?.trim()
                })
              }}
            />
          </Form.Item>
          <Row
            justify='end'
            gutter={GUTTER}
          >
            <Col>
              <Form.Item shouldUpdate>
                <Button
                  className='btn-100'
                  loading={loading}
                  onClick={onCancelModal}
                >
                  {t('buttons.cancel')}
                </Button>
              </Form.Item>
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
