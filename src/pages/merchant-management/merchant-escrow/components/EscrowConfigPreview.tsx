import { DialogModal, TextArea } from '@components/index'
import { formatCurrency } from '@utils/formatNumber'
import {
  ESCROW_OVERDUE_ACTION_LABEL,
  ESCROW_REQUIREMENT_MODE_LABEL,
  ESCROW_REVIEW_CYCLE_LABEL,
  ESCROW_STATE_LABEL
} from '../constants/merchantEscrow.constants'
import type { EscrowConfigPreview as Preview } from '../types/merchantEscrow.types'

/** Các tham số BE trả giá trị là số tiền dạng chuỗi (`"50000000"`). */
const MONEY_PARAMETERS = new Set([
  'Mức ký quỹ yêu cầu',
  'Mức tối thiểu',
  'Mức tối đa'
])

const ENUM_LABEL: Record<string, string> = {
  ...ESCROW_REQUIREMENT_MODE_LABEL,
  ...ESCROW_REVIEW_CYCLE_LABEL,
  ...ESCROW_OVERDUE_ACTION_LABEL,
  true: 'Có',
  false: 'Không'
}

/** BE trả giá trị cũ/mới là chuỗi thô (`"true"`, `"FIXED"`, số tiền); đổi sang nhãn đọc được. */
const formatValue = (parameter: string, value: string | null): string => {
  if (value === null) return '—'
  if (MONEY_PARAMETERS.has(parameter) && /^-?\d+$/.test(value))
    return formatCurrency(Number(value))
  return ENUM_LABEL[value] ?? value
}

const money = (value: number | null) =>
  value === null ? ESCROW_STATE_LABEL.UNKNOWN : formatCurrency(value)

interface EscrowConfigPreviewProps {
  preview: Preview | null
  reason: string
  reasonError: string
  confirmLoading: boolean
  onReasonChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Hộp xem trước trước khi xin OTP: bảng tham số cũ/mới, tác động lên số dư và Sub, và cảnh báo
 * cần người duyệt. Thay đổi làm giảm mức bảo đảm (giảm mức, tắt một hình thức nạp, nới thời hạn,
 * bỏ chặn thanh toán) không áp dụng ngay mà chờ người có quyền duyệt, nên bắt buộc ghi lý do để
 * người duyệt có căn cứ.
 */
export function EscrowConfigPreview({
  preview,
  reason,
  reasonError,
  confirmLoading,
  onReasonChange,
  onConfirm,
  onCancel
}: EscrowConfigPreviewProps) {
  return (
    <DialogModal
      open={preview !== null}
      title='Xem trước thay đổi cấu hình'
      okText='Xin mã OTP và lưu'
      // Không có thay đổi thì BE từ chối PUT sau khi đã tiêu OTP, nên chặn ngay ở đây.
      okButtonProps={{
        loading: confirmLoading,
        disabled: preview?.changes.length === 0
      }}
      onOk={onConfirm}
      onCancel={onCancel}
      width={{ xs: 'calc(100vw - 24px)', md: 720 }}
    >
      {preview && (
        <div className='flex flex-col gap-3'>
          {preview.changes.length === 0 ? (
            <p className='text-sm text-muted-foreground'>
              Không có thay đổi nào so với cấu hình đang áp dụng.
            </p>
          ) : (
            <table className='w-full text-left text-sm'>
              <thead className='text-xs text-muted-foreground'>
                <tr>
                  <th className='py-1 pr-2 font-medium'>Tham số</th>
                  <th className='py-1 pr-2 font-medium'>Giá trị cũ</th>
                  <th className='py-1 pr-2 font-medium'>Giá trị mới</th>
                  <th className='py-1 font-medium' />
                </tr>
              </thead>
              <tbody>
                {preview.changes.map((change) => (
                  <tr
                    key={change.parameter}
                    className='border-t border-border'
                  >
                    <td className='py-1 pr-2'>{change.parameter}</td>
                    <td className='py-1 pr-2 tabular-nums'>
                      {formatValue(change.parameter, change.oldValue)}
                    </td>
                    <td className='py-1 pr-2 tabular-nums'>
                      {formatValue(change.parameter, change.newValue)}
                    </td>
                    <td className='py-1'>
                      {change.reducesProtection && (
                        <span className='rounded-md bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-strong'>
                          Giảm bảo đảm
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <dl className='grid grid-cols-2 gap-2 rounded-lg border border-border p-3 text-sm'>
            <dt className='text-muted-foreground'>Mức yêu cầu sau thay đổi</dt>
            <dd className='tabular-nums'>
              {formatCurrency(preview.requiredAmount)}
            </dd>
            <dt className='text-muted-foreground'>Còn thiếu sau thay đổi</dt>
            <dd className='tabular-nums'>{money(preview.shortfallAfter)}</dd>
            <dt className='text-muted-foreground'>Đang dư sau thay đổi</dt>
            <dd className='tabular-nums'>{money(preview.surplusAfter)}</dd>
            <dt className='text-muted-foreground'>
              Sub bị chặn thanh toán khi quá hạn
            </dt>
            <dd className='tabular-nums'>{preview.affectedSubMerchants}</dd>
          </dl>

          {preview.setoffWarning && (
            <p className='rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed'>
              Đang bật cấn trừ tại lệnh rút: tiền rút của Sub có thể bị cấn trừ
              để bù vào ký quỹ của Master.
            </p>
          )}

          {preview.needsApproval && (
            <p
              role='status'
              className='text-sm font-medium text-warning-strong'
            >
              Thay đổi này cần người duyệt
            </p>
          )}

          {preview.reducesProtection && (
            <div>
              <label
                className='mb-1 block text-sm font-medium'
                htmlFor='escrow-config-reason-confirm'
              >
                Lý do giảm mức bảo đảm{' '}
                <span className='text-danger-strong'>*</span>
              </label>
              <TextArea
                id='escrow-config-reason-confirm'
                value={reason}
                onChange={(event) => onReasonChange(event.target.value)}
                rows={3}
                status={reasonError ? 'error' : undefined}
              />
              {reasonError && (
                <p
                  role='alert'
                  className='mt-1 text-xs text-danger-strong'
                >
                  {reasonError}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </DialogModal>
  )
}
