import ButtonCancel from '@components/button-cancel/ButtonCancel'
import ButtonFreeze from '@components/button-freeze/ButtonFreeze'
import ButtonUnfreeze from '@components/button-Unfreeze/ButtonUnfreeze'
import ButtonView from '@components/button-view/ButtonView'
import CellContent from '@components/cell-content/CellContent'
import Table from '@components/table/Table'
import TransactionDetail from '@components/transaction-detail/TransactionDetail'
import { TimeFullFormat } from '@constants/datetime'
import { useFreezeAccountMutationMutation, useUnFreezeAccountMutationMutation } from '@services/apiFreezeAndUnfreezeAccountService'
import { useTransactionMainFindAllQuery } from '@services/cmsService'
import { TransactionDto, TransactionFindAllApiArg } from '@type/application'
import { FrozenStatus, TransactionStatus, TransactionType } from '@type/transfer'
import {
  convertLocalStringNumber,
  getTransactionStatus,
  getTransactionType
} from '@utils/helperFunctions'
import { useBoolean } from 'ahooks'
import { Button, Empty, Form, Input, message, Modal, Space, Tag, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { set } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  search: TransactionFindAllApiArg
  setSearch: (search: TransactionFindAllApiArg) => void
  skip?: boolean
  className?: string
}

