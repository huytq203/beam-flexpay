import { EyeOutlined } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { TYPEDATE } from '@constants/date.constant'
import { MerchanOrderItem } from '../types/apiOrder.type'

import { ColumnType } from "antd/es/table";
import dayjs from "dayjs";
import React from "react";
import { status } from "../constants/Order.constant";
import { formatNumber } from "@utils/formatNumber";

interface props {
  handleOpenModalDetail: (value: MerchanOrderItem) => void;
}
export const OrderColumn = ({ handleOpenModalDetail }: props): ColumnType<MerchanOrderItem>[] => [
  {
    title: "#",
    dataIndex: "no",
    align: "center",
  },
  {
    title: "Mã order",
    dataIndex: "orderCode",
    align: "center",
  },
  {
    title: "Mô tả",
    dataIndex: "orderDescription",
    align: "center",
  },
  {
    title: "Số tiền",
    dataIndex: "contactEmail",
    align: "center",
    render(value, record) {
      return (
        <>
          <span>
            {formatNumber(record.amount)} {record.currency}
          </span>
        </>
      );
    },
  },
  {
    title: "Trạng thái",
    dataIndex: "status",
    align: "center",
    render: (value: keyof typeof status) => <span className={status[value] == status.SUCCESS ? "success-status px-2 rounded text-[12px]" : 'info-status  px-2 rounded text-[12px]'}>{status[value] ?? value}</span>,
  },
  {
    title: "Thời gian tạo",
    dataIndex: "createdAt",
    align: "center",
    render(value, record) {
      return <>{dayjs(record.createdAt).format(TYPEDATE.fullTime)}</>;
    },
  },
  {
    title: "Hành động",
    align: "center",
    width: 100,
    render(value, record) {
      return (
        <>
          <ButtonComponent
            type="default"
            onClick={() => handleOpenModalDetail(record)}
            className={"button-action-blue"}
            size="small"
            content={
              <>
                <EyeOutlined />
              </>
            }
          />
        </>
      );
    },
  },
];
