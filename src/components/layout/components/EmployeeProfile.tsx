import React, { useEffect } from 'react'
import {
  DialogModal,
  Input,
  ButtonComponent,
  SelectInput
} from '@components/index'
import { useAppSelector } from '@hooks/hook'
import { useUserUpdateMutation } from '@services/cmsService'
import { CustomModalProps } from '@type/api'
import { updateLayout } from '@utils/events'
import {
  Avatar,
  Col,
  Form,
  Row,
  notification,
  Divider,
  Typography
} from 'antd'
import { useForm } from 'antd/es/form/Form'
import { useTranslation } from 'react-i18next'
import { RootState } from 'src/app/store'
import IAvatarDefault from '@assets/image/avatar_default.webp'
import {
  User as UserIcon,
  Envelope as EnvelopeIcon,
  ShieldCheck as ShieldIcon,
  IdentificationCard as IdIcon
} from '@phosphor-icons/react'
import '../style.scss'

const { Text, Title } = Typography

function EmployeeProfile(props: CustomModalProps) {
  const { onClose, open } = props
  const { t } = useTranslation()
  const [form] = useForm()
  const { profile } = useAppSelector((state: RootState) => state.auth)
  const [changeProfile, { isLoading }] = useUserUpdateMutation()

  const handleUpdate = async () => {
    try {
      const values = await form.validateFields()
      await changeProfile({
        id: values.id,
        updateUserDto: {
          fullName: values.fullName
        }
      }).unwrap()
      notification.success({
        message: t('messages.changeProfileSuccess'),
        placement: 'topRight'
      })
      updateLayout()
      onClose()
    } catch (error) {
      console.error('Update profile error:', error)
    }
  }

  useEffect(() => {
    if (open) {
      form.setFieldsValue(profile)
    }
  }, [profile, open])

  return (
    <DialogModal
      open={open}
      onCancel={onClose}
      onOk={handleUpdate}
      title={t('employee.profile')}
      width={480}
      confirmLoading={isLoading}
      footer={
        <div className="flex justify-end gap-3 mt-4">
          <ButtonComponent
            type='default'
            onClick={onClose}
            content={t('buttons.cancel')}
            className="min-w-[100px]"
          />
          <ButtonComponent
            type="primary"
            onClick={handleUpdate}
            loading={isLoading}
            content={t('buttons.update')}
            className="min-w-[100px]"
          />
        </div>
      }
    >
      <div className="flex flex-col items-center mb-4 pt-2">
        <div className="relative group cursor-pointer">
          <Avatar
            size={100}
            src={profile.avatar || IAvatarDefault}
            className="border-4 border-blue-50 shadow-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <UserIcon size={24} color="white" weight="bold" />
          </div>
        </div>
        <Title level={4} className="mt-3 mb-0 text-gray-800">{profile.fullName || profile.email}</Title>
        <Text type="secondary" className="text-gray-500">{profile.email}</Text>
      </div>

      <Divider className="my-4" />

      <Form
        form={form}
        layout='vertical'
        className='mt-2'
        requiredMark={false}
      >
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>

        <Form.Item
          name='fullName'
          label={
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <IdIcon size={18} className="text-blue" />
              {(t('employee.fullName') as string)}
            </div>
          }
          rules={[{ required: true, message: (t('validation.required') as string) }]}
        >
          <Input
            prefix={<UserIcon size={18} className="text-gray-400 mr-1" />}
            placeholder={(t('employee.fullName') as string)}
            className="h-10 rounded-lg hover:border-blue-400"
          />
        </Form.Item>

        <Form.Item
          name='email'
          label={
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <EnvelopeIcon size={18} className="text-blue" />
              {(t('employee.email') as string)}
            </div>
          }
        >
          <Input
            readOnly
            disabled
            prefix={<EnvelopeIcon size={18} className="text-gray-400 mr-1" />}
            className="h-10 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200"
          />
        </Form.Item>

        <Form.Item
          label={
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <ShieldIcon size={18} className="text-blue" />
              {(t('employee.status') as string)}
            </div>
          }
        >
          <Input
            disabled
            value={profile.status==true ? 'Hoạt động' : 'Không hoạt động'}
            className="h-10 rounded-lg bg-gray-50 opacity-100"
          />
        </Form.Item>
      </Form>
    </DialogModal>
  )
}

export default EmployeeProfile