const TransactionTable = ({ search, setSearch, skip, className }: Props) => {
  const { t } = useTranslation()

  // State variables
  const [selectedId, setSelectedId] = useState<number>()
  const [freezingId, setFreezingId] = useState<number>()
  const [unfreezingId, setUnfreezingId] = useState<number>()
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [visible, { setTrue, setFalse }] = useBoolean()
  const [freezeMoney, setFreezeMoney] = useState<number>(0)
  const [freezeModalVisible, { setTrue: showFreezeModal, setFalse: hideFreezeModal }] = useBoolean()
  const [unfreezeModalVisible, { setTrue: showUnfreezeModal, setFalse: hideUnfreezeModal }] = useBoolean()
  
  // API hooks
  const [freezeTransaction, { isLoading: isFreezingTransaction }] = useFreezeAccountMutationMutation()
  const [unfreezeTransaction, { isLoading: isUnfreezingTransaction }] = useUnFreezeAccountMutationMutation()

  const handleDetail = (id: number) => {
    setSelectedId(id)
    setTrue()
  }

  const handleCloseDetail = () => {
    setSelectedId(undefined)
    setFalse()
  }

  const handleFreezeClick = (id: number, transaction: TransactionDto) => {
    const dataIndex = getDataIndex(transaction.type as TransactionType);
    setFreezingId(id)
    setReason('')
    setFreezeMoney(transaction.amount)
    showFreezeModal()
    setAccountNumber(transaction[dataIndex])
  }
  
  // Handler for cancelling freeze
  const handleCancelFreeze = () => {
    setFreezingId(undefined)
    setReason('')
    setFreezeMoney(0)
    hideFreezeModal()
    setAccountNumber('')
  }
  
  // Handler for confirming freeze
  const handleConfirmFreeze = async () => {
    if (!reason.trim()) {
      message.error('Vui lòng nhập lý do đóng băng giao dịch')
      return
    }
    
    try {
      await freezeTransaction({
        transactionId: String(freezingId),
        reason: reason.trim(),
        freezeMoney: freezeMoney,
        customerAccountNumber: accountNumber
        // Add customerId if your API requires it
      }).unwrap()
      
      message.success('Đóng băng giao dịch thành công')
      handleCancelFreeze()
      
      // Refresh the transaction list
      setSearch({...search})
    } catch (error: any) {
      message.error(error?.data?.message || 'Không thể đóng băng giao dịch. Vui lòng thử lại sau.')
    }
  }

  // Handler for initiating unfreeze process
  const handleUnfreezeClick = (id: number, transaction: TransactionDto) => {
    const dataIndex = getDataIndex(transaction.type as TransactionType);
    setUnfreezingId(id)
    setReason('')
    setFreezeMoney(transaction.amount)
    showUnfreezeModal()
    setAccountNumber(transaction[dataIndex])
  }
  
  // Handler for cancelling unfreeze
  const handleCancelUnfreeze = () => {
    setUnfreezingId(undefined)
    setReason('')
    hideUnfreezeModal()
  }
  
  // Handler for confirming unfreeze
  const handleConfirmUnfreeze = async () => {
    if (!reason.trim()) {
      message.error('Vui lòng nhập lý do mở đóng băng giao dịch')
      return
    }
    
    try {
      await unfreezeTransaction({
        transactionId: String(unfreezingId),
        reason: reason.trim(),
        freezeMoney: freezeMoney,
        customerAccountNumber: accountNumber
      }).unwrap()
      
      message.success('Mở đóng băng giao dịch thành công')
      handleCancelUnfreeze()
      
      // Refresh the transaction list
      setSearch({...search})
    } catch (error: any) {
      message.error(error?.data?.message || 'Không thể mở đóng băng giao dịch. Vui lòng thử lại sau.')
    }
  }

  const getDataIndex = (type: TransactionType) =>
    type === TransactionType.WITHDRAW ? 'from' : 'to'


  const transferHistoryColumns: ColumnsType<TransactionDto> = [
    {
      title: t('transfer-history.number'),
      dataIndex: 'no',
      width: 60,
      align: 'center',
      render(value, record, index) {
        if (search.page === 1) {
          return index + search.page
        } else {
          return index + ((search.page - 1) * search.take + 1)
        }
      },
      fixed: 'left'
    },
    {
      title: t('transfer-history.transferTime'),
      dataIndex: 'createdAt',
      align: 'center',
      render: (value) => dayjs(value).format(TimeFullFormat),
      fixed: 'left',
      width: 160
    },
    {
      title: t('transfer-history.transferNumber'),
      dataIndex: ['code'],
      align: 'center',
      render: (record) => <CellContent data={record} />,
      fixed: 'left',
      width: 160
    },
    {
      title: t('transfer-history.accountName'),
      align: 'center',
      render: (record) => {
        const dataIndex = getDataIndex(record.type);
        return <CellContent data={record[dataIndex]} />
      },
      width: 150
    },
    {
      title: t('transfer-history.transferType'),
      dataIndex: 'type',
      align: 'center',
      render: (value) => getTransactionType(value),
      width: 120
    },
    {
      title: t('transfer-history.value') + ' (VNĐ)',
      dataIndex: 'amount',
      align: 'center',
      render: (value, amount) => convertLocalStringNumber(value),
      width: 200
    },
    {
      title: t('transfer-history.status'),
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
      title: t('transfer-history.note'),
      dataIndex: 'note',
      align: 'center',
      width: 300,
      ellipsis: true,
      render: (record) => <CellContent data={record} />
    },
    {
      title: t('transfer-history.action'),
      dataIndex: 'id',
      align: 'center',
      fixed: 'right',
      width: 180, // Slightly increased width for better spacing
      render: (id, record) => (
        <Space>
          <ButtonView onClick={() => handleDetail(id)} />
          
          {record.status === TransactionStatus.SUCCESS && record.frozenStatus !== FrozenStatus.FROZEN && (
            <Tooltip title={t('freezeAndUnfreezeAccount.freezeTransaction')}>
              <span> {/* Wrapper needed because ButtonFreeze might not accept ref properly */}
                <ButtonFreeze 
                  module="transaction" 
                  onClick={() => handleFreezeClick(id, record)} 
                />
              </span>
            </Tooltip>
          )}
        
          {record.frozenStatus === FrozenStatus.FROZEN && (
            <Tooltip title={t('freezeAndUnfreezeAccount.unfreezeTransaction')}>
              <span> {/* Wrapper needed for the same reason as above */}
                <ButtonUnfreeze
                  module="transaction"
                  onClick={() => handleUnfreezeClick(id, record)}
                />
              </span>
            </Tooltip>
          )}
        </Space>
      )
    }
  ]

  const { data: transactionHistory, isLoading } = useTransactionMainFindAllQuery(search, {
    skip: skip
  })
  return (
    <>
      <Table
        rowKey='id'
        columns={transferHistoryColumns}
        dataSource={transactionHistory?.data}
        className={className}
        loading={isLoading}
        locale={{
          emptyText: <Empty description={t('transfer-history.noData') || 'Không có dữ liệu'} />
        }}
        pagination={{
          current: transactionHistory?.meta?.page,
          pageSize: 10,
          total: transactionHistory?.meta?.itemCount,
          showSizeChanger: false,
          onChange(page) {
            setSearch({
              ...search,
              page
            })
          }
        }}
      />
      {selectedId && (
        <TransactionDetail
          open={visible}
          onCancel={handleCloseDetail}
          id={String(selectedId)}
        />
      )}
      {/* Freeze Transaction Modal */}
      <Modal
        title={t('freezeAndUnfreezeAccount.freezeTransaction')}
        open={freezeModalVisible}
        onCancel={handleCancelFreeze}
        footer={[
          <Button
            className='mr-10'
            onClick={handleCancelFreeze}
          >
            {t('custom-check-box.button.cancel')}
          </Button>,
          <Button
            type='primary'
            htmlType='submit'
            loading={isFreezingTransaction}
            onClick={handleConfirmFreeze}
          >
            {t('custom-check-box.button.submit')}
          </Button>
        ]}
      >
        <p>Bạn đang thực hiện đóng băng giao dịch. Vui lòng nhập lý do:</p>
        <Form layout="vertical">
          <Form.Item 
            label="Lý do đóng băng" 
            required
            rules={[{ required: true, message: 'Vui lòng nhập lý do đóng băng' }]}
          >
            <Input.TextArea 
              rows={4} 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do đóng băng giao dịch..."
            />
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Unfreeze Transaction Modal */}
      <Modal
        title="Mở đóng băng giao dịch"
        open={unfreezeModalVisible}
        onCancel={handleCancelUnfreeze}
        footer={[
          <Button key="cancel" onClick={handleCancelUnfreeze}>
            Hủy
          </Button>,
          <Button 
            key="submit" 
            type="primary"
            loading={isUnfreezingTransaction} 
            onClick={handleConfirmUnfreeze}
          >
            Xác nhận mở đóng băng
          </Button>
        ]}
      >
        <p>Bạn đang thực hiện mở đóng băng giao dịch. Vui lòng nhập lý do:</p>
        <Form layout="vertical">
          <Form.Item 
            label="Lý do mở đóng băng" 
            required
            rules={[{ required: true, message: 'Vui lòng nhập lý do mở đóng băng' }]}
          >
            <Input.TextArea 
              rows={4} 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Nhập lý do mở đóng băng giao dịch..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
export default TransactionTable