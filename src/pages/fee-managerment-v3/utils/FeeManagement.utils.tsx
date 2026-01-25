import {
  serviceType,
} from '@pages/fee-managerment-v3/constants/feePoliciesComponent'
export const getEnumLabel = <T extends Record<string, string>>(
  value: string,
  typeEnum: T
): string => {
  const key = value?.trim() as keyof T
  return typeEnum[key] ?? value
}
export const getServiceTypeLabel = (value: string) => {
  return serviceType[value.trim() as keyof typeof serviceType] ?? value
}

export const convertToISO = (dateString: string) => {
  return new Date(dateString.replace(' ', 'T')).toISOString()
}

export const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleDateString('vi-VN') : ''
}
