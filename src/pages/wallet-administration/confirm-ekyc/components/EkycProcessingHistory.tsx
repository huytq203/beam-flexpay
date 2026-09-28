import {
  CaretDownIcon,
  CaretRightIcon,
  ClockIcon,
  WarningIcon
} from '@components/icons'
import { genderMap } from '../types/ConfirmEKYC.type'
import React from 'react'
import type { ContentEKYC } from '@type/apiResponseEKYC'
import {
  HISTORY_STATUS_CLASS,
  STATUS_LABEL,
  STEP_LABEL,
  DOCUMENT_PROFILE_LABEL
} from '../constants/ekycHistory.constants'
import {
  formatDateTime,
  formatCode,
  formatDate,
  shortIssuePlace
} from '../utils/ekycFormat'

// Toàn bộ giấy tờ đọc được ở CHÍNH lần đó (OCR của phiên), không phải hồ sơ đã chốt.
const AttemptDetail = ({ attempt }: { attempt: ContentEKYC }) => {
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

const HISTORY_COLUMNS = [
  'Lần',
  'Trạng thái / bước',
  'Thông tin cá nhân',
  'Bắt đầu',
  'Hoàn tất',
  'Hết hạn',
  'Face score'
]

const AttemptStatusCell = ({ attempt }: { attempt: ContentEKYC }) => (
  <td className='px-3 py-3'>
    <span
      className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold ${HISTORY_STATUS_CLASS[attempt.status] ?? 'border-slate-300 bg-slate-50 text-slate-700'}`}
    >
      {STATUS_LABEL[attempt.status] ?? formatCode(attempt.status)}
    </span>
    <p className='mt-1 text-xs text-slate-600'>
      {attempt.currentStep
        ? (STEP_LABEL[attempt.currentStep] ?? formatCode(attempt.currentStep))
        : 'Không có bước xử lý'}
    </p>
    <p className='mt-1 max-w-64 break-all text-xs text-slate-500'>
      Session: {attempt.sessionId ?? attempt.ekycSessionId ?? '—'}
    </p>
    {attempt.documentOwnedByOtherAccount && (
      <p className='mt-2 flex items-center gap-1 text-xs font-medium text-amber-700'>
        <WarningIcon
          size={14}
          className='shrink-0'
          aria-hidden
        />
        CCCD đã xác thực ở tài khoản khác
        {attempt.documentOwnerUsername
          ? ` (${attempt.documentOwnerUsername})`
          : ''}
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
)

export const ProcessingHistory = ({
  attempts
}: {
  attempts: ContentEKYC[]
}) => {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})

  if (attempts.length === 0) {
    return (
      <div
        className='flex min-h-32 flex-col items-center justify-center px-4 py-8 text-center'
        role='status'
      >
        <ClockIcon
          size={22}
          className='text-slate-500'
          aria-hidden
        />
        <p className='mt-2 text-sm text-slate-600'>
          Chưa có lần thực hiện eKYC nào.
        </p>
      </div>
    )
  }

  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className='overflow-x-auto'>
      <table className='w-full min-w-200 border-collapse text-left text-sm'>
        <thead className='bg-slate-50 text-xs font-semibold text-slate-600'>
          <tr>
            {HISTORY_COLUMNS.map((title) => (
              <th
                key={title}
                scope='col'
                className={
                  title === 'Face score'
                    ? 'px-3 py-2.5 text-right'
                    : 'px-3 py-2.5'
                }
              >
                {title}
              </th>
            ))}
          </tr>
        </thead>
        {attempts.map((attempt, index) => {
          const key =
            attempt.sessionId ??
            attempt.ekycSessionId ??
            `${attempt.createdAt}-${index}`
          const isOpen = !!expanded[key]
          const attemptNo = attempts.length - index
          return (
            <tbody
              key={key}
              className='border-t border-slate-200'
            >
              <tr className='align-top'>
                <td className='px-3 py-3 font-semibold text-slate-900'>
                  <button
                    type='button'
                    onClick={() => toggle(key)}
                    aria-expanded={isOpen}
                    aria-label={`${isOpen ? 'Thu gọn' : 'Xem chi tiết'} lần ${attemptNo}`}
                    className='inline-flex items-center gap-1 rounded-sm px-1 py-0.5 hover:bg-slate-100'
                  >
                    {isOpen ? (
                      <CaretDownIcon
                        size={14}
                        aria-hidden
                      />
                    ) : (
                      <CaretRightIcon
                        size={14}
                        aria-hidden
                      />
                    )}
                    #{attemptNo}
                  </button>
                </td>
                <AttemptStatusCell attempt={attempt} />
                <td className='px-3 py-3'>
                  {attempt.idNumber || attempt.fullName ? (
                    <>
                      <p className='font-medium text-slate-900'>
                        {attempt.fullName ?? '—'}
                      </p>
                      <p className='text-xs tabular-nums text-slate-600'>
                        {attempt.idNumber ?? '—'}
                      </p>
                      <p className='text-xs text-slate-500'>
                        {attempt.cardType ?? ''}
                      </p>
                    </>
                  ) : (
                    <span className='text-xs text-slate-500'>
                      Chưa đọc được
                    </span>
                  )}
                </td>
                <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>
                  {formatDateTime(attempt.startedAt ?? attempt.createdAt)}
                </td>
                <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>
                  {formatDateTime(attempt.completedAt ?? attempt.verifiedAt)}
                </td>
                <td className='whitespace-nowrap px-3 py-3 tabular-nums text-slate-700'>
                  {formatDateTime(attempt.expiresAt)}
                </td>
                <td className='px-3 py-3 text-right font-semibold tabular-nums text-slate-900'>
                  {attempt.faceMatchScore == null
                    ? '—'
                    : `${attempt.faceMatchScore}%`}
                </td>
              </tr>
              {isOpen && (
                <tr>
                  <td
                    colSpan={7}
                    className='bg-slate-50 px-6 py-4'
                  >
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
