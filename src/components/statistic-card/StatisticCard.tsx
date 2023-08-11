import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons'
import { Card, Col, Row, Typography } from 'antd'
import React from 'react'
import './style.scss'

interface Props {
  color: string
  title: string
  description: string
  data: string
  type: boolean
  icon: React.ReactNode
}

const StatisticCard = ({
  color,
  data,
  description,
  icon,
  title,
  type
}: Props) => {
  return (
    <Card
      className='statistic-card h-100'
      style={{ background: color }}
    >
      <Row
        align={'middle'}
        justify={'space-between'}
      >
        <Col>
          <Typography.Title
            className='t-white'
            level={5}
          >
            {title}
          </Typography.Title>
          <Typography.Title
            className='t-white'
            level={2}
          >
            {data} {type ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
          </Typography.Title>
          <Typography.Text className='t-white'>{description}</Typography.Text>
        </Col>
        <Col>
          <div className='icon-wrapper t-white d-flex justify-center align-center'>
            {icon}
          </div>
        </Col>
      </Row>
    </Card>
  )
}

export default StatisticCard
