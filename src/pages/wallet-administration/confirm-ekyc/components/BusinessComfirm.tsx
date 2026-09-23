import { ButtonComponent, CardComponent } from '@components/index'
import { CaretDownIcon, CaretRightIcon, ClockIcon, WarningIcon } from '@components/icons'
import BusinessPesonal from './BusinessPesonal'
import { genderMap } from '../types/ConfirmEKYC.type'
import dayjs from 'dayjs'
import React from 'react'
import type { ContentEKYC, EKYCListItem } from '@type/apiResponseEKYC'

interface Props {
  data?: EKYCListItem
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

const HISTORY_STATUS_CLASS: Record<string, string> = {
  VERIFIED: 'border-green-300 bg-green-50 text-green-800',
  COMPLETED: 'border-green-300 bg-green-50 text-green-800',
  IN_PROGRESS: 'border-blue-300 bg-blue-50 text-blue-800',
  FAILED: 'border-red-300 bg-red-50 text-red-800',
  ABANDONED: 'border-slate-300 bg-slate-100 text-slate-700',
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  REJECTED: 'border-red-300 bg-red-50 text-red-800',
  INVALIDATED: 'border-slate-300 bg-slate-100 text-slate-700',
  EXPIRED: 'border-slate-300 bg-slate-100 text-slate-700'
}

const STATUS_LABEL: Record<string, string> = {
  VERIFIED: 'Đã xác thực',
  COMPLETED: 'Thành công',
  INITIATED: 'Khởi tạo',
  IN_PROGRESS: 'Đang xử lý',
  FAILED: 'Thất bại',
  ABANDONED: 'Bỏ dở',
  PENDING: 'Chờ xử lý',
  REJECTED: 'Từ chối',
  INVALIDATED: 'Đã huỷ',
  EXPIRED: 'Hết hạn'
}

const STEP_LABEL: Record<string, string> = {
  DOCUMENT_CAPTURE: 'Chụp giấy tờ',
  OCR: 'Trích xuất thông tin',
  CARD_LIVENESS_FRONT: 'Kiểm tra mặt trước giấy tờ',
  CARD_LIVENESS_BACK: 'Kiểm tra mặt sau giấy tờ',
  FACE_CAPTURE: 'Chụp chân dung',
  FACE_LIVENESS: 'Kiểm tra người thật',
  FACE_LIVENESS_3D: 'Kiểm tra người thật 3D',
  FACE_MASK: 'Kiểm tra che mặt',
  FACE_COMPARE: 'Đối chiếu khuôn mặt',
  COMPLETED: 'Hoàn tất'
}

const formatDateTime = (value?: string | null) =>
  value ? dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss') : '—'

const formatCode = (value?: string | null) =>
  value ? value.replaceAll('_', ' ') : '—'

const formatDate = (value?: string | null) =>
  value ? dayjs(value).format('DD/MM/YYYY') : '—'

const shortIssuePlace = (value?: string | null) =>
  value?.replace(/CỤC TRƯỞNG CỤC CẢNH SÁT\s*QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi, 'Cục CS QLHC về TTXH')

const DOCUMENT_PROFILE_LABEL: Record<string, string> = {
  VERIFIED: 'Đã xác thực',
  INVALID: 'Đã thu hồi'
}

// Toàn bộ giấy tờ đọc được ở CHÍNH lần đó (OCR của phiên), không phải hồ sơ đã chốt.
const AttemptDetail = ({ attempt }: { attempt: ContentEKYC }) => {
  const fields = [
    { label: 'Họ và tên', value: attempt.fullName },
    { label: 'Số CCCD', value: attempt.idNumber },
    { label: 'Số CMND cũ', value: attempt.oldIdNumber || undefined },
    { label: 'Loại giấy tờ', value: attempt.cardType },
    { label: 'Ngày sinh', value: attempt.dateOfBirth ? formatDate(attempt.dateOfBirth) : undefined },
    { label: 'Giới tính', value: attempt.gender ? genderMap[attempt.gender] ?? attempt.gender : undefined },
    { label: 'Quốc tịch', value: attempt.nationality },
    { label: 'Nơi sinh', value: attempt.placeOfBirth },
    { label: 'Ngày cấp', value: attempt.issueDate ? formatDate(attempt.issueDate) : undefined },
    { label: 'Nơi cấp', value: shortIssuePlace(attempt.issuePlace) },
    { label: 'Ngày hết hạn', value: attempt.expiryDate ? formatDate(attempt.expiryDate) : undefined },
    { label: 'Tạo lúc', value: formatDateTime(attempt.createdAt) },
    { label: 'Quê quán', value: attempt.placeOfOrigin, wide: true },
    { label: 'Nơi thường trú', value: attempt.permanentAddress, wide: true },
    { label: 'Đặc điểm nhận dạng', value: attempt.features, wide: true },
    {
      label: 'Hồ sơ đang giữ số CCCD này',
      value: attempt.documentProfileStatus
        ? `${DOCUMENT_PROFILE_LABEL[attempt.documentProfileStatus] ?? attempt.documentProfileStatus}`
          + (attempt.documentOwnerUsername ? ` · ${attempt.documentOwnerUsername}` : '')
          + (attempt.documentOwnedByOtherAccount ? ' (tài khoản khác)' : '')
        : 'Chưa có hồ sơ nào',
      wide: true
    }
  ]

  if (!attempt.idNumber && !attempt.fullName) {
    return <p className='text-xs text-slate-500'>Lần này chưa qua bước OCR nên chưa đọc được giấy tờ.</p>
  }

  return (
    <dl className='grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4'>
      {fields.map((field) => (
        <div key={field.label} className={`min-w-0 ${field.wide ? 'col-span-2' : ''}`}>
          <dt className='text-xs text-slate-500'>{field.label}</dt>
          <dd className='mt-0.5 whitespace-pre-line break-words text-sm font-medium text-slate-900'>
            {field.value || '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}

const ProcessingHistory = ({ attempts }: { attempts: ContentEKYC[] }) => {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  if (attempts.length === 0) {
    return (
      <div className='flex min-h-32 flex-col items-center justify-center px-4 py-8 text-center' role='status'>
        <ClockIcon size={22} className='text-slate-500' aria-hidden />
        <p className='mt-2 text-sm text-slate-600'>Chưa có lần thực hiện eKYC nào.</p>
      </div>
    )
  }

  const toggle = (key: string) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-200 border-collapse text-left text-sm'>
        <thead className='bg-slate-50 text-xs font-semibold text-slate-600'>
          <tr>
            <th scope='col' className='px-3 py-2.5'>Lần</th>
            <th scope='col' className='px-3 py-2.5'>Trạng thái / bước</th>
            <th scope='col' className='px-3 py-2.5'>Thông tin cá nhân</th>
            <th scope='col' className='px-3 py-2.5'>Bắt đầu</th>
            <th scope='col' className='px-3 py-2.5'>Hoàn tất</th>
            <th scope='col' className='px-3 py-2.5'>Hết hạn</th>
            <th scope='col' className='px-3 py-2.5 text-right'>Face score</th>
          </tr>
        </thead>
        {attempts.map((attempt, index) => {
          const key = attempt.sessionId ?? attempt.ekycSessionId ?? `${attempt.createdAt}-${index}`
          const isOpen = !!expanded[key]
          const attemptNo = attempts.length - index
          return (
            <tbody key={key} className='border-t border-slate-200'>
              <tr className='align-top'>
                <td className='px-3 py-3 font-semibold text-slate-900'>
                  <button
                    type='button'
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Thu gọn' : 'Xem chi tiết'} lần ${attemptNo}`}
                    className='inline-flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-slate-100'
                  >
                    {isOpen ? <CaretDownIcon size={14} aria-hidden /> : <CaretRightIcon size={14} aria-hidden />}
                    #{attemptNo}
                  </button>
                </td>
                <td className='px-3 py-3'>
                  <span className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold ${HISTORY_STATUS_CLASS[attempt.status] ?? 'border-slate-300 bg-slate-50 text-slate-700'}`}>
                    {STATUS_LABEL[attempt.status] ?? formatCode(attempt.status)}
                  </span>
                  <p className='mt-1 text-xs text-slate-600'>
                    {attempt.currentStep ? STEP_LABEL[attempt.currentStep] ?? formatCode(attempt.currentStep) : 'Không có bước xử lý'}
                  </p>
                  <p className='mt-1 max-w-64 break-all text-xs text-slate-500'>
                    Session: {attempt.sessionId ?? attempt.ekycSessionId ?? '—'}
                  </p>
                  {attempt.documentOwnedByOtherAccount && (
                    <p className='mt-2 flex items-center gap-1 text-xs font-medium text-amber-700'>
                      <WarningIcon size={14} className='shrink-0' aria-hidden />
                      CCCD đã xác thực ở tài khoản khác
                      {attempt.documentOwnerUsername ? ` (${attempt.documentOwnerUsername})` : ''}
                    </p>
                  )}
                  {attempt.invalidationReason && (
                    <div className='mt-2 text-xs text-red-700'>
                      <p>Lý do huỷ: {attempt.invalidationReason}</p>
                      <p>
                        {formatDateTime(attempt.invalidatedAt)}
                        {attempt.invalidatedBy ? ` · ${attempt.invalidatedBy}` : ''}
                      </p>
                    </div>
                  )}
                </td>
                <td className='px-3 py-3'>
                  {attempt.idNumber || attempt.fullName ? (
                    <>
                      <p className='font-medium text-slate-900'>{attempt.fullName ?? '—'}</p>
                      <p className='text-xs tabular-nums text-slate-600'>{attempt.idNumber ?? '—'}</p>
                      <p className='text-xs text-slate-500'>{attempt.cardType ?? ''}</p>
                    </>
                  ) : (
                    <span className='text-xs text-slate-500'>Chưa đọc được</span>
                  )}
                </td>
                <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>{formatDateTime(attempt.startedAt ?? attempt.createdAt)}</td>
                <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>{formatDateTime(attempt.completedAt ?? attempt.verifiedAt)}</td>
                <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>{formatDateTime(attempt.expiresAt)}</td>
                <td className='px-3 py-3 text-right font-semibold tabular-nums text-slate-900'>
                  {attempt.faceMatchScore == null ? '—' : `${attempt.faceMatchScore}%`}
                </td>
              </tr>
              {isOpen && (
                <tr>
                  <td colSpan={7} className='bg-slate-50 px-6 py-4'>
                    <AttemptDetail attempt={attempt} />
                  </td>
                </tr>
              )}
            </tbody>
          )
        })}
      </table>
    </div>
  )
}

const ContenModalConfirm = ({
  data,
  isError,
  onRetry
}: Pick<Props, 'data' | 'isError' | 'onRetry'>) => {
  const record = data
  // Mục OCR là giấy tờ đọc được ở lần mới nhất, không phải hồ sơ đã chốt của người (dòng lưới).
  const ocr = data?.attempts?.[0] ?? data

  const ocrFields = [
    { label: 'Họ và tên', value: ocr?.fullName },
    { label: 'Số điện thoại', value: record?.username },
    { label: 'Số CCCD', value: ocr?.idNumber },
    { label: 'Ngày cấp', value: ocr?.issueDate ? dayjs(ocr.issueDate).format('DD/MM/YYYY') : undefined },
    { label: 'Nơi cấp', value: ocr?.issuePlace?.replace(/CỤC TRƯỞNG CỤC CẢNH SÁT\nQUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi, 'Cục CS QLHC về TTXH') },
    { label: 'Ngày sinh', value: ocr?.dateOfBirth ? dayjs(ocr.dateOfBirth).format('DD/MM/YYYY') : undefined },
    { label: 'Giới tính', value: ocr?.gender ? genderMap[ocr.gender as string] ?? ocr.gender : undefined },
    { label: 'Quốc tịch', value: ocr?.nationality },
  ]

  const addressFields = [
    { label: 'Quê quán', value: ocr?.placeOfOrigin ?? ocr?.placeOfBirth },
    { label: 'Nơi thường trú', value: ocr?.permanentAddress },
  ]

  return (
    <>
      {isError && (
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950'>
          <div className='flex min-w-0 items-center gap-2'>
            <WarningIcon className='shrink-0' size={18} aria-hidden />
            <p className='text-sm'>Không tải được dữ liệu mới nhất. Đang hiển thị dữ liệu từ danh sách.</p>
          </div>
          {onRetry && (
            <ButtonComponent size='small' type='default' onClick={onRetry}>
              Thử lại
            </ButtonComponent>
          )}
        </div>
      )}
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <div className='flex min-w-0 flex-col rounded-md border p-2'>
          <BusinessPesonal />
        </div>
        <section className='min-w-0 overflow-hidden rounded-md border border-slate-200'>
          <div className='border-b border-slate-200 bg-slate-50 px-3 py-2.5'>
            <h2 className='font-medium text-slate-900'>Dữ liệu trích xuất (OCR)</h2>
          </div>
          <dl className='grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2'>
            {ocrFields.map((item) => (
              <div key={item.label} className='min-w-0'>
                <dt className='text-xs text-slate-500'>{item.label}</dt>
                <dd className='mt-1 break-words text-sm font-medium text-slate-900'>
                  {item.value ?? '—'}
                </dd>
              </div>
            ))}
            {addressFields.map((item) => (
              <div
                key={item.label}
                className='min-w-0 border-t border-slate-200 pt-4 sm:col-span-2'
              >
                <dt className='text-xs text-slate-500'>{item.label}</dt>
                <dd className='mt-1 whitespace-pre-line break-words text-sm font-medium leading-5 text-slate-900'>
                  {item.value ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <div className='mt-3 overflow-hidden rounded-md border border-slate-200'>
        <div className='flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2.5'>
          <p className='font-medium text-slate-900'>Lịch sử xử lý</p>
          <span className='text-xs font-medium text-slate-600'>
            {record?.attemptCount ?? record?.attempts.length ?? 0} lần thực hiện
          </span>
        </div>
        <ProcessingHistory attempts={record?.attempts ?? []} />
      </div>
    </>
  )
}

const BusinessComfirm = ({ data, isLoading, isError, onRetry }: Props) => {


  if (isLoading) {
    return <div className="flex justify-center items-center h-40 text-gray-400">Đang tải dữ liệu...</div>
  }

  if (!data) {
    return (
      <div className='flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center'>
        <WarningIcon size={28} className='text-amber-700' aria-hidden />
        <p className='font-medium text-slate-900'>Không tải được chi tiết hồ sơ</p>
        <p className='text-sm text-slate-600'>Vui lòng thử tải lại dữ liệu.</p>
        {onRetry && (
          <ButtonComponent type='default' onClick={onRetry}>Thử lại</ButtonComponent>
        )}
      </div>
    )
  }

  return (
    <div>
      <div>
        <CardComponent content={
          <ContenModalConfirm data={data} isError={isError} onRetry={onRetry} />
        } />
      </div>
    </div>
  )
}

export default BusinessComfirm
