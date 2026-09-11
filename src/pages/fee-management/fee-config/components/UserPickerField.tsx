import { WalletIcon } from '@components/icons'
import { ButtonComponent, MaskText } from '@components/index'
import { useGetAccountQuery } from '@services/apiWalletAccount.api'
import type { ContentAccountWallet } from '@type/responseAccountWallet'
import { formatFeeNumber } from '@utils/fee-format'
import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'
import { UserPickerDialog } from './UserPickerDialog'

interface UserPickerFieldProps {
  control: Control<FeeConfigFormValues>
  className?: string
}

const HEAD =
  'text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'

const Fact = ({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className='flex flex-col gap-0.5'>
    <span className={HEAD}>{label}</span>
    <span className='text-[13px] text-foreground'>{children}</span>
  </div>
)

/**
 * Ô gán biểu phí cho riêng một ví.
 *
 * <p>Biểu mẫu lưu `ownerId` — đúng mã mà ví gửi lên dịch vụ phí trong mỗi báo
 * giá. Sau khi chọn, khối này đổ lại thông tin ví để người vận hành đối chiếu
 * trước khi gán một mức phí đặc biệt: một mã UUID thì không ai nhìn ra đúng sai.
 */
export const UserPickerField = ({ control, className }: UserPickerFieldProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [picked, setPicked] = useState<ContentAccountWallet | null>(null)

  return (
    <Controller
      control={control}
      name='subjectId'
      render={({ field, fieldState }) => (
        <UserPickerBody
          ownerId={field.value}
          picked={picked}
          error={fieldState.error?.message}
          className={className}
          isOpen={isOpen}
          onOpen={() => setIsOpen(true)}
          onClose={() => setIsOpen(false)}
          onClear={() => {
            setPicked(null)
            field.onChange('')
          }}
          onSelect={(account) => {
            setPicked(account)
            field.onChange(account.ownerId)
            setIsOpen(false)
          }}
        />
      )}
    />
  )
}

interface UserPickerBodyProps {
  ownerId: string
  picked: ContentAccountWallet | null
  error?: string
  className?: string
  isOpen: boolean
  onOpen: () => void
  onClose: () => void
  onClear: () => void
  onSelect: (account: ContentAccountWallet) => void
}

const UserPickerBody = ({
  ownerId,
  picked,
  error,
  className,
  isOpen,
  onOpen,
  onClose,
  onClear,
  onSelect
}: UserPickerBodyProps) => {
  /**
   * Chỉ gọi khi mở bản ghi cũ. Danh sách tài khoản lọc theo `ownerId` chứ không
   * có đường tra một chủ ví, nên lấy đúng một dòng rồi đọc ra.
   */
  const { data } = useGetAccountQuery(
    { ownerId, ownerType: 'USER', page: 1, size: 1 },
    { skip: !ownerId || picked?.ownerId === ownerId }
  )

  const account =
    picked?.ownerId === ownerId ? picked : data?.content?.[0]

  return (
    <div className={className}>
      <p className='font-medium'>Ví được gán riêng</p>

      {account ? (
        <div className='mt-2 rounded-lg border border-border bg-muted px-4 py-3'>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div className='flex flex-wrap gap-x-8 gap-y-3'>
              <Fact label='Chủ ví'>{account.ownerFullName || 'Chưa có tên'}</Fact>
              <Fact label='Số điện thoại'>
                <MaskText value={account.ownerUsername} />
              </Fact>
              <Fact label='Định danh'>
                {account.ekycStatus === 'VERIFIED'
                  ? 'Đã định danh'
                  : 'Chưa định danh'}
              </Fact>
              <Fact label='Số dư'>
                <span className='tabular-nums'>
                  {formatFeeNumber(account.balance ?? 0)} đ
                </span>
              </Fact>
              <Fact label='Trạng thái'>{account.status}</Fact>
            </div>
            <div className='flex gap-2'>
              <ButtonComponent
                htmlType='button'
                type='default'
                content='Đổi ví'
                onClick={onOpen}
              />
              <ButtonComponent
                htmlType='button'
                type='text'
                content='Bỏ chọn'
                onClick={onClear}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className='mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3'>
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Chọn ví'
            icon={<WalletIcon size={16} weight='bold' aria-hidden />}
            onClick={onOpen}
          />
          <span className='text-[13px] text-muted-foreground'>
            Bỏ trống nghĩa là chính sách áp cho mọi người dùng. Chọn một ví thì
            biểu phí này đè lên mọi biểu phí chung của họ.
          </span>
        </div>
      )}

      {error && (
        <p className='mt-1 text-[13px] font-medium text-danger-strong'>{error}</p>
      )}

      <UserPickerDialog
        open={isOpen}
        selectedOwnerId={ownerId}
        onSelect={onSelect}
        onCancel={onClose}
      />
    </div>
  )
}
