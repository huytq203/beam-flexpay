/**
 * Bất biến dùng chung của mọi endpoint xuất CSV (wallet-core + fee).
 * Năm endpoint chạy qua cùng một `CsvWriter` / `ExportGuard` nên các hằng số ở
 * đây đúng cho tất cả — sửa một chỗ, mọi nút Xuất nhận theo.
 */

/**
 * Trần một lần xuất. Vượt trần BE trả 400 và **không** cắt bớt im lặng, nên FE
 * chặn trước thay vì để người dùng bấm rồi mới nhận thông báo lỗi.
 */
export const EXPORT_ROW_LIMIT = 100_000

/**
 * File luôn sắp theo thời gian tạo giảm dần — không theo cột người dùng đang
 * sắp trên bảng. Ghi chú này chỉ cần cho lưới cho phép đổi thứ tự sắp xếp.
 */
export const EXPORT_ORDER_HINT =
  'File sắp theo thời gian tạo giảm dần, không theo cột đang sắp trên bảng.'

export const buildExportLimitHint = (totalRows: number): string =>
  `Bộ lọc hiện tại khớp ${totalRows.toLocaleString('vi-VN')} dòng, vượt trần ${EXPORT_ROW_LIMIT.toLocaleString('vi-VN')} dòng của một lần xuất. Thu hẹp khoảng thời gian hoặc thêm bộ lọc rồi xuất lại.`

export const isOverExportLimit = (totalRows: number | undefined): boolean =>
  totalRows !== undefined && totalRows > EXPORT_ROW_LIMIT
