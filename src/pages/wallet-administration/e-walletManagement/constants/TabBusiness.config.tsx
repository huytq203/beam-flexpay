import { CreditCardOutlined, HistoryOutlined, InfoCircleOutlined, PercentageOutlined, SafetyOutlined,SnowflakeIcon } from "@components/icons";
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
    {
        key: '3',
        label: < ><span className="!flex !justify-center !items-center gap-1"><HistoryOutlined />Lịch sử giao dịch</span></>,
    },
    {
        key: '4',
         label: < ><span className="!flex !justify-center !items-center gap-1"><SnowflakeIcon size={18} />Đóng băng số dư</span></>,
    },
    {
        key: '5',
        label: < ><span className="!flex !justify-center !items-center gap-1"><PercentageOutlined />Cấu hình phí</span></>,
    },
    {
        key: '6',
         label: < ><span className="!flex !justify-center !items-center gap-1"><SafetyOutlined />Bảo mật</span></>,
    },
];
export const businessInfo: TabsProps['items'] = [
    {
        key: '1',
        label: '1. Hồ sơ pháp lý',
    },
    {
        key: '2',
        label: '2. Người đại diện',
    },
];