import { LockOutlined } from '@ant-design/icons'
import { GUTTER } from '@constants/appConstant'
import { Button, Card, Col, Form, Input, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import { useEffect } from 'react'
import './style.scss'

const ResetPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = useForm()
  const handleCancel = () => {
    navigate('/auth/forgot-password')
  }
  const handleSubmit = () => {}

  useEffect(() => {
    window.events.emit('auth-set-title', t('reset.title').toString())
    window.events.emit('auth-set-description', t`reset.sub-description`)
  }, [])

  return (
    <Card className='wx-450'>
      <Form
        layout='vertical'
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          name='password'
          label={t('reset.password')}
          rules={[
            {
              required: true,
              message: t`reset.messages.passwordConfirm`.toString()
            }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className='site-form-item-icon' />}
            placeholder={t`reset.placeholders.password`.toString()}
          />
        </Form.Item>
        <Form.Item
          name='confirmPassword'
          label={t('reset.confirmPassword')}
          rules={[
            { required: true, message: t`reset.messages.password`.toString() },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(t('reset.messages.password'))
              }
            })
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className='site-form-item-icon' />}
            placeholder={t`reset.placeholders.passwordConfirm`.toString()}
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
                style={{ width: '100px' }}
              >
                {t('reset.cancel')}
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
                {t('reset.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default ResetPassword
