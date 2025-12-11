import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { DateInput } from "../ui/dateInput-component"; // Import từ UI components của bạn
import dayjs, { Dayjs } from "dayjs";

interface FormDatePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  picker?: "date" | "week" | "month" | "quarter" | "year";
  className?: string;
  [key: string]: any;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control,
  label,
  picker = "date",
  className = "col-span-6 flex flex-col",
  ...rest
}: FormDatePickerProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      render={(field) => (
        <DateInput
          {...field}
          {...rest}
          value={field.value ? dayjs(field.value) : null}
          picker={picker}
          onChange={(date: Dayjs | null, dateString: string) =>
            field.onChange(dateString ? `${dateString}T00:00:00.000Z` : "")
          }
        />
      )}
    />
  );
}
