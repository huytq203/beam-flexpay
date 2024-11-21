import Icon from '@ant-design/icons/lib/components/Icon'
import { Card, Col, InputNumber, Progress, Row, Space } from 'antd'

import { useEffect, useState } from 'react'
import './index.scss'

type props = {
  label: string
  icon: any
  iconColor: string
  value: number
  total: number
  className?: string
}

export default function CardLabel({
  label,
  icon,
  iconColor,
  value,
  total,
  className
}: props) {
  const [_value, setValue] = useState(value)

  useEffect(() => {
    setValue(value)
  }, [value])

  return (
    <Card
      title={label}
      className={`card-label ${className}`}
    >
      <Row justify='space-between'>
        <Col>
          <Space direction='horizontal'>
            <Icon
              component={icon}
              className={`fs-30 fw-600 ${iconColor}`}
            />
            <InputNumber
              value={_value || 0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              readOnly
              bordered={false}
              className='fs-25'
              style={{ minWidth: 200 }}
            />
          </Space>
        </Col>
        <Col>
          <Progress
            type='circle'
            width={45}
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            percent={Number(((value / total) * 100).toFixed(0))}
          />
        </Col>
      </Row>
    </Card>
  )
}
