import { ButtonComponent, CardComponent } from '@components/index'
import { WarningIcon } from '@components/icons'
import BusinessPesonal from './BusinessPesonal'
import { ProcessingHistory } from './EkycProcessingHistory'
import { genderMap } from '../types/ConfirmEKYC.type'
import dayjs from 'dayjs'
import type { EKYCListItem } from '@type/apiResponseEKYC'
import { useState } from 'react'
import { EkycReviewPanel } from './EkycReviewPanel'
import { getReviewSessionId } from '../utils/ekycReviewTarget'

interface Props {
  data?: EKYCListItem
  isLoading?: boolean
  isError?: boolean
  onRetry?: () => void
}

const ContenModalConfirm = ({
  data,
  isError,
  onRetry
}: Pick<Props, 'data' | 'isError' | 'onRetry'>) => {
  const record = data
  // Mở sẵn phiên đang chờ duyệt để xét duyệt ngay trong chi tiết hồ sơ.
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    () => (record ? getReviewSessionId(record) : null)
  )
  // Mục OCR là giấy tờ đọc được ở lần mới nhất, không phải hồ sơ đã chốt của người (dòng lưới).
  const ocr =
    data?.attempts?.find((attempt) => attempt.sessionId === data.sessionId) ??
    data

  const ocrFields = [
    { label: 'Họ và tên', value: ocr?.fullName },
    { label: 'Số điện thoại', value: record?.username },
    { label: 'Số CCCD', value: ocr?.idNumber },
    {
      label: 'Ngày cấp',
      value: ocr?.issueDate
        ? dayjs(ocr.issueDate).format('DD/MM/YYYY')
        : undefined
    },
    {
      label: 'Nơi cấp',
      value: ocr?.issuePlace?.replace(
        /CỤC TRƯỞNG CỤC CẢNH SÁT\nQUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi,
        'Cục CS QLHC về TTXH'
      )
    },
    {
      label: 'Ngày sinh',
      value: ocr?.dateOfBirth
        ? dayjs(ocr.dateOfBirth).format('DD/MM/YYYY')
        : undefined
    },
    {
      label: 'Giới tính',
      value: ocr?.gender
        ? (genderMap[ocr.gender as string] ?? ocr.gender)
        : undefined
    },
    { label: 'Quốc tịch', value: ocr?.nationality }
  ]

  const addressFields = [
    { label: 'Quê quán', value: ocr?.placeOfOrigin ?? ocr?.placeOfBirth },
    { label: 'Nơi thường trú', value: ocr?.permanentAddress }
  ]

  return (
    <>
      {isError && (
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-950'>
          <div className='flex min-w-0 items-center gap-2'>
            <WarningIcon
              className='shrink-0'
              size={18}
              aria-hidden
            />
            <p className='text-sm'>
              Không tải được dữ liệu mới nhất. Đang hiển thị dữ liệu từ danh
              sách.
            </p>
          </div>
          {onRetry && (
            <ButtonComponent
              size='small'
              type='default'
              onClick={onRetry}
            >
              Thử lại
            </ButtonComponent>
          )}
        </div>
      )}
      <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
        <div className='flex min-w-0 flex-col rounded-md border p-2'>
          <BusinessPesonal
            attempts={record?.attempts}
            ocrSessionId={ocr?.sessionId}
            selectedSessionId={selectedSessionId ?? undefined}
            onReload={onRetry}
          />
        </div>
        <section className='min-w-0 overflow-hidden rounded-md border border-slate-200'>
          <div className='border-b border-slate-200 bg-slate-50 px-3 py-2.5'>
            <h2 className='font-medium text-slate-900'>
              Dữ liệu trích xuất (OCR)
            </h2>
          </div>
          <dl className='grid grid-cols-1 gap-x-6 gap-y-4 p-4 sm:grid-cols-2'>
            {ocrFields.map((item) => (
              <div
                key={item.label}
                className='min-w-0'
              >
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
        <ProcessingHistory
          attempts={record?.attempts ?? []}
          onInspect={setSelectedSessionId}
        />
      </div>
      {selectedSessionId && (
        <EkycReviewPanel
          key={selectedSessionId}
          sessionId={selectedSessionId}
          onUpdated={onRetry}
        />
      )}
    </>
  )
}

const BusinessComfirm = ({ data, isLoading, isError, onRetry }: Props) => {
  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-40 text-gray-400'>
        Đang tải dữ liệu...
      </div>
    )
  }

  if (!data) {
    return (
      <div className='flex min-h-40 flex-col items-center justify-center gap-3 px-4 text-center'>
        <WarningIcon
          size={28}
          className='text-amber-700'
          aria-hidden
        />
        <p className='font-medium text-slate-900'>
          Không tải được chi tiết hồ sơ
        </p>
        <p className='text-sm text-slate-600'>Vui lòng thử tải lại dữ liệu.</p>
        {onRetry && (
          <ButtonComponent
            type='default'
            onClick={onRetry}
          >
            Thử lại
          </ButtonComponent>
        )}
      </div>
    )
  }

  return (
    <div>
      <div>
        <CardComponent
          content={
            <ContenModalConfirm
              data={data}
              isError={isError}
              onRetry={onRetry}
            />
          }
        />
      </div>
    </div>
  )
}

export default BusinessComfirm
