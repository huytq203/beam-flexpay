import { GUTTER } from '@constants/appConstant'
import {
  useChangeCustomerPasswordMutation,
  useGetCustomerByAccountNumberQuery
} from '@services/customerService'
import { Button, Card, Col, Form, Input, notification, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Search from 'antd/es/input/Search'
// import _ from 'lodash'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function CustomerPassword() {
  const { t: trans } = useTranslation()

  const [values] = useState({
    id: 0,
    phoneNumber: null,
    accountName: null,
    password: null,
    confirmPassword: null
  })

  const [id, setId] = useState<string>('')

  const { data: customer, isLoading } = useGetCustomerByAccountNumberQuery(id, {
    skip: id === ''
  })

  const [changePassword] = useChangeCustomerPasswordMutation()

  const [form] = useForm()

  const handleConfirmReset = async (_values: any) => {
    await changePassword(_values).unwrap()
    notification.success({
      message: trans('messages.changePasswordSuccess'),
      placement: 'top'
    })
    handleConfirmCancel()
  }

  const handleConfirmCancel = () => {
    form.resetFields()
  }

  const handleChangePhoneNumber = () => {
    const val = form.getFieldValue('phoneNumber')
    if (val.length >= 4 && val.length <= 20) {
      setId(val)
    }
  }

  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        id: customer.id,
        phoneNumber: customer.phoneNumber,
        accountName: customer.fullName,
        password: '',
        confirmPassword: ''
      })
    }
  }, [customer])

  return (
    <Card title={trans('customer-password.title')}>
      <Row>
        <Col
          span={12}
          offset={6}
        >
          <Form
            form={form}
            layout='vertical'
            initialValues={values}
            onFinish={handleConfirmReset}
          >
            <Form.Item
              name='id'
              hidden
            >
              <Input />
            </Form.Item>

            <Form.Item
              label={trans('customer-password.phoneNumber')}
              name='phoneNumber'
              rules={[
                {
                  required: true,
                  message: trans(
                    'customer-password.phoneNumber-required'
                  ).toString(),
                  max: 20,
                  min: 6
                }
              ]}
            >
              <Search onSearch={handleChangePhoneNumber} />
            </Form.Item>
            <Form.Item
              label={trans('customer-password.accountName')}
              name='accountName'
            >
              <Input
                bordered={false}
                readOnly
              />
            </Form.Item>
            <Form.Item
              label={trans('customer-password.newPassword')}
              name='password'
              rules={[
                {
                  required: true,
                  message: trans(
                    'customer-password.newPassword-required'
                  ).toString()
                },
                {
                  pattern: /^(?=.*[a-zA-Z0-9]).{6,18}$/,
                  message: `${trans('messages.password-format')}`
                }
              ]}
              hasFeedback
            >
              <Input.Password />
            </Form.Item>
            <Form.Item
              label={trans('customer-password.confirmPassword')}
              name='confirmPassword'
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: trans(
                    'customer-password.confirmPassword-required'
                  ).toString(),
                  min: 6
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error(trans('customer-password.notMatch').toString())
                    )
                  }
                })
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Row
              justify='end'
              gutter={GUTTER}
            >
              <Col>
                <Form.Item>
                  <Button
                    className='btn-100'
                    onClick={handleConfirmCancel}
                  >
                    {trans('customer-password.reset')}
                  </Button>
                </Form.Item>
              </Col>
              <Col>
                <Form.Item>
                  <Button
                    className='btn-100'
                    type='primary'
                    htmlType='submit'
                    loading={isLoading}
                  >
                    {trans('customer-password.submit')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </Card>
  )
}

export default CustomerPassword
