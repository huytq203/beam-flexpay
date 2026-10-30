import type { UploadFile } from 'antd'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { z } from 'zod'
import {
  ESCROW_MAX_DOCUMENT_BYTES,
  ESCROW_MAX_DOCUMENTS,
  ESCROW_TRANSFER_REF_MAX
} from '../constants/merchantEscrow.constants'
import type {
  EscrowDocumentRef,
  EscrowOrderCreate,
  EscrowSource
} from '../types/merchantEscrow.types'

dayjs.extend(utc)

/**
 * Luật form tạo lệnh nạp ký quỹ (SRS 3.6.27), chép từ `MerchantEscrowOrderService.validateNew` ở BE
 * (flex.merchant) và giữ NGUYÊN câu thông báo của BE để người dùng thấy cùng một câu dù lỗi bắt ở FE
 * hay BE. FE kiểm trước để không tốn một lượt xem trước/OTP cho nội dung chắc chắn bị từ chối;
 * BE vẫn là chốt cuối (trùng mã tham chiếu, số dư khả dụng của Sub chỉ BE biết).
 */
export const ESCROW_ORDER_MESSAGE = {
  amount: 'Số tiền phải lớn hơn 0',
  receivingAccount: 'Cần chọn tài khoản nhận tiền',
  transferReference: 'Mã tham chiếu chuyển khoản là bắt buộc và tối đa 50 ký tự',
  creditedOnRequired: 'Cần nhập ngày ngân hàng ghi có',
  creditedOnFuture: 'Ngày ngân hàng ghi có không được là ngày tương lai',
  documentsRequired: 'Cần đính kèm ít nhất một chứng từ',
  documentsMax: 'Tối đa 5 chứng từ cho mỗi lệnh',
  documentSize: 'Mỗi chứng từ tối đa 10MB',
  subMerchant: 'Cần chọn điểm bán nguồn',
  noteRequired: 'Nạp vượt mức yêu cầu phải nhập ghi chú',
  // Ba câu dưới đây BE không có (BE không kiểm định dạng/độ dài ghi chú/trạng thái tải) nên FE tự viết.
  noteMax: 'Ghi chú tối đa 500 ký tự',
  documentType: 'Chứng từ chỉ nhận tệp PDF, JPG, PNG hoặc WEBP',
  documentUploading: 'Chứng từ đang tải lên hoặc tải lỗi, vui lòng chờ hoặc chọn lại tệp'
} as const

/** STT 12: ghi chú tối đa 500 ký tự. Quyết định 27/10 bỏ mức tối thiểu 10 ký tự của SRS. */
export const ESCROW_ORDER_NOTE_MAX = 500

/** Định dạng chứng từ nhận (STT 8 "ảnh hoặc tệp văn bản in"), dùng cho thuộc tính `accept`. */
export const ESCROW_EVIDENCE_ACCEPT =
  '.pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp'
const EVIDENCE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
const EVIDENCE_EXTENSION = /\.(pdf|jpe?g|png|webp)$/i

/**
 * Một chứng từ trong form: `UploadFile` của antd, `response` là tham chiếu tệp tạm BE trả sau khi
 * tải lên ngay lúc chọn tệp (STT 8). Chỉ tệp đã có `response` mới gửi được kèm lệnh.
 */
export type EscrowEvidenceFile = UploadFile<EscrowDocumentRef>

export interface EscrowOrderFormValues {
  source: EscrowSource
  amount: number | null
  receivingAccountRef: string
  transferReference: string
  /** Giá trị FormDatePicker: 'YYYY-MM-DDT00:00:00.000' (hoặc 'YYYY-MM-DD'); chỉ phần ngày có nghĩa. */
  creditedOn: string
  documents: EscrowEvidenceFile[]
  subMerchantId: string
  note: string
}

