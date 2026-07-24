import React from "react";
import type { DatePickerProps } from "antd";
import { DatePicker } from "antd";
import { cn } from "@/lib/utils/cn";
import "./style.css";

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
    const { isRange: _isRange, classNames, ...rangeProps } = props;
    return (
      <RangePicker
        {...rangeProps}
        classNames={{
          ...classNames,
          popup: {
            ...classNames?.popup,
            root: cn("responsive-range-picker", classNames?.popup?.root),
          },
        }}
      />
    );
  }

  const { isRange: _isRange, classNames, ...dateProps } = props;
  return (
    <DatePicker
      {...dateProps}
      classNames={{
        ...classNames,
        popup: {
          ...classNames?.popup,
          root: cn("responsive-range-picker", classNames?.popup?.root),
        },
      }}
    />
  );
};

export default DateInput;
