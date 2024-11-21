import {
  useDeleteProductChildMutation,
  useViewProductQuery
} from '@services/productService'
import { IChildProduct } from '@type/product'
import {
  Button,
  Col,
  Form,
  Modal,
  notification,
  Row,
  Table,
  TableColumnsType,
  Tooltip
} from 'antd'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import { CreateProductChildModal } from '../productChildModal/CreateProductChildModal'
import { UpdateProductChildModal } from '../productChildModal/UpdateProductChildModal'
import { Eye } from '@phosphor-icons/react'
import { ViewProductChildModal } from '../productChildModal/ViewProductChildModal'
import { renderDisplayOn } from '@utils/helperFunctions'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import { GUTTER } from '@constants/appConstant'

type ProductDetailProps = {
  onCancel: () => void
  id: string
}

const ViewProductModal = (props: ProductDetailProps) => {
  const { onCancel, id } = props
  const [openModalProductChild, setOpenModalProductChild] = useState(false)
  const [openModalUpdateProductChild, setOpenModalUpdateProductChild] =
    useState(false)
  const [openModalViewProductChild, setOpenModalViewProductChild] =
    useState(false)
  const [selectedId, setSelectedId] = useState<string>('')

  const { t } = useTranslation()

  const handleUpdateChild = (id?: string) => {
    setOpenModalUpdateProductChild(true)
    if (id) setSelectedId(id)
  }

  const handleViewChild = (id?: string) => {
    setOpenModalViewProductChild(true)
    if (id) setSelectedId(id)
  }

  const handleCreateChild = () => {
    setOpenModalProductChild(true)
  }

  const { data: detailData } = useViewProductQuery(id)

  const productChildName = detailData?.data?.products.map(
    (item: any, index: number) => ({
      ...item,
      no: index + 1,
      productName: detailData?.data.name
    })
  )

  const toggleModal = (toggle: boolean) => {
    setOpenModalProductChild(toggle)
    setOpenModalUpdateProductChild(toggle)
    setOpenModalViewProductChild(toggle)
  }

  const [deleteProductChild] = useDeleteProductChildMutation()

  const onHandleDelete = (id: any) => {
    Modal.confirm({
      title: t('product.childProduct.confirm.cancel.title'),
      content: t('product.childProduct.confirm.cancel.content'),
      onOk: () => handleOk(id),
      okText: t('buttons.ok'),
      cancelText: t('buttons.cancel'),
      type: 'warning'
    })
  }
  const handleOk = async (id: any) => {
    const result: any = await deleteProductChild(id as string)
    if (result.data) {
      notification.success({ message: t('messages.successDeleteProductChild') })
    }
  }
  const childTableColumns: TableColumnsType<IChildProduct> = [
    {
      title: t('productType.id'),
      dataIndex: 'no',
      key: 'id',
      align: 'center',
      width: '10%'
    },
    {
      title: t('product.productBig'),
      key: 'productName',
      dataIndex: 'productName'
    },
    {
      title: t('product.childName'),
      key: 'name',
      dataIndex: 'name'
    },
    {
      title: t('product.actions'),
      align: 'center',
      width: '25%',
      render: (value, record, index) => (
        <Row
          gutter={GUTTER}
          justify='center'
        >
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.view')}
            >
              <Button
                icon={<Eye />}
                onClick={() => handleViewChild(value.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.edit')}
            >
              <ButtonUpdate
                module='product'
                onClick={() => handleUpdateChild(value.id)}
              />
            </Tooltip>
          </Col>
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.delete')}
            >
              <ButtonDelete
                module='product'
                onClick={async () => onHandleDelete(record.id)}
              />
            </Tooltip>
          </Col>
        </Row>
      )
    }
  ]

  const renderAttribute = (detailData: any) => {
    if (detailData?.data?.featured === 'NEW_PRODUCT') {
      return t('product.attributeValue.newProduct')
    } else if (detailData?.data?.featured === 'HOT_PRODUCT') {
      return t('product.attributeValue.hotProduct')
    } else if (detailData?.data?.featured === 'PROMOTION_PRODUCTS') {
      return t('product.attributeValue.promoProduct')
    } else {
      return ''
    }
  }

  return (
    <>
      <Form.Item className='text-end'>
        <ButtonAdd
          module='product'
          label={t`product.childProduct.create-childProduct` as string}
          onClick={() => {
            handleCreateChild()
          }}
        />
      </Form.Item>

      <Row className='mb-5'>
        <Col
          span={6}
          className='fw-600'
        >
          {t('product.service')}:
        </Col>
        <Col>{detailData?.data?.productType?.service?.name}</Col>
      </Row>
      <Row className='mb-5'>
        <Col
          span={6}
          className='fw-600'
        >
          {t('product.productType')}:
        </Col>
        <Col>{detailData?.data?.productType?.name}</Col>
      </Row>
      <Row className='mb-5'>
        <Col
          span={6}
          className='fw-600'
        >
          {t('product.product')}:
        </Col>
        <Col>{detailData?.data?.name}</Col>
      </Row>
      <Row className='mb-10'>
        <Col span={24}>
          {detailData?.data?.products &&
            detailData?.data?.products?.length > 0 && (
              <Table
                columns={childTableColumns}
                dataSource={productChildName || []}
                scroll={{ y: 300 }}
                pagination={false}
              />
            )}
        </Col>
      </Row>
      <Row className='mb-5'>
        <Col
          span={6}
          className='fw-600'
        >
          {t('product.attribute')}:
        </Col>
        <Col>{renderAttribute(detailData)}</Col>
      </Row>
      <Row className='mb-5'>
        <Col
          span={6}
          className='fw-600'
        >
          {t('product.displayOn')}:
        </Col>
        <Col>{renderDisplayOn(detailData)}</Col>
      </Row>
      <Row className='mb-5'>
        <Col
          span={6}
          className='fw-600'
        >
          {t('product.avatar')}:
        </Col>
        <Col>
          <Row>
            <div className='image'>
              <img src={detailData?.data?.avatar} />
            </div>
          </Row>
        </Col>
      </Row>
      {openModalProductChild && (
        <CreateProductChildModal
          open={openModalProductChild}
          onCancel={() => toggleModal(false)}
          id={id}
          data={detailData}
        />
      )}
      {openModalUpdateProductChild && (
        <UpdateProductChildModal
          open={openModalUpdateProductChild}
          onCancel={() => toggleModal(false)}
          id={selectedId}
          detailData={detailData}
        />
      )}
      {openModalViewProductChild && (
        <ViewProductChildModal
          open={openModalViewProductChild}
          onCancel={() => toggleModal(false)}
          id={selectedId}
        />
      )}
    </>
  )
}

export default ViewProductModal
