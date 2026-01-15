import { CreditCardOutlined, HistoryOutlined, InfoCircleOutlined, PercentageOutlined, SafetyOutlined,SnowflakeIcon } from "@components/icons/common";
import { TabsProps } from "antd/lib";

export const items: TabsProps['items'] = [
    {
        key: '1',
        label: < ><span className="!flex !justify-center !items-center gap-1"><InfoCircleOutlined />Thông tin chung</span></>,
    },
    {
        key: '2',
        label: < ><span className="!flex !justify-center !items-center gap-1"><CreditCardOutlined />Thẻ/TK Ngân hàng</span></>,
    },
];
