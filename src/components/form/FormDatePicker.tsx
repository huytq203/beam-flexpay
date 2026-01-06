import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { DateInput } from "@components/ui/dateInput-component";
import dayjs, { Dayjs } from "dayjs";

interface FormDatePickerBaseProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  picker?: "date" | "week" | "month" | "quarter" | "year";
  className?: string;
  showTime?: boolean;
  classNameLable?: string;
}

// Props cho DatePicker thường
interface FormDatePickerSingleProps<T extends FieldValues>
  extends FormDatePickerBaseProps<T> {
  isRange?: false;
}

// Props cho RangePicker
interface FormDatePickerRangeProps<T extends FieldValues>
  extends FormDatePickerBaseProps<T> {
  isRange: true;
}

type FormDatePickerProps<T extends FieldValues> =
  | FormDatePickerSingleProps<T>
  | FormDatePickerRangeProps<T>;

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
}: FormDatePickerProps<T> & { [key: string]: any }) {
  // Format tùy thuộc vào showTime
  const dateFormat = showTime ? "DD/MM/YYYY HH:mm:ss" : "DD/MM/YYYY";

  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      classNameLable={classNameLable}
      render={(field) => {
        if (isRange) {
          // RangePicker handling
          return (
            <DateInput
              {...rest}
              isRange={true}
              format={dateFormat}
              showTime={showTime}
              picker={picker}
              value={
                field.value && Array.isArray(field.value)
                  ? [
                      field.value[0] ? dayjs(field.value[0]) : null,
                      field.value[1] ? dayjs(field.value[1]) : null,
                    ]
                  : null
              }
              onChange={(
                dates: [Dayjs | null, Dayjs | null] | null,
                dateStrings: [string, string]
              ) => {
                if (!dates || !dateStrings[0] || !dateStrings[1]) {
                  field.onChange(null);
                  return;
                }
                if (showTime && dates[0] && dates[1]) {
                  field.onChange([
                    dates[0].toISOString(),
                    dates[1].toISOString(),
                  ]);
                } else {
                  field.onChange([
                    dayjs(dateStrings[0], "DD/MM/YYYY").startOf("day").toISOString(),
                    dayjs(dateStrings[1], "DD/MM/YYYY").endOf("day").toISOString(),
                  ]);
                }
              }}
            />
          );
        }

        // DatePicker handling
        return (
          <DateInput
            {...rest}
            format={dateFormat}
            showTime={showTime}
            picker={picker}
            value={field.value ? dayjs(field.value) : null}
            onChange={(date: Dayjs | null, dateString: string | string[]) => {
              const dateStr = Array.isArray(dateString) ? dateString[0] : dateString;
              if (!dateStr) {
                field.onChange("");
                return;
              }
              if (showTime && date) {
                field.onChange(date.toISOString());
              } else {
                field.onChange(
                  dayjs(dateStr, "DD/MM/YYYY").startOf("day").toISOString()
                );
              }
            }}
          />
        );
      }}
    />
  );
}
