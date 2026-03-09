import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { TimeFormat, TimeFullFormat } from '@constants/datetime'
import { useLazyCustomerFindOneByAccountNumberQuery } from '@services/cmsService'
import {
  CustomerBalanceDetailDto,
  TransactionDto,
  TransactionFindAllApiArg
} from '@type/application'
import {
  convertLocalStringNumber,
  getStatusAccountText,
  getStatusText,
  getTagAccountStatusColor,
  getTagColor,
  getTransactionStatus,
  getTransactionType
} from '@utils/helperFunctions'
import { Card, Descriptions, Form, Input, Tag, Typography } from 'antd'
import dayjs from 'dayjs'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import CellContent from '@components/cell-content/CellContent'
import TransactionTable from '@components/transaction-table/TransactionTable'
import { ColumnsType } from 'antd/es/table'
import '../style.scss'

const { Text } = Typography

function CustomerLookup() {
  const { t: trans } = useTranslation()
  const [search, setSearch] = useState<string>()
  const [historySearch, setHistorySearch] = useState<TransactionFindAllApiArg>({
    page: 1,
    take: 10
  })
  const [customerInfo, setCustomerInfo] = useState<CustomerBalanceDetailDto>()
  const [form] = Form.useForm<CustomerBalanceDetailDto>()
  const [getCustomerByAccountNumber] =
    useLazyCustomerFindOneByAccountNumberQuery()

  const lookUp = async () => {
    if (search) {
      setHistorySearch({
        ...historySearch,
        accountNumber: search
      })
      getCustomerByAccountNumber({ accountNumber: search })
        .unwrap()
        .then((result: CustomerBalanceDetailDto) => {
          setCustomerInfo(result)
        })
    }
  }

  const transferHistoryColumns: ColumnsType<TransactionDto> = [
    {
      title: trans('transfer-history.number'),
      dataIndex: 'no',
      width: 60,
      align: 'center',
      render(value, record, index) {
        if (historySearch.page === 1) {
          return index + historySearch.page
        } else {
          return index + ((historySearch.page - 1) * historySearch.take + 1)
        }
      },
      fixed: 'left'
    },
    {
      title: trans('transfer-history.transferTime'),
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => dayjs(value).format(TimeFullFormat),
      fixed: 'left',
      width: 160
    },
    {
      title: trans('transfer-history.transferNumber'),
      dataIndex: ['referenceId'],
      align: 'center',
      render: (record) => <CellContent data={record} />,
      fixed: 'left',
      width: 160
    },
    {
      title: trans('transfer-history.transferType'),
      dataIndex: 'type',
      align: 'center',
      render: (value) => getTransactionType(value),
      width: 120
    },
    {
      title: trans('transfer-history.value') + ' (VNĐ)',
      dataIndex: 'amount',
      align: 'center',
      render: (value, amount) => convertLocalStringNumber(value - amount.fee),
      width: 200
    },
    {
      title: trans('transfer-history.fee') + ' (VNĐ)',
      dataIndex: 'fee',
      align: 'center',
      render: (record) => (
        <CellContent data={convertLocalStringNumber(record)} />
      ),
      width: 200
    },
    {
      title: trans('transfer-history.total') + ' (VNĐ)',
      dataIndex: 'amount',
      align: 'center',
      render: (record) => (
        <CellContent data={convertLocalStringNumber(record)} />
      ),
      width: 200
    },
    {
      title: trans('transfer-history.status'),
      dataIndex: 'status',
      align: 'center',
      render: (status: string) => (
        <Tag color={getTransactionStatus(status)?.value}>
          {getTransactionStatus(status)?.label}
        </Tag>
      ),
      width: 100
    },
    {
      title: trans('transfer-history.note'),
      dataIndex: 'note',
      align: 'center',
      width: 300,
      ellipsis: true,
      render: (record) => <CellContent data={record} />
    }
    // {
    //   title: trans('transfer-history.action'),
    //   dataIndex: 'status',
    //   align: 'center',
    //   key: 'status',
    //   fixed: 'right',
    //   width: 100,
    //   render: (value, record) => (
    //     <ButtonView
    //       onClick={async () => {
    //         // setSelectedTransaction(record.id.toString())
    //         // toggleModal(true)
    //       }}
    //     />
    //   )
    // }
  ]

  return (
    <Card
      title={
        <SearchBar
          onFinish={lookUp}
          form={form}
          cols='2'
          headerMenu={
            <>
              <Input
                onChange={(e) => {
                  if (e.target.value !== '') {
                    setSearch(e.target.value)
                  }
                }}
                placeholder={trans('placeholders.phone').toString()}
                onPressEnter={lookUp}
              />
              <ButtonSearch onClick={lookUp} />
            </>
          }
        />
      }
    >
      <Descriptions
        bordered
        size='small'
        labelStyle={{ fontWeight: 'bold' }}
        title={trans('customer.information')}
        className='mb-16'
      >
        <Descriptions.Item label={trans('labels.accountName')}>
          {customerInfo?.accountNumber}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.accountType')}>
          {trans('internal-accounts-report.personalAccount') ?? (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.dateOfBirth')}>
          {customerInfo?.birthDay ? (
            dayjs(customerInfo.birthDay, TimeFormat).format(TimeFormat)
          ) : (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.email')}>
          {customerInfo?.email ?? <Text>{trans('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.IdNumber')}>
          {customerInfo?.identityNumber ?? (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.dateOfIdNumber')}>
          {customerInfo?.dateOfIdentityIssuance ?? (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item
          label={trans('labels.placeOfIdNumber')}
          span={8}
        >
          {customerInfo?.placeOfIdentityIssuance ?? (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.province')}>
          {customerInfo?.province ?? <Text>{trans('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.district')}>
          {customerInfo?.district ?? <Text>{trans('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.ward')}>
          {customerInfo?.village ?? <Text>{trans('labels.nodata')}</Text>}
        </Descriptions.Item>
      </Descriptions>

      <Descriptions
        bordered
        size='small'
        labelStyle={{ fontWeight: 'bold' }}
        title={trans('customer.wallet')}
        className='mb-16'
      >
        <Descriptions.Item label={trans('labels.walletNo')}>
          {customerInfo?.phoneNumber ?? <Text>{trans('labels.nodata')}</Text>}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.verifiedAccount')}>
          <Tag
            color={getTagAccountStatusColor(customerInfo?.status)}
            className='text-capitalize'
          >
            {getStatusAccountText(customerInfo?.status) ?? (
              <Text>{trans('labels.nodata')}</Text>
            )}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.status')}>
          <Tag
            color={getTagColor(customerInfo?.active)}
            className='text-capitalize'
          >
            {getStatusText(customerInfo?.active) ?? (
              <Text>{trans('labels.nodata')}</Text>
            )}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.totalBalance')}>
          {customerInfo?.balances
            ? convertLocalStringNumber(
                customerInfo?.balances?.[0]?.availableMoney +
                  customerInfo?.balances?.[0]?.freezedMoney
              )
            : '0'}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.availableBalances')}>
          {customerInfo?.balances?.[0]?.availableMoney
            ? convertLocalStringNumber(
                customerInfo?.balances?.[0]?.availableMoney
              )
            : '0'}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.lockedBalance')}>
          {customerInfo?.balances?.[0]?.freezedMoney ||
          customerInfo?.balances?.[0]?.freezedMoney !== 0
            ? convertLocalStringNumber(
                customerInfo?.balances?.[0]?.freezedMoney
              )
            : '0'}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.createdWalletDate')}>
          {customerInfo?.createdAt ? (
            dayjs(new Date(customerInfo.createdAt), TimeFormat).format(
              TimeFormat
            )
          ) : (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={trans('labels.verifiedWalletDate')}>
          {customerInfo?.customerVerification ? (
            dayjs(
              new Date(customerInfo?.customerVerification?.createdAt),
              TimeFormat
            ).format(TimeFormat)
          ) : (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        {/* ngày khóa ví */}
        <Descriptions.Item label={trans('labels.lockedWalletDate')}>
          {customerInfo?.isLocked && customerInfo?.lockedAt ? (
            dayjs(new Date(customerInfo?.lockedAt), TimeFormat).format(
              TimeFormat
            )
          ) : (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
        {/* ngày đóng băng */}
        <Descriptions.Item label={trans('labels.frozenWalletDate')}>
          {customerInfo?.balances[0] &&
          customerInfo?.balances[0]?.freezedMoney ? (
            dayjs(
              new Date(customerInfo?.balances[0]?.updatedAt),
              TimeFormat
            ).format(TimeFormat)
          ) : (
            <Text>{trans('labels.nodata')}</Text>
          )}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions
        bordered
        size='small'
        labelStyle={{ fontWeight: 'bold' }}
        title={trans('customer.banks')}
        className='mb-16'
      >
        {customerInfo?.paymentLinks &&
          customerInfo?.paymentLinks?.length > 0 &&
          customerInfo?.paymentLinks?.map((item, index) => (
            <>
              <Descriptions.Item
                label={trans('customer.banks')}
                key={index}
              >
                {item.provider}
              </Descriptions.Item>
              <Descriptions.Item
                label={trans('customer.linkedDate')}
                key={index}
              >
                {dayjs(new Date(item.createdAt), TimeFormat).format(
                  TimeFormat
                )}
              </Descriptions.Item>
              <Descriptions.Item
                label={trans('customer.cancelLinkedDate')}
                key={index}
              >
                {item.deletedAt ? (
                  dayjs(new Date(item.deletedAt), TimeFormat).format(
                    TimeFormat
                  )
                ) : (
                  <Text>{trans('labels.nodata')}</Text>
                )}
              </Descriptions.Item>
            </>
          ))}
        {/* <Descriptions.Item label={trans('customer.banks')}>
          {customerInfo?.paymentLinks && customerInfo?.paymentLinks?.length > 0
            ? customerInfo?.paymentLinks?.[0].provider
            : '0'}
        </Descriptions.Item>
        <Descriptions.Item label={trans('customer.linkedDate')}>
          {customerInfo?.paymentLinks && customerInfo?.paymentLinks?.length > 0
            ? dayjs(
                new Date(customerInfo?.paymentLinks?.[0].createdAt),
                TimeFormat
              ).format(TimeFormat)
            : '0'}
        </Descriptions.Item>
        <Descriptions.Item label={trans('customer.cancelLinkedDate')}>
          {customerInfo?.paymentLinks && customerInfo?.paymentLinks?.length > 0
            ? dayjs(
              new Date(customerInfo?.paymentLinks?.[0].deletedAt),
                TimeFormat
              ).format(TimeFormat)
            : '0'}
        </Descriptions.Item> */}
      </Descriptions>

      <h3 className='mb-16'>{trans('customer.transaction')}</h3>
      <TransactionTable
        search={historySearch}
        setSearch={setHistorySearch}
        skip={!historySearch.accountNumber}
      />

      <Descriptions
        bordered
        size='small'
        labelStyle={{ fontWeight: 'bold' }}
        title={trans('customer.history')}
        className='mb-16'
      ></Descriptions>
    </Card>
  )
}

export default CustomerLookup
