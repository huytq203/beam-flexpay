import { DialogModal } from '@components/index'

interface EscrowSetoffWarningDialogProps {
  open: boolean
  onClose: () => void
}

/**
 * Nội dung "cảnh báo hệ quả của việc cấn trừ tại lệnh rút" mà ô xác nhận trong form cấu hình ký quỹ
 * nhắc tới. SRS chỉ bắt tick xác nhận, không có câu chữ cho cảnh báo, nên mỗi ý dưới đây chỉ nêu lại
 * đúng hành vi đang chạy ở BE (MerchantEscrowSetoffService, MerchantSubWithdrawalService) và điều SRS
 * đã ghi ở FR-MER-0625-02 đến 05 — không thêm quy tắc mới.
 */
export function EscrowSetoffWarningDialog({
  open,
  onClose
}: EscrowSetoffWarningDialogProps) {
  return (
    <DialogModal
      open={open}
      title='Hệ quả của việc cấn trừ tại lệnh rút'
      okText='Đã hiểu'
      onOk={onClose}
      onCancel={onClose}
      // Popup chỉ để đọc: một nút đóng là đủ.
      cancelButtonProps={{ style: { display: 'none' } }}
      width={{ xs: 'calc(100vw - 24px)', md: 640 }}
    >
      <ul className='flex list-disc flex-col gap-2 pl-5 text-sm'>
        <li>
          Khi số dư ký quỹ của Master chưa đủ mức yêu cầu, mỗi lệnh rút doanh
          thu của Sub-merchant bị cấn trừ số tiền bằng giá trị nhỏ hơn giữa phần
          ký quỹ còn thiếu và số tiền của lệnh rút.
        </li>
        <li>
          Khoản cấn trừ được giữ lại vào ký quỹ của Master, ghi là đóng góp của
          Sub-merchant tạo lệnh rút, và không về tài khoản ngân hàng của
          Sub-merchant.
        </li>
        <li>
          Số thực nhận = số tiền lệnh rút − khoản cấn trừ − phí rút. Merchant
          thấy đủ bốn dòng này trước khi xác nhận lệnh. Thực nhận bằng 0 thì
          Merchant phải xác nhận riêng; còn lại lớn hơn 0 nhưng nhỏ hơn phí rút
          thì không tạo được lệnh.
        </li>
        <li>
          Khi tăng mức ký quỹ yêu cầu, phần còn thiếu mới chỉ áp cho lệnh rút
          tạo sau thời điểm lưu; lệnh rút đã tạo trước đó không bị tính lại.
        </li>
        <li>
          Tiền đã vào ký quỹ không rút được bằng lệnh rút doanh thu. Tiền chỉ ra
          khỏi ký quỹ qua lệnh hoàn trả ký quỹ được duyệt hoặc khấu trừ khi chấm
          dứt hợp tác; hệ thống không tự động hoàn.
        </li>
      </ul>
    </DialogModal>
  )
}
