import ButtonProhibit from '@components/button-prohibit/ButtonProhibit'
import ButtonStamp from '@components/button-stamp/ButtonStamp'
import { GUTTER } from '@constants/appConstant'
import { TimeFormat } from '@constants/datetime'
import { usePaymentLinkUpdateStatusMutation } from '@services/cmsService'
import { CustomerBalanceDetailDto } from '@type/application'
import { getStatusPaymentLinkBank } from '@utils/helperFunctions'
import { Col, message, Modal, Row, Table, Tooltip, Typography } from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
const { Text } = Typography
type CustomerInfo = {
    customerInfo?: CustomerBalanceDetailDto
}
const CustomerBankTab = (props: CustomerInfo) => {

    const { t: trans } = useTranslation()
    const { customerInfo } = props

    const [localPaymentLinks, setLocalPaymentLinks] = useState(customerInfo?.paymentLinks || [])

    const [updateStatus, { isLoading }] = usePaymentLinkUpdateStatusMutation()

    const [confirmVisible, setConfirmVisible] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<any>(null)

    const showConfirm = (record: any) => {
        setSelectedRecord(record)
        setConfirmVisible(true)
    }

    const handleConfirmOk = async () => {
        if (selectedRecord) {
            await handleUpdateStatus(selectedRecord)
        }
        setConfirmVisible(false)
        setSelectedRecord(null)
    }

    const handleConfirmCancel = () => {
        setConfirmVisible(false)
        setSelectedRecord(null)
    }
    useEffect(() => {
        setLocalPaymentLinks(customerInfo?.paymentLinks || [])
        console.log('customerInfo changed:', customerInfo?.paymentLinks)
    }, [customerInfo])
    const handleUpdateStatus = useCallback(async (record: any) => {
        try {
            // Optimistic update - Cập nhật UI trước khi API hoàn thành
            setLocalPaymentLinks(prev => prev.map(item => 
            item.id === record.id 
                ? {...item, status: item.status === 1 ? 0 : 1} 
                : item
            ))
            await updateStatus({ id: record.id}).unwrap()
            message.success(trans('customer.updateStatusSuccess'))
        } catch {
            message.error(trans('customer.updateStatusFail'))
            // Reset lại UI nếu API thất bại
            setLocalPaymentLinks(customerInfo?.paymentLinks || [])
        }
    }, [updateStatus, trans, customerInfo])
    const columns = [
        {
        title: trans('customer.banks'),
        dataIndex: 'provider',
        key: 'provider'
        },
        {
        title: trans('customer.payerDebit'),
        dataIndex: 'payerDebit',
        key: 'payerDebit'
        },
        {
        title: trans('customer.status'),
        dataIndex: 'status',
        key: 'status',
        render: (value: number) => {
            return <Text>{getStatusPaymentLinkBank(value)}</Text>
            }
        },
        {
        title: trans('customer.linkedDate'),
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (value: string) =>
            dayjs(new Date(value), TimeFormat).format(TimeFormat)
        },
        {
        title: trans('customer.cancelLinkedDate'),
        dataIndex: 'deletedAt',
        key: 'deletedAt',
        render: (value: string | null) =>
            value ? (
            dayjs(new Date(value), TimeFormat).format(TimeFormat)
            ) : (
            <Text>{trans('labels.nodata')}</Text>
            )
        },
        {
            title: trans('customer.action'),
            dataIndex: 'id',
            key: 'id',
            align: 'center' as const,
            fixed: 'right' as const,
            width: 140,
            render: (value: string, record: any) => (
            <Row
                gutter={GUTTER}
                justify='center'
            >
                <Col>
                <Tooltip
                    title={
                    record.status
                        ? trans`customer.cancelVerify`
                        : trans`customer.verify`
                    }
                >
                    {record.status ? (
                        <ButtonProhibit
                        module='payment-link'
                        onClick={async () =>
                        showConfirm(record)
                        }
                    />
                    
                    ) : (
                    <ButtonStamp
                        module='payment-link'
                        onClick={async () =>
                        showConfirm(record)
                        }
                    />
                    )}
                </Tooltip>
                </Col>
                
            </Row>
            )
        }
    ]

    return (
        <>
            <Table
            key={JSON.stringify(customerInfo?.paymentLinks)}
            bordered
            size='small'
            columns={columns}
            dataSource={localPaymentLinks}
            rowKey={(record) => record.id || record.provider + record.createdAt + record.status}
            pagination={false}
            locale={{
                emptyText: trans('labels.nodata')
            }}
            />
            <Modal
                open={confirmVisible}
                onOk={handleConfirmOk}
                onCancel={handleConfirmCancel}
                confirmLoading={isLoading}
                title={trans('customer.confirmUpdateStatus')}
                okText={trans('buttons.ok')}
                cancelText={trans('buttons.cancel')}
                centered
            >
                <Text>
                    {selectedRecord?.status
                        ? trans('customer.confirmCancelVerifyMsg')
                        : trans('customer.confirmVerifyMsg')}
                </Text>
            </Modal>
        </>
            
    )
}

export default CustomerBankTab
