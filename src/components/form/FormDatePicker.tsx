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
          style={{width:'100%'}}
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
