import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { useUserLoginMutation } from '@services/cmsService'
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Typography,
  notification
} from 'antd'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import './style.scss'
import { useLazyGetUrlLoginQuery } from '@services/cmsUser'
import { COlOR } from '@components/layout/components/Navigation'

interface PayloadInterface {
  email: string
  password: string
}

function Login() {
  const [login, { isLoading }] = useUserLoginMutation()
  const [getUrlLogin] = useLazyGetUrlLoginQuery()
  const { t } = useTranslation()

  const onFinish = async (values: PayloadInterface) => {
    await login({ userLoginDto: values })
  }

  const ssoLogin = async () => {
    try {
      const res = (await getUrlLogin({})) as {
        data: { data: string; statusCode: number }
      }
      if ([200, 201].includes(res?.data?.statusCode) && res?.data?.data) {
        window.location.href = res?.data?.data
      } else {
        notification.error({ message: t`login.sso-failed` })
      }
    } catch (error) {
      notification.error({ message: t`login.sso-failed` })
    }
  }

  useEffect(() => {
    window.events.emit('auth-set-title', t('login.title').toString())
    window.events.emit('auth-set-description', t`login.description`)
  }, [])

  return (
    <Card className='wx-450 box-shadow'>
      <h1 className='mb-30'>{t`login.title`}</h1>
      <Form
        name='normal_login'
        initialValues={{
          email: '',
          password: ''
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name='email'
          rules={[
            {
              required: true,
              message: t`login.messages.email`.toString()
            }
          ]}
          normalize={(value) => value.trim()}
        >
          <Input
            prefix={<UserOutlined className='site-form-item-icon' />}
            placeholder={t`login.placeholders.email`.toString()}
          />
        </Form.Item>
        <Form.Item
          name='password'
          rules={[
            {
              required: true,
              message: t`login.messages.password`.toString()
            }
          ]}
          normalize={(value) => value.trim()}
        >
          <Input
            prefix={<LockOutlined className='site-form-item-icon' />}
            type='password'
            placeholder={t`login.placeholders.password`.toString()}
          />
        </Form.Item>
        <Row justify='end'>
          <Col>
            <Form.Item>
              <Link
                style={{ color: COlOR }}
                className='mb-24'
                to='/auth/forget-password'
              >
                {t`login.forgot-password`.toString()}
              </Link>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item className='text-center'>
          <Button
            type='primary'
            htmlType='submit'
            block
            loading={isLoading}
          >
            <b>{t`login.title`.toString()}</b>
          </Button>
        </Form.Item>
        <Divider orientation='center'>
          <Typography.Text
            italic
            disabled
          >{t`login.other`}</Typography.Text>
        </Divider>
        <Form.Item className='text-center'>
          <Button
            type='primary'
            ghost
            block
            loading={isLoading}
            onClick={ssoLogin}
          >
            <b>{t`login.ssoLogin`.toString()}</b>
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default Login
