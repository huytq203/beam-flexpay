import {
  getCustomerSegmentName,
  type CustomerSegmentNames
} from '@hooks/useCustomerSegmentNames'
import type { AppliedSubject, AppliedTarget } from '@type/fee.type'

export const getAppliedSubjectName = (subject: AppliedSubject): string => {
  const name =
    subject.fullName && subject.displayName
      ? `${subject.fullName} · ${subject.displayName}`
      : (subject.fullName ?? subject.displayName ?? subject.subjectId)

  return subject.subjectType === 'MERCHANT' ? `Merchant · ${name}` : name
}

export const getAppliedTargetLabel = (
  target: AppliedTarget,
  customerSegmentNames: CustomerSegmentNames
): string => {
  if (target.type === 'ALL') return 'Tất cả'

  if (target.type === 'ACCOUNT') {
    const totalSubjects = target.subjectCount ?? target.count
    const subject =
      totalSubjects === 1 && target.subjects?.length === 1
        ? target.subjects[0]
        : undefined

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
