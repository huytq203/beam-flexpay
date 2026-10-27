import { getApiErrorDetail } from '@/app/utils/api-error'
import {
  useGetBankAccountQuery,
  type BankAccountChangeRequestItem
} from '@/app/services/merchantBankAccountApi'
import { DialogModal } from '@components/index'
import {
  BankAccountDecisionDialog,
  type BankAccountDecisionType
} from './BankAccountDecisionDialog'

interface Props {
  type: BankAccountDecisionType
  request: BankAccountChangeRequestItem
  onClose: () => void
}

/**
 * Duyệt/từ chối từ hàng đợi: tải tài khoản đích rồi dùng lại hộp thoại quyết
 * định (đối chiếu giá trị hiện tại với đề xuất). Yêu cầu không còn là yêu cầu
 * chờ duyệt của tài khoản thì không cho quyết định trên dữ liệu cũ.
 */
export function BankAccountRequestDecision({ type, request, onClose }: Props) {
  const { data, isError, error, isLoading } = useGetBankAccountQuery(
    request.bankAccountId,
    { refetchOnMountOrArgChange: true }
  )

  if (data?.pendingChangeRequest?.id === request.id)
    return (
      <BankAccountDecisionDialog
        type={type}
        row={data}
        onClose={onClose}
      />
    )

  const stale = data && data.pendingChangeRequest?.id !== request.id
  return (
    <DialogModal
      open
      title='Không thể xử lý yêu cầu'
      onCancel={onClose}
      onOk={onClose}
      okText='Đóng'
      okButtonProps={{ loading: isLoading }}
    >
      <p
        role={isError || stale ? 'alert' : undefined}
        className='text-sm'
      >
        {isLoading && 'Đang tải thông tin tài khoản...'}
        {isError &&
          getApiErrorDetail(error, 'Không thể tải thông tin tài khoản.')}
        {stale &&
          'Yêu cầu này không còn chờ duyệt (đã được xử lý hoặc bị thay thế). Hãy tải lại danh sách.'}
      </p>
    </DialogModal>
  )
}
