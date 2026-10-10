import { ButtonComponent } from '@components/index'
import { PERMISSION, useAccess } from '@/app/permissions'
import { useMessage } from '@hooks/useMessage'
import { useLazyGetStuckTransactionReceiptQuery } from '@services/apiStuckTransaction'
import { describeReceiptViewError } from './stuckTransaction.utils'

interface StuckReceiptViewButtonProps {
  transactionCode?: string | null
  className?: string
}

const NO_RECEIPT = 'Giao dịch chưa có biên lai'

/**
 * Link biên lai hết hạn sau ~5 phút nên chỉ lấy khi bấm, không lưu và không gọi lúc mở
 * trang. Chỉ `EWALLET:FULL` thấy nút (BE chỉ mở endpoint cho quyền này).
 */
export const StuckReceiptViewButton = ({
  transactionCode,
  className
}: StuckReceiptViewButtonProps) => {
  const { has } = useAccess()
  const { infoMess, errorMess } = useMessage()
  const [fetchReceipt, { isFetching }] =
    useLazyGetStuckTransactionReceiptQuery()

  if (!transactionCode || !has(PERMISSION.EWALLET_FULL)) return null

  const handleView = async (): Promise<void> => {
    if (isFetching) return
    try {
      const { receiptUrl } = await fetchReceipt(transactionCode).unwrap()
      if (!receiptUrl) {
        infoMess(NO_RECEIPT)
        return
      }
      window.open(receiptUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      errorMess(describeReceiptViewError(error))
    }
  }

  return (
    <ButtonComponent
      htmlType='button'
      type='default'
      className={className}
      content='Xem biên lai'
      loading={isFetching}
      onClick={() => void handleView()}
    />
  )
}
