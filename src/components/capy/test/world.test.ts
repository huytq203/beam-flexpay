import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SAFETY, STAGE } from '../engine/tuning'
import { measureWorld } from '../engine/world'

beforeEach(() => {
  SAFETY.forbiddenZones = true
  STAGE.pagePlatforms = true
  document.body.innerHTML = ''
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
    function (this: Element) {
      const raw = this.getAttribute('data-rect')
      const [left, top, width, height] = raw
        ? raw.split(',').map(Number)
        : [0, 0, 0, 0]
      return {
        left,
        top,
        width,
        height,
        right: left + width,
        bottom: top + height,
        x: left,
        y: top,
        toJSON: () => ({})
      }
    }
  )
})
afterEach(() => {
  SAFETY.forbiddenZones = false
  STAGE.pagePlatforms = false
  vi.restoreAllMocks()
})

describe('measureWorld', () => {
  it('đưa ô số tiền chưa đánh dấu vào vùng cấm bằng cách nhận biết nội dung', () => {
    document.body.innerHTML = `<table><tbody><tr>
      <td data-rect="300,200,120,40">2,000,000 VND</td>
      <td data-rect="420,200,120,40">Rút tiền</td>
    </tr></tbody></table>`
    const { zones } = measureWorld(54)
    expect(zones).toHaveLength(1)
    expect(zones[0].left).toBe(300)
  })

  it('gộp cả vùng đánh dấu data-capy và vùng tự nhận biết', () => {
    document.body.innerHTML = `<div data-capy="no" data-rect="10,100,50,50"></div>
      <table><tbody><tr><td data-rect="300,200,120,40">0962341913</td></tr></tbody></table>`
    expect(measureWorld(54).zones).toHaveLength(2)
  })

  it('bỏ qua vùng nằm ngoài khung nhìn', () => {
    document.body.innerHTML = `<table><tbody><tr><td data-rect="300,5000,120,40">2,000,000 VND</td></tr></tbody></table>`
    expect(measureWorld(54).zones).toHaveLength(0)
  })

  it('luôn có nền đáy viewport ở cuối danh sách', () => {
    const { platforms, height } = measureWorld(54)
    expect(platforms[platforms.length - 1].y).toBe(height - 8)
  })

  it('công tắc vùng cấm tắt (mặc định) thì không đo vùng cấm nào', () => {
    SAFETY.forbiddenZones = false
    document.body.innerHTML = `<div data-capy="no" data-rect="10,100,50,50"></div>
      <table><tbody><tr><td data-rect="300,200,120,40">2,000,000 VND</td></tr></tbody></table>`
    expect(measureWorld(54).zones).toHaveLength(0)
  })

  it('mặc định của công tắc là tắt', () => {
    SAFETY.forbiddenZones = false
    expect(SAFETY.forbiddenZones).toBe(false)
  })

  it('mặc định chỉ có nền đáy khung màn hình dù trang có thẻ và hàng bảng', () => {
    STAGE.pagePlatforms = false
    document.body.innerHTML = `<div class="ant-card" data-rect="100,300,600,120"></div>
      <table><tbody><tr class="ant-table-row"><td data-rect="100,500,600,40">x</td></tr></tbody></table>`
    expect(measureWorld(54).platforms).toHaveLength(1)
  })

  it('bật pagePlatforms thì có thêm nền là mép trên các thẻ', () => {
    document.body.innerHTML = `<div class="ant-card" data-rect="100,300,600,120"></div>`
    expect(measureWorld(54).platforms).toHaveLength(2)
  })
})
