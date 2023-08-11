import { GUTTER } from '@constants/appConstant'
import { useAppSelector } from '@hooks/hook'
import {
  useUserChangePasswordMutation,
  useUserGetUserOtpMutation
} from '@services/cmsService'
import { CustomModalProps } from '@type/api'
import { IChangePassword } from '@type/auth'
import { Button, Col, Form, Input, Modal, Row, notification } from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

function EmployeePassword(props: CustomModalProps) {
  const { onClose, open } = props
  const { t } = useTranslation()
  const [form] = useForm()
  const { profile } = useAppSelector((state) => state.auth)
  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [disabled, setDisabled] = useState<boolean>(true)

  const [changePassword] = useUserChangePasswordMutation()
  const [getOTP] = useUserGetUserOtpMutation()

  const handleChangePassword = async () => {
    const record: IChangePassword = {
      trackingId: trackingId || '',
      password: form.getFieldValue('currentPassword'),
      newPassword: form.getFieldValue('newPassword'),
      otpCode: form.getFieldValue('otp')
    }
    await changePassword({
      changeUserPasswordDto: record
    }).unwrap()
    notification.success({ message: t('messages.changePasswordSuccess') })
    form.resetFields()
    onClose()
  }

  const handleClose = () => {
    form.resetFields()
    onClose()
  }

  const handleGetOTP = async () => {
    const otp = await getOTP({
      adminGetOtp: {
        email: profile.email,
        action: 'ADMIN_CHANGE_PASSWORD'
      }
    }).unwrap()
    if (otp) {
      setTrackingId(otp.trackingId)
    }
  }

  const handleValuesChange = (
    changeValue: any,
    values: Record<string, string>
  ) => {
    if (
      values['currentPassword'] &&
      values['newPassword'] &&
      values['confirmPassword'] &&
      values['otp'] &&
      trackingId !== null
    ) {
      setDisabled(false)
    } else {
      setDisabled(true)
    }
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open])

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      title={t('employee.changePassword')}
      footer={null}
      centered
      maskClosable={false}
      getContainer={false}
    >
      <Form
        layout='vertical'
        className='w-100'
        initialValues={{
          currentPassword: null,
          newPassword: null,
          confirmPassword: null,
          otp: null
        }}
        onValuesChange={handleValuesChange}
        form={form}
      >
        <Form.Item
          name='currentPassword'
          label={t('employee.currentPassword')}
          rules={[
            {
              required: true,
              message: t('employee.password-required').toString()
            },
            {
              pattern: /^(?=.*[a-zA-Z0-9]).{6,18}$/,
              message: `${t('messages.password-format')}`
            }
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name='newPassword'
          label={t('employee.newPassword')}
          rules={[
            {
              required: true,
              message: t('employee.newPassword-required').toString()
            },
            {
              pattern: /^(?=.*[a-zA-Z0-9]).{6,18}$/,
              message: `${t('messages.password-format')}`
            }
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          name='confirmPassword'
          label={t('employee.confirmPassword')}
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            {
              required: true,
              message: t('employee.confirmPassword-required').toString(),
              min: 6
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  new Error(t('employee.notmatch').toString())
                )
              }
            })
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label={t('employee.otp')}
          name='otp'
          rules={[
            {
              required: true,
              message: t('employee.otp-required').toString()
            }
          ]}
        >
          <Input />
        </Form.Item>
        <Row
          justify='end'
          gutter={GUTTER}
        >
          <Col>
            <Button
              onClick={onClose}
              className='wx-100'
            >
              {t('buttons.cancel')}
            </Button>
          </Col>
          <Col>
            <Button
              onClick={handleGetOTP}
              className='wx-100'
              type='primary'
            >
              {t('buttons.getOtp')}
            </Button>
          </Col>
          <Col>
            <Button
              onClick={handleChangePassword}
              type='primary'
              className='wx-100'
              disabled={disabled}
            >
              {t('buttons.update')}
            </Button>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default EmployeePassword
