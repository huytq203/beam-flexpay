import dayjs from 'dayjs'
import { describe, expect, it } from 'vitest'
import {
  createEscrowOrderSchema,
  ESCROW_ORDER_MESSAGE,
  formatWaitingTime,
  toEscrowOrderCreate,
  todayInVietnam,
  type EscrowEvidenceFile,
  type EscrowOrderFormValues
} from '../escrowOrder.schema'

const doc = (over: Partial<EscrowEvidenceFile> = {}): EscrowEvidenceFile => ({
  uid: 'u1',
  name: 'sao-ke.pdf',
  size: 1024,
  type: 'application/pdf',
  status: 'done',
  response: {
    fileRef: 'stg-1',
    fileName: 'sao-ke.pdf',
    contentType: 'application/pdf',
    sizeBytes: 1024
  },
  ...over
})

const bank = (
  over: Partial<EscrowOrderFormValues> = {}
): EscrowOrderFormValues => ({
  source: 'BANK_TRANSFER',
  amount: 10_000_000,
  receivingAccountRef: 'VCB 0011001234567',
  transferReference: 'FT26303ABC',
  creditedOn: todayInVietnam(),
  documents: [doc()],
  subMerchantId: '',
  note: '',
  ...over
})

/** Mặc định Master đang thiếu 30 triệu: số tiền ≤ 30 triệu thì không cần ghi chú. */
const errorsOf = (values: EscrowOrderFormValues, shortfall = 30_000_000) => {
  const result = createEscrowOrderSchema({ shortfall }).safeParse(values)
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path.join('.'), issue.message])
  )
}

