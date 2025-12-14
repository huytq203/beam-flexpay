import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { DateInput } from "@components/ui/dateInput-component"; // Import từ UI components của bạn
import dayjs, { Dayjs } from "dayjs";

interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  picker?: "date" | "week" | "month" | "quarter" | "year";
  className?: string;
  showTime?: boolean;
  [key: string]: any;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  picker = "date",
  className = "col-span-6 flex flex-col",
  classNameLable = 'font-medium',
  showTime = false,
  ...rest
}: FormDatePickerProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      classNameLable={classNameLable}
      render={(field) => (
        <DateInput
          {...field}
          {...rest}
          format="DD/MM/YYYY HH:mm:ss"
          showTime={showTime}
          value={field.value ? dayjs(field.value) : null}
          picker={picker}
          onChange={(date: Dayjs | null, dateString: string) => {
            if (!dateString) {
              field.onChange("");
              return;
            }
            // If showTime is enabled, use the selected datetime directly
            if (showTime && date) {
              field.onChange(date.toISOString());
            } else {
              // Date only - append midnight time
              field.onChange(`${dateString}T00:00:00.000Z`);
            }
          }}
        />
      )}
    />
  );
}
