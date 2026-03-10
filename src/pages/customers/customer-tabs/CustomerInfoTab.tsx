import { TimeFormat } from "@constants/datetime";
import { CustomerBalanceDetailDto } from "@type/application";
import { convertLocalStringNumber, getStatusAccountText, getStatusText, getTagAccountStatusColor, getTagColor } from "@utils/helperFunctions";
import { Descriptions, Tag, Typography } from "antd";
import moment from "moment";
import { useTranslation } from "react-i18next";
const { Text } = Typography;

type CustomerInfo = {
    customerInfo?: CustomerBalanceDetailDto
}

const CustomerInfoTab = (props: CustomerInfo) => {
    const { t: trans } = useTranslation();
    const { customerInfo } = props;


    return (
        <>
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
                {customerInfo?.createdAt ? dayjs(
                new Date(customerInfo.createdAt),
                TimeFormat
                ).format(TimeFormat) : <Text>{trans('labels.nodata')}</Text>}
            </Descriptions.Item>
            <Descriptions.Item label={trans('labels.verifiedWalletDate')}>
                {customerInfo?.customerVerification ? dayjs(
                new Date(customerInfo?.customerVerification?.createdAt),
                TimeFormat
                ).format(TimeFormat) : <Text>{trans('labels.nodata')}</Text>}
            </Descriptions.Item>
            {/* ngày khóa ví */}
            <Descriptions.Item label={trans('labels.lockedWalletDate')}>
                {(customerInfo?.isLocked && customerInfo?.lockedAt) ? dayjs(
                new Date(customerInfo?.lockedAt),
                TimeFormat
                ).format(TimeFormat) : <Text>{trans('labels.nodata')}</Text>}
            </Descriptions.Item>
            {/* ngày đóng băng */}
            <Descriptions.Item label={trans('labels.frozenWalletDate')}>
                {(customerInfo?.balances[0] && customerInfo?.balances[0]?.freezedMoney) ? dayjs(
                new Date(customerInfo?.balances[0]?.updatedAt),
                TimeFormat
                ).format(TimeFormat
                ) : <Text>{trans('labels.nodata')}</Text>}
            </Descriptions.Item>
            </Descriptions>
        </>
    )
    }

export default CustomerInfoTab
