import { GUTTER } from '@constants/appConstant'
import { Col, Row, Typography } from 'antd'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface IItemResult {
  title?: string
  data?: any
  extra?: JSX.Element | ReactNode | null | string
  noStyle?: boolean
  boldTitle?: boolean
}

const { Text } = Typography

const ItemDetail = ({
  title,
  data,
  extra,
  noStyle,
  boldTitle
}: IItemResult) => {
  const { t: trans } = useTranslation()

  return (
    <Row
      gutter={GUTTER}
      className={noStyle ? '' : 'mb-30'}
    >
      <Col
        xs={24}
        md={10}
      >
        <Text className={boldTitle ? 'fw-600' : ''}>{title}</Text>
      </Col>
      <Col
        xs={24}
        md={10}
      >
        <>
          {data ? (
            typeof data === 'string' ? (
              <Text> {data}</Text>
            ) : (
              data
            )
          ) : (
            <Text>{trans('labels.nodata')}</Text>
          )}
          {extra || null}
        </>
      </Col>
    </Row>
  )
}

export default ItemDetail
