import React, { useEffect, useState } from 'react'
import ButtonComponent from '@components/ui/button-component'
import DialogModal from '@components/ui/dialogModal-component'
import Input from '@components/ui/Input-component'
import { useAppSelector } from '@hooks/hook'
import {
  useUserChangePasswordMutation,
  useUserGetUserOtpMutation
} from '@services/cmsService'
import { CustomModalProps } from '@type/api'
import { IChangePassword } from '@type/auth'
import {
  Col,
  Form,
  Row,
  notification,
  Typography,
  Divider
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useTranslation } from 'react-i18next'
import { RootState } from 'src/app/store'
import {
  Lock as LockIcon,
  Key as KeyIcon,
  ShieldCheckered as ShieldIcon,
  CheckCircle as CheckIcon
} from '@phosphor-icons/react'
import '../style.css'

const { Text } = Typography

/** Các field của form đổi mật khẩu (khớp với `name` của các Form.Item bên dưới). */
interface ChangePasswordFormValues {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
  otp?: string
}

function EmployeePassword(props: CustomModalProps) {
  const { onClose, open } = props
  const { t } = useTranslation()
  const [form] = useForm()
  const { profile } = useAppSelector((state: RootState) => state.auth)

  const [trackingId, setTrackingId] = useState<string | null>(null)
  const [disabled, setDisabled] = useState<boolean>(true)

  const [changePassword, { isLoading: isChanging }] = useUserChangePasswordMutation()
  const [getOTP, { isLoading: isGettingOtp }] = useUserGetUserOtpMutation()

  const handleChangePassword = async () => {
    try {
      const values = await form.validateFields()
      const record: IChangePassword = {
        trackingId: trackingId || '',
        password: values.currentPassword,
        newPassword: values.newPassword,
        otpCode: values.otp
      }
      await changePassword({
        changeUserPasswordDto: record
      }).unwrap()
      notification.success({
        message: (t('messages.changePasswordSuccess') as string),
        placement: 'topRight'
      })
      form.resetFields()
      onClose()
    } catch (error) {
      console.error('Change password error:', error)
    }
  }

  const handleClose = () => {
    form.resetFields()
    setTrackingId(null)
    setDisabled(true)
    onClose()
  }

  const handleGetOTP = async () => {
    try {
      const otp = await getOTP({
        adminGetOtp: {
          email: profile.email || '',
          action: 'ADMIN_CHANGE_PASSWORD'
        }
      }).unwrap()
      notification.success({
        message: (t('messages.getOtpSuccess') as string),
        placement: 'topRight'
      })
      if (otp) {
        setTrackingId(otp.trackingId)
      }
    } catch (error) {
      console.error('Get OTP error:', error)
    }
  }

  const handleValuesChange = (
    _: Partial<ChangePasswordFormValues>,
    values: ChangePasswordFormValues
  ) => {
    const isComplete =
      values.currentPassword &&
      values.newPassword &&
      values.confirmPassword &&
      values.otp &&
      trackingId !== null

    setDisabled(!isComplete)
  }

  useEffect(() => {
    if (open) {
      form.resetFields()
      setTrackingId(null)
      setDisabled(true)
    }
  }, [open])

  return (
    <DialogModal
      open={open}
      onCancel={handleClose}
      title={t('employee.changePassword')}
      width={500}
      onOk={() => { }}
      footer={
        <div className="flex justify-end gap-3 mt-4">
          <ButtonComponent
            type="default"
            onClick={handleClose}
            content={t('buttons.cancel')}
            className="min-w-[100px]"
          />
          <ButtonComponent
            type="primary"
            onClick={handleChangePassword}
            loading={isChanging}
            disabled={disabled}
            content={t('buttons.update')}
            className="min-w-[100px]"
          />
        </div>
      }
    >
      <div className="mb-6 flex flex-col items-center pt-2">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
          <ShieldIcon size={32} className="text-blue" weight="duotone" />
        </div>
        <Text type="secondary" className="text-center px-4">
          {'Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi bảo mật tài khoản.'}
        </Text>
      </div>

      <Divider className="my-4" />

      <Form
        layout='vertical'
        form={form}
        onValuesChange={handleValuesChange}
        requiredMark={false}
        className="mt-2"
      >
        <Form.Item
          name='currentPassword'
          label={
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <LockIcon size={18} className="text-blue" />
              {(t('employee.currentPassword') as string)}
            </div>
          }
          rules={[
            { required: true, message: (t('employee.password-required') as string) },
            { pattern: /^(?=.*[a-zA-Z0-9]).{6,18}$/, message: (t('messages.password-format') as string) }
          ]}
        >
          <Input.Password
            prefix={<LockIcon size={18} className="text-gray-400 mr-1" />}
            placeholder={(t('employee.currentPassword') as string)}
            className="h-10 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name='newPassword'
          label={
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <ShieldIcon size={18} className="text-blue" />
              {(t('employee.newPassword') as string)}
            </div>
          }
          rules={[
            { required: true, message: (t('employee.newPassword-required') as string) },
            { pattern: /^(?=.*[a-zA-Z0-9]).{6,18}$/, message: (t('messages.password-format') as string) }
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<ShieldIcon size={18} className="text-gray-400 mr-1" />}
            placeholder={(t('employee.newPassword') as string)}
            className="h-10 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name='confirmPassword'
          label={
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <CheckIcon size={18} className="text-blue" />
              {(t('employee.confirmPassword') as string)}
            </div>
          }
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: (t('employee.confirmPassword-required') as string) },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error(t('employee.notmatch').toString()))
              }
            })
          ]}
        >
          <Input.Password
            prefix={<CheckIcon size={18} className="text-gray-400 mr-1" />}
            placeholder={(t('employee.confirmPassword') as string)}
            className="h-10 rounded-lg"
          />
        </Form.Item>

        <Row align="bottom">
          <Col flex="auto" className="pr-3">
            <Form.Item
              label={
                <div className="flex items-center gap-2 text-gray-700 font-medium">
                  <KeyIcon size={18} className="text-blue" />
                  {(t('employee.otp') as string)}
                </div>
              }
              name='otp'
              rules={[{ required: true, message: (t('employee.otp-required') as string) }]}
              className="mb-0"
            >
              <Input
                prefix={<KeyIcon size={18} className="text-gray-400 mr-1" />}
                placeholder={(t('employee.otp') as string)}
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>
          <Col>
            <ButtonComponent
              onClick={handleGetOTP}
              type='dashed'
              variant="dashed"
              loading={isGettingOtp}
              content={t('buttons.getOtp')}
              className="h-10"
            />
          </Col>
        </Row>
      </Form>
    </DialogModal>
  )
}

export default EmployeePassword
