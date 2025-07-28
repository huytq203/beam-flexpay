import ButtonAdd from '@components/button-add/ButtonAdd'
import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CustomPaymentMethod from '@components/custom-payment-method/CustomPaymentMethod'
import CustomSelect from '@components/custom-select/CustomSelect'
import Table from '@components/table/Table'
import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import { applicableObjects } from '@constants/options'
import {
  useLazyCustomerFindAllQuery,
  useLazyGroupFindAllQuery
} from '@services/cmsService'
import { APPLICABLE_OBJECTS, pageEnum } from '@type/policyManagement'
import { convertNumber } from '@utils/helperFunctions'
import { Col, DatePicker, Form, FormInstance, Row, Select, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { t } from 'i18next'
import { useState } from 'react'

type props = {
  id?: string
  depositMethodLabel: string
  depositMethodErorr: string
  toggle: () => void
  record: any
  form: FormInstance
}

const formItemStyle = {
  labelCol: { span: 4 },
  wrapperCol: { span: 15 }
}

const FeeSetupModal = ({
  id,
  depositMethodLabel,
  depositMethodErorr,
  toggle,
  record,
  form
}: props) => {
  // #region function
  const [object, setObject] = useState<APPLICABLE_OBJECTS>(
    APPLICABLE_OBJECTS.SYSTEM
  )

  const [fnGetGroups] = useLazyGroupFindAllQuery()
  const [fnGetCustomer] = useLazyCustomerFindAllQuery()

  const handleSelectMethod = (values: number[] | string, status?: string) => {
    if (typeof status === 'string' && status === 'all') {
      form.setFieldsValue({
        depositMethod: undefined
      })
      return
    }

    form.setFieldsValue({
      depositMethod: values
    })
  }
  // #endregion

  // #region columns
  const columns: ColumnsType<any> = [
    {
      align: 'center',
      title: t`labels.no`,
      render: () => 1
    },
    {
      align: 'center',
      dataIndex: ['transactionFrom'],
      title: t`policy-management.depositManagement.modalContent.tableModal.transactionFrom`,
      render: (value) => <div>{convertNumber(value)}</div>
    },
    {
      align: 'center',
      title: t`policy-management.depositManagement.modalContent.tableModal.transactionTo`,
      dataIndex: ['transactionTo'],
      render: (value) => <div>{convertNumber(value)}</div>
    },
    {
      title: t`policy-management.depositManagement.modalContent.tableModal.transactionFee`,
      children: [
        {
          align: 'center',
          title: t`policy-management.depositManagement.modalContent.tableModal.onTransferor`,
          children: [
            {
              dataIndex: 'transferorFlexibleFee',
              title: t`policy-management.depositManagement.modalContent.tableModal.variableFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              dataIndex: 'transferorFixedFee',
              title: t`policy-management.depositManagement.modalContent.tableModal.fixedFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              dataIndex: 'transferorFeeMin',
              title: t`policy-management.depositManagement.modalContent.tableModal.minFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              dataIndex: 'transferorFeeMax',
              title: t`policy-management.depositManagement.modalContent.tableModal.maxFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            }
          ]
        },
        {
          align: 'center',
          title: t`policy-management.depositManagement.modalContent.tableModal.onReceiver`,
          children: [
            {
              dataIndex: 'receiverFlexibleFee',
              title: t`policy-management.depositManagement.modalContent.tableModal.variableFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              dataIndex: 'receiverFixedFee',
              title: t`policy-management.depositManagement.modalContent.tableModal.fixedFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              dataIndex: 'receiverFeeMin',
              title: t`policy-management.depositManagement.modalContent.tableModal.minFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            },
            {
              dataIndex: 'receiverFeeMax',
              title: t`policy-management.depositManagement.modalContent.tableModal.maxFee`,
              align: 'center',
              render: (record) => <div>{convertNumber(record)}</div>
            }
          ]
        }
      ]
    },
    {
      align: 'center',
      width: 120,
      title: t`policy-management.depositManagement.action`,
      render: (record) => (
        <Row
          gutter={5}
          justify='center'
        >
          <Col>
            <Tooltip
              placement='top'
              title={t('admin-management.tooltip.view')}
            >
              <ButtonUpdate
                module='direct_deposit'
                onClick={() => {
                  // setFeeMode(viewMode.update)
                  // setOpenAddAndUpdateFeePackage(true)
                  // setSelectedFeePackageId(record.id)
                }}
              />
            </Tooltip>
          </Col>
          <Col>
            <ButtonDelete
                  // hidden={mode === viewMode.update}
                  module='direct_deposit'
                  onClick={() => {
                    // setFeeMode(viewMode.delete)
                    // setOpenAddAndUpdateFeePackage(true)
                  }}
            />
          </Col>
        </Row>
      )
    }
  ]
  //#endregion

  return (
    <Form
      form={form}
      initialValues={{
        startDate: dayjs().startOf('day')
      }}
      {...formItemStyle}
      labelAlign='left'
    >
      <Row gutter={GUTTER}>
        <Col flex='auto'>
          <Form.Item
            name='applicableObject'
            label={t`policy-management.payment.applicableObject`}
            initialValue={APPLICABLE_OBJECTS.SYSTEM}
            rules={[
              {
                required: true,
                message:
                  t`policy-management.depositManagement.validateSystemRequired`.toString()
              }
            ]}
          >
            <Select
              onChange={(value) => setObject(value)}
              style={{ minWidth: 220 }}
              options={applicableObjects}
            />
          </Form.Item>
          {[
            APPLICABLE_OBJECTS.PERSONAL_ACCOUNT,
            APPLICABLE_OBJECTS.ACCOUNT_GROUP
          ].includes(object) && (
            <>
              {object === APPLICABLE_OBJECTS.ACCOUNT_GROUP ? (
                <Form.Item
                  name='applicableObjectId'
                  label={t`policy-management.payment.selectAccountGroup`}
                  rules={[
                    {
                      required: true,
                      message:
                        t`policy-management.depositManagement.validateAccountGroupRequired`.toString()
                    }
                  ]}
                >
                  <CustomSelect
                    field='name'
                    trigger={fnGetGroups}
                    search={{
                      page: 1,
                      take: 10
                    }}
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  name='applicableObjectId'
                  label={t`policy-management.payment.inputAccount`}
                  rules={[
                    {
                      required: true,
                      message:
                        t`policy-management.depositManagement.validateAccountRequired`.toString()
                    }
                  ]}
                >
                  <CustomSelect
                    style={{ minWidth: 350 }}
                    mode='multiple'
                    trigger={fnGetCustomer}
                    search={{
                      page: 1,
                      take: 10
                    }}
                    field='phoneNumber'
                  />
                </Form.Item>
              )}
            </>
          )}
          <Form.Item
            rules={[
              {
                required: true,
                message: depositMethodErorr
              }
            ]}
            name='depositMethod'
            label={depositMethodLabel}
          >
            <CustomPaymentMethod
              module={pageEnum.directDeposit}
              defaultMethod='search'
              handleSelectMethod={handleSelectMethod}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row
        gutter={GUTTER}
        justify='space-between'
        className='mb-20'
      >
        <div>{t`policy-management.depositManagement.modalContent.packagePackage`}</div>
        {!id && (
          <ButtonAdd
            module='direct_deposit'
            label={t`policy-management.depositManagement.modalContent.createNewFeePackage`.toString()}
            onClick={toggle}
          />
        )}
      </Row>

      <Table
        dataSource={record ? [record] : []}
        columns={columns}
      />

      <Row
        gutter={GUTTER}
        className='mt-20'
      >
        <Col span={24}>
          <Form.Item
            name='startDate'
            label={t`policy-management.depositManagement.applicableTimeStart`}
            {...formItemStyle}
            rules={[
              {
                required: true,
                message:
                  t`policy-management.depositManagement.validateRequired`.toString()
              }
            ]}
          >
            <DatePicker
              showTime
              use12Hours={false}
              // disabledDate={disabledDate}
              className='w-100'
              format={TimeFullFormat}
              // onChange={onChangeStartDate}
              showNow={false}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Form.Item
            name='endDate'
            label={t`policy-management.depositManagement.applicableTimeEnd`}
            {...formItemStyle}
          >
            <DatePicker
              showTime
              showNow={false}
              // disabledDate={disabledEndDate}
              className='w-100'
              format={TimeFullFormat}
              placeholder={t`policy-management.depositManagement.modalContent.endDatePlaceholder`.toString()}
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
export default FeeSetupModal
