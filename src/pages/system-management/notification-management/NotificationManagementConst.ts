export enum  NOTIFICATION_CONTEXT_SETTING {
     /**
     * Đối tượng áp dụng
     */
     OBJECT = 'OBJECT',
     /**
      * Loại dịch vụ
      */
     SERVICE = 'SERVICE',
     /**
      * Trạng thái
      */
     STATUS = 'STATUS',
     /**
      * Title
      */
     TEXT_TITLE = 'TEXT_TITLE',
     /**
      * Ngày áp dụng
      */
     APPLY_DATE = 'APPLY_DATE',
     /**
      * Nội dung
      */
     CONTENT = 'CONTENT',
}

export enum NOTIFICATION_TYPE_OBJECT {
    /**
     * Hệ thống
     */
    SYSTEM = 'SYSTEM',
    /**
     * Đối tượng riêng
     */
    PERSONAL_ACCOUNT = 'PERSONAL_ACCOUNT',
    /**
     * Nhóm tài khoản
     */
    ACCOUNT_GROUP = 'ACCOUNT_GROUP',
}

export enum NOTIFICATION_TYPE_SERVICE {
    /**
     * Nạp tiền từ thẻ liên kết
     */
    DEPOSIT_LINK_BANK = 'DEPOSIT_LINK_BANK',
    /**
     * Nạp tiền từ khoản ngân hàng
     */
    DEPOSIT_CARD_PHONE = 'DEPOSIT_CARD_PHONE',
    /**
     * Nạp tiền không thành công
     */
    DEPOSIT_FAIL = 'DEPOSIT_FAIL',
    /**
     * Nạp tiền điện thoại
     */
    CHARGE_CARD_PHONE_NUMBER = 'CHARGE_CARD_PHONE_NUMBER',
    /**
     * Nạp Data 3G/4G
     */
    CHARGE_DATA_3G_4G = 'CHARGE_DATA_3G_4G',
    /**
     * Mua mã thẻ di động
     */
    PAYMENT_CARD_PHONE = 'PAYMENT_CARD_PHONE',
    /**
     * Mua mã thẻ data 3G/4G
     */
    PAYMENT_DATA_3G_4G = 'PAYMENT_DATA_3G_4G',
    /**
     * Chuyển tiền người chuyển
     */
    TRANSFER_RECEIVE = 'TRANSFER_RECEIVE',
    /**
     * Chuyển tiền người nhận
     */
    TRANSFER_MOVER = 'TRANSFER_MOVER',
    /**
     * Rút tiền về tài khoản liên kết
     */
    WITHDRAW_LINK_BANK = 'WITHDRAW_LINK_BANK',
    /**
     * Rút tiền về tài khoản chưa liên kết
     */
    WITHDRAW_NOT_LINK_BANK = 'WITHDRAW_NOT_LINK_BANK',
    /**
     * Liên kết thẻ
     */
    LINK_BANK = 'LINK_BANK',
    /**
     * Huỷ liên kết thẻ
     */
    UNLINK_BANK = 'UNLINK_BANK',
    /**
     * Thanh toán hoá đơn
     */
    PAYMENT_BILL = 'PAYMENT_BILL',
    /**
     * Cảnh báo đăng nhập tại 1 thiết bị mới
     */
    WARNING_LOGIN_NEW_DEVICE = 'WARNING_LOGIN_NEW_DEVICE',
    /**
     * Cảnh báo đổi mật khẩu định kỳ 90 ngày/ lần
     */
    WARNING_CHANGE_PASSWORD = 'WARNING_CHANGE_PASSWORD',
    /**
     * Dịch vụ khác
     */
    OTHER = 'OTHER'
}
