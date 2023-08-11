import React, { useCallback, useMemo, useState } from 'react'
import {
  Modal,
  Form,
  Row,
  Col,
  Table,
  Typography,
  DatePicker,
  Button,
  Select,
  Divider,
  Empty
} from 'antd'
import { useTranslation } from 'react-i18next'
import { ColumnsType } from 'antd/es/table'
import FormItem from 'antd/es/form/FormItem'
import { AiFillDelete } from 'react-icons/ai'
import SettingFormModal from './SettingFormModal'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'

interface Props {
  open: boolean
  closeModal: () => void
  title: string
  hasBankCol?: boolean
}

const SettingFeeModal = ({ closeModal, hasBankCol, open, title }: Props) => {
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [openForm, setOpenForm] = useState(false)

  const closeForm = useCallback(() => setOpenForm(false), [])

  const trans = useCallback(
    (label: string) => {
      const key = `policy-management.payment.${label}`
      return t(key)
    },
    [t]
  )

  const columns = useMemo<ColumnsType<any>>(
    () => [
      ...(hasBankCol
        ? ([
            {
              title: `${trans('withdrawBank')}`,
              align: 'center',
              render: () => 'ACB'
            }
          ] as ColumnsType<any>)
        : []),
      {
        title: `${trans('transactionLevelFrom')} (VND)`,
        align: 'center',
        render: () => <div>100.000</div>
      },
      {
        title: `${trans('transactionLevelTo')} (VND)`,
        align: 'center',
        render: () => <div>100.000</div>
      },
      {
        align: 'center',
        title: trans('fixedChargeMerchant'),
        children: [
          {
            title: `${trans('flexibleFee')} (%)`,
            align: 'center'
          },
          {
            title: `${trans('fixedCharge')} (VNĐ)`,
            align: 'center'
          },
          {
            title: `${trans('minFee')} (VNĐ)`,
            align: 'center'
          },
          {
            title: `${trans('maxFee')} (VNĐ)`,
            align: 'center'
          }
        ]
      },
      {
        align: 'center',
        title: trans('selectionFee'),
        children: [
          {
            title: `${trans('flexibleFee')} (%)`,
            align: 'center'
          },
          {
            title: `${trans('fixedCharge')} (VNĐ)`,
            align: 'center'
          },
          {
            title: `${trans('minFee')} (VNĐ)`,
            align: 'center'
          },
          {
            title: `${trans('maxFee')} (VNĐ)`,
            align: 'center'
          }
        ]
      },
      {
        title: trans('action'),
        render: () => {
          return (
            <Row wrap={false}>
              <Col>
                <ButtonUpdate
                  onClick={() => setOpenForm(true)}
                  className='mr-10'
                  module=''
                />
              </Col>
              <Col>
                <ButtonDelete
                  icon={
                    <AiFillDelete
                      size={16}
                      style={{ transform: 'translateY(2px)' }}
                    />
                  }
                  module=''
                />
              </Col>
            </Row>
          )
        }
      }
    ],
    []
  )

  const applicableObject = useMemo(
    () => [
      {
        key: '1',
        label: 'system',
        value: '1'
      },
      {
        key: '2',
        label: 'personalAccount',
        value: '2'
      },
      {
        key: '3',
        label: 'businessAccount',
        value: '3'
      },
      {
        key: '4',
        label: 'majorAccount',
        value: '4'
      },
      {
        key: '5',
        label: 'accountGroup',
        value: '5'
      },
      {
        key: '6',
        label: 'personal',
        value: '6'
      }
    ],
    []
  )

  return (
    <>
      <Modal
        okText={trans('establish')}
        cancelText={trans('back')}
        width={1200}
        title={<div>{title}</div>}
        open={open}
        onCancel={() => closeModal()}
        centered
      >
        <Divider className='mt-20' />
        <Form>
          <FormItem
            label={trans('applicableObject')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            labelAlign='left'
          >
            <Select defaultValue={'1'}>
              {applicableObject.map((x) => {
                return (
                  <Select.Option
                    value={x.value}
                    key={x.label}
                  >
                    {trans(x.label)}
                  </Select.Option>
                )
              })}
            </Select>
          </FormItem>
          <Row
            justify={'space-between'}
            className='mb-20'
          >
            <Col>
              <Typography.Title level={5}>{trans('fee')}</Typography.Title>
            </Col>
            <Col>
              <ButtonAdd
                module=''
                onClick={() => setOpenForm(true)}
                label={t`policy-management.depositManagement.modalContent.createNewFeePackage`.toString()}
              />
            </Col>
          </Row>
          <Table
            className='mt-4'
            bordered
            columns={columns}
            dataSource={[1, 2, 3]}
            locale={{
              emptyText: <Empty description={t`labels.table-nodata`} />
            }}
          />
          <FormItem
            className='mt-20'
            label={trans('FeeType')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            labelAlign='left'
          >
            <Select defaultValue={'1'}>
              <Select.Option value={'1'}> Thông thường</Select.Option>
              <Select.Option value={'2'}> Sự kiện</Select.Option>
            </Select>
          </FormItem>
          <FormItem
            label={trans('applicableTime')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            labelAlign='left'
          >
            <DatePicker className='w-100' />
          </FormItem>
          <FormItem
            label={trans('endTime')}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 14 }}
            labelAlign='left'
          >
            <DatePicker className='w-100' />
          </FormItem>
        </Form>
      </Modal>
      <SettingFormModal
        hasBankCol={hasBankCol}
        open={openForm}
        closeModal={closeForm}
      />
    </>
  )
}

export default React.memo(SettingFeeModal)
