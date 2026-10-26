import { FormTextArea } from '@components/form'
import { StopOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { formatNumber } from '@utils/formatNumber'
import { Skeleton } from 'antd'
import { useWalletClose } from '../hooks/useWalletClose'

interface DialogCloseWalletProps {
  userId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

const DANGER_BOX = 'p-3 bg-red-50 text-red-600 border border-red-200 rounded-md'

const DialogCloseWallet = ({
  userId,
  onSuccess,
  onCancel
}: DialogCloseWalletProps) => {
  const {
    check,
    data,
    view,
    form,
    isClosing,
    submitError,
    confirm,
    canConfirm,
    loadError
  } = useWalletClose({ userId, onSuccess })

  if (check.isLoading)
    return (
      <Skeleton
        active
        paragraph={{ rows: 4 }}
      />
    )

  if (loadError || !data) {
    return (
      <div className='space-y-3'>
        <div className={DANGER_BOX}>{loadError ?? 'Không có dữ liệu.'}</div>
        <div className='flex justify-end gap-2'>
          <ButtonComponent
            type='default'
            content='Đóng'
            onClick={onCancel}
          />
          <ButtonComponent
            content='Thử lại'
            onClick={() => check.refetch()}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      <p>
        Khách hàng: <strong>{data.customerName ?? '--'}</strong>
        {data.phoneNumber ? <span> · {data.phoneNumber}</span> : null}
      </p>
      <div
        className={`p-3 border rounded-md flex-between ${
          data.balance > 0
            ? 'bg-red-50 text-red-600 border-red-200'
            : 'bg-gray-50 text-gray-700 border-gray-200'
        }`}
      >
        <p>Số dư hiện tại:</p>
        <p className='font-bold'>
          {formatNumber(data.balance)} {data.currency}
        </p>
      </div>

      {view !== 'form' && data.blockingReasons.length > 0 && (
        <div className={DANGER_BOX}>
          <p className='font-bold flex-start gap-1'>
            <StopOutlined />{' '}
            {view === 'retry' ? 'Cần hoàn tất xóa ví' : 'Không được phép xóa'}
          </p>
          {data.blockingReasons.map((reason) => (
            <p key={reason.code}>{reason.message}</p>
          ))}
        </div>
      )}

      {view === 'form' && (
        <>
          <div className={DANGER_BOX}>
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Khách
            hàng sẽ bị đăng xuất khỏi mọi thiết bị, không thể đăng nhập lại; số
            điện thoại và CCCD bị chặn vĩnh viễn, không dùng để mở ví mới.
          </div>
          <FormTextArea
            control={form.control}
            name='reason'
            maxLength={500}
            label={
              <span>
                Lý do hủy dịch vụ<span className='text-red-600'>*</span>:
              </span>
            }
            placeholder='Nhập lý do hủy dịch vụ chi tiết...'
          />
        </>
      )}

      {submitError && <div className={DANGER_BOX}>{submitError}</div>}

      <div className='flex justify-end gap-2 pt-1'>
        <ButtonComponent
          type='default'
          content='Hủy'
          onClick={onCancel}
        />
        <ButtonComponent
          danger
          type='primary'
          disabled={!canConfirm}
          loading={isClosing}
          content='Xác nhận Xóa'
          onClick={confirm}
        />
      </div>
    </div>
  )
}

export default DialogCloseWallet
