import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { Input } from "../ui/Input-component";

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  className = "col-span-6 flex flex-col",
  disabled,
  classNameLable='font-medium',
  ...rest
}: FormInputProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      classNameLable={classNameLable}
      className={className}
      render={(field) => (
        <Input
          {...field}
          {...rest}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
    />
  );
}
