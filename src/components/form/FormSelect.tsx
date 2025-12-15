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
   classNameLable="font-medium",
  className = "col-span-6 flex flex-col",
  ...rest
}: FormSelectProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      classNameLable={classNameLable}
      className={className}
      render={(field) => {
        const { onChange: customOnChange, ...fieldRest } = rest as any
        return (
          <SelectInput
            {...field}
            {...fieldRest}
            defaultValue={defaultValue}
            data={options}
            handleChange={(value: any, option: any) => {
              field.onChange(value)
              if (customOnChange) {
                customOnChange(value)
              }
            }}
          />
        )
      }}
    />
  );
}
