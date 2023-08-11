import React, { useCallback, useState } from 'react'
import { Modal, Input, Form, Row, Col, Select, Typography, Divider } from 'antd'
import FormItem from 'antd/es/form/FormItem'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  closeModal: () => void
  hasBankCol?: boolean
}

const SettingFormModal = ({ open, hasBankCol, closeModal }: Props) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [openForm, setOpenForm] = useState(false)

  const trans = useCallback(
    (label: string) => {
      const key = `policy-management.payment.${label}`
      return t(key)
    },
    [t]
  )
  return (
    <Modal
      width={800}
      cancelText={trans('back')}
      okText={trans('establish')}
      title={trans('title.setting-omipay')}
      open={open}
      onCancel={closeModal}
      centered
    >
      <Divider className='mt-20' />
      <Form layout={'vertical'}>
        {hasBankCol && (
          <FormItem
            name='bank'
            rules={[{ required: true, message: trans('messageRequired') }]}
            label={trans('bank')}
          >
            <Select placeholder={trans('placeholder.selectBank')}>
              <Select.Option>ACB</Select.Option>
              <Select.Option>Vietcom Bank</Select.Option>
            </Select>
          </FormItem>
        )}
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              name='transactionLevelFrom'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('transactionLevelFrom')}
            >
              <Input placeholder={trans('placeholder.transactionLevelFrom')} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name='transactionLevelTo'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('transactionLevelTo')}
            >
              <Input placeholder={trans('placeholder.transactionLevelTo')} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Title level={5}>
              {trans('fixedChargeMerchant')}
            </Typography.Title>
          </Col>
          <Col span={12}>
            <Typography.Title level={5}>
              {trans('selectionFee')}
            </Typography.Title>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              name='flexibleFee'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('flexibleFee')}
            >
              <Input placeholder={trans('placeholder.flexibleFee')} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name='flexibleFee2'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('flexibleFee')}
            >
              <Input placeholder={trans('placeholder.flexibleFee')} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              name='fixedCharge'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('fixedCharge')}
            >
              <Input placeholder={trans('placeholder.fixedCharge')} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name='fixedCharge2'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('fixedCharge')}
            >
              <Input placeholder={trans('placeholder.fixedCharge')} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              name='minFee'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('minFee')}
            >
              <Input placeholder={trans('placeholder.minFee')} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name='minFee2'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('minFee')}
            >
              <Input placeholder={trans('placeholder.minFee')} />
            </FormItem>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem
              name='maxFee'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('maxFee')}
            >
              <Input placeholder={trans('placeholder.maxFee')} />
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              name='maxFee2'
              rules={[{ required: true, message: trans('messageRequired') }]}
              label={trans('maxFee')}
            >
              <Input placeholder={trans('placeholder.maxFee')} />
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default React.memo(SettingFormModal)
