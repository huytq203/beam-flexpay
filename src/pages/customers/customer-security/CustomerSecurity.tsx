import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
import { useCustomerGetSecurityMethodQuery } from '@services/cmsCustomer'
import { useChangeSecuritySettingMutation } from '@services/customerService'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function CustomerSecurity() {
  const { t: trans } = useTranslation()

  const OTPOptions = [
    {
      label: trans('customer-security.EMAIL_OTP'),
      value: 'EMAIL_OTP'
    },
    {
      label: trans('customer-security.SMS_OTP'),
      value: 'SMS_OTP'
    },
    {
      label: trans('customer-security.SMART_OTP'),
      value: 'SMART_OTP'
    },
    {
      label: trans('customer-security.OTHER'),
      value: 'OTHER'
    }
  ]

  const [values] = useState({
    id: null,
    phoneNumber: null,
    accountName: null,
    currentOtp: null,
    usageLimit: null
  })

  const [id, setId] = useState<string>('')

  const { data: customer, isLoading } = useCustomerGetSecurityMethodQuery(
    { accountNumber: id },
    {
      skip: id === ''
    }
  )

  const [search, setSearch] = useState<string>()

  const [changeOTP] = useChangeSecuritySettingMutation()

  const [security] = useForm()

  const handleConfirmUpdate = (values: any) => {
    Modal.confirm({
      title: trans('customer-security.confirm.update.title'),
      content: trans('customer-security.confirm.update.content'),
      onOk: () => handleUpdate(values),
      okText: trans('buttons.ok'),
      cancelText: trans('buttons.cancel'),
      type: 'info'
    })
  }

  const onConfirmCancel = () => {
    Modal.confirm({
      title: trans('customer-security.confirm.cancel.title'),
      content: trans('customer-security.confirm.cancel.content'),
      onOk: onCancel,
      okText: trans('buttons.ok'),
      cancelText: trans('buttons.cancel'),
      type: 'warning'
    })
  }

  const onCancel = () => {
    security.resetFields()
  }

  const handleUpdate = async (values: any) => {
    const record = {
      accountNumber: values.phoneNumber,
      method: values.newOtp,
      usageLimit: +String(values.usageLimit)
        .replaceAll('.', '')
        .replaceAll('_', '')
    }
    await changeOTP(record).unwrap()
  }

  const handleChangePhoneNumber = () => {
    if (search && search.length >= 10 && search.length <= 12) {
      setId(search)
    }
  }

  useEffect(() => {
    if (customer) {
      security.setFieldsValue({
        id: customer.id,
        phoneNumber: customer.phoneNumber,
        accountName: customer.accountName,
        currentOtp: customer.securityMethod,
        usageLimit: customer.usageLimit
      })
    }
  }, [customer])

  return (
    <Card
      title={
        <SearchBar
          headerMenu={
            <Row
              gutter={GUTTER}
              justify='center'
            >
              <Col span={10}>
                <Input
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      setSearch(e.target.value)
                    }
                  }}
                  placeholder={trans('placeholders.phone').toString()}
                  className='w-100'
                />
              </Col>
              <Col span={2}>
                <ButtonSearch onClick={handleChangePhoneNumber} />
              </Col>
            </Row>
          }
        />
      }
    >
      <Row>
        <Col span={12}>
          <Form
            form={security}
            initialValues={values}
            onFinish={handleConfirmUpdate}
            labelCol={{ style: { width: '250px', textAlign: 'left' } }}
          >
            <Form.Item
              label={trans('customer-security.accountName')}
              name='accountName'
            >
              <Input
                bordered={false}
                disabled
              />
            </Form.Item>
            <Form.Item
              label={trans('customer-security.otp')}
              name='currentOtp'
            >
              <Select
                options={OTPOptions}
                disabled
                bordered={false}
                suffixIcon={<></>}
              />
            </Form.Item>
            <Form.Item
              label={trans('customer-security.newOtp')}
              name='newOtp'
              rules={[
                {
                  required: true,
                  message: trans('customer-security.newOTP-required').toString()
                }
              ]}
            >
              <Select options={OTPOptions} />
            </Form.Item>
            <Form.Item
              label={trans('customer-security.usageLimit')}
              name='usageLimit'
              rules={[
                {
                  required: true,
                  message: trans(
                    'customer-security.usageLimit-required'
                  ).toString()
                }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
              />
            </Form.Item>
            <Row
              justify='end'
              gutter={GUTTER}
            >
              <Col>
                <Form.Item>
                  <Button
                    className='btn-100'
                    onClick={onConfirmCancel}
                  >
                    {trans('customer-security.reset')}
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
                    {trans('customer-security.submit')}
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

export default CustomerSecurity
