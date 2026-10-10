import { globalMessage } from '@hooks/useMessage'
import { useAppDispatch } from '@hooks/hook'
import { apiJournal } from '@services/apiJournal'
import { useCreateRefundMutation } from '@services/apiRefund'
import { getRefundErrorText } from '@pages/transaction-management/refund-management/utils/refund.utils'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { buildCreateRefundRequest } from '../dto/transactionRefund.dto'
import type { CreateRefundFormValues } from '../schemas/createRefund.schema'

export type CreateRefundResult = { ok: true } | { ok: false; message: string }

const UNSUPPORTED =
  'Giao dịch này chưa đủ dữ liệu hoặc không thuộc loại có thể hoàn tiền.'

/**
 * `createRefund` tự làm mới danh sách hoàn tiền (tag `Refund`). Dòng giao dịch hiển thị
 * số đã hoàn / đang chờ hoàn nằm ở cache wallet-core nên phải làm mới thêm tag `Journal`.
 * Lỗi BE (vượt hạn mức, đóng băng...) trả về để form hiện nguyên văn `detail`.
 */
export const useCreateRefund = () => {
  const [createRefund, { isLoading }] = useCreateRefundMutation()
  const dispatch = useAppDispatch()

  const submit = async (
    transaction: UnifiedContentJournal,
    values: CreateRefundFormValues
  ): Promise<CreateRefundResult> => {
    const request = buildCreateRefundRequest(transaction, values)
    if (!request) return { ok: false, message: UNSUPPORTED }
    try {
      const refund = await createRefund(request).unwrap()
      dispatch(apiJournal.util.invalidateTags(['Journal']))
      globalMessage.success(
        `Đã tạo yêu cầu ${refund.refundCode}, chờ người khác duyệt.`
      )
      return { ok: true }
    } catch (error) {
      return { ok: false, message: getRefundErrorText(error) }
    }
  }

  return { submit, isSubmitting: isLoading }
}
