import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { SelectInput } from "../ui/select-component"; // Import từ UI components của bạn

interface SelectOption {
  label: string;
  value: string | number|undefined;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  options: SelectOption[];
  defaultValue?: string | number;
  className?: string;
  [key: string]: any;
}

export function FormSelect<T extends FieldValues>({
  name,
  control,
  label,
  options,
  defaultValue,
  className = "col-span-6 flex flex-col",
  ...rest
}: FormSelectProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      render={(field) => (
        <SelectInput
          {...field}
          {...rest}
          defaultValue={defaultValue}
          data={options}
          handleChange={field.onChange}
        />
      )}
    />
  );
}
