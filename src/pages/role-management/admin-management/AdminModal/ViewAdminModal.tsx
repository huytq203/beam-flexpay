import { GUTTER } from '@constants/appConstant'
import { useUserFindOneQuery } from '@services/cmsUser'
import { Button, Col, Row, Space, Spin, Typography } from 'antd'
import { t } from 'i18next'
import { useTranslation } from 'react-i18next'

type ViewAdminModalProps = {
  onCancel?: () => void
  id: string
}

const { Text } = Typography

const ItemView = ({ label, data }: { label: string; data?: string }) => {
  return (
    <Col
      xs={24}
      md={8}
      lg={6}
    >
      <Space direction='vertical'>
        <Text className='fw-600'>{label}:</Text>
        {data ? <Text>{data}</Text> : <Text>{t('labels.nodata')}</Text>}
      </Space>
    </Col>
  )
}

export const ViewAdminModal = ({ onCancel, id }: ViewAdminModalProps) => {
  const { t: trans } = useTranslation()

  const { data: detailData, isLoading } = useUserFindOneQuery({ id: +id })

  return (
    <Spin spinning={isLoading}>
      <Row gutter={GUTTER}>
        <ItemView
          label={trans('admin-management.label.userName')}
          data={detailData?.fullName}
        />
        <ItemView
          label={trans('admin-management.label.email')}
          data={detailData?.email}
        />
        <ItemView
          label={trans('admin-management.label.phoneNumber')}
          data={detailData?.phoneNumber}
        />
      </Row>
      <Row
        justify='end'
        gutter={GUTTER}
      >
        <Col>
          <Button
            type='primary'
            onClick={onCancel}
          >
            {trans('admin-management.button.close')}
          </Button>
        </Col>
      </Row>
    </Spin>
  )
}
