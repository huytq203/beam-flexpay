import { WarningOutlined } from '@ant-design/icons'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonSearch from '@components/button-search/ButtonSearch'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import SearchBar from '@components/search-bar/SearchBar'
import { PARTNER_TYPE } from '@constants/partnerOptions'
import {
  usePaymentPartnerFindAllQuery,
  usePaymentPartnerUpdateMutation
} from '@services/cmsPaymentParner'
import { useToggle } from 'ahooks'
import { Card, Col, Empty, Form, Image, Input, Modal, Row, Tooltip } from 'antd'
import { useForm } from 'antd/es/form/Form'
import Table, { ColumnsType } from 'antd/es/table'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PartnerContactForm from './PartnerContactForm'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import {
  PaymentPartnerDetailDto,
  PaymentPartnerFindAllApiArg
} from '@type/application'
import ButtonLock from '@components/button-lock/ButtonLock'
import ButtonUnlock from '@components/button-unlock/ButtonUnlock'

const { confirm } = Modal

type props = {
  type: PARTNER_TYPE
}

export default function PartnerContactComponent(props: props) {
  const [form] = useForm()
  const { t } = useTranslation()
  const [addForm, { toggle: addFormToggle }] = useToggle()
  const [updateForm, { toggle: updateFormToggle }] = useToggle()

  const [record, setRecord] = useState<PaymentPartnerDetailDto>()
  const [search, setSearch] = useState<PaymentPartnerFindAllApiArg>({
    page: 1,
    take: 10,
    order: 'DESC',
    type: props.type
  })
  const [type, setType] = useState<PARTNER_TYPE>(props.type)

  const [updatePartner] = usePaymentPartnerUpdateMutation()

  const { data: partners } = usePaymentPartnerFindAllQuery(search)

  const handleSearch = () => {
    const values = form.getFieldsValue()
    setSearch({
      ...search,
      type: type,
      ...values
    })
  }

  const handleActive = (record: PaymentPartnerDetailDto) => {
    var formdata = new FormData()
    formdata.append('active', (!record.active).toString())
    formdata.append('file', record.logo)
    formdata.append('name', record.name)
    formdata.append('paymentServiceId', record.paymentService.id.toString())
    confirm({
      icon: <WarningOutlined />,
      title: record.active
        ? t('messages.confirmInactive')
        : t('messages.confirmActive'),
      onOk() {
        updatePartner({ id: record.id, body: formdata })
      },
      onCancel() {}
    })
  }

  //#region columns
  const columns: ColumnsType<PaymentPartnerDetailDto> = [
    {
      title: 'STT',
      dataIndex: 'id',
      width: 80,
      fixed: 'left',
      align: 'center'
    },
    {
      title: t('partner.service-type'),
      align: 'center',
      width: 200,
      fixed: 'left',
      render(_, record) {
        return t(record.paymentService.type)
      }
    },
    {
      title: t('partner.service-name'),
      dataIndex: 'name',
      align: 'center',
      width: 200,
      fixed: 'left',
      render(_, record) {
        return t(record.paymentService.name)
      }
    },
    {
      title: t('partner.partner-name'),
      dataIndex: 'name',
      width: 200,
      align: 'center'
    },
    {
      title: t('partner.logo'),
      dataIndex: 'logo',
      align: 'center',
      width: 200,
      render(value) {
        if (value) {
          return (
            <Image
              src={import.meta.env.VITE_IMAGE_URL + value}
              preview={false}
              width={150}
            />
          )
        }
      }
    },
    {
      title: t('partner.createdDate'),
      width: 200,
      render: (_, record) =>
        moment(new Date(record?.createdAt)).format(TimeFormat).toString()
    },
    {
      title: t('partner.createdBy'),
      align: 'center',
      width: 200,
      render(_, record) {
        return record.createdBy?.fullName
      }
    },
    {
      title: t('partner.updatedBy'),
      align: 'center',
      width: 200,
      render(_, record) {
        return record.updatedBy?.fullName
      }
    },
    {
      title: t('partner.updatedDate'),
      width: 200,
      render: (_, record) =>
        moment(new Date(record?.updatedAt)).format(TimeFormat).toString()
    },
    {
      title: t('labels.status'),
      align: 'center',
      dataIndex: 'active',
      width: 200,
      render(value) {
        return value ? (
          <h4>{t('labels.active')}</h4>
        ) : (
          <h4>{t('labels.inActive')}</h4>
        )
      }
    },
    {
      title: t('labels.action'),
      align: 'center',
      width: 120,
      fixed: 'right',
      render(_, record) {
        return (
          <Row gutter={GUTTER}>
            <Col>
              <ButtonUpdate
                module='partner'
                onClick={() => {
                  setRecord(record)
                  updateFormToggle()
                }}
              />
            </Col>
            <Col>
              <Tooltip
                title={
                  record.active
                    ? t`internal-wallet.modal.change-status-lock-ok-button`
                    : t`internal-wallet.modal.change-status-unlock-ok-button`
                }
              >
                {record.active ? (
                  <ButtonLock
                    className='ml-5'
                    module='customer'
                    onClick={() => handleActive(record)}
                  />
                ) : (
                  <ButtonUnlock
                    className='ml-5'
                    module='customer'
                    onClick={() => handleActive(record)}
                  />
                )}
              </Tooltip>
            </Col>
          </Row>
        )
      }
    }
  ]
  //#endregion

  return (
    <Card
      title={
        <SearchBar
          form={form}
          onFinish={handleSearch}
          cols='2'
          headerMenu={
            <>
              <Form.Item
                label={t('partner.service-name')}
                name='name'
              >
                <Input />
              </Form.Item>
              {/* <Col flex='350px'>
                  <Form.Item
                    label={t('partner.service-type')}
                    name='type'
                  >
                    <Select
                      options={PARTNER_TYPE_OPTIONS}
                      defaultValue={props.type}
                    />
                  </Form.Item>
                </Col> */}

              <ButtonAdd
                module='partner'
                onClick={addFormToggle}
                className='mt-7'
              />

              <ButtonSearch onClick={handleSearch} />
            </>
          }
        />
      }
    >
      <Table
        columns={columns}
        dataSource={partners?.data || []}
        scroll={{ x: '100%' }}
        rowKey='id'
        size='small'
        bordered
        locale={{
          emptyText: (
            <>
              <Empty description={t`labels.nodata`} />
            </>
          )
        }}
        pagination={{
          current: partners?.meta?.page,
          pageSize: partners?.meta?.take,
          total: partners?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      <PartnerContactForm
        title={t('partner.newTitle', { name: t(props.type) })}
        isShow={addForm}
        onCancel={addFormToggle}
        type={props.type}
      />
      <PartnerContactForm
        title={t('partner.updateTitle', { name: t(props.type) })}
        record={record}
        isShow={updateForm}
        onCancel={updateFormToggle}
        type={props.type}
      />
    </Card>
  )
}
