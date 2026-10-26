export interface FrameMeta {
  /** Rộng và cao ảnh gốc, tính bằng px. */
  readonly w: number
  readonly h: number
  /** Điểm neo ngang (tâm áo) tính từ mép trái ảnh. Đáy ảnh luôn là bàn chân. */
  readonly ax: number
  /** Hệ số tỉ lệ để đầu các khung cùng cỡ. */
  readonly s: number
  /** Khung đẩy ô tìm kiếm: [trái, trên, phải, dưới] của thanh đã cắt, tính từ góc ảnh. */
  readonly bar?: readonly [number, number, number, number]
}
