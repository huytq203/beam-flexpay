import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { DateInput } from "@components/ui/dateInput-component";
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import React, { ReactNode } from "react";
import { DatePicker } from "antd";
import type { DatePickerProps } from "antd";

type RangePickerProps = React.ComponentProps<typeof DatePicker.RangePicker>;

/** Props owned by this component - they are never forwarded verbatim to the picker. */
type OwnPropKeys =
  | "name"
  | "value"
  | "onChange"
  | "picker"
  | "showTime"
  | "format"
  | "needConfirm"
  | "placeholder"
  | "required"
  | "className"
  | "style";

interface BaseProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  picker?: "date" | "week" | "month" | "quarter" | "year";
  className?: string;
  showTime?: boolean;
  classNameLable?: string;
  required?: boolean;
}

type SinglePickerProps<T extends FieldValues> = BaseProps<T> &
  Omit<DatePickerProps, OwnPropKeys> & {
    isRange?: false;
    placeholder?: string;
  };

type RangePickerFormProps<T extends FieldValues> = BaseProps<T> &
  Omit<RangePickerProps, OwnPropKeys> & {
    isRange: true;
    placeholder?: string | [string, string];
  };

type props<T extends FieldValues> =
  | SinglePickerProps<T>
  | RangePickerFormProps<T>;

export function FormDatePicker<T extends FieldValues>(props: props<T>) {
  const {
    name,
    control,
    label,
    picker = "date",
    className = "col-span-6 flex flex-col",
    classNameLable = "font-medium",
    required = false,
    showTime = false,
    placeholder = 'DD/MM/YYYY',
  } = props;

  // Helper to parse value for RangePicker
  const getRangeValue = (value: Dayjs[]): [Dayjs | null, Dayjs | null] | null => {
    if (!value || !Array.isArray(value)) return null;
    return [
      value[0] ? dayjs(value[0]) : null,
      value[1] ? dayjs(value[1]) : null,
    ];
  };

  // Helper to parse value for single DatePicker
  const getSingleValue = (value: Dayjs | null): Dayjs | null => {
    if (!value) return null;
    return dayjs(value)
  };

  const format = showTime ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY";

  return (
    <FormField
      name={name}
      control={control}
      label={label}
      required={required}
      className={className}
      classNameLable={classNameLable}
      render={(field) => {
        if (props.isRange) {
          const {
            name: _name,
            control: _control,
            label: _label,
            picker: _picker,
            className: _className,
            classNameLable: _classNameLable,
            required: _required,
            showTime: _showTime,
            isRange: _isRange,
            placeholder: _placeholder,
            ...rest
          } = props;
          return (
            <DateInput
              {...rest}
              isRange={true}
              style={{ width: "100%" }}
              format={format}
              showTime={showTime}
              needConfirm={false}
              value={getRangeValue(field.value)}
              picker={picker}
              placeholder={
                Array.isArray(placeholder) ? placeholder : [placeholder, placeholder]
              }
              onChange={(dates, dateStrings) => {
                const [start, end] = dates ?? [null, null];
                if (!start || !end || !dateStrings[0] || !dateStrings[1]) {
                  field.onChange('');
                  return;
                }
                if (showTime) {
                  field.onChange([
                    start.format("YYYY-MM-DDTHH:mm:ss.SSS"),
                    end.format("YYYY-MM-DDTHH:mm:ss.SSS"),
                  ]);
                } else {
                  field.onChange([
                    start.startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS"),
                    end.endOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS"),
                  ]);
                }
              }}
            />
          );
        }

        const {
          name: _name,
          control: _control,
          label: _label,
          picker: _picker,
          className: _className,
          classNameLable: _classNameLable,
          required: _required,
          showTime: _showTime,
          isRange: _isRange,
          placeholder: _placeholder,
          ...rest
        } = props;
        return (
          <DateInput
            {...field}
            {...rest}
            isRange={false}
            style={{ width: "100%" }}
            format={format}
            showTime={showTime}
            needConfirm={false}
            value={getSingleValue(field.value)}
            picker={picker}
            placeholder={
              typeof placeholder === 'string' ? placeholder : placeholder[0]
            }
            onChange={(date) => {
              if (!date) {
                field.onChange('');
                return;
              }
              if (showTime) {
                field.onChange(dayjs(date).format("YYYY-MM-DDTHH:mm:ss.SSS"))
              } else {
                field.onChange(dayjs(date).startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSS"));
              }
            }}
          />
        );
      }}
    />
  );
}
