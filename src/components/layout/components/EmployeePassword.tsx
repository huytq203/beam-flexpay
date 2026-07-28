import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  LockKey as LockKeyIcon,
  ShieldCheckered as ShieldIcon
} from '@phosphor-icons/react'
import { FormInput } from '@components/form'
import ButtonComponent from '@components/ui/button-component'
import ModalComponent from '@components/ui/modal-component/ModalComponent'
import { useMessage } from '@hooks/useMessage'
import type { CustomModalProps } from '@type/api'
import { ChangePasswordChecklist } from './ChangePasswordChecklist'
import { useChangePassword } from './useChangePassword'

const FORM_ID = 'admin-change-password-form'
const FIELD_CLASS =
  'flex flex-col gap-1.5 [&>p]:text-xs [&>p]:leading-relaxed'
const LABEL_CLASS = 'text-[13px] font-semibold text-gray-700'
const INPUT_CLASS =
  'h-[42px]!  border-border! bg-muted! px-3! text-[13px]! shadow-none! hover:border-primary! [&.ant-input-affix-wrapper-focused]:border-primary! [&.ant-input-affix-wrapper-focused]:bg-white!'

interface EmployeePasswordDialogProps {
  onClose: () => void
}

function EmployeePasswordDialog({
  onClose
}: EmployeePasswordDialogProps) {
  const { t } = useTranslation()
  const { successMess } = useMessage()
  const handleSuccess = (): void => {
    successMess(t('messages.changePasswordSuccess').toString())
    onClose()
  }
  const {
    control,
    isSubmitting,
    isValid,
    submitError,
    submit,
    clearSubmitError
  } = useChangePassword({ onSuccess: handleSuccess })
  const newPassword = useWatch({ control, name: 'newPassword' })

  const handleClose = (): void => {
    if (!isSubmitting) onClose()
  }

  return (
    <ModalComponent
      open
      width={520}
      title={t('employee.changePassword')}
      onCancel={handleClose}
      closable={!isSubmitting}
      keyboard={!isSubmitting}
      maskClosable={!isSubmitting}
      className="[&_.ant-modal-content]:rounded-2xl! [&_.ant-modal-content]:border! [&_.ant-modal-content]:border-border! [&_.ant-modal-content]:shadow-none! [&_.ant-modal-header]:mb-4! [&_.ant-modal-title]:text-lg! [&_.ant-modal-title]:font-bold!"
      footer={
        <div className="flex justify-end gap-3">
          <ButtonComponent
            type="default"
            htmlType="button"
            onClick={handleClose}
            disabled={isSubmitting}
            content={t('buttons.cancel')}
            className="h-[42px]! min-w-24  border-border! text-foreground! shadow-none!"
          />
          <ButtonComponent
            type="primary"
            htmlType="submit"
            form={FORM_ID}
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            content={t('buttons.update')}
            className="h-[42px]! min-w-28  border-none! bg-primary! font-semibold! text-primary-foreground! shadow-none! hover:bg-primary/85! hover:text-primary-foreground!"
          />
        </div>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-muted p-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary-foreground">
          <ShieldIcon
            aria-hidden
            size={22}
            weight="duotone"
          />
        </span>
        <p className="pt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          Dùng mật khẩu hiện tại để xác nhận, sau đó tạo một mật khẩu mới cho
          tài khoản quản trị.
        </p>
      </div>

      <form
        id={FORM_ID}
        className="flex flex-col gap-4"
        onSubmit={submit}
        noValidate
      >
        <FormInput
          name="oldPassword"
          control={control}
          type="password"
          label={t('employee.currentPassword').toString()}
          placeholder={t('employee.currentPassword').toString()}
          autoComplete="current-password"
          maxLength={128}
          disabled={isSubmitting}
          prefix={<LockKeyIcon aria-hidden size={17} />}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
          inputClassName={INPUT_CLASS}
          onChange={clearSubmitError}
        />

        <FormInput
          name="newPassword"
          control={control}
          type="password"
          label={t('employee.newPassword').toString()}
          placeholder={t('employee.newPassword').toString()}
          autoComplete="new-password"
          maxLength={128}
          disabled={isSubmitting}
          prefix={<ShieldIcon aria-hidden size={17} />}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
          inputClassName={INPUT_CLASS}
          onChange={clearSubmitError}
        />

        <ChangePasswordChecklist password={newPassword} />

        <FormInput
          name="confirmPassword"
          control={control}
          type="password"
          label={t('employee.confirmPassword').toString()}
          placeholder={t('employee.confirmPassword').toString()}
          autoComplete="new-password"
          maxLength={128}
          disabled={isSubmitting}
          prefix={<LockKeyIcon aria-hidden size={17} />}
          className={FIELD_CLASS}
          classNameLable={LABEL_CLASS}
          inputClassName={INPUT_CLASS}
          onChange={clearSubmitError}
        />

        {submitError && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-3 py-2.5 text-xs leading-relaxed text-red-700"
          >
            {submitError}
          </p>
        )}
      </form>
    </ModalComponent>
  )
}

export function EmployeePassword({
  open,
  onClose
}: CustomModalProps) {
  if (!open) return null
  return <EmployeePasswordDialog onClose={onClose} />
}
