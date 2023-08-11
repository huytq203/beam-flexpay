import {
  useCreateProductChildMutation,
  useDetailProductChildQuery,
  useUpdateProductChildMutation,
  useViewProductQuery
} from '@services/productService'
import { IChildProduct, IProductForm } from '@type/product'
import { Button, Col, Form, Input, Modal, notification, Radio, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  mode?: any
  open: boolean
  onCancel: () => void
  id: string
  detailData: any
}

export const UpdateProductChildModal = ({
  open,
  onCancel,
  id,
  detailData
}: IProps) => {
  const { t } = useTranslation()
  const [form] = useForm<IChildProduct>()
  const { data: getDetailProductChild } = useDetailProductChildQuery(id, {
    skip: id === ''
  })
  useEffect(() => {
    if (getDetailProductChild) {
      form.setFieldsValue({
        id: getDetailProductChild?.data?.id,
        name: getDetailProductChild?.data?.name,
        price: getDetailProductChild?.data?.price,
        isShow: getDetailProductChild?.data?.isShow
      })
    }
  }, [getDetailProductChild])
  const [updateProductChild, isLoadingUpdate] = useUpdateProductChildMutation()
  const handleSubmit = async (values: any) => {
    const payload = {
      id: id,
      groupProductId: values.id,
      name:
        values.name !== getDetailProductChild?.data?.name
          ? values.name
          : undefined,
      price: Number(values.price),
      isShow: values.isShow
    }
    const result: any = await updateProductChild(payload)

    if (result.data) {
      notification.success({ message: t('messages.updateProductChildSuccess') })
      onCancel()
    }
  }

  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        centered
        title={t('product.childProduct.edit-childProduct')}
        footer={null}
        width={1000}
        className='modal-product'
        maskClosable={false}
        mask
        destroyOnClose={true}
      >
        <Form
          form={form}
          layout='vertical'
          className='w-100'
          onFinish={handleSubmit}
        >
          {/* Product */}
          <Form.Item
            name='nameProductBig'
            label={t('product.productBig')}
            initialValue={detailData?.data?.name}
          >
            <Input disabled />
          </Form.Item>
          {/* name */}
          <Form.Item
            name='name'
            label={t('product.childName')}
            initialValue={getDetailProductChild?.data?.name}
            rules={[
              {
                min: 5,
                max: 255,
                message: t('messages.minMaxFormValidate', {
                  min: 5,
                  max: 255
                }).toString()
              }
            ]}
          >
            <Input
              placeholder={t(
                'product.childProduct.placeholder.inputProductChildName'
              ).toString()}
            />
          </Form.Item>

          {/* price */}
          <Form.Item
            name='price'
            label={t('product.childPrice')}
            initialValue={getDetailProductChild?.data?.price}
            rules={[
              {
                pattern: /^\d+$/,
                message: `${t('messages.numberFormat')}`
              }
            ]}
          >
            <Input
              placeholder={t(
                'product.childProduct.placeholder.inputPriceProductChildName'
              ).toString()}
            />
          </Form.Item>
          <Form.Item
            name='isShow'
            label={t('product.displayOn')}
            initialValue={getDetailProductChild?.data?.isShow}
          >
            <Radio.Group>
              <Radio value={1}>{t('product.displayOn')}</Radio>
              <Radio value={0}>{t('product.noneDisplayOn')}</Radio>
            </Radio.Group>
          </Form.Item>
          <div className='text-end'>
            <Button
              className='mr-10'
              onClick={onCancel}
            >{t`buttons.cancel`}</Button>
            <Button
              type='primary'
              className='mr-10'
              htmlType='submit'
              loading={isLoadingUpdate.isLoading}
            >{t`buttons.update`}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
