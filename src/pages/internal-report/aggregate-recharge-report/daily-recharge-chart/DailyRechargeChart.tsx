
import { Card, Col, Typography } from 'antd';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const DailyRechargeChart = () => {
  const { t } = useTranslation()

  const trans = useCallback((key: string) => {
    const str = `internal-aggregate-recharge-report.${key}`
    return t(str);
  }, [])



  return (
    <Col
      xs={24}
      lg={12}
    >
      <Card>
        <Typography.Title level={5}>
          {trans('dailyRecharge')}
        </Typography.Title>
        <div style={{ padding: '24px 0', textAlign: 'center' }}>
          <i>(Biểu đồ đã bị gỡ theo yêu cầu)</i>
        </div>
      </Card>
    </Col>
  )
}

export default React.memo(DailyRechargeChart)
