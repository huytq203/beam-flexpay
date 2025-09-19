import { ColumnsType } from "antd/lib/table"
import CellContent from "@components/cell-content/CellContent"
import NoDataText from "@components/no-data-text/NoDataText"
import { Tooltip, Row, Col } from "antd"
import { GUTTER } from "@constants/appConstant"
import ButtonView from "@components/button-view/ButtonView"
import ButtonDelete from "@components/button-delete/ButtonDelete"
import { useMemo } from "react"
import { TFunction } from "@type/common"
import { OutboundFeeType } from "@type/outbound-fee"
import { convertLocalStringNumber, convertMiniPercentToPercent, getStringDateFromMoment, getVNDateStringFromUTCTimeString, getVNEndOfDayStringFromUTCTimeString, getVNStartOfDayStringFromUTCTimeString } from "@utils/helperFunctions"
import { DateFormat, TimeFullFormat } from "@constants/datetime"

export const useOutboundFeeColumns = (
  t: TFunction,
  onView?: (record: OutboundFeeType) => void,
  onEdit?: (record: OutboundFeeType) => void,
  onDelete?: (record: OutboundFeeType) => void
): ColumnsType<OutboundFeeType> => {
  return useMemo(() => [
    {
      title: t('labels.stt'),
      key: 'stt',
      align: 'center',
      fixed: 'left',
      width: 60,
      render: (_value, _record, index) => (
        <CellContent data={`${index + 1}`} />
      )
    },
    {
      title: t('labels.applicationType'),
      align: 'center',
      dataIndex: 'applicationType',
      key: 'applicationType',
      width: 150,
      render: (value) => {
        return <CellContent data={value} />
      }
    },
    {
      title: t('labels.transactionType'),
      dataIndex: 'transactionType',
      key: 'transactionType',
      align: 'center',
      width: 150,
      render: (value) => {
        return <CellContent data={value} />
      }
    },
    {
      title: t('labels.method'),
      dataIndex: 'method',
      key: 'method',
      align: 'center',
      width: 150,
      render: (value) => {
        return <CellContent data={value} />
      }
    },
    {
      title: t('labels.bank'),
      dataIndex: 'bank',
      key: 'bank',
      align: 'center',
      width: 120,
      render: (value) => {
        return <CellContent data={value} />
      }
    },
    {
      title: t('labels.provider'),
      dataIndex: 'provider',
      key: 'provider',
      align: 'center',
      width: 120,
      render: (value) => {
        return <CellContent data={value} />
      }
    },
    {
      title: t('labels.accountGroup'),
      dataIndex: 'accountGroup',
      key: 'accountGroup',
      align: 'center',
      width: 150,
      render: (value) => {
        return <CellContent data={value} />
      }
    },
    {
      title: t('labels.chargeWithin'),
      dataIndex: 'chargeWithin',
      key: 'chargeWithin',
      align: 'center',
      width: 120,
      render: (value) => {
        return <CellContent data={value ? 'Có' : 'Không'} />
      }
    },
    {
      title: t('labels.priceRange'),
      key: 'priceRange',
      align: 'center',
      width: 200,
      render: (record) => {
        const from = record.priceFrom?.toLocaleString() || '0'
        const to = record.priceTo?.toLocaleString() || '0'
        return <CellContent data={`${from} - ${to} VND`} />
      }
    },
    {
      title: t('labels.payerFees'),
      align: 'center',
      children: [
        {
          title: t('labels.flexibleFee'),
          align: 'center',
          width: 120,
          dataIndex: 'payerFlexibleFeeMpct',
          render: (value) => (
            <CellContent data={`${convertMiniPercentToPercent(value)}%`} />
          )
        },
        {
          title: t('labels.fixedFee'),
          align: 'center',
          width: 140,
          dataIndex: 'payerFixedFee',
          render: (value) => (
            <CellContent data={`${convertLocalStringNumber(value)} VND`} />
          )
        },
        {
          title: t('labels.minFee'),
          align: 'center',
          width: 140,
          dataIndex: 'payerMinFee',
          render: (value) => (
            <CellContent data={`${convertLocalStringNumber(value)} VND`} />
          )
        },
        {
          title: t('labels.maxFee'),
          align: 'center',
          width: 140,
          dataIndex: 'payerMaxFee',
          render: (value) => (
            <CellContent data={`${convertLocalStringNumber(value)} VND`} />
          )
        }
      ]
    },
    {
      title: t('labels.receiverFees'),
      align: 'center',
      children: [
        {
          title: t('labels.flexibleFee'),
          align: 'center',
          width: 120,
          dataIndex: 'receiverFlexibleFeeMpct',
          render: (value) => (
            <CellContent data={`${convertMiniPercentToPercent(value)}%`} />
          )
        },
        {
          title: t('labels.fixedFee'),
          align: 'center',
          width: 140,
          dataIndex: 'receiverFixedFee',
          render: (value) => (
            <CellContent data={`${convertLocalStringNumber(value)} VND`} />
          )
        },
        {
          title: t('labels.minFee'),
          align: 'center',
          width: 140,
          dataIndex: 'receiverMinFee',
          render: (value) => (
            <CellContent data={`${convertLocalStringNumber(value)} VND`} />
          )
        },
        {
          title: t('labels.maxFee'),
          align: 'center',
          width: 140,
          dataIndex: 'receiverMaxFee',
          render: (value) => (
            <CellContent data={`${convertLocalStringNumber(value)} VND`} />
          )
        }
      ]
    },
    {
      title: t('labels.createdTime'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      align: 'center',
      width: 180,
      render: (value) => {
        return <CellContent data={getVNDateStringFromUTCTimeString(value)} />
      }
    },
    {
      title: t('labels.startTime'),
      dataIndex: 'startDate',
      key: 'startDate',
      align: 'center',
      width: 150,
      render: (value) => {
        return <CellContent data={getVNStartOfDayStringFromUTCTimeString(value)} />
      }
    },
    {
      title: t('labels.endTime'),
      dataIndex: 'endDate',
      key: 'endDate',
      align: 'center',
      width: 150,
      render: (value) => {
        return <CellContent data={getVNEndOfDayStringFromUTCTimeString(value)} />
      }
    },
    {
      title: t('labels.action'),
      key: 'action',
      align: 'center',
      fixed: 'right',
      width: 160,
      render: (value: any, record: OutboundFeeType) => (
        <Row gutter={GUTTER} justify='center'>
          <Col>
            <ButtonView
              onClick={async () => {
                onView?.(record)
              }}
            />
          </Col>
        </Row>
      )
    }
  ], [t, onView, onEdit, onDelete])
}