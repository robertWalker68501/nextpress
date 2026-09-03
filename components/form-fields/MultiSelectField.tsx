'use client';

import type { ReactNode } from 'react';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { cn } from '@/lib/utils';

type MultiSelectOption = {
  label: ReactNode;
  value: string;
  disabled?: boolean;
};

export function MultiSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  description,
  options,
  className,
  disabled = false,
}: {
  control: Control<TFieldValues>;
  name: TName;
  label: ReactNode;
  description?: ReactNode;
  options: MultiSelectOption[];
  className?: string;
  disabled?: boolean;
}) {
  const fieldId = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const values = Array.isArray(field.value)
          ? (field.value as string[])
          : [];

        return (
          <Field
            data-invalid={fieldState.invalid || undefined}
            className={cn('grid gap-3', className)}
          >
            <FieldLabel>{label}</FieldLabel>
            <FieldContent>
              {description ? (
                <FieldDescription>{description}</FieldDescription>
              ) : null}
              <div className='grid max-h-48 gap-2 overflow-y-auto rounded-md border p-3'>
                {options.length === 0 ? (
                  <p className='text-muted-foreground text-sm'>
                    No options available.
                  </p>
                ) : (
                  options.map((option) => {
                    const id = `${fieldId}-${option.value}`;
                    return (
                      <label
                        key={option.value}
                        htmlFor={id}
                        className='flex cursor-pointer items-center gap-2 text-sm'
                      >
                        <Checkbox
                          id={id}
                          checked={values.includes(option.value)}
                          disabled={disabled || option.disabled}
                          onCheckedChange={(checked) => {
                            const nextValues =
                              checked === true
                                ? [...values, option.value]
                                : values.filter(
                                    (value) => value !== option.value
                                  );
                            field.onChange(nextValues);
                            field.onBlur();
                          }}
                        />
                        {option.label}
                      </label>
                    );
                  })
                )}
              </div>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        );
      }}
    />
  );
}

export type { MultiSelectOption };
