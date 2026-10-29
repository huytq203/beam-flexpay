import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useGetEscrowObligationWaitQuery,
  useSetEscrowObligationWaitMutation
} from '@/app/services/merchantEscrowApi'
import { getApiErrorDetail } from '@/app/utils/api-error'
import { ButtonComponent, feedback, InputNumber } from '@components/index'
import { EscrowLoadError } from './EscrowLoadError'

const MIN_DAYS = 1
const MAX_DAYS = 365
const RANGE_ERROR = 'Số ngày chờ nghĩa vụ phải từ 1 đến 365'

/**
 * Số ngày chờ sau giao dịch cuối của Master trước khi được hoàn ký quỹ với lý do chấm dứt
 * hợp đồng (QĐ-04). Ai xem được màn đều thấy; chỉ người có quyền cập nhật cấu hình ký quỹ mới sửa.
 */
export function EscrowObligationWait({ masterId }: { masterId: string }) {
  const query = useGetEscrowObligationWaitQuery(masterId)
  const [save, saving] = useSetEscrowObligationWaitMutation()
  const [days, setDays] = useState<number | null>()
  const [error, setError] = useState<string>()

  // `days` chỉ có giá trị khi người dùng đã gõ; chưa gõ thì hiện số đang lưu ở BE.
  const shown = days === undefined ? (query.data ?? null) : days

  const submit = async () => {
    // Kiểm tra ở FE để không bắn PUT chắc chắn bị BE từ chối.
    if (
      shown === null ||
      !Number.isInteger(shown) ||
      shown < MIN_DAYS ||
      shown > MAX_DAYS
    ) {
      setError(RANGE_ERROR)
      return
    }
    setError(undefined)
    try {
      await save({ masterId, days: shown }).unwrap()
      feedback.success('Đã lưu số ngày chờ nghĩa vụ')
    } catch (err) {
      feedback.error(
        getApiErrorDetail(err, 'Không lưu được số ngày chờ nghĩa vụ')
      )
    }
  }

  return (
    <div className='flex max-w-md flex-col gap-3'>
      <p className='text-sm text-muted-foreground'>
        Số ngày phải chờ sau giao dịch cuối của Master trước khi được hoàn ký
        quỹ với lý do chấm dứt hợp đồng (từ {MIN_DAYS} đến {MAX_DAYS} ngày).
      </p>
      {query.isError && (
        <EscrowLoadError
          error={query.error}
          fallback='Không tải được số ngày chờ nghĩa vụ.'
          onRetry={() => void query.refetch()}
        />
      )}
      <p className='text-sm'>
        Hiện tại: <strong className='tabular-nums'>{query.data ?? ''}</strong>{' '}
        ngày
      </p>
      <Can
        screen='MERCHANT_ESCROW_DETAIL'
        action='update'
      >
        <div className='flex items-start gap-2'>
          <div className='flex-1'>
            <InputNumber
              aria-label='Số ngày chờ nghĩa vụ'
              precision={0}
              value={shown}
              onChange={(value) => {
                setDays(typeof value === 'number' ? value : null)
                setError(undefined)
              }}
            />
            {error && (
              <p
                role='alert'
                className='mt-1 text-xs text-danger-strong'
              >
                {error}
              </p>
            )}
          </div>
          <ButtonComponent
            content='Lưu'
            loading={saving.isLoading}
            onClick={() => void submit()}
          />
        </div>
      </Can>
    </div>
  )
}
