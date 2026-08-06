import { notification } from 'antd'
import { t } from 'i18next'
import i18n from '../../languages/i18n'

interface DisplayOnDetail {
  data?: {
    showWeb?: number
    showApp?: number
  }
}

export const renderDisplayOn = (detailData?: DisplayOnDetail) => {
  if (detailData?.data?.showWeb && detailData?.data?.showApp === 1) {
    return t`productType.web-app`
  }
  if (detailData?.data?.showApp === 1) return t`productType.app`
  if (detailData?.data?.showWeb === 1) return t`productType.web`
  return t`product.noneDisplayOn`
}

export const showSuccessMessage = (message: string) => {
  notification.destroy()
  notification.success({ message })
}

export const getGeneralReportDeviceChartTitle = (title: string) => {
  switch (title) {
    case 'totalDeviceAndroid':
      return i18n.t`internal-accounts-report.chart.title.totalDeviceAndroid`
    case 'totalDeviceIos':
      return i18n.t`internal-accounts-report.chart.title.totalDeviceIos`
    case 'totalDeviceOther':
      return i18n.t`internal-accounts-report.chart.title.totalDeviceOther`
  }
}
