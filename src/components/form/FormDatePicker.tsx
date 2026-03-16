import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { DateInput } from "@components/ui/dateInput-component";
import dayjs, { Dayjs } from "dayjs";
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);
import { ReactNode } from "react";

interface props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
  picker?: "date" | "week" | "month" | "quarter" | "year";
  className?: string;
  showTime?: boolean;
  classNameLable?: string;
  isRange?: boolean;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  picker = "date",
  className = "col-span-6 flex flex-col",
  classNameLable = "font-medium",
  showTime = false,
  isRange = false,
  placeholder = 'DD/MM/YYYY',
  ...rest
}: props<T> & { [key: string]: any }) {

  // Helper to parse value for RangePicker
  const getRangeValue = (value: Dayjs[]): [Dayjs | null, Dayjs | null] | null => {
    if (!value || !Array.isArray(value)) return null;
    return [
      value[0] ? dayjs.utc(value[0]).utcOffset(7) : null,
      value[1] ? dayjs.utc(value[1]).utcOffset(7) : null,
    ];
  };

  // Helper to parse value for single DatePicker
  const getSingleValue = (value: Dayjs | null): Dayjs | null => {
    if (!value) return null;
    return dayjs.utc(value).utcOffset(7);
  };

  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      classNameLable={classNameLable}
      render={(field) =>
        isRange ? (
          <DateInput
            {...rest}
            isRange={true}
            style={{ width: "100%" }}
            format={showTime ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
            showTime={showTime}
            needConfirm={false}
            value={getRangeValue(field.value)}
            picker={picker}
            placeholder={placeholder}
            onChange={((dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
              if (!dates || !dateStrings[0] || !dateStrings[1]) {
                field.onChange(null);
                return;
              }
              if (showTime) {
                field.onChange([
                  dates[0].toISOString(),
                  dates[1].toISOString(),
                ]);
              } else {
                field.onChange([
                  `${dates[0].format("YYYY-MM-DD")}T00:00:00.000Z`,
                  `${dates[1].format("YYYY-MM-DD")}T23:59:59.999Z`,
                ]);
              }
            }) as any}
          />
        ) : (
          <DateInput
            {...field}
            {...rest}
            isRange={false}
            style={{ width: "100%" }}
            format={showTime ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
            showTime={showTime}
            needConfirm={false}
            value={getSingleValue(field.value)}
            picker={picker}
            onChange={(date: Dayjs | null, dateString: string) => {
              if (!date) {
                field.onChange("");
                return;
              }
              if (showTime) {
                field.onChange(date.toISOString());
              } else {
                field.onChange(`${date.format("YYYY-MM-DD")}T00:00:00.000Z`);
              }
            }}
          />
        )
      }
    />
  );
}
