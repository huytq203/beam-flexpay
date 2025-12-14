import React from "react";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";
import './style.scss'

interface props extends DatePickerProps {
  onChange?: DatePickerProps["onChange"];
  picker?: "date" | "week" | "month" | "quarter" | "year";
}

const DateInput: React.FC<props> = ({ picker, onChange,...rest }) => {
  return (
    <Space direction="vertical">
      <DatePicker onChange={onChange} picker={picker} {...rest} />
    </Space>
  );
};

export default DateInput;
