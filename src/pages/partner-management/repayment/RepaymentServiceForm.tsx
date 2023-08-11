import FileUpload from '@components/upload/FileUpload'
import { openNotification } from '@configs/fetchBaseQueryCustom'
import { GUTTER } from '@constants/appConstant'
import { PARTNER_TYPE_OPTIONS } from '@constants/partnerOptions'
import {
  usePaymentServiceCreateMutation,
  usePaymentServiceUpdateMutation
} from '@services/cmsPaymentService'
import { PaymentServiceDetailDto } from '@type/application'
import { Button, Col, Form, Input, Modal, Row, Select } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

type props = {
  title: string
  record?: PaymentServiceDetailDto | undefined
  isShow: boolean
  onCancel: VoidFunction
}

function RepaymentServiceForm({ record, isShow, onCancel, title }: props) {
  const { t } = useTranslation()
  const [form] = useForm<PaymentServiceDetailDto>()

  const [create, { isLoading: createLoading }] =
    usePaymentServiceCreateMutation()
  const [update, { isLoading: updateLoading }] =
    usePaymentServiceUpdateMutation()

  const onSubmit = async () => {
    const record = form.getFieldsValue()
    var formdata = new FormData()
    if (form.getFieldValue('file'))
      formdata.append(
        'file',
        form.getFieldValue('file').originFileObj,
        form.getFieldValue('file').name
      )
    formdata.append('name', record.name)
    formdata.append('type', record.type)
    formdata.append('active', String(record.active))

    if (record.id) {
      update({ id: record.id, formData: formdata })
        .unwrap()
        .then(() => {
          openNotification(t('messages.update-success'), 'success')
          onCancel()
        })
    } else {
      await create(formdata)
        .unwrap()
        .then(() => {
          openNotification(t('messages.create-success'), 'success')
          onCancel()
        })
    }
  }

  useEffect(() => {
    if (isShow && record && record.id) {
      form.setFieldsValue({
        id: record.id,
        name: record.name,
        active: record.active,
        logo: record.logo,
        type: record.type
      })
    }
    if (!isShow) {
      form.resetFields()
    }
  }, [isShow, record])

  return (
    <Modal
      open={isShow}
      footer={null}
      title={title}
      onCancel={onCancel}
      maskClosable={false}
    >
      <Form
        layout='vertical'
        form={form}
      >
        <Form.Item
          hidden={true}
          name='id'
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('payment-service.name')}
          name='name'
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={t('payment-service.type')}
          name='type'
        >
          <Select options={PARTNER_TYPE_OPTIONS} />
        </Form.Item>
        <Form.Item
          label={t('labels.active')}
          name='active'
        >
          <Select
            defaultValue={true}
            options={[
              {
                label: t('labels.active'),
                value: true
              },
              {
                label: t('labels.inactivated'),
                value: false
              }
            ]}
          />
        </Form.Item>
        <Form.Item
          name='file'
          label={t('partner.logo')}
        >
          <FileUpload
            fileSelect={(file) => form.setFieldValue('file', file)}
            preview={record?.logo}
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
              loading={createLoading || updateLoading}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              onClick={onSubmit}
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

export default RepaymentServiceForm
