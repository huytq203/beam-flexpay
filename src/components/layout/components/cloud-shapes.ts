export interface CloudPuff {
  cx: number
  cy: number
  r: number
}

export interface CloudBar {
  x: number
  y: number
  width: number
  height: number
  rx: number
}

export interface CloudStreak {
  cx: number
  cy: number
  rx: number
  ry: number
}

/**
 * Mây vẽ bằng hình khối phẳng để khớp ngôn ngữ thị giác của dãy núi:
 * `cumulus` là cụm bóng tròn trên một thanh đáy, `wisp` là vệt mây ti dẹt.
 */
export type CloudShape =
  | {
      kind: 'cumulus'
      width: number
      height: number
      puffs: CloudPuff[]
      base: CloudBar
    }
  | {
      kind: 'wisp'
      width: number
      height: number
      streaks: CloudStreak[]
    }

const shapes = {
  broad: {
    kind: 'cumulus',
    width: 240,
    height: 100,
    puffs: [
      { cx: 78, cy: 56, r: 30 },
      { cx: 126, cy: 46, r: 36 },
      { cx: 172, cy: 58, r: 26 }
    ],
    base: { x: 46, y: 58, width: 164, height: 24, rx: 12 }
  },
  compact: {
    kind: 'cumulus',
    width: 170,
    height: 100,
    puffs: [
      { cx: 66, cy: 58, r: 24 },
      { cx: 104, cy: 48, r: 30 }
    ],
    base: { x: 40, y: 60, width: 100, height: 22, rx: 11 }
  },
  ridge: {
    kind: 'cumulus',
    width: 260,
    height: 100,
    puffs: [
      { cx: 66, cy: 62, r: 20 },
      { cx: 110, cy: 52, r: 26 },
      { cx: 154, cy: 58, r: 22 },
      { cx: 196, cy: 64, r: 16 }
    ],
    base: { x: 44, y: 64, width: 170, height: 18, rx: 9 }
  },
  tower: {
    kind: 'cumulus',
    width: 200,
    height: 100,
    puffs: [
      { cx: 104, cy: 48, r: 34 },
      { cx: 64, cy: 66, r: 24 },
      { cx: 142, cy: 64, r: 26 }
    ],
    base: { x: 40, y: 68, width: 130, height: 14, rx: 7 }
  },
  streakWide: {
    kind: 'wisp',
    width: 320,
    height: 60,
    streaks: [
      { cx: 124, cy: 27, rx: 102, ry: 7 },
      { cx: 214, cy: 40, rx: 78, ry: 5 },
      { cx: 172, cy: 14, rx: 58, ry: 4 }
    ]
  },
  streakThin: {
    kind: 'wisp',
    width: 260,
    height: 60,
    streaks: [
      { cx: 112, cy: 32, rx: 96, ry: 6 },
      { cx: 178, cy: 18, rx: 64, ry: 4 }
    ]
  }
} satisfies Record<string, CloudShape>

export const CLOUD_SHAPES = shapes

export type CloudShapeName = keyof typeof shapes

export interface CloudInstance {
  shape: CloudShapeName
  /** Vị trí ngang tính theo % của track (một nửa track = 0–50). */
  left: number
  /** Vị trí dọc tính theo % chiều cao panel. */
  top: string
  /**
   * Chiều rộng tính theo % của track — tức gấp đôi % của panel. Đo theo panel
   * chứ không theo `vw` để bố cục mây giữ nguyên tỉ lệ ở mọi bề rộng màn hình.
   */
  width: string
}

export interface CloudLayer {
  id: string
  /** Lớp càng xa thì trôi càng chậm — tạo chiều sâu bằng thị sai. */
  durationSeconds: number
  opacity: number
  blurPx: number
  hasFloat: boolean
  clouds: CloudInstance[]
}

/**
 * Ba dải mây chỉ chiếm khoảng trời phía trên linh vật, xếp chiều sâu bằng
 * kích thước — tốc độ — độ đục: mây ti mờ và chậm nhất ở trên, mây gần to
 * và nhanh nhất ở dưới, đủ thấp để linh vật che một phần khi trôi qua.
 */
export const CLOUD_LAYERS: CloudLayer[] = [
  {
    id: 'cirrus',
    durationSeconds: 210,
    opacity: 0.34,
    blurPx: 2.6,
    hasFloat: false,
    clouds: [
      { shape: 'streakWide', left: 6, top: '6%', width: '16.6%' },
      { shape: 'streakThin', left: 30, top: '12%', width: '13.6%' }
    ]
  },
  {
    id: 'distant',
    durationSeconds: 160,
    opacity: 0.62,
    blurPx: 0.8,
    hasFloat: false,
    clouds: [
      { shape: 'compact', left: 6, top: '12%', width: '5.7%' },
      { shape: 'ridge', left: 22, top: '17%', width: '7.1%' },
      { shape: 'tower', left: 38, top: '14%', width: '6%' }
    ]
  },
  {
    id: 'near',
    durationSeconds: 86,
    opacity: 0.96,
    blurPx: 0,
    hasFloat: true,
    clouds: [
      { shape: 'broad', left: 4, top: '18%', width: '14.7%' },
      { shape: 'tower', left: 20, top: '24%', width: '11.8%' },
      { shape: 'ridge', left: 36, top: '20%', width: '15.2%' }
    ]
  }
]
