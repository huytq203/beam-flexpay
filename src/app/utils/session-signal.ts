/**
 * Tín hiệu đăng xuất giữa các tab của cùng trình duyệt. Chỉ khóa này mới làm
 * các tab khác bật popup hết phiên — việc một tab vào trang đăng nhập hay xóa
 * mốc hoạt động không được coi là đăng xuất.
 */
export const LOGOUT_SIGNAL_KEY = 'auth_logout_at'

export const broadcastLogout = (): void => {
  try {
    localStorage.setItem(LOGOUT_SIGNAL_KEY, String(Date.now()))
  } catch {
    // Không ghi được storage thì chỉ tab hiện tại đăng xuất.
  }
}
