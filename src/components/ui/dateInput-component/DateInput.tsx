import React from "react";
import type { DatePickerProps } from "antd";
import { DatePicker, Space } from "antd";
import './style.scss'

interface DateInputProps {
  onChange: DatePickerProps["onChange"];
  picker: "date" | "week" | "month" | "quarter" | "year";
}

const DateInput: React.FC<DateInputProps> = ({ picker, onChange }) => {
  return (
    <Space direction="vertical">
      <DatePicker onChange={onChange} picker={picker} />
    </Space>
  );
};

export default DateInput;
