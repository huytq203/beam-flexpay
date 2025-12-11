import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { TextArea } from "../ui/textarea-component"; // Giả sử bạn có export TextArea

interface FormTextAreaProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
  [key: string]: any;
}

export function FormTextArea<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  rows = 4,
  className = "col-span-12 flex flex-col",
  disabled,
  ...rest
}: FormTextAreaProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      className={className}
      render={(field) => (
        <TextArea
          {...field}
          {...rest}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
        />
      )}
    />
  );
}
