import { Card, Col, Typography } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Bar, BarConfig } from '@ant-design/plots'
import { ProvinceChartItemType } from '../report.const'

type TopCityPropsType = {
  provinceData: ProvinceChartItemType[]
  isLoadingProvinceData: boolean
}

const TopCity = ({ provinceData, isLoadingProvinceData }: TopCityPropsType) => {
  const { t: trans } = useTranslation()

  const config: BarConfig = useMemo(() => {
    return {
      data: provinceData,
      xField: 'value',
      yField: 'year',
      seriesField: 'year',
      legend: {
        position: 'top-left'
      }
    }
  }, [provinceData])
  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans`internal-accounts-report.top5`}
        </Typography.Title>
        <Bar
          loading={isLoadingProvinceData}
          {...config}
        />
      </Card>
    </Col>
  )
}

export default React.memo(TopCity)
