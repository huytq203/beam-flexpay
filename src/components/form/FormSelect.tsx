import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { SelectInput } from "../ui/select-component"; // Import từ UI components của bạn
import { ReactNode } from "react";

interface SelectOption {
  label: string|boolean | ReactNode;
  value: string|boolean | number | undefined;
}

interface FormSelectProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string | ReactNode;
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
  classNameLable = "font-medium",
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
        const { onChange: customOnChange, allowClear = true, ...fieldRest } = rest as any
        // Extract onChange from field to prevent it from overriding handleChange in SelectInput
        const { onChange: fieldOnChange, ...fieldWithoutOnChange } = field
        return (
          <SelectInput
            {...fieldWithoutOnChange}
            {...fieldRest}
            id={field.name}
            allowClear={allowClear} 
            defaultValue={defaultValue}
            data={options}
            handleChange={(value: any, option: any) => {
              fieldOnChange(value)
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
