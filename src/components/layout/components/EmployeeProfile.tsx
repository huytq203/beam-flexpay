import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Avatar, Divider, Typography } from 'antd'
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  IdentificationCardIcon,
  PhoneIcon,
  UserGearIcon
} from '@phosphor-icons/react'
import ButtonComponent from '@components/ui/button-component'
import DialogModal from '@components/ui/dialogModal-component'
import { useAppSelector } from '@hooks/hook'
import type { CustomModalProps } from '@type/api'
import type { RootState } from 'src/app/store'
import '../style.css'

const AVATAR_DEFAULT = '/images/assets/image/avatar_default.webp'
const EMPTY_VALUE = '—'

const { Text, Title } = Typography

interface ProfileFieldProps {
  icon: ReactNode
  label: string
  children: ReactNode
}

function ProfileField({ icon, label, children }: ProfileFieldProps) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="flex shrink-0 items-center gap-2 text-[13px] font-medium text-muted-foreground">
        <span aria-hidden className="text-primary">
          {icon}
        </span>
        {label}
      </span>
      <span className="text-right text-[13px] font-semibold wrap-break-word text-foreground">
        {children}
      </span>
    </div>
  )
}

function EmployeeProfile({ open, onClose }: CustomModalProps) {
  const { t } = useTranslation()
  const { profile } = useAppSelector((state: RootState) => state.auth)

  const roles = profile.roles?.length ? profile.roles.join(', ') : EMPTY_VALUE
  const statusLabel = profile.status
    ? t('employee.active')
    : t('employee.unactive')

  return (
    <DialogModal
      open={open}
      width={480}
      title={t('employee.profile')}
      onOk={onClose}
      onCancel={onClose}
      className="[&_.ant-modal-content]:rounded-2xl! [&_.ant-modal-content]:border! [&_.ant-modal-content]:border-border! [&_.ant-modal-content]:shadow-none! [&_.ant-modal-header]:mb-4! [&_.ant-modal-title]:text-lg! [&_.ant-modal-title]:font-bold!"
      footer={
        <div className="mt-4 flex justify-end border-t border-border pt-4">
          <ButtonComponent
            type="primary"
            onClick={onClose}
            content={t('buttons.close')}
            className="h-10.5! min-w-28  border-none! bg-primary! font-semibold! text-primary-foreground! shadow-none! hover:bg-primary/85! hover:text-primary-foreground!"
          />
        </div>
      }
    >
      <div className="mb-2 flex flex-col items-center pt-2">
        <Avatar
          size={96}
          src={profile.avatar || AVATAR_DEFAULT}
          className="border-4 border-muted shadow-sm"
        />
        <Title level={4} className="mt-3 mb-0! text-foreground!">
          {profile.fullName || profile.email || EMPTY_VALUE}
        </Title>
        <Text className="text-muted-foreground!">{profile.email}</Text>
      </div>

      <Divider className="my-4" />

      <dl className="flex flex-col">
        <ProfileField
          icon={<IdentificationCardIcon size={18} weight="duotone" />}
          label={t('employee.fullName').toString()}
        >
          {profile.fullName || EMPTY_VALUE}
        </ProfileField>

        <ProfileField
          icon={<EnvelopeIcon size={18} weight="duotone" />}
          label={t('employee.email').toString()}
        >
          {profile.email || EMPTY_VALUE}
        </ProfileField>

        <ProfileField
          icon={<PhoneIcon size={18} weight="duotone" />}
          label={t('employee.phoneNumber').toString()}
        >
          {profile.phoneNumber || EMPTY_VALUE}
        </ProfileField>

        <ProfileField
          icon={<UserGearIcon size={18} weight="duotone" />}
          label={t('employee.role').toString()}
        >
          {roles}
        </ProfileField>

        <ProfileField
          icon={<ShieldCheckIcon size={18} weight="duotone" />}
          label={t('employee.status').toString()}
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold ${
              profile.status
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            <UserIcon aria-hidden size={14} weight="bold" />
            {statusLabel}
          </span>
        </ProfileField>
      </dl>
    </DialogModal>
  )
}

export default EmployeeProfile
