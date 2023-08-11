import { GUTTER } from '@constants/appConstant'
import { useViewDetailProductTypeQuery } from '@services/productTypeService'
import { renderDisplayOn } from '@utils/helperFunctions'

import { Button, Col, Row, Space, Spin, Typography } from 'antd'
import moment from 'moment'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

type ViewAdminModalProps = {
  data?: any
  onCancel?: () => void
  id: string
}

const { Text } = Typography

export const ViewProductTypeModal = ({
  data,
  onCancel,
  id
}: ViewAdminModalProps) => {
  const { t: trans } = useTranslation()

  const {
    data: detailData,
    isLoading,
    refetch
  } = useViewDetailProductTypeQuery(id)

  if (isLoading) return <Spin />
  return (
    <>
      <Row
        gutter={GUTTER}
        className='mt-20'
      >
        <>
          <Col
            xs={24}
            md={8}
            lg={6}
          >
            <Space direction='vertical'>
              <Text className='fw-600'>
                {trans('productType.serviceType')}:
              </Text>
              {detailData?.data?.service?.name
                ? detailData?.data?.service?.name
                : trans('labels.nodata')}
            </Space>
          </Col>
          <Col
            xs={24}
            md={8}
            lg={6}
          >
            <Space direction='vertical'>
              <Text className='fw-600'>
                {trans('productType.nameServiceType')}:
              </Text>
              {detailData?.data?.name
                ? detailData?.data?.name
                : trans('labels.nodata')}
            </Space>
          </Col>
          <Col
            xs={24}
            md={8}
            lg={6}
          >
            <Space direction='vertical'>
              <Text className='fw-600'>{trans('productType.displayOn')}:</Text>
              {renderDisplayOn(detailData)}
            </Space>
          </Col>
          <Col
            xs={24}
            md={8}
            lg={6}
          >
            <Space direction='vertical'>
              <Text className='fw-600'>{trans('productType.timeUpdate')}:</Text>
              {detailData?.data?.updatedAt
                ? moment(detailData?.data?.updatedAt).format(
                    'HH:mm:ss YYYY/MM/DD'
                  )
                : trans('labels.nodata')}
            </Space>
          </Col>
        </>
      </Row>
      <div className='text-end'>
        <Button
          className='mt-20'
          onClick={onCancel}
          type='primary'
        >{trans`buttons.close`}</Button>
      </div>
    </>
  )
}
