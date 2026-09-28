import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { DialogModal, type PickedEntity } from '@components/index'
import { useBankAccountEditor } from '../hooks/useBankAccountEditor'
import { BankAccountFormFields } from './BankAccountFormFields'
import { BankAccountFormSection } from './BankAccountFormSection'
import { BankAccountNotice } from './BankAccountNotice'
import { BankAccountOtpDialog } from './BankAccountOtpDialog'
import { BankAccountScopeFields } from './BankAccountScopeFields'

interface BankAccountEditorDialogProps {
  /** `null` là thêm mới. */
  row: BankAccountDto | null
  initialMerchant?: PickedEntity
  onClose: () => void
}

export function BankAccountEditorDialog({
  row,
  initialMerchant,
  onClose
}: BankAccountEditorDialogProps) {
  const editor = useBankAccountEditor(row, initialMerchant, onClose)
  const isCreate = row === null

  return (
    <>
      <DialogModal
        open
        width={{ xs: '95%', md: 680 }}
        title={
          isCreate ? 'Thêm tài khoản ngân hàng' : 'Cập nhật tài khoản ngân hàng'
        }
        onCancel={onClose}
        onOk={() => void editor.save()}
        okButtonProps={{ loading: editor.isSaving }}
        okText={isCreate ? 'Thêm mới' : 'Lưu thay đổi'}
      >
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {isCreate && (
            <>
              <BankAccountFormSection
                id='bank-account-scope'
                step='I'
                title='Phạm vi áp dụng'
                withDivider={false}
              />
              <BankAccountScopeFields
                merchant={editor.merchant}
                subMerchant={editor.subMerchant}
                onMerchantChange={editor.setMerchant}
                onSubMerchantChange={editor.setSubMerchant}
              />
              <BankAccountNotice
                tone='info'
                className='col-span-full'
              >
                Để trống Sub-merchant để áp dụng cho Master. Chọn Sub-merchant
                khi cần tài khoản riêng cho chi nhánh.
              </BankAccountNotice>
            </>
          )}
          <BankAccountFormSection
            id='bank-account-settlement'
            step='II'
            title='Tài khoản nhận quyết toán'
            withDivider={isCreate}
          />
          <BankAccountFormFields
            isCreate={isCreate}
            draft={editor.draft}
            isDefault={editor.isDefault}
            onPatch={editor.patch}
            onDefaultChange={editor.setIsDefault}
          />
          {isCreate && (
            <BankAccountNotice
              tone='warning'
              className='col-span-full'
            >
              Thêm tài khoản yêu cầu xác thực OTP và được ghi vào nhật ký thao
              tác.
            </BankAccountNotice>
          )}
        </div>
      </DialogModal>
      <BankAccountOtpDialog
        otp={editor.otp}
        loading={editor.isSaving}
        onConfirm={() => {
          const confirmation = editor.otp.toConfirmation()
          if (confirmation) void editor.save(confirmation)
        }}
      />
    </>
  )
}
