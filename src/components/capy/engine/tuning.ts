/**
 * Thông số "độ linh động" của Capy. Người dùng chọn mức ở bảng cài đặt (nút Capy trên header);
 * mỗi mức ánh xạ sang số cụ thể ở đây. Chỉnh số tại đây để đổi ý nghĩa của từng mức.
 */
export type SpeedLevel = 'slow' | 'normal' | 'fast'
export type ActivityLevel = 'low' | 'normal' | 'high'
export type ActionName = 'roam' | 'run' | 'climb' | 'rest' | 'selfie'

export const SPEED_LEVELS: readonly SpeedLevel[] = ['slow', 'normal', 'fast']
export const ACTIVITY_LEVELS: readonly ActivityLevel[] = [
  'low',
  'normal',
  'high'
]
/** Số phút không ai động vào thì Capy đi ngủ; 0 nghĩa là không bao giờ ngủ. */
export const SLEEP_AFTER_OPTIONS = [3, 5, 10, 15, 0] as const
export type SleepAfter = (typeof SLEEP_AFTER_OPTIONS)[number]

export interface Levels {
  readonly speed: SpeedLevel
  readonly activity: ActivityLevel
  readonly sleepAfter: SleepAfter
}

/** Mặc định: đi chậm vừa phải, ít đi lại, ngủ sau 5 phút. */
export const DEFAULT_LEVELS: Levels = {
  speed: 'normal',
  activity: 'normal',
  sleepAfter: 5
}

export interface CapyTuning {
  readonly walkSpeed: number
  readonly runSpeed: number
  /** Đi quãng dài hơn số px này thì chuyển sang chạy. */
  readonly runFrom: number
  /** Hệ số kéo dài thời gian mỗi cú nhảy bậc. */
  readonly hopScale: number
  /** Khoảng đứng chờ giữa hai hành động, mili giây: [ngắn nhất, dài nhất]. */
  readonly gap: readonly [number, number]
  readonly lookChance: number
  /** Mỗi lần xuất hiện của một tên là một "phiếu" khi chọn hành động ngẫu nhiên. */
  readonly weighted: readonly ActionName[]
  /** null nghĩa là không ngủ. */
  readonly sleepAfterMs: number | null
}

const SPEED = {
  slow: { walkSpeed: 40, runSpeed: 105, runFrom: 420, hopScale: 1.7 },
  normal: { walkSpeed: 55, runSpeed: 140, runFrom: 360, hopScale: 1.35 },
  fast: { walkSpeed: 80, runSpeed: 210, runFrom: 260, hopScale: 1 }
} as const

const ACTIVITY: Record<
  ActivityLevel,
  Pick<CapyTuning, 'gap' | 'weighted' | 'lookChance'>
> = {
  low: {
    gap: [10_000, 20_000],
    lookChance: 0.5,
    weighted: ['roam', 'rest', 'rest', 'rest', 'selfie']
  },
  normal: {
    gap: [6000, 12_000],
    lookChance: 0.5,
    weighted: ['roam', 'roam', 'run', 'rest', 'rest', 'selfie']
  },
  high: {
    gap: [2200, 4500],
    lookChance: 0.5,
    weighted: ['roam', 'roam', 'roam', 'run', 'run', 'rest', 'selfie']
  }
}

export function buildTuning({
  speed,
  activity,
  sleepAfter
}: Levels): CapyTuning {
  return {
    ...SPEED[speed],
    ...ACTIVITY[activity],
    sleepAfterMs: sleepAfter === 0 ? null : sleepAfter * 60_000
  }
}

/** Hành động khi người dùng chọn "Chỉ đứng yên": không di chuyển. */
export const IDLE_ONLY_ACTIONS: readonly ActionName[] = ['rest', 'selfie']

/** Mỗi giấc ngủ dài kéo dài ngẫu nhiên trong khoảng này, mili giây. */
export const DEEP_SLEEP_MS: readonly [number, number] = [60_000, 120_000]

/**
 * Công tắc an toàn. `forbiddenZones` đang **tắt**: Capy không né, không mờ đi và không dừng trước các ô
 * có số tiền, số tài khoản hay nút thao tác (vì hiện chưa có tương tác nào chạm vào chữ). Bật lại bằng cách
 * đổi thành `true`: toàn bộ logic né vùng cấm (`zones.ts`, `sensitive.ts`) vẫn còn nguyên. Có hộp thoại mở
 * thì Capy vẫn ngồi ở góc, việc đó độc lập với công tắc này.
 */
export const SAFETY = { forbiddenZones: false }

/**
 * Sân khấu của Capy. `pagePlatforms` đang **tắt**: Capy chỉ đi lại dọc đáy khung màn hình, không đứng trên
 * mép thẻ, hàng bảng, nút hay ô nhập ("bậc thang"), và không còn hành động nhảy bậc. Bật lại bằng cách đổi
 * thành `true` và thêm `'climb'` vào danh sách hành động của từng mức ở trên.
 */
export const STAGE = { pagePlatforms: false }
