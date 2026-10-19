import {
  CaretDownIcon,
  CaretRightIcon,
  ClockIcon,
  WarningIcon
} from '@components/icons'
import React from 'react'
import type { ContentEKYC } from '@type/apiResponseEKYC'
import {
  HISTORY_STATUS_CLASS,
  STATUS_LABEL,
  STEP_LABEL
} from '../constants/ekycHistory.constants'
import { formatDateTime, formatCode } from '../utils/ekycFormat'
import { findAppliedAttempt, isStalledAttempt } from '../utils/ekycAttempt'
import { AttemptDetail } from './EkycAttemptDetail'

const HISTORY_COLUMNS = [
  'Phiên',
  'Trạng thái / bước',
  'Thông tin cá nhân',
  'Bắt đầu',
  'Hoàn tất',
  'Hết hạn',
  'Face score'
]

const AttemptStatusCell = ({ attempt }: { attempt: ContentEKYC }) => {
  const isStalled = isStalledAttempt(attempt)
  const status = isStalled ? 'EXPIRED' : attempt.status
  const step = attempt.currentStep
    ? (STEP_LABEL[attempt.currentStep] ?? formatCode(attempt.currentStep))
    : null
  return (
    <td className='px-3 py-3'>
      <span
        className={`inline-flex rounded-sm border px-2 py-0.5 text-xs font-semibold ${HISTORY_STATUS_CLASS[status] ?? 'border-slate-300 bg-slate-50 text-slate-700'}`}
      >
        {STATUS_LABEL[status] ?? formatCode(status)}
      </span>
      <p className='mt-1 text-xs text-slate-600'>
        {step && isStalled
          ? `Dừng ở: ${step}`
          : (step ?? 'Không có bước xử lý')}
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
}

export const ProcessingHistory = ({
  attempts,
  onInspect
}: {
  attempts: ContentEKYC[]
  onInspect?: (sessionId: string) => void
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

  const appliedAttempt = findAppliedAttempt(attempts)
  const toggle = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    // Giới hạn chiều cao để nút xét duyệt bên dưới vẫn nằm trong tầm nhìn khi có nhiều phiên.
    <div
      className='max-h-96 overflow-auto'
      role='region'
      aria-label='Danh sách phiên eKYC'
      tabIndex={0}
    >
      <table className='w-full min-w-200 border-collapse text-left text-sm'>
        <thead className='sticky top-0 z-10 bg-slate-50 text-xs font-semibold text-slate-600'>
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
          const isApplied = attempt === appliedAttempt
          const attemptLabel = isApplied
            ? 'phiên áp dụng gần nhất'
            : `lần ${attempts.length - index}`
          return (
            <tbody
              key={key}
              className='border-t border-slate-200'
            >
              <tr className='align-top'>
                <td className='px-3 py-3 font-semibold text-slate-900'>
                  <div className='flex flex-col items-start gap-1'>
                    <button
                      type='button'
                      onClick={() => toggle(key)}
                      aria-expanded={isOpen}
                      aria-label={`${isOpen ? 'Thu gọn' : 'Xem chi tiết'} ${attemptLabel}`}
                      className='inline-flex items-center gap-1 whitespace-nowrap rounded-sm px-1 py-0.5 hover:bg-slate-100'
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
                      {isApplied
                        ? 'Áp dụng gần nhất'
                        : `#${attempts.length - index}`}
                    </button>
                    {onInspect &&
                      (attempt.sessionId || attempt.ekycSessionId) && (
                        <button
                          type='button'
                          className='ml-4 whitespace-nowrap rounded-sm px-1 py-0.5 text-xs font-medium text-primary-foreground underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-primary'
                          onClick={() =>
                            onInspect(
                              attempt.sessionId ?? attempt.ekycSessionId!
                            )
                          }
                        >
                          Xem phiên
                        </button>
                      )}
                  </div>
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
