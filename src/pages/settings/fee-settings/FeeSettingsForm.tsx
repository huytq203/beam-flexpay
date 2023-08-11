import { GUTTER } from '@constants/appConstant'
import { feeSettingsKey } from '@constants/options'
import { useSystemSettingCreateMutation as fnCreateMutation } from '@services/cmsSetting'
import { CreateSystemSettingDto, SystemSetting } from '@type/application'
import { Button, Col, Form, Modal, Row, Select, notification } from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

type props = {
  isShow: boolean
  onCancel: VoidFunction
  mode: 'add' | 'update'
  record?: SystemSetting
}

const FeeSettingsForm = ({ isShow, onCancel, mode, record }: props) => {
  const { t } = useTranslation()
  const [form] = Form.useForm<CreateSystemSettingDto>()
  const [fnCreate] = fnCreateMutation()

  const handleSubmit = async (value: CreateSystemSettingDto) => {
    try {
      const payload = await fnCreate({ createSystemSettingDto: value }).unwrap()
      if (payload) {
        notification.success({
          message: t('labels.update', { name: t('labels.fee-form') }),
          placement: 'top'
        })
        onCancel()
      }
    } catch (error) {
      console.error('rejected', error)
    }
  }

  useEffect(() => {
    form.resetFields()
    if (record && mode === 'update') {
      form.setFieldValue('key', record.key)
      form.setFieldValue('value', record.value)
    }
  }, [record])

  return (
    <Modal
      open={isShow}
      footer={null}
      onCancel={onCancel}
      width={800}
      maskClosable={false}
      centered
    >
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='key'
          label={t('labels.key')}
        >
          <Select
            disabled={mode === 'update'}
            options={feeSettingsKey}
          />
        </Form.Item>
        <Form.Item
          name='value'
          label={t('labels.value')}
        >
          <ReactQuill
            theme='snow'
            value={form.getFieldValue('value')}
            onChange={(value) => form.setFieldValue('value', value)}
          >
            <div className='hx-190' />
          </ReactQuill>
        </Form.Item>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              className='btn-100'
              onClick={onCancel}
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              className='btn-100'
              type='primary'
              htmlType='submit'
            >
              {t('buttons.save')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}
export default FeeSettingsForm
