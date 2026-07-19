"use client";

import type { FormEvent, FormHTMLAttributes, ReactNode } from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Field from "./Field";
import FileUpload from "./FileUpload";
import Input from "./Input";
import SearchSelect from "./SearchSelect";
import Select from "./Select";
import Textarea from "./Textarea";

type BaseField = { name: string; label: string; description?: string; required?: boolean; disabled?: boolean; className?: string };
export type FormFieldDescriptor =
  | (BaseField & { type: "text" | "email" | "password" | "url" | "tel" | "number" | "date"; placeholder?: string; defaultValue?: string | number })
  | (BaseField & { type: "textarea"; placeholder?: string; defaultValue?: string; rows?: number })
  | (BaseField & { type: "select" | "search-select"; options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>; defaultValue?: string; placeholder?: string })
  | (BaseField & { type: "checkbox"; defaultChecked?: boolean })
  | (BaseField & { type: "file"; accept?: string; multiple?: boolean; maxSize?: number })
  | (BaseField & { type: "custom"; control: ReactNode });
export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & { fields: FormFieldDescriptor[]; onSubmit?: (data: FormData, event: FormEvent<HTMLFormElement>) => void | Promise<void>; submitLabel?: string; submitting?: boolean; submittingLabel?: string; actions?: ReactNode; errors?: Record<string, string | undefined>; className?: string };

export default function Form({ fields, onSubmit, submitLabel = "Submit", submitting = false, submittingLabel = "Submitting", actions, errors = {}, className, ...props }: FormProps) {
  return (
    <form {...props} className={className} data-vc-component="form" onSubmit={onSubmit ? (event) => { event.preventDefault(); void onSubmit(new FormData(event.currentTarget), event); } : undefined}>
      <div data-vc-form-fields>
        {fields.map((field) => {
          if (field.type === "checkbox") return <Checkbox key={field.name} name={field.name} label={field.label} description={field.description} required={field.required} disabled={field.disabled} defaultChecked={field.defaultChecked} className={field.className} />;
          if (field.type === "file") return <FileUpload key={field.name} name={field.name} label={field.label} description={field.description} required={field.required} disabled={field.disabled} accept={field.accept} multiple={field.multiple} maxSize={field.maxSize} error={errors[field.name]} className={field.className} />;
          if (field.type === "search-select") return <SearchSelect key={field.name} name={field.name} label={field.label} options={field.options} defaultValue={field.defaultValue} placeholder={field.placeholder} required={field.required} disabled={field.disabled} className={field.className} />;
          if (field.type === "custom") return <Field key={field.name} label={field.label} description={field.description} error={errors[field.name]} required={field.required} className={field.className}>{field.control as React.ReactElement<Record<string, unknown>>}</Field>;
          const control = field.type === "textarea"
            ? <Textarea name={field.name} placeholder={field.placeholder} defaultValue={field.defaultValue} rows={field.rows} disabled={field.disabled} invalid={Boolean(errors[field.name])} />
            : field.type === "select"
              ? <Select name={field.name} defaultValue={field.defaultValue} disabled={field.disabled} invalid={Boolean(errors[field.name])}>{field.placeholder && <option value="">{field.placeholder}</option>}{field.options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</Select>
              : <Input name={field.name} type={field.type} placeholder={field.placeholder} defaultValue={field.defaultValue} disabled={field.disabled} invalid={Boolean(errors[field.name])} />;
          return <Field key={field.name} label={field.label} description={field.description} error={errors[field.name]} required={field.required} className={field.className}>{control}</Field>;
        })}
      </div>
      <div data-vc-form-actions>{actions}<Button type="submit" loading={submitting} loadingLabel={submittingLabel}>{submitLabel}</Button></div>
    </form>
  );
}
