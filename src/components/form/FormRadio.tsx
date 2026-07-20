import { Control, FieldValues, Path } from "react-hook-form";
import { FormField } from "./FormField";
import { RadioGroupComponent, RadioOption } from "@components/ui/radio-component/RadioComponent";
import type { RadioGroupProps } from "antd";

interface FormRadioProps<T extends FieldValues>
    extends Omit<RadioGroupProps, "name" | "value" | "onChange" | "options" | "className"> {
    name: Path<T>;
    control: Control<T>;
    label?: string;
    options: RadioOption[];
    vertical?: boolean;
    className?: string;
    disabled?: boolean;
    classNameLabel?: string;
}

export function FormRadio<T extends FieldValues>({
    name,
    control,
    label,
    options,
    vertical = false,
    className = "col-span-6 flex flex-col",
    disabled,
    classNameLabel = 'font-medium',
    ...rest
}: FormRadioProps<T>) {
    return (
        <FormField
            name={name}
            control={control}
            label={label}
            className={className}
            classNameLable={classNameLabel}
            render={(field) => (
                <RadioGroupComponent
                    {...field}
                    {...rest}
                    options={options}
                    vertical={vertical}
                    disabled={disabled}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                />
            )}
        />
    );
}
