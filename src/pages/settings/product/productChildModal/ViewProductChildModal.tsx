import { useDetailProductChildQuery } from '@services/productService'
import { useViewDetailProductTypeQuery } from '@services/productTypeService'
import { renderDisplayOn } from '@utils/helperFunctions'

import {
  Button,
  Checkbox,
  Col,
  Modal,
  Row,
  Space,
  Spin,
  Typography
} from 'antd'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  mode?: any
  open: boolean
  onCancel: () => void
  id: string
}

const { Text } = Typography

export const ViewProductChildModal = ({ open, onCancel, id }: IProps) => {
  const { t } = useTranslation()

  const { data: getDetailProductChild, isLoading } = useDetailProductChildQuery(
    id,
    {
      skip: id === ''
    }
  )

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        centered
        title={t('product.childProduct.view-childProduct')}
        footer={null}
        width={1000}
        className='modal-product'
        maskClosable={false}
        mask
        destroyOnClose={true}
      >
        <>
          <Row className='mt-20 mb-15'>
            <Col
              span={8}
              className='fw-600'
            >
              {t('product.productBig')}:
            </Col>
            <Col>
              {getDetailProductChild?.data?.groupProduct?.name
                ? getDetailProductChild?.data?.groupProduct?.name
                : t('labels.nodata')}
            </Col>
          </Row>
          <Row className='mb-15'>
            <Col
              span={8}
              className='fw-600'
            >
              {t('product.childProduct.childProduct')}:
            </Col>
            <Col>
              {getDetailProductChild?.data?.name
                ? getDetailProductChild?.data?.name
                : t('labels.nodata')}
            </Col>
          </Row>
          <Row className='mb-15'>
            <Col
              span={8}
              className='fw-600'
            >
              {t('product.childPrice')}:
            </Col>
            <Col>
              {getDetailProductChild?.data?.price
                ? getDetailProductChild?.data?.price.toLocaleString('vi', {
                    style: 'currency',
                    currency: 'VND'
                  })
                : t('labels.nodata')}
            </Col>
          </Row>
          <Row className='mb-5'>
            <Col
              span={8}
              className='fw-600'
            >
              {t('productType.displayOn')}:
            </Col>
            <Col>
              <Checkbox checked={getDetailProductChild?.data?.isShow} />
            </Col>
          </Row>
        </>
        <div className='text-end'>
          <Button
            className='mt-20'
            onClick={onCancel}
            type='primary'
          >{t`buttons.close`}</Button>
        </div>
      </Modal>
    </>
  )
}
