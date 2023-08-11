import { MailOutlined } from '@ant-design/icons'
import { GUTTER } from '@constants/appConstant'
import { Button, Card, Col, Descriptions, Form, Input, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import './style.scss'

function ForgotPassword() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = useForm()

  const handleSubmit = () => {
    navigate('/auth/reset-password')
  }

  const handleCancel = () => {
    navigate('/auth/login')
  }

  useEffect(() => {
    window.events.emit('auth-set-title', t('forgot.subtitle').toString())
    window.events.emit('auth-set-description', '')
  }, [])

  return (
    <Card className='mw-400'>
      <Descriptions title={t`forgot.subtitle`}>
        <Descriptions.Item>{t`forgot.sub-description`}</Descriptions.Item>
      </Descriptions>
      <Form
        layout='vertical'
        onFinish={handleSubmit}
        form={form}
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
          className='mt-10'
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
    </Card>
  )
}

export default ForgotPassword
