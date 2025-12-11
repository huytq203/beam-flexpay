import {
  feeDomain,
  serviceType,
  componentType,
  calculationMethodEnum
} from '@type/feePoliciesComponent'

export const getServiceTypeLabel = (value: string) => {
  return serviceType[value.trim() as keyof typeof serviceType] ?? value
}

export const getFeeDomainLabel = (value: string) => {
  return feeDomain[value.trim() as keyof typeof feeDomain] ?? value
}

export const getComponentTypeLabel = (value: string) => {
  return componentType[value.trim() as keyof typeof componentType] ?? value
}

export const getCalculationMethodLabel = (value: string) => {
  return (
    calculationMethodEnum[value.trim() as keyof typeof calculationMethodEnum] ??
    value
  )
}

export const convertToISO = (dateString: string) => {
  return new Date(dateString.replace(' ', 'T')).toISOString()
}

export const formatDate = (date: string) => {
  return date ? new Date(date).toLocaleDateString('vi-VN') : ''
}
