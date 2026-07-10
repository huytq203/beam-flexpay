import { LockOutlined } from '@ant-design/icons'
import { GUTTER } from '@constants/appConstant'
import { Button, Card, Col, Form, Input, notification, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import './style.css'
import { useUserNewPasswordMutation, useUserVerifyTokenMutation } from '@services/cmsService'
import { PATHS } from '@constants/pathConstant'

const ResetPassword = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form] = useForm()
  const [searchParams] = useSearchParams()
  const [newPassword] = useUserNewPasswordMutation()
  const [validateResetToken] = useUserVerifyTokenMutation()

  const handleCancel = () => {
    navigate(PATHS.AUTH.FORGOT_PASSWORD)
  }
  const handleSubmit = async () => {
    const password = form.getFieldValue('password')
    const confirmPassword = form.getFieldValue('confirmPassword')
    const token = searchParams.get('token')

    if (!token) {
      notification.error({ message: t('reset.messages.tokenMissing') })
      return
    }

    if (password !== confirmPassword) {
      notification.error({ message: t('reset.messages.passwordMismatch') })
      return
    }

    try {
      const result = await newPassword({ token, userNewPassword: { newPassword: password } })

      if ('data' in result && result.data) {
        notification.success({
          message: t('reset.messages.passwordResetSuccess')
        })
        navigate(PATHS.AUTH.LOGIN)
      } else {
        notification.error({ message: t('reset.messages.passwordResetFailed') })
      }
    } catch (error) {
      notification.error({ message: t('reset.messages.passwordResetError') })
    }
  }

  useEffect(() => {
    window.events.emit('auth-set-title', t('reset.title').toString())
    window.events.emit('auth-set-description', t`reset.sub-description`)
  }, [])

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      validateResetToken({ token })
        .unwrap()
        .then(() => { })
        .catch(() => {
          notification.error({ message: t('reset.messages.tokenInvalid') })
          navigate(PATHS.AUTH.FORGOT_PASSWORD)
        })
    } else {
      notification.error({ message: t('reset.messages.tokenMissing') })
      navigate(PATHS.AUTH.FORGOT_PASSWORD)
    }
  }, [searchParams])

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
