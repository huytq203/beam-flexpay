import {
  CloudDownloadOutlined,
  FileDoneOutlined,
  LineChartOutlined,
  WifiOutlined
} from '@ant-design/icons'
import InternalTimeOptions from '@components/internal-time-options/InternalTimeOptions'
import { GUTTER } from '@constants/appConstant'
import {
  useGetAccountChartDataQuery,
  useGetDeviceChartDataQuery,
  useGetProvincesChartDataQuery,
  useLazyGetReportDataQuery
} from '@services/internalReport'
import { getGeneralReportDeviceChartTitle } from '@utils/helperFunctions'
import { Card, Col, DatePicker, Row } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import StatisticCard from '../../../components/statistic-card/StatisticCard'
import CircleChart from './circle-chart/CircleChart'
import DailyRegistration from './daily-registration/DailyRegistration'
import {
  DATE_PAYLOAD,
  DeviceChartItemType,
  ProvinceChartItemType,
  ProvinceDataType,
  ReportDataType,
  ReportItemType
} from './report.const'
import TopCity from './top-city/TopCity'

function InternalAccountsReport() {
  const [selectedOption, setSelectedOption] = useState<DATE_PAYLOAD>(
    DATE_PAYLOAD.DAY
  )
  const [reportChartData, setReportChartData] = useState<ReportItemType[]>([])

  const getValue = (value: any) => {
    if (value !== undefined && value !== null) {
      return value
    } else {
      return '-'
    }
  }

  const { t: trans } = useTranslation()

  const { data: AccountData } = useGetAccountChartDataQuery(selectedOption)
  const { data: DeviceData, isLoading: isLoadingDeviceData } =
    useGetDeviceChartDataQuery('')
  const { data: ProvincetyData, isLoading: isLoadingProvinceData } =
    useGetProvincesChartDataQuery('')
  const [triggerGetReportData] = useLazyGetReportDataQuery()
  const deviceData: DeviceChartItemType[] = useMemo(() => {
    const deviceArr: DeviceChartItemType[] = []
    if (DeviceData?.data) {
      for (const property in DeviceData?.data) {
        deviceArr.push({
          type: getGeneralReportDeviceChartTitle(property) || '-',
          value: DeviceData?.data[property]
        })
      }
    }
    return deviceArr
  }, [DeviceData?.data])

  const provinceData: ProvinceChartItemType[] = useMemo(() => {
    const provinceArr: ProvinceChartItemType[] = []
    if (ProvincetyData?.data) {
      ProvincetyData?.data.map((el: ProvinceDataType) => {
        if (el.type && el.value !== undefined) {
          provinceArr.push({
            year: el.type,
            value: el.value
          })
        }
      })
    }
    return provinceArr
  }, [ProvincetyData?.data])

  const formatReportChartData = useCallback(
    (data: any) => {
      const reportArr: ReportItemType[] = []
      if (data?.data?.statusCode === 200) {
        const responseData = data?.data?.data?.data
        responseData.map((el: ReportDataType) => {
          reportArr.push({
            time: dayjs(el.createdAt).format('DD MMM YYYY'),
            value: el.value
          })
        })
        setReportChartData(reportArr)
      }
    },
    [reportChartData]
  )

  const onChangeDate = async (value: any) => {
    if (value) {
      const data = await triggerGetReportData({
        from: value[0].toISOString(),
        to: value[1].toISOString()
      })
      formatReportChartData(data)
    } else {
      setReportChartData([])
    }
  }

  return (
    <Card title={trans`internal-accounts-report.title`}>
      <Row gutter={GUTTER}>
        <Row gutter={GUTTER}>
          <Col>
            <DatePicker.RangePicker onChange={onChangeDate} />
          </Col>
          <Col>
            <InternalTimeOptions
              setSelectedOption={setSelectedOption}
              selectedOption={selectedOption}
            />
          </Col>
        </Row>
        <Row gutter={GUTTER}>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <StatisticCard
              title={trans`internal-accounts-report.totalAccounts`.toUpperCase()}
              data={getValue(AccountData?.data?.totalAccount)}
              type={getValue(AccountData?.data?.isTotalAccount)}
              description={`${getValue(
                AccountData?.data?.totalAccountToday
              )} ${trans`internal-accounts-report.registerAccountToday`}`}
              color={'#8892d6'}
              icon={<LineChartOutlined style={{ fontSize: 20 }} />}
            />
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <StatisticCard
              title={trans`internal-accounts-report.activeAccount`.toUpperCase()}
              data={getValue(AccountData?.data?.totalAccountActive)}
              type={getValue(AccountData?.data?.isTotalAccountActive)}
              description={`${getValue(
                AccountData?.data?.totalAccountActiveToday
              )} ${trans`internal-accounts-report.registerAccountToday`}`}
              color={'#45bbe0'}
              icon={<WifiOutlined style={{ fontSize: 20 }} />}
            />
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <StatisticCard
              title={trans`internal-accounts-report.KYCAccount`.toUpperCase()}
              data={getValue(AccountData?.data?.totalAccountKyc)}
              type={getValue(AccountData?.data?.isTotalAccountKyc)}
              description={`${getValue(
                AccountData?.data?.totalAccountKycToday
              )} ${trans`internal-accounts-report.registerAccountToday`}`}
              color={'#f06292'}
              icon={<FileDoneOutlined style={{ fontSize: 20 }} />}
            />
          </Col>
          <Col
            xs={24}
            md={12}
            lg={6}
          >
            <StatisticCard
              title={trans`internal-accounts-report.personalAccount`.toUpperCase()}
              data={getValue(AccountData?.data?.totalPersonalAccount)}
              type={getValue(AccountData?.data?.isTotalAccountPersonal)}
              description={`${getValue(
                AccountData?.data?.totalPersonalAccountToday
              )} ${trans`internal-accounts-report.registerAccountToday`}`}
              color={'#78c350'}
              icon={<CloudDownloadOutlined style={{ fontSize: 20 }} />}
            />
          </Col>
          <CircleChart
            deviceData={deviceData}
            isLoading={isLoadingDeviceData}
          />
          <TopCity
            provinceData={provinceData}
            isLoadingProvinceData={isLoadingProvinceData}
          />
          <DailyRegistration reportChartData={reportChartData} />
        </Row>
      </Row>
    </Card>
  )
}
export default InternalAccountsReport
