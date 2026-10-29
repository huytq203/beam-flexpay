import { useGetBankQuery } from '@services/apiFeeBank'
import { CheckboxComponent, Input, SelectComponent } from '@components/index'
import { STATUS_OPTIONS } from '../constants/bankAccount.constants'
import type { BankAccountDraft } from '../utils/bankAccount.utils'

interface BankAccountFormFieldsProps {
  isCreate: boolean
  draft: BankAccountDraft
  isDefault: boolean
  /** Chỉ TK Master có ô "dùng tên khác pháp nhân"; TK Sub vốn không bị so tên. */
  showHolderNameExemption: boolean
  onPatch: (value: Partial<BankAccountDraft>) => void
  onDefaultChange: (value: boolean) => void
}

const labelClass = 'mb-1 block text-sm font-medium'
const required = <span className='text-danger'>*</span>
// Tài khoản đã xác minh chỉ do BE chuyển trạng thái, không chọn tay.
const editableStatusOptions = STATUS_OPTIONS.map((option) => ({
  ...option,
  disabled: option.value === 'VERIFIED'
}))

export function BankAccountFormFields({
  isCreate,
  draft,
  isDefault,
  showHolderNameExemption,
  onPatch,
  onDefaultChange
}: BankAccountFormFieldsProps) {
  const holderNameExempt =
    showHolderNameExemption && draft.allowDifferentHolderName
  const banks = useGetBankQuery({ page: 1, size: 100 })
  const bankError = banks.isError
    ? 'Không tải được danh sách ngân hàng'
    : undefined

  return (
    <>
      <div>
        <label
          className={labelClass}
          htmlFor='bank-code'
        >
          Ngân hàng {required}
        </label>
        <SelectComponent
          aria-label='Ngân hàng'
          id='bank-code'
          className='w-full'
          value={draft.bankCode || undefined}
          onChange={(bankCode: string) => onPatch({ bankCode })}
          showSearch
          optionFilterProp='label'
          loading={banks.isFetching}
          options={(banks.data?.content ?? []).map((bank) => ({
            value: bank.code,
            label: `${bank.name} (${bank.code})`
          }))}
          placeholder={bankError ?? 'Chọn ngân hàng thụ hưởng'}
          notFoundContent={bankError}
        />
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='bank-number'
        >
          Số tài khoản {required}
        </label>
        <Input
          id='bank-number'
          value={draft.accountNumber}
          onChange={(event) =>
            onPatch({ accountNumber: event.target.value.replace(/\D/g, '') })
          }
          inputMode='numeric'
          maxLength={20}
          placeholder='6–20 chữ số'
        />
      </div>
      <div className='sm:col-span-2'>
        <label
          className={labelClass}
          htmlFor='bank-name'
        >
          Tên chủ tài khoản {required}
        </label>
        <Input
          id='bank-name'
          value={draft.accountName}
          onChange={(event) =>
            onPatch({ accountName: event.target.value.toUpperCase() })
          }
          maxLength={100}
          placeholder='Tên khớp thông tin KYB/eKYC'
        />
        <p className='mt-1 text-xs text-muted-foreground'>
          {holderNameExempt
            ? 'Đã cho phép tên chủ tài khoản khác tên pháp nhân đã xác thực KYB.'
            : 'Tên phải khớp pháp nhân hoặc chủ ví đã xác thực.'}
        </p>
        {showHolderNameExemption && (
          // Quyết định 22/10 (FR-MER-0608-01): Admin được miễn so tên cho TK Master; bật/tắt đều qua OTP.
          <CheckboxComponent
            className='mt-2'
            checked={draft.allowDifferentHolderName}
            onChange={(event) =>
              onPatch({ allowDifferentHolderName: event.target.checked })
            }
          >
            Dùng tài khoản có tên khác tên pháp nhân
          </CheckboxComponent>
        )}
      </div>
      <div>
        <label
          className={labelClass}
          htmlFor='bank-branch'
        >
          Chi nhánh
        </label>
        <Input
          id='bank-branch'
          value={draft.branchName}
          onChange={(event) => onPatch({ branchName: event.target.value })}
          maxLength={100}
          placeholder='Nếu có'
        />
      </div>
      {isCreate ? (
        <div className='flex items-end pb-2'>
          <CheckboxComponent
            checked={isDefault}
            onChange={(event) => onDefaultChange(event.target.checked)}
          >
            Đặt làm tài khoản mặc định
          </CheckboxComponent>
        </div>
      ) : (
        <>
          <div>
            <label
              className={labelClass}
              htmlFor='bank-edit-status'
            >
              Trạng thái
            </label>
            <SelectComponent
              id='bank-edit-status'
              className='w-full'
              value={draft.status}
              onChange={(status: BankAccountDraft['status']) =>
                onPatch({ status })
              }
              options={editableStatusOptions}
            />
          </div>
          <div>
            <label
              className={labelClass}
              htmlFor='bank-edit-reason'
            >
              Lý do
            </label>
            <Input
              id='bank-edit-reason'
              value={draft.reason}
              onChange={(event) => onPatch({ reason: event.target.value })}
            />
          </div>
        </>
      )}
    </>
  )
}
