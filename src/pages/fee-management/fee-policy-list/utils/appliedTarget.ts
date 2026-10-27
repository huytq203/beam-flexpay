import {
  getCustomerSegmentName,
  type CustomerSegmentNames
} from '@hooks/useCustomerSegmentNames'
import { allowsMerchantCriteria } from '@utils/fee-execution'
import type { AppliedSubject, AppliedTarget } from '@type/fee.type'

const getSubjectBaseName = (subject: AppliedSubject): string =>
  subject.fullName && subject.displayName
    ? `${subject.fullName} · ${subject.displayName}`
    : (subject.fullName ?? subject.displayName ?? subject.subjectId)

export const getAppliedSubjectName = (subject: AppliedSubject): string => {
  const name = getSubjectBaseName(subject)

  return subject.subjectType === 'MERCHANT' ? `Merchant · ${name}` : name
}

/**
 * Nhãn một đối tượng áp dụng. Chính sách thu hộ / chi hộ (`serviceType`) gọi đối tượng riêng là
 * "Merchant cụ thể" thay cho "ví riêng"; chính sách ví giữ nguyên.
 */
export const getAppliedTargetLabel = (
  target: AppliedTarget,
  customerSegmentNames: CustomerSegmentNames,
  serviceType?: string | null
): string => {
  const isMerchant = allowsMerchantCriteria(serviceType)

  if (target.type === 'ALL') return 'Tất cả'

  if (target.type === 'ACCOUNT') {
    const totalSubjects = target.subjectCount ?? target.count
    const subject =
      totalSubjects === 1 && target.subjects?.length === 1
        ? target.subjects[0]
        : undefined

    if (isMerchant) {
      return subject && (subject.fullName || subject.displayName)
        ? `Merchant cụ thể · ${getSubjectBaseName(subject)}`
        : `${target.count} merchant cụ thể`
    }

    return subject && (subject.fullName || subject.displayName)
      ? `Ví riêng · ${getAppliedSubjectName(subject)}`
      : `${target.count} ví riêng`
  }

  return target.code
    ? getCustomerSegmentName(target.code, customerSegmentNames)
    : 'Chưa gán'
}

export const getAppliedSubjectLines = (target: AppliedTarget): string[] => {
  if (target.type === 'ALL' || !target.subjects?.length) return []

  const lines = target.subjects.map(getAppliedSubjectName)
  const remainingCount = (target.subjectCount ?? 0) - target.subjects.length

  if (remainingCount > 0) {
    lines.push(`… và ${remainingCount} chủ thể khác`)
  }

  return lines
}
