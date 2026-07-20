import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { Checkbox } from "antd";
import type { CheckboxProps } from "antd";
import { ReactNode } from "react";

interface FormCheckboxProps<T extends FieldValues>
    extends Omit<CheckboxProps, "name" | "checked" | "onChange" | "className" | "children"> {
    name: Path<T>;
    control: Control<T>;
    label?: string | ReactNode;
    className?: string;
    disabled?: boolean;
}

export function FormCheckbox<T extends FieldValues>({
    name,
    control,
    label,
    className = "",
    disabled,
    ...rest
}: FormCheckboxProps<T>) {
    return (
        <FormField
            name={name}
            control={control}
            className={className}
            render={(field) => (
                <Checkbox
                    {...rest}
                    checked={field.value}
                    disabled={disabled}
                    onChange={(e) => field.onChange(e.target.checked)}
                >
                    {label}
                </Checkbox>
            )}
        />
    );
}
