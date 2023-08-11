import {
  useCreateProductChildMutation,
  useViewProductQuery
} from '@services/productService'
import { IChildProduct, IProductForm } from '@type/product'
import { Button, Col, Form, Input, Modal, notification, Radio, Row } from 'antd'
import { useForm } from 'antd/es/form/Form'
import React from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  mode?: any
  open: boolean
  onCancel: () => void
  id: string
  data: any
}

export const CreateProductChildModal = ({
  open,
  onCancel,
  id,
  data
}: IProps) => {
  const { t } = useTranslation()
  const [form] = useForm<IChildProduct>()
  const [createProductChild, isLoadingCreate] = useCreateProductChildMutation()
  const handleSubmit = async (values: any) => {
    const payload = {
      groupProductId: id,
      name: values.name,
      price: Number(values.price),
      isShow: values.isShow
    }
    const result: any = await createProductChild(payload)

    if (result.data) {
      notification.success({ message: t('messages.createProductChildSuccess') })
      onCancel()
    }
  }
  return (
    <div>
      <Modal
        open={open}
        onCancel={onCancel}
        centered
        title={t('product.childProduct.create-childProduct')}
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
            initialValue={data?.data?.name}
          >
            <Input disabled />
          </Form.Item>
          {/* name */}
          <Form.Item
            name='name'
            label={t('product.childName')}
            rules={[
              {
                min: 5,
                max: 255,
                message: t('messages.minMaxFormValidate', {
                  min: 5,
                  max: 255
                }).toString()
              },
              {
                required: true,
                message: `${t('product.childProduct.messages.name')}`
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
            rules={[
              {
                required: true,
                message: `${t('product.childProduct.messages.price')}`
              },
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
              loading={isLoadingCreate.isLoading}
            >{t`buttons.add`}</Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