/**
 * Ngày hôm nay theo giờ Việt Nam ('YYYY-MM-DD'). BE so ngày ghi có với `LocalDate.now(BUSINESS_ZONE)`
 * (Asia/Ho_Chi_Minh), nên FE cũng phải tính theo +07:00 chứ không theo múi giờ của máy người dùng.
 */
export const todayInVietnam = (): string =>
  dayjs.utc().utcOffset(7 * 60).format('YYYY-MM-DD')

/** Phần ngày của giá trị date picker; chuỗi rỗng khi chưa chọn. */
const datePart = (value: string): string => value.slice(0, 10)

/**
 * Số tiền vượt phần còn thiếu (STT 4, FR-MER-0627-05). `shortfall` null nghĩa là chưa đọc được số dư:
 * khi đó không suy ra vượt mức (dialog đã khóa gửi), để không bắt ghi chú dựa trên số giả.
 */
export const overfundOf = (
  amount: number | null,
  shortfall: number | null
): number =>
  amount === null || shortfall === null ? 0 : Math.max(0, amount - shortfall)

const isAllowedEvidence = (file: EscrowEvidenceFile): boolean =>
  EVIDENCE_TYPES.includes(file.type ?? '') || EVIDENCE_EXTENSION.test(file.name)

export interface EscrowOrderSchemaContext {
  /** Phần còn thiếu hiện tại của Master (tổng quan); null khi chưa đọc được số dư. */
  shortfall: number | null
  /** Cho test cố định "hôm nay"; mặc định tính theo giờ Việt Nam lúc kiểm. */
  today?: string
}

export const createEscrowOrderSchema = ({
  shortfall,
  today
}: EscrowOrderSchemaContext) =>
  z
    .object({
      source: z.enum(['BANK_TRANSFER', 'SUB_REVENUE']),
      amount: z.number().nullable(),
      receivingAccountRef: z.string(),
      transferReference: z.string(),
      creditedOn: z.string(),
      documents: z.array(z.custom<EscrowEvidenceFile>()),
      subMerchantId: z.string(),
      note: z.string()
    })
    .superRefine((values, ctx) => {
      const fail = (path: keyof EscrowOrderFormValues, message: string) =>
        ctx.addIssue({ code: 'custom', path: [path], message })

      // Tiền là số nguyên VND; ô số đã chặn phần thập phân nên chỉ còn kiểm > 0.
      if (values.amount === null || values.amount <= 0)
        fail('amount', ESCROW_ORDER_MESSAGE.amount)

      if (values.source === 'BANK_TRANSFER') {
        if (!values.receivingAccountRef.trim())
          fail('receivingAccountRef', ESCROW_ORDER_MESSAGE.receivingAccount)
        const reference = values.transferReference.trim()
        if (!reference || reference.length > ESCROW_TRANSFER_REF_MAX)
          fail('transferReference', ESCROW_ORDER_MESSAGE.transferReference)
        const credited = datePart(values.creditedOn)
        if (!credited)
          fail('creditedOn', ESCROW_ORDER_MESSAGE.creditedOnRequired)
        else if (credited > (today ?? todayInVietnam()))
          fail('creditedOn', ESCROW_ORDER_MESSAGE.creditedOnFuture)
        validateDocuments(values.documents, (message) =>
          fail('documents', message)
        )
      } else if (!values.subMerchantId) {
        fail('subMerchantId', ESCROW_ORDER_MESSAGE.subMerchant)
      }

      if (values.note.length > ESCROW_ORDER_NOTE_MAX)
        fail('note', ESCROW_ORDER_MESSAGE.noteMax)
      else if (
        overfundOf(values.amount, shortfall) > 0 &&
        !values.note.trim()
      )
        fail('note', ESCROW_ORDER_MESSAGE.noteRequired)
    })

