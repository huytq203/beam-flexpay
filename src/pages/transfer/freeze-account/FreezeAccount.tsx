import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import {
  useFreezeAccountMutationMutation,
  useLazyGetHistoryFreezeQuery
} from '@services/apiFreezeAndUnfreezeAccountService'
import { useLazyCustomerFindOneByAccountNumberQuery } from '@services/cmsService'
import {
  CustomerElementType,
  FreezeAndUnfreezeAccountSearchParams,
  HistoryElementType,
  IFreezeAccountForm
} from '@type/freezeAccount'
import { convertNumber } from '@utils/helperFunctions'
import { Button, Card, Col, Form, Input, Row, Table, notification } from 'antd'
import { useForm } from 'antd/es/form/Form'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FreezeAnUnFreezeAccountForm from './freeze-account-form/FreezeAccountForm'

type FreezeAccountType = {
  mode?: boolean
}

const FreezeAccount = (props: FreezeAccountType) => {
  const {} = props
  const { t } = useTranslation()
  const [form] = useForm<IFreezeAccountForm>()

  const [disableFreeze, setDisableFreeze] = useState<boolean>(true)
  const [searchValue, setSearchValue] = useState<string>('')
  const [search, setSearch] = useState<FreezeAndUnfreezeAccountSearchParams>({
    page: 1,
    take: 10,
    status: false
  })
  const [visibleHistory, setVisibleHistory] = useState<boolean>(false)

  const [
    triggerGetHistory,
    { data: historyFreeze, isLoading: loadingHistory }
  ] = useLazyGetHistoryFreezeQuery()

  const [
    triggerGetDetailAccountInformation,
    { data: detailAccountInformation }
  ] = useLazyCustomerFindOneByAccountNumberQuery()

  const [freezeAccountMoney] = useFreezeAccountMutationMutation()

  const historyTableColumns: ColumnsType<HistoryElementType> = [
    {
      title: t('freezeAndUnfreezeAccount.number'),
      render: (text, object, index) => (
        <div>
          {((historyFreeze?.meta?.page as number) - 1) * 10 + index + 1}
        </div>
      ),
      align: 'center',
      key: 'id',
      width: 50,
      fixed: 'left'
    },
    {
      title: t('freezeAndUnfreezeAccount.accountNumber'),
      dataIndex: 'customer',
      align: 'center',
      width: 200,
      key: 'accountNumber',
      render: (record: CustomerElementType) => (
        <div>{record?.accountNumber}</div>
      )
    },
    {
      title: t('freezeAndUnfreezeAccount.freezeBalance'),
      align: 'center',
      width: 200,
      render: (record: CustomerElementType) => (
        <div>{convertNumber(record?.freezeMoney)} VND</div>
      )
    },
    {
      title: t('freezeAndUnfreezeAccount.reason'),
      dataIndex: 'reason',
      align: 'center',
      key: 'reason',
      width: 400
    },
    {
      title: t('freezeAndUnfreezeAccount.freezeBy'),
      dataIndex: 'user',
      align: 'center',
      key: 'fullName',
      width: 300,
      render: (record: CustomerElementType) => <div>{record?.fullName}</div>
    },
    {
      title: t('freezeAndUnfreezeAccount.freezeAt'),
      key: 'createdAt',
      align: 'center',
      fixed: 'right',
      width: 250,
      render: (record: CustomerElementType) => (
        <div>{dayjs(record?.createdAt).format(TimeFullFormat)}</div>
      )
    }
  ]

  const handleGetCustomer = async () => {
    if (searchValue.trim() === '') {
      return
    }
    setSearch({ ...search, customerAccountNumber: searchValue })
    setVisibleHistory(false)
    await triggerGetDetailAccountInformation({ accountNumber: searchValue })
  }

  useEffect(() => {
    const regex =
      /^(\\+84|0)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6]|9[0-4|6-9])([0-9]{7})$/
    const test = regex.test(searchValue)
    if (!test && searchValue !== '') {
      form.setFields([
        {
          name: 'accountNumber',
          errors: [t('freezeAndUnfreezeAccount.validation.phoneNumber')]
        }
      ])
    } else if (test) {
      form.setFields([
        {
          name: 'accountNumber',
          errors: []
        }
      ])
    }
  }, [searchValue])

  const handleFreeze = async (values: any) => {
    if (values.reason.trim() === '') {
      form.setFields([
        {
          name: 'reason',
          errors: [t`freezeAndUnfreezeAccount.validation.require`.toString()]
        }
      ])
      return
    }
    const data: any = await freezeAccountMoney({
      reason: values.reason.trim(),
      freezeMoney: values.freezeBalanceRequest,
      customerAccountNumber: searchValue
    })
    await triggerGetDetailAccountInformation({ accountNumber: searchValue })
    await triggerGetHistory({
      page: 1,
      take: 10,
      status: false,
      customerAccountNumber: searchValue
    })
    form.setFieldsValue({
      reason: undefined,
      freezeBalanceRequest: undefined
    })
    if (data.data.statusCode === 201) {
      notification.success({
        message: t('freezeAndUnfreezeAccount.successFreeze')
      })
    }
  }

  return (
    <Card>
      <Row justify='center'>
        <Col span={16}>
          <Form
            form={form}
            onFinish={handleFreeze}
            labelCol={{ span: 8 }}
            labelAlign='left'
          >
            <Form.Item
              label={t('freezeAndUnfreezeAccount.accountNumber')}
              name='accountNumber'
            >
              <Row gutter={GUTTER}>
                <Col span={18}>
                  <Input
                    onChange={(e) => {
                      setSearchValue(e.target.value)
                    }}
                    placeholder={t(
                      'freezeAndUnfreezeAccount.placeholders.phoneNumber'
                    ).toString()}
                  />
                </Col>
                <Col span={6}>
                  <Button
                    className='w-100'
                    type='primary'
                    onClick={handleGetCustomer}
                  >
                    {t('freezeAndUnfreezeAccount.search')}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
            <FreezeAnUnFreezeAccountForm
              setDisableFreeze={setDisableFreeze}
              searchValue={searchValue}
              detail={detailAccountInformation}
              triggerGetHistory={triggerGetHistory}
              setVisibleHistory={setVisibleHistory}
            />
            <Form.Item>
              <div style={{ textAlign: 'center' }}>
                <Button
                  disabled={disableFreeze}
                  type='primary'
                  htmlType='submit'
                >
                  {t('freezeAndUnfreezeAccount.submit')}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      {visibleHistory && (
        <Row className='w-100'>
          <Card
            title={t('freezeAndUnfreezeAccount.tableHistoryTitle')}
            className='w-100'
            extra={
              <Button
                danger
                onClick={() => {
                  setVisibleHistory(false)
                }}
              >
                {t('freezeAndUnfreezeAccount.close')}
              </Button>
            }
          >
            <Table
              columns={historyTableColumns}
              dataSource={historyFreeze?.data || []}
              loading={loadingHistory}
              scroll={{ x: '100%' }}
              bordered
              rowKey='id'
              size='small'
              pagination={{
                current: historyFreeze?.meta?.page,
                pageSize: historyFreeze?.meta?.take,
                total: historyFreeze?.meta?.itemCount,
                async onChange(page) {
                  setSearch({
                    ...search,
                    page
                  })
                  await triggerGetHistory({ ...search, page })
                }
              }}
            />
          </Card>
        </Row>
      )}
    </Card>
  )
}

export default FreezeAccount
