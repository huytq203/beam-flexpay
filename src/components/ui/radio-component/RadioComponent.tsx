import { Radio } from 'antd';
import type { RadioProps, RadioGroupProps } from 'antd';
import type { RadioChangeEvent } from 'antd';
import React, { ReactNode } from 'react';

// Single Radio Component
interface RadioComponentProps extends Omit<RadioProps, 'title'> {
  title?: ReactNode;
}

export const RadioComponent = ({ title, ...rest }: RadioComponentProps) => {
  return <Radio {...rest}>{title}</Radio>;
};

// Radio Group Component
export interface RadioOption {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
}

interface RadioGroupComponentProps extends Omit<RadioGroupProps, 'options'> {
  options: RadioOption[];
  vertical?: boolean;
  onChange?: (e: RadioChangeEvent) => void;
}

export const RadioGroupComponent = ({
  options,
  vertical = false,
  onChange,
  value,
  ...rest
}: RadioGroupComponentProps) => {
  return (
    <Radio.Group
      onChange={onChange}
      value={value}
      style={{ display: 'flex', flexDirection: vertical ? 'column' : 'row', gap: vertical ? 8 : 16 }}
      {...rest}
    >
      {options.map((option) => (
        <Radio key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </Radio>
      ))}
    </Radio.Group>
  );
};

