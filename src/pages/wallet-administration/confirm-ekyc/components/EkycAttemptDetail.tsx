import { genderMap } from '../types/ConfirmEKYC.type'
import type { ContentEKYC } from '@type/apiResponseEKYC'
import { DOCUMENT_PROFILE_LABEL } from '../constants/ekycHistory.constants'
import {
  formatDateTime,
  formatDate,
  shortIssuePlace
} from '../utils/ekycFormat'

// Toàn bộ giấy tờ đọc được ở CHÍNH lần đó (OCR của phiên), không phải hồ sơ đã chốt.
export const AttemptDetail = ({ attempt }: { attempt: ContentEKYC }) => {
  const fields = [
    { label: 'Họ và tên', value: attempt.fullName },
    { label: 'Số CCCD', value: attempt.idNumber },
    { label: 'Số CMND cũ', value: attempt.oldIdNumber || undefined },
    { label: 'Loại giấy tờ', value: attempt.cardType },
    {
      label: 'Ngày sinh',
      value: attempt.dateOfBirth ? formatDate(attempt.dateOfBirth) : undefined
    },
    {
      label: 'Giới tính',
      value: attempt.gender
        ? (genderMap[attempt.gender] ?? attempt.gender)
        : undefined
    },
    { label: 'Quốc tịch', value: attempt.nationality },
    { label: 'Nơi sinh', value: attempt.placeOfBirth },
    {
      label: 'Ngày cấp',
      value: attempt.issueDate ? formatDate(attempt.issueDate) : undefined
    },
    { label: 'Nơi cấp', value: shortIssuePlace(attempt.issuePlace) },
    {
      label: 'Ngày hết hạn',
      value: attempt.expiryDate ? formatDate(attempt.expiryDate) : undefined
    },
    { label: 'Tạo lúc', value: formatDateTime(attempt.createdAt) },
    { label: 'Quê quán', value: attempt.placeOfOrigin, wide: true },
    { label: 'Nơi thường trú', value: attempt.permanentAddress, wide: true },
    { label: 'Đặc điểm nhận dạng', value: attempt.features, wide: true },
    {
      label: 'Hồ sơ đang giữ số CCCD này',
      value: attempt.documentProfileStatus
        ? `${DOCUMENT_PROFILE_LABEL[attempt.documentProfileStatus] ?? attempt.documentProfileStatus}` +
          (attempt.documentOwnerUsername
            ? ` · ${attempt.documentOwnerUsername}`
            : '') +
          (attempt.documentOwnedByOtherAccount ? ' (tài khoản khác)' : '')
        : 'Chưa có hồ sơ nào',
      wide: true
    }
  ]

  if (!attempt.idNumber && !attempt.fullName) {
    return (
      <p className='text-xs text-slate-500'>
        Lần này chưa qua bước OCR nên chưa đọc được giấy tờ.
      </p>
    )
  }

  return (
    <dl className='grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4'>
      {fields.map((field) => (
        <div
          key={field.label}
          className={`min-w-0 ${field.wide ? 'col-span-2' : ''}`}
        >
          <dt className='text-xs text-slate-500'>{field.label}</dt>
          <dd className='mt-0.5 whitespace-pre-line break-words text-sm font-medium text-slate-900'>
            {field.value || '—'}
          </dd>
        </div>
      ))}
    </dl>
  )
}
