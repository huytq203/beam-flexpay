import React from "react";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import "./style.scss";

const { RangePicker } = DatePicker;

type RangePickerProps = React.ComponentProps<typeof RangePicker>;

type DateInputProps =
  | ({
    isRange?: false;
  } & DatePickerProps)
  | ({
    isRange: true;
  } & RangePickerProps);

const DateInput: React.FC<DateInputProps> = (props) => {
  if (props.isRange) {
    const { isRange, ...rangeProps } = props;
    return <RangePicker popupClassName="responsive-range-picker"  {...rangeProps} />;
  }

  const { isRange, ...dateProps } = props;
  return <DatePicker popupClassName="responsive-range-picker" {...dateProps} />;
};

export default DateInput;