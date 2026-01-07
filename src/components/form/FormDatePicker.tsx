import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { DateInput } from "@components/ui/dateInput-component";
import dayjs, { Dayjs } from "dayjs";

interface props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
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
  ...rest
}: props<T> & { [key: string]: any }) {

  // Helper to parse value for RangePicker
  const getRangeValue = (value: any): [Dayjs, Dayjs] | null => {
    if (!value) return null;
    if (Array.isArray(value) && value.length === 2) {
      return [dayjs(value[0]), dayjs(value[1])];
    }
    return null;
  };

  // Helper to parse value for single DatePicker
  const getSingleValue = (value: any): Dayjs | null => {
    return value ? dayjs(value) : null;
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
            value={getRangeValue(field.value)}
            picker={picker}
            onChange={(dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
              if (!dates || !dateStrings[0] || !dateStrings[1]) {
                field.onChange(null);
                return;
              }
              if (showTime) {
                field.onChange([dates[0].toISOString(), dates[1].toISOString()]);
              } else {
                field.onChange([
                  `${dateStrings[0].split(" ")[0]}T00:00:00.000Z`,
                  `${dateStrings[1].split(" ")[0]}T23:59:59.999Z`,
                ]);
              }
            }}
          />
        ) : (
          <DateInput
            {...field}
            {...rest}
            isRange={false}
            style={{ width: "100%" }}
            format={showTime ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY"}
            showTime={showTime}
            value={getSingleValue(field.value)}
            picker={picker}
            onChange={(date: Dayjs | null, dateString: string) => {
              if (!dateString) {
                field.onChange("");
                return;
              }
              if (showTime && date) {
                field.onChange(date.toISOString());
              } else {
                field.onChange(`${dateString}T00:00:00.000Z`);
              }
            }}
          />
        )
      }
    />
  );
}
