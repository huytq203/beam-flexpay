import { GUTTER } from '@constants/appConstant'
import { TimeFullFormat } from '@constants/datetime'
import {
  useLazyGetDetailAccountInformationQuery,
  useLazyGetHistoryFreezeQuery,
  useUnFreezeAccountMutationMutation
} from '@services/apiFreezeAndUnfreezeAccountService'
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
import FreezeAccountForm from '../freeze-account/freeze-account-form/FreezeAccountForm'
import { useLazyCustomerFindOneByAccountNumberQuery } from '@services/cmsService'

type UnfreezeAccountType = {
  mode?: boolean
}

const UnFreezeAccount = (props: UnfreezeAccountType) => {
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
    { data: historyUnFreeze, isLoading: loadingHistory }
  ] = useLazyGetHistoryFreezeQuery()

  const [
    triggerGetDetailAccountInformation,
    { data: detailAccountInformation }
  ] = useLazyCustomerFindOneByAccountNumberQuery()

  const [freezeAccountMoney] = useUnFreezeAccountMutationMutation()

  const historyTableColumns: ColumnsType<HistoryElementType> = [
    {
      title: t('freezeAndUnfreezeAccount.number'),
      render: (text, object, index) => (
        <div>
          {((historyUnFreeze?.meta?.page as number) - 1) * 10 + index + 1}
        </div>
      ),
      width: 50,
      fixed: 'left'
    },
    {
      title: t('freezeAndUnfreezeAccount.accountNumber'),
      dataIndex: ['customer', 'phoneNumber'],
      width: 200,
      fixed: 'left'
    },
    {
      title: t('freezeAndUnfreezeAccount.openFreezeBalance'),
      dataIndex: ['freezeMoney'],
      width: 200,
      render: (value) => <div>{convertNumber(value)} VND</div>
    },
    {
      title: t('freezeAndUnfreezeAccount.reason'),
      dataIndex: ['reason'],
      width: 400
    },
    {
      title: t('freezeAndUnfreezeAccount.freezeBy'),
      dataIndex: ['user'],
      width: 300,
      render: (record: CustomerElementType) => <div>{record?.fullName}</div>
    },
    {
      title: t('freezeAndUnfreezeAccount.freezeAt'),
      dataIndex: ['createdAt'],
      fixed: 'right',
      width: 250,
      render: (value) => (
        <div>{dayjs(value).format(TimeFullFormat)}</div>
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

  const handleUnFreeze = async (values: any) => {
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
      OpenFreezeMoney: values.freezeBalanceRequest,
      customerAccountNumber: searchValue
    })
    await triggerGetDetailAccountInformation({ accountNumber: searchValue })
    await triggerGetHistory({
      page: 1,
      take: 10,
      status: true,
      customerAccountNumber: searchValue
    })
    form.setFieldsValue({
      reason: undefined,  
      freezeBalanceRequest: undefined
    })
    if (data.data.statusCode === 201) {
      notification.success({
        message: t('freezeAndUnfreezeAccount.successUnFreeze')
      })
    }
  }

  return (
    <Card>
      <Row justify='center'>
        <Col span={16}>
          <Form
            form={form}
            onFinish={handleUnFreeze}
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
            <FreezeAccountForm
              isOpenFreeze={true}
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
                  {t('freezeAndUnfreezeAccount.unfreezeAccount.submit')}
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      {visibleHistory && (
        <Row className='w-100'>
          <Card
            title={t('freezeAndUnfreezeAccount.openFreezeHistoryTitle')}
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
              dataSource={historyUnFreeze?.data || []}
              loading={loadingHistory}
              scroll={{ x: '100%' }}
              rowKey='id'
              size='small'
              pagination={{
                current: historyUnFreeze?.meta.page,
                pageSize: historyUnFreeze?.meta?.take,
                total: historyUnFreeze?.meta.itemCount,
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

export default UnFreezeAccount
