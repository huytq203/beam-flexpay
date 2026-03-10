import { Card, Col, Typography } from 'antd'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ProvinceChartItemType } from '../report.const'

type TopCityPropsType = {
  provinceData: ProvinceChartItemType[]
  isLoadingProvinceData: boolean
}

const TopCity = ({ provinceData, isLoadingProvinceData }: TopCityPropsType) => {
  const { t: trans } = useTranslation()


  return (
    <Col
      xs={24}
      lg={8}
    >
      <Card>
        <Typography.Title level={5}>
          {trans`internal-accounts-report.top5`}
        </Typography.Title>
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <i>(Biểu đồ đã bị gỡ theo yêu cầu)</i>
        </div>
      </Card>
    </Col>
  )
}

export default React.memo(TopCity)
