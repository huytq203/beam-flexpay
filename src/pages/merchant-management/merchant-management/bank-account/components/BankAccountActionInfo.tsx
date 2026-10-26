import type { BankAccountDto } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  MIN_HOLD_REASON_LENGTH,
  levelLabel
} from '../constants/bankAccount.constants'
import { BankAccountNotice } from './BankAccountNotice'
import { BankAccountSummary } from './BankAccountSummary'

interface BankAccountActionInfoProps {
  type: 'default' | 'hold'
  row: BankAccountDto
}

function DefaultInfo({ row }: { row: BankAccountDto }) {
  return (
    <>
      <BankAccountNotice tone='info'>
        Tài khoản này sẽ trở thành tài khoản nhận tiền mặc định của{' '}
        {levelLabel(row.level)}. Tài khoản đang là mặc định của cùng cấp sẽ mất
        dấu mặc định.
      </BankAccountNotice>
      {row.level === 'SUB' ? (
        <BankAccountNotice tone='warning'>
          Tài khoản thuộc Sub-merchant nên thay đổi chưa có hiệu lực ngay: hệ
          thống tạo yêu cầu chờ một quản trị viên khác phê duyệt. Người gửi yêu
          cầu không được tự duyệt.
        </BankAccountNotice>
      ) : (
        <BankAccountNotice tone='info'>
          Tài khoản thuộc Master nên có hiệu lực ngay sau khi xác nhận.
        </BankAccountNotice>
      )}
      {row.status === 'INACTIVE' && (
        <BankAccountNotice tone='danger'>
          Tài khoản đang bị khóa nên không thể đặt làm mặc định.
        </BankAccountNotice>
      )}
      <p className='text-xs text-muted-foreground'>
        Bạn sẽ nhập mã OTP ở bước tiếp theo.
      </p>
    </>
  )
}

function HoldInfo({ row }: { row: BankAccountDto }) {
  if (row.holdMode) {
    return (
      <>
        <BankAccountNotice tone='info'>
          Bỏ tạm giữ để cho phép chi tiền về tài khoản này trở lại, với điều
          kiện tài khoản đang hoạt động và đã liên kết.
        </BankAccountNotice>
        {row.holdModeReason && (
          <p className='text-xs text-muted-foreground'>
            Lý do đang giữ: {row.holdModeReason}
            {row.holdModeChangedAt &&
              ` (từ ${formatUTCToLocalDateTime(row.holdModeChangedAt)})`}
          </p>
        )}
      </>
    )
  }
  return (
    <>
      <BankAccountNotice tone='warning'>
        Tạm giữ sẽ đóng băng việc chi tiền về tài khoản này: quyết toán và lệnh
        rút không dùng được tài khoản (trạng thái chi trả chuyển sang “Không thể
        chi trả”) cho đến khi bỏ giữ.
      </BankAccountNotice>
      <BankAccountNotice tone='info'>
        Thông tin và trạng thái hoạt động của tài khoản không đổi. Có thể bỏ giữ
        bất cứ lúc nào. Lý do được ghi vào nhật ký, tối thiểu{' '}
        {MIN_HOLD_REASON_LENGTH} ký tự.
      </BankAccountNotice>
    </>
  )
}

/** Giải thích hệ quả của thao tác trước khi người dùng nhập lý do. */
export function BankAccountActionInfo({
  type,
  row
}: BankAccountActionInfoProps) {
  return (
    <div className='mb-3 flex flex-col gap-2'>
      <BankAccountSummary row={row} />
      {type === 'default' ? <DefaultInfo row={row} /> : <HoldInfo row={row} />}
    </div>
  )
}
