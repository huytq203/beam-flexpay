import { ButtonComponent, DialogModal } from '@components/index'

interface StuckRefundConfirmDialogProps {
  open: boolean
  isSubmitting?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Hoàn tiền là lệnh chi thật về ngân hàng, không hoàn tác được nên phải xác nhận lại. */
export const StuckRefundConfirmDialog = ({
  open,
  isSubmitting,
  onConfirm,
  onCancel
}: StuckRefundConfirmDialogProps) => (
  <DialogModal
    open={open}
    title='Xử lý chi tiền hoàn'
    width={{ xs: '100%', sm: 480 }}
    footer={null}
    maskClosable={false}
    onOk={onCancel}
    onCancel={onCancel}
  >
    <p className='m-0 text-sm leading-5 text-foreground'>
      Hệ thống sẽ chi tiền về tài khoản ngân hàng khách đã dùng để nạp. Thao tác
      này không thể hoàn tác. Chỉ tiếp tục khi đã xác nhận ngân hàng đã trừ tiền
      khách.
    </p>
    <div className='mt-4 flex justify-end gap-2'>
      <ButtonComponent
        type='default'
        htmlType='button'
        content='Quay lại'
        disabled={isSubmitting}
        onClick={onCancel}
      />
      <ButtonComponent
        danger
        htmlType='button'
        content='Xác nhận hoàn tiền'
        loading={isSubmitting}
        onClick={onConfirm}
      />
    </div>
  </DialogModal>
)
