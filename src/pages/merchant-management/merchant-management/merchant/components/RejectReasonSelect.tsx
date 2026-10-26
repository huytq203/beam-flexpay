import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, SelectComponent } from '@components/index'
import { useGetMerchantRejectionReasonsQuery } from '@services/apiMerchant'
import type {
  MerchantRejectionReason,
  MerchantRejectionReasonCode
} from '@type/merchant'

interface RejectReasonSelectProps {
  value?: MerchantRejectionReasonCode
  onPick: (reason: MerchantRejectionReason | undefined) => void
}

/** Danh mục lý do mẫu lấy từ GET /merchants/rejection-reasons. */
export function RejectReasonSelect({ value, onPick }: RejectReasonSelectProps) {
  const { data, isFetching, isError, error, refetch } =
    useGetMerchantRejectionReasonsQuery()
  const reasons = data ?? []

  return (
    <div className='mb-3 space-y-1'>
      <label
        htmlFor='merchant-reject-reason'
        className='text-sm font-medium text-foreground'
      >
        Lý do mẫu
      </label>
      <SelectComponent<MerchantRejectionReasonCode>
        id='merchant-reject-reason'
        className='w-full'
        allowClear
        placeholder='Chọn lý do mẫu'
        loading={isFetching}
        value={value}
        notFoundContent={isFetching ? 'Đang tải…' : 'Không có lý do mẫu'}
        options={reasons.map((reason) => ({
          value: reason.code,
          label: reason.label
        }))}
        onChange={(code) =>
          onPick(reasons.find((reason) => reason.code === code))
        }
      />
      {isError && (
        <div
          role='alert'
          className='flex flex-wrap items-center gap-2 text-xs text-danger-strong'
        >
          {getApiErrorDetail(error, 'Không tải được danh sách lý do mẫu.')}
          <ButtonComponent
            htmlType='button'
            type='default'
            size='small'
            content='Thử lại'
            onClick={() => void refetch()}
          />
        </div>
      )}
    </div>
  )
}
