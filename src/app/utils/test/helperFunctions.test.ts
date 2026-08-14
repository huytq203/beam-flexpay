import { describe, expect, it } from 'vitest'
import * as legacyHelpers from '../helperFunctions'
import { getParamsFromURL } from '../helper-functions/browser'
import {
  compareData,
  fnTransformResponse,
  parseManually,
  toPromise
} from '../helper-functions/data'
import {
  extractNativeDateFromPicker,
  formatUTCDateTimeByOffset,
  getDate
} from '../helper-functions/date'
import {
  compareFormData,
  mapEnumToSelectOptions,
  normalizeText
} from '../helper-functions/form'
import {
  convertMiniPercentToPercent,
  convertMiniPercentToPercentNumber,
  convertNumber,
  convertPercentToMiniPercent,
  parseNumberFromCommaString
} from '../helper-functions/number'
import { formatKey } from '../helper-functions/policy'

describe('helperFunctions compatibility facade', () => {
  it('re-export đúng implementation từ các module chuyên biệt', () => {
    expect(legacyHelpers.mapEnumToSelectOptions).toBe(mapEnumToSelectOptions)
    expect(legacyHelpers.normalizeText).toBe(normalizeText)
    expect(legacyHelpers.convertNumber).toBe(convertNumber)
    expect(legacyHelpers.getDate).toBe(getDate)
    expect(legacyHelpers.fnTransformResponse).toBe(fnTransformResponse)
    expect(legacyHelpers.formatKey).toBe(formatKey)
    expect(legacyHelpers.getParamsFromURL).toBe(getParamsFromURL)
  })
})

describe('form helpers', () => {
  it('map enum-like object thành option và giữ key làm value', () => {
    expect(
      mapEnumToSelectOptions({ ACTIVE: 'Hoạt động', ENABLED: true })
    ).toEqual([
      { label: 'Hoạt động', value: 'ACTIVE' },
      { label: 'true', value: 'ENABLED' }
    ])
  })

  it('chuẩn hóa fullwidth text và khoảng trắng', () => {
    expect(normalizeText('　ＦｌｅｘＰａｙ　')).toBe('FlexPay')
  })

  it('so sánh FormData nhưng bỏ qua bigImage', () => {
    const formData = new FormData()
    formData.set('name', 'new-name')
    formData.set('bigImage', 'new-image')

    expect(
      compareFormData(formData, {
        name: 'old-name',
        bigImage: 'old-image'
      })
    ).toEqual(['name'])
  })
})

describe('number helpers', () => {
  it('giữ nguyên quy tắc format và parse số', () => {
    expect(convertNumber(1234567, ' VND')).toBe('1,234,567 VND')
    expect(parseNumberFromCommaString('1,234,567')).toBe(1234567)
  })

  it('chuyển đổi mini-percent hai chiều', () => {
    expect(convertMiniPercentToPercent(10500)).toBe('10.5%')
    expect(convertMiniPercentToPercentNumber(10500)).toBe(10.5)
    expect(convertPercentToMiniPercent(10.5)).toBe(10500)
  })
})

describe('data and date helpers', () => {
  it('unwrap response và chuyển giá trị thành Promise', async () => {
    expect(fnTransformResponse({ data: { id: 'fee-1' } })).toEqual({
      id: 'fee-1'
    })
    await expect(toPromise('done')).resolves.toBe('done')
  })

  it('parse chuỗi object thủ công và so sánh object sâu', () => {
    expect(parseManually('{"name":"FlexPay","priority":10}')).toEqual({
      name: 'FlexPay',
      priority: 10
    })
    expect(
      compareData(
        { name: 'old', config: { enabled: true } },
        { name: 'new', config: { enabled: true } }
      )
    ).toEqual(['name'])
  })

  it('trích xuất ngày từ chuỗi và date-picker object', () => {
    const date = new Date('2026-08-06T00:00:00.000Z')
    expect(getDate('2026-08-06T12:30:00Z')).toBe('2026-08-06')
    expect(extractNativeDateFromPicker({ $d: date })).toBe(date)
  })

  it('format thời gian UTC theo offset được chọn', () => {
    const utcTime = '2026-08-14T13:51:39.642204'

    expect(formatUTCDateTimeByOffset(utcTime, 7)).toBe(
      '14/08/2026 20:51:39'
    )
    expect(formatUTCDateTimeByOffset(utcTime, 0)).toBe(
      '14/08/2026 13:51:39'
    )
  })
})

describe('browser and policy helpers', () => {
  it('đọc query parameter từ URL hiện tại', () => {
    window.history.replaceState({}, '', '/?page=3')
    expect(getParamsFromURL('page')).toBe('3')
  })

  it('format camelCase key thành nhãn dễ đọc', () => {
    expect(formatKey('createdAt')).toBe('Created At')
  })
})
