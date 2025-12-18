import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { Input } from "../ui/Input-component";
import { UserOutlined, LockOutlined } from '@ant-design/icons';

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: string;
  classNameLable?: string;
  prefix?: React.ReactNode; // Icon or element to display at the beginning
  // Password specific props
  passwordConfig?: {
    iconRender?: (visible: boolean) => React.ReactNode;
    visibilityToggle?: boolean;
  };
  [key: string]: any;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  className = "col-span-6 flex flex-col",
  disabled,
  type,
  classNameLable = 'font-medium',
  prefix,
  passwordConfig,
  ...rest
}: FormInputProps<T>) {
  return (
    <FormField
      name={name}
      control={control}
      label={label}
      classNameLable={classNameLable}
      
      render={(field) => {
        const { onChange: customOnChange, ...fieldRest } = rest as any;
        if (type === 'password') {
          return (
            <Input.Password
              {...field}
              {...fieldRest}
              placeholder={placeholder}
              disabled={disabled}
              className={className}
              prefix={prefix}
              iconRender={passwordConfig?.iconRender}
              visibilityToggle={passwordConfig?.visibilityToggle ?? true}
              onChange={(e: any) => {
                field.onChange(e);
                if (customOnChange) {
                  customOnChange(e);
                }
              }}
            />
          );
        }
        return (
          <Input
            {...field}
            {...fieldRest}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            className={className}
            prefix={prefix}
            onChange={(e: any) => {
              field.onChange(e);
              if (customOnChange) {
                customOnChange(e);
              }
            }}
          />
        );
      }}
    />
  );
}