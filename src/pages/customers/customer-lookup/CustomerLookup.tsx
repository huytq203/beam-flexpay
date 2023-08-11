import ButtonSearch from '@components/button-search/ButtonSearch'
import SearchBar from '@components/search-bar/SearchBar'
import { GUTTER } from '@constants/appConstant'
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
import { Card, Col, Descriptions, Input, Row, Tag, Typography } from 'antd'
import moment from 'moment'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import CellContent from '@components/cell-content/CellContent'
import TransactionTable from '@components/transaction-table/TransactionTable'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
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
          headerMenu={
            <Row
              gutter={GUTTER}
              justify='center'
            >
              <Col flex='500px'>
                <Input
                  onChange={(e) => {
                    if (e.target.value !== '') {
                      setSearch(e.target.value)
                    }
                  }}
                  placeholder={trans('placeholders.phone').toString()}
                  onPressEnter={lookUp}
                />
              </Col>
              <Col flex='150px'>
                <ButtonSearch onClick={lookUp} />
              </Col>
            </Row>
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
            moment(customerInfo.birthDay, TimeFormat).format(TimeFormat)
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
        <Descriptions.Item label={trans('customer.banks')}>
          {/* TODO: banks.map -> watting for api */}
        </Descriptions.Item>
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
