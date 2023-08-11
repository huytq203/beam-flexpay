export enum DATE_PAYLOAD {
  DAY = 'DAY',
  LAST_DAY = 'LAST_DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH'
}

export type DeviceChartItemType = {
  value: number
  type: string
}

export type ProvinceChartItemType = {
  year: string
  value: number
}

export type ProvinceDataType = {
  createdAt: string
  id: number
  key: string
  periodFrom: string
  periodTo: string
  type: string
  updatedAt: string
  value: number
}

export type ReportItemType = {
  time: string
  value: number
}

export type ReportDataType = {
  createdAt: string
  id: number
  key: string
  periodFrom: string
  periodTo: string
  type: string
  updatedAt: string
  value: number
}