/** Thứ tự kiểm giống BE: có tệp → không quá 5 tệp → từng tệp ≤ 10MB; thêm định dạng và trạng thái tải. */
const validateDocuments = (
  documents: EscrowEvidenceFile[],
  fail: (message: string) => void
) => {
  if (documents.length === 0) return fail(ESCROW_ORDER_MESSAGE.documentsRequired)
  if (documents.length > ESCROW_MAX_DOCUMENTS)
    return fail(ESCROW_ORDER_MESSAGE.documentsMax)
  if (documents.some((file) => (file.size ?? 0) > ESCROW_MAX_DOCUMENT_BYTES))
    return fail(ESCROW_ORDER_MESSAGE.documentSize)
  if (!documents.every(isAllowedEvidence))
    return fail(ESCROW_ORDER_MESSAGE.documentType)
  if (documents.some((file) => !file.response))
    return fail(ESCROW_ORDER_MESSAGE.documentUploading)
}

/** Giá trị khởi đầu: nguồn chuyển khoản nếu cấu hình cho phép (mặc định của STT 3), ngày ghi có hôm nay (STT 7). */
export const defaultEscrowOrderValues = (
  allowTransfer: boolean
): EscrowOrderFormValues => ({
  source: allowTransfer ? 'BANK_TRANSFER' : 'SUB_REVENUE',
  amount: null,
  receivingAccountRef: '',
  transferReference: '',
  creditedOn: todayInVietnam(),
  documents: [],
  subMerchantId: '',
  note: ''
})

const blankToNull = (value: string): string | null => value.trim() || null

/**
 * Thân gửi BE. Nguồn trích từ Sub thì để null mọi trường chuyển khoản và không gửi chứng từ: BE
 * cũng bỏ qua các trường đó, gửi null để bản ghi nhật ký không mang dữ liệu thừa của nguồn kia.
 */
export const toEscrowOrderCreate = (
  values: EscrowOrderFormValues,
  masterId: string
): EscrowOrderCreate => {
  const bank = values.source === 'BANK_TRANSFER'
  return {
    masterId,
    source: values.source,
    amount: values.amount,
    receivingAccountRef: bank ? blankToNull(values.receivingAccountRef) : null,
    transferReference: bank ? blankToNull(values.transferReference) : null,
    creditedOn: bank ? datePart(values.creditedOn) || null : null,
    subMerchantId: bank ? null : values.subMerchantId || null,
    note: blankToNull(values.note),
    documents: bank
      ? values.documents.flatMap((file) => (file.response ? [file.response] : []))
      : []
  }
}

/** 'YYYY-MM-DD' (LocalDate của BE) → 'DD/MM/YYYY'; tách chuỗi thay vì qua Date để khỏi lệch múi giờ. */
export const formatLocalDate = (value: string | null): string =>
  value ? value.split('-').reverse().join('/') : '—'

export const CREATE_ORDER_LABEL = 'Tạo lệnh nạp ký quỹ'

/**
 * Lý do vô hiệu nút "Tạo lệnh nạp ký quỹ" (SRS 3.6.26 STT 14 + bước 3 workflow, 3.6.27 STT 1): Master
 * chưa có cấu hình hoặc mức yêu cầu bằng 0. `null` = được lập lệnh. Câu trùng câu BE trả ở
 * `requireConfigured`. Dùng chung cho dòng danh sách, tab lệnh nạp và dialog.
 */
export const createOrderBlockReason = (
  configured: boolean,
  requiredAmount: number
): string | null =>
  !configured || requiredAmount <= 0
    ? 'Master chưa có cấu hình ký quỹ hoặc mức yêu cầu bằng 0; hãy cấu hình ký quỹ trước'
    : null

/**
 * Thời gian chờ của lệnh tính từ lúc lập (SRS 3.6.29 STT 11): dưới một ngày hiện số giờ, từ một ngày
 * trở lên hiện số ngày. `now` tách ra để test cố định đồng hồ.
 */
export const formatWaitingTime = (
  createdAt: string,
  now: number = Date.now()
): string => {
  const hours = Math.max(0, Math.floor((now - Date.parse(createdAt)) / 3_600_000))
  return hours < 24 ? `${hours} giờ` : `${Math.floor(hours / 24)} ngày`
}
