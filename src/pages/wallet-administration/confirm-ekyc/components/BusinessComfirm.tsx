import { ButtonComponent, CardComponent, Input } from '@components/index'
import { ClockIcon, WarningIcon } from '@components/icons'
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
  IN_PROGRESS: 'border-blue-300 bg-blue-50 text-blue-800',
  PENDING: 'border-amber-300 bg-amber-50 text-amber-800',
  REJECTED: 'border-red-300 bg-red-50 text-red-800',
  INVALIDATED: 'border-slate-300 bg-slate-100 text-slate-700',
  EXPIRED: 'border-slate-300 bg-slate-100 text-slate-700'
}

const STATUS_LABEL: Record<string, string> = {
  VERIFIED: 'Đã xác thực',
  IN_PROGRESS: 'Đang xử lý',
  PENDING: 'Chờ xử lý',
  REJECTED: 'Từ chối',
  INVALIDATED: 'Đã huỷ',
  EXPIRED: 'Hết hạn'
}

const STEP_LABEL: Record<string, string> = {
  DOCUMENT_CAPTURE: 'Chụp giấy tờ',
  OCR: 'Trích xuất thông tin',
  FACE_CAPTURE: 'Chụp chân dung',
  FACE_COMPARE: 'Đối chiếu khuôn mặt',
  COMPLETED: 'Hoàn tất'
}

const formatDateTime = (value?: string | null) =>
  value ? dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss') : '—'

const formatCode = (value?: string | null) =>
  value ? value.replaceAll('_', ' ') : '—'

const ProcessingHistory = ({ attempts }: { attempts: ContentEKYC[] }) => {
  if (attempts.length === 0) {
    return (
      <div className='flex min-h-32 flex-col items-center justify-center px-4 py-8 text-center' role='status'>
        <ClockIcon size={22} className='text-slate-500' aria-hidden />
        <p className='mt-2 text-sm text-slate-600'>Chưa có lần thực hiện eKYC nào.</p>
      </div>
    )
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-200 border-collapse text-left text-sm'>
        <thead className='bg-slate-50 text-xs font-semibold text-slate-600'>
          <tr>
            <th scope='col' className='px-3 py-2.5'>Lần</th>
            <th scope='col' className='px-3 py-2.5'>Trạng thái / bước</th>
            <th scope='col' className='px-3 py-2.5'>Bắt đầu</th>
            <th scope='col' className='px-3 py-2.5'>Hoàn tất</th>
            <th scope='col' className='px-3 py-2.5'>Hết hạn</th>
            <th scope='col' className='px-3 py-2.5 text-right'>Face score</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-200'>
          {attempts.map((attempt, index) => (
            <tr key={attempt.sessionId ?? attempt.ekycSessionId ?? `${attempt.createdAt}-${index}`} className='align-top'>
              <td className='px-3 py-3 font-semibold text-slate-900'>#{attempts.length - index}</td>
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
              <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>{formatDateTime(attempt.startedAt ?? attempt.createdAt)}</td>
              <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>{formatDateTime(attempt.completedAt ?? attempt.verifiedAt)}</td>
              <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>{formatDateTime(attempt.expiresAt)}</td>
              <td className='px-3 py-3 text-right font-semibold tabular-nums text-slate-900'>
                {attempt.faceMatchScore == null ? '—' : `${attempt.faceMatchScore}%`}
              </td>
            </tr>
          ))}
        </tbody>
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

  const ocrFields = [
    { label: 'Họ và tên', value: record?.fullName },
    { label: 'Số điện thoại', value: record?.username },
    { label: 'Số CCCD', value: record?.idNumber },
    { label: 'Ngày cấp', value: record?.issueDate ? dayjs(record.issueDate).format('DD/MM/YYYY') : undefined },
    { label: 'Nơi cấp', value: record?.issuePlace?.replace(/CỤC TRƯỞNG CỤC CẢNH SÁT\nQUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi, 'Cục CS QLHC về TTXH') },
    { label: 'Ngày sinh', value: record?.dateOfBirth ? dayjs(record.dateOfBirth).format('DD/MM/YYYY') : undefined },
    { label: 'Giới tính', value: record?.gender ? genderMap[record.gender as string] ?? record.gender : undefined },
    { label: 'Quốc tịch', value: record?.nationality },
  ]

  const addressFields = [
    { label: 'Quê quán', value: record?.placeOfOrigin ?? record?.placeOfBirth },
    { label: 'Nơi thường trú', value: record?.permanentAddress },
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
        <div className='min-w-0 rounded-md border'>
          <div className='bg-gray-100 p-3'>
            <p className="font-medium">Dữ liệu trích xuất (OCR)</p>
          </div>
          <div className='grid grid-cols-1 gap-1 py-5 sm:grid-cols-2'>
            {ocrFields.map((item, index) => (
              <div key={index} className='col-span-1 mx-2'>
                <span className="text-[12px] text-gray-500">{item.label}</span>
                <Input
                  readOnly
                  value={item.value ?? '—'}
                />
              </div>
            ))}
            {addressFields.map((item, index) => (
              <div key={`addr-${index}`} className='mx-2 sm:col-span-2'>
                <span className="text-[12px] text-gray-500">{item.label}</span>
                <textarea
                  readOnly
                  rows={2}
                  value={item.value ?? '—'}
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5  bg-white resize-none focus:outline-hidden"
                />
              </div>
            ))}
          </div>
        </div>
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
