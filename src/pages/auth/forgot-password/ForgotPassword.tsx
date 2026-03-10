import { MailOutlined } from '@ant-design/icons'
import { GUTTER } from '@constants/appConstant'
import { Button, Card, Col, Descriptions, Form, Input, Row, notification } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useUserForgotPasswordMutation } from '@services/cmsService'; // Import mutation

import './style.scss'

function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = useForm()
  const [forgotPassword] = useUserForgotPasswordMutation()

  const handleSubmit = async () => {
    const email = form.getFieldValue('email')
    if (!email) {
      notification.error({ message: t('forgot.messages.missingEmail') }); // Thông báo nếu không có email
      return;
    }

    try {
      const result = await forgotPassword({userForgotPassword: {email}}); // Gọi API gửi email

      if ('data' in result && result.data) {
        notification.success({ message: t('forgot.messages.forgotPasswordSuccess') }); // Thông báo thành công
      }
    } catch (error) {
      notification.error({ message: t('forgot.messages.forgotPasswordError') }); // Thông báo lỗi
    }
  }

  const handleCancel = () => {
    navigate('/auth/login')
  }

  useEffect(() => {
    window.events.emit('auth-set-title', t('forgot.subtitle').toString())
    window.events.emit('auth-set-description', '')
  }, [])

  return (
    <div className='mx-6 border p-3 rounded-lg bg-white'>

      <span>{t`forgot.sub-description`}</span>
      <Form
        layout='vertical'
        onFinish={handleSubmit}
        form={form}
        className='mt-3'
      >
        <Form.Item
          label=''
          name='email'
          rules={[
            { required: true, message: t`forgot.messages.email`.toString() },
            {
              pattern: new RegExp(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
              message: t('messages.emailCorrectFormat').toString()
            }
          ]}
        >
          <Input
            prefix={<MailOutlined className='site-form-item-icon' />}
            placeholder={t`forgot.placeholders.email`.toString()}
          />
        </Form.Item>
        <Row
          gutter={GUTTER}
          justify='end'
        >
          <Col>
            <Form.Item>
              <Button
                onClick={handleCancel}
                block
                style={{ width: '100px' }}
              >
                {t('forgot.cancel')}
              </Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item>
              <Button
                htmlType='submit'
                type='primary'
                style={{ width: '100px' }}
              >
                {t('forgot.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  )
}

export default ForgotPassword