describe('escrowOrderSchema', () => {
  it('lệnh chuyển khoản đủ trường thì qua', () => {
    expect(errorsOf(bank())).toEqual({})
  })

  it.each([0, null, -5])('số tiền %s báo "Số tiền phải lớn hơn 0"', (amount) => {
    expect(errorsOf(bank({ amount }))).toMatchObject({
      amount: 'Số tiền phải lớn hơn 0'
    })
  })

  it('mã tham chiếu 51 ký tự báo lỗi đúng câu BE', () => {
    expect(errorsOf(bank({ transferReference: 'A'.repeat(51) }))).toMatchObject(
      {
        transferReference:
          'Mã tham chiếu chuyển khoản là bắt buộc và tối đa 50 ký tự'
      }
    )
    expect(errorsOf(bank({ transferReference: 'A'.repeat(50) }))).toEqual({})
    expect(errorsOf(bank({ transferReference: '   ' }))).toMatchObject({
      transferReference: ESCROW_ORDER_MESSAGE.transferReference
    })
  })

  it('thiếu tài khoản nhận báo "Cần chọn tài khoản nhận tiền"', () => {
    expect(errorsOf(bank({ receivingAccountRef: ' ' }))).toMatchObject({
      receivingAccountRef: 'Cần chọn tài khoản nhận tiền'
    })
  })

  it('ngày ghi có: trống báo bắt buộc, ngày mai (giờ VN) báo tương lai, hôm nay qua', () => {
    expect(errorsOf(bank({ creditedOn: '' }))).toMatchObject({
      creditedOn: 'Cần nhập ngày ngân hàng ghi có'
    })
    const tomorrow = dayjs(todayInVietnam()).add(1, 'day')
    // FormDatePicker trả dạng 'YYYY-MM-DDT00:00:00.000'; schema chỉ so phần ngày.
    expect(
      errorsOf(bank({ creditedOn: tomorrow.format('YYYY-MM-DDT00:00:00.000') }))
    ).toMatchObject({
      creditedOn: 'Ngày ngân hàng ghi có không được là ngày tương lai'
    })
    expect(
      errorsOf(bank({ creditedOn: `${todayInVietnam()}T00:00:00.000` }))
    ).toEqual({})
  })

  it('chuyển khoản không chứng từ báo "Cần đính kèm ít nhất một chứng từ"', () => {
    expect(errorsOf(bank({ documents: [] }))).toMatchObject({
      documents: 'Cần đính kèm ít nhất một chứng từ'
    })
  })

  it('6 chứng từ báo "Tối đa 5 chứng từ cho mỗi lệnh"', () => {
    const six = Array.from({ length: 6 }, (_, i) => doc({ uid: `u${i}` }))
    expect(errorsOf(bank({ documents: six }))).toMatchObject({
      documents: 'Tối đa 5 chứng từ cho mỗi lệnh'
    })
  })

  it('chứng từ quá 10MB, sai định dạng, hoặc chưa tải xong đều bị chặn', () => {
    expect(
      errorsOf(bank({ documents: [doc({ size: 10_485_761 })] }))
    ).toMatchObject({ documents: 'Mỗi chứng từ tối đa 10MB' })
    expect(
      errorsOf(
        bank({ documents: [doc({ name: 'a.docx', type: 'application/msword' })] })
      )
    ).toMatchObject({ documents: ESCROW_ORDER_MESSAGE.documentType })
    expect(
      errorsOf(
        bank({ documents: [doc({ status: 'uploading', response: undefined })] })
      )
    ).toMatchObject({ documents: ESCROW_ORDER_MESSAGE.documentUploading })
  })

  it('nạp vượt phần còn thiếu thì bắt buộc ghi chú, không đặt tối thiểu ký tự', () => {
    expect(errorsOf(bank({ amount: 40_000_000 }))).toMatchObject({
      note: 'Nạp vượt mức yêu cầu phải nhập ghi chú'
    })
    expect(errorsOf(bank({ amount: 40_000_000, note: 'Dư' }))).toEqual({})
    // Không đọc được số dư (shortfall null) thì không tự suy ra vượt mức.
    expect(errorsOf(bank({ amount: 40_000_000 }), null as never)).toEqual({})
  })

  it('ghi chú quá 500 ký tự báo lỗi', () => {
    expect(errorsOf(bank({ note: 'a'.repeat(501) }))).toMatchObject({
      note: ESCROW_ORDER_MESSAGE.noteMax
    })
  })

  it('trích từ Sub: bắt chọn Sub, bỏ qua các trường chuyển khoản', () => {
    const sub: EscrowOrderFormValues = bank({
      source: 'SUB_REVENUE',
      receivingAccountRef: '',
      transferReference: '',
      creditedOn: '',
      documents: []
    })
    expect(errorsOf(sub)).toEqual({ subMerchantId: 'Cần chọn điểm bán nguồn' })
    expect(errorsOf({ ...sub, subMerchantId: 'sub-1' })).toEqual({})
  })

  it('toEscrowOrderCreate: chuyển khoản gửi fileRef, ngày dạng YYYY-MM-DD; trích Sub để trống trường chuyển khoản', () => {
    expect(
      toEscrowOrderCreate(
        bank({ creditedOn: '2026-10-29T00:00:00.000', note: '  ' }),
        'master-1'
      )
    ).toEqual({
      masterId: 'master-1',
      source: 'BANK_TRANSFER',
      amount: 10_000_000,
      receivingAccountRef: 'VCB 0011001234567',
      transferReference: 'FT26303ABC',
      creditedOn: '2026-10-29',
      subMerchantId: null,
      note: null,
      documents: [
        {
          fileRef: 'stg-1',
          fileName: 'sao-ke.pdf',
          contentType: 'application/pdf',
          sizeBytes: 1024
        }
      ]
    })
    expect(
      toEscrowOrderCreate(
        bank({ source: 'SUB_REVENUE', subMerchantId: 'sub-1', note: 'x' }),
        'master-1'
      )
    ).toEqual({
      masterId: 'master-1',
      source: 'SUB_REVENUE',
      amount: 10_000_000,
      receivingAccountRef: null,
      transferReference: null,
      creditedOn: null,
      subMerchantId: 'sub-1',
      note: 'x',
      documents: []
    })
  })
})

describe('formatWaitingTime', () => {
  const now = Date.parse('2026-10-30T12:00:00Z')
  it('dưới một ngày hiện giờ, từ một ngày hiện ngày', () => {
    expect(formatWaitingTime('2026-10-30T09:30:00Z', now)).toBe('2 giờ')
    expect(formatWaitingTime('2026-10-29T12:00:00Z', now)).toBe('1 ngày')
    expect(formatWaitingTime('2026-10-20T03:00:00Z', now)).toBe('10 ngày')
  })
})
