import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { useCreateAccountMutation } from '@services/customerService'
import { districts, provinces, village } from '@utils/location'
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  notification,
  Row,
  Select
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type ILocation = {
  label: string
  value: number
  parent?: ILocation
}

function CustomerForm() {
  const { t: trans } = useTranslation()

  const [form] = useForm()
  const [createAccount] = useCreateAccountMutation()
  const [province, setProvince] = useState<ILocation | undefined>(undefined)
  const [district, setDistrict] = useState<ILocation | undefined>(undefined)

  const handleChangeProvince = (value: any, option: any) => {
    setProvince(option)
    setDistrict(undefined)
    form.setFieldValue('district', null)
    form.setFieldValue('village', null)
  }

  const handleChangeDistrict = (value: any, option: any) => {
    setDistrict(option)
    form.setFieldValue('village', null)
  }

  const handleReset = () => {
    form.resetFields()
  }

  const handleCreate = async (value: any) => {
    const data = {
      ...value,
      district: district?.label,
      province: province?.label,
      village: value.village.label
    }
    const res = await createAccount(data)
    if ((res as any)?.data?.id) {
      notification.success({ message: trans('messages.createAccountSuccess') })
    }
  }

  return (
    <Form
      className='form-account'
      layout='vertical'
      form={form}
      initialValues={{
        accountType: 'personal',
        province: '',
        district: '',
        phoneNumber: '',
        village: ''
      }}
      onFinish={handleCreate}
      autoComplete='off'
    >
      <Row gutter={GUTTER}>
        <Col span={24}>
          <h1>{trans('labels.createAccount')}</h1>
        </Col>
        <Col span={12}>
          <Form.Item
            name='accountType'
            label={trans('labels.accountType')}
          >
            <Select disabled>
              <Select.Option value='personal'>
                {trans('labels.personalAccount')}
              </Select.Option>
              <Select.Option value='business'>
                {trans('labels.businessAccount')}
              </Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='phoneNumber'
            label={trans('labels.phone')}
            rules={[
              {
                required: true,
                message: `${trans('messages.phoneRequired')}`
              }
            ]}
          >
            <Input placeholder={trans('placeholders.phone').toString()} />
          </Form.Item>
          <Form.Item
            name='fullName'
            label={trans('labels.accountName')}
            rules={[
              {
                required: true,
                message: `${trans('messages.accountNameRequired')}`
              }
            ]}
          >
            <Input
              placeholder={trans('placeholders.accountName').toString()}
              autoComplete='off'
            />
          </Form.Item>
          <Form.Item
            name='email'
            label={trans('labels.email')}
            rules={[
              {
                type: 'email',
                required: true,
                message: `${trans('messages.emailRequired')}`
              }
            ]}
          >
            <Input
              placeholder={trans('placeholders.email').toString()}
              autoComplete='off'
            />
          </Form.Item>
          <Form.Item
            name='birthDay'
            label={trans('labels.dateOfBirth')}
          >
            <DatePicker
              className='w-100'
              format={TimeFormat}
              allowClear
              placeholder={trans('placeholders.dateOfBirth').toString()}
            />
          </Form.Item>
          <Form.Item
            name='password'
            label={trans('labels.password')}
            rules={[
              {
                required: true,
                message: `${trans('messages.passwordRequired')}`
              },
              {
                pattern: /^(?=.*[a-zA-Z0-9]).{6,18}$/,
                message: `${trans('messages.password-format')}`
              }
            ]}
          >
            <Input.Password
              placeholder={trans('placeholders.password').toString()}
              autoComplete='off'
            />
          </Form.Item>
          <Form.Item
            name='matchPassword'
            label={trans('labels.passwordConfirm')}
            rules={[
              {
                required: true,
                message: `${trans('messages.passwordRequired')}`
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(
                    trans('messages.passowrdMatchConfirmPassword')
                  )
                }
              })
            ]}
          >
            <Input.Password
              placeholder={trans('placeholders.passwordConfirm').toString()}
              autoComplete='off'
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='identityNumber'
            label={trans('labels.IdNumber')}
            rules={[
              {
                required: true,
                message: `${trans('messages.idNumberRequired')}`
              }
            ]}
          >
            <Input placeholder={trans('placeholders.IdNumber').toString()} />
          </Form.Item>
          <Form.Item
            name='dateOfIdentityIssuance'
            label={trans('labels.dateOfIdNumber')}
          >
            <DatePicker
              format={TimeFormat}
              allowClear
              className='w-100'
              placeholder={trans('placeholders.dateOfIdNumber').toString()}
            />
          </Form.Item>
          <Form.Item
            name='placeOfIdentityIssuance'
            label={trans('labels.placeOfIdNumber')}
          >
            <Input
              placeholder={trans('placeholders.placeOfIdNumber').toString()}
            />
          </Form.Item>
          <Form.Item
            name='address'
            label={trans('labels.address')}
          >
            <Input placeholder={trans('placeholders.address').toString()} />
          </Form.Item>
          <Form.Item
            name='province'
            label={trans('labels.province')}
          >
            <Select
              placeholder={trans('placeholders.province')}
              options={provinces}
              onChange={handleChangeProvince}
              labelInValue={true}
            />
          </Form.Item>
          <Form.Item
            name='district'
            label={trans('labels.district')}
          >
            <Select
              placeholder={trans('placeholders.district')}
              options={districts.filter(
                (s: any) => s.parent.value === province?.value
              )}
              onChange={handleChangeDistrict}
              disabled={!province?.value}
              labelInValue={true}
            />
          </Form.Item>
          <Form.Item
            name='village'
            label={trans('labels.ward')}
          >
            <Select
              placeholder={trans('placeholders.ward')}
              options={village.filter(
                (v) => v.parent.value === district?.value
              )}
              disabled={!district}
              labelInValue={true}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Row
            gutter={GUTTER}
            justify='end'
          >
            <Col>
              <Button
                className='btn-100'
                onClick={handleReset}
              >
                {trans('buttons.cancel')}
              </Button>
            </Col>
            <Col>
              <Button
                className='btn-100'
                type='primary'
                htmlType='submit'
              >
                {trans('buttons.create')}
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
  )
}

export default CustomerForm
