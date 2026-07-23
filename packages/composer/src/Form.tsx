"use client";

import { useRef, useState, type ChangeEvent, type FormEvent, type FormHTMLAttributes, type ReactNode } from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import Field from "./Field";
import FileUpload from "./FileUpload";
import Input from "./Input";
import SearchSelect from "./SearchSelect";
import Select from "./Select";
import Textarea from "./Textarea";

export type FormValues = Record<string, FormDataEntryValue | undefined>;
type BaseField = { name: string; label: string; description?: string; required?: boolean; disabled?: boolean; visibleWhen?: (values: FormValues) => boolean; disabledWhen?: (values: FormValues) => boolean; className?: string };
type WrappedCustomField = BaseField & { type: "custom"; control: ReactNode; selfLabeled?: false };
type SelfLabeledCustomField = {
  type: "custom";
  name: string;
  control: ReactNode;
  selfLabeled: true;
  className?: string;
};
export type FormFieldDescriptor =
  | (BaseField & { type: "text" | "email" | "password" | "url" | "tel" | "number" | "date"; placeholder?: string; defaultValue?: string | number })
  | (BaseField & { type: "textarea"; placeholder?: string; defaultValue?: string; rows?: number })
  | (BaseField & { type: "select" | "search-select"; options: Array<{ value: string; label: string; description?: string; disabled?: boolean }>; defaultValue?: string; placeholder?: string })
  | (BaseField & { type: "checkbox"; defaultChecked?: boolean })
  | (BaseField & { type: "file"; accept?: string; multiple?: boolean; maxSize?: number })
  | WrappedCustomField
  | SelfLabeledCustomField;
export type FormSubmitResult = { errors?: Record<string, string | undefined>; message?: string } | void;
export type FormProps = Omit<FormHTMLAttributes<HTMLFormElement>, "onSubmit"> & { fields: FormFieldDescriptor[]; onSubmit?: (data: FormData, event: FormEvent<HTMLFormElement>) => FormSubmitResult | Promise<FormSubmitResult>; submitLabel?: string; submitting?: boolean; submittingLabel?: string; actions?: ReactNode; errors?: Record<string, string | undefined>; onErrorsChange?: (errors: Record<string, string | undefined>) => void; serverError?: ReactNode; clearErrorsOnChange?: boolean; className?: string };

function valuesFrom(data: FormData): FormValues { const values: FormValues = {}; for (const [name, value] of data.entries()) values[name] = value; return values; }

export default function Form({ fields, onSubmit, submitLabel = "Submit", submitting: externalSubmitting, submittingLabel = "Submitting", actions, errors = {}, onErrorsChange, serverError, clearErrorsOnChange = true, className, onChange, onReset, ...props }: FormProps) {
  const [values, setValues] = useState<FormValues>(() => Object.fromEntries(fields.map((field) => [field.name, "defaultValue" in field ? String(field.defaultValue ?? "") : "defaultChecked" in field && field.defaultChecked ? "on" : undefined])));
  const [serverErrors, setServerErrors] = useState<Record<string, string | undefined>>({});
  const [submitMessage, setSubmitMessage] = useState<ReactNode>();
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const submitting = externalSubmitting ?? internalSubmitting;
  const resolvedErrors = { ...serverErrors, ...errors };
  const change = (event: ChangeEvent<HTMLFormElement>) => {
    const next = valuesFrom(new FormData(event.currentTarget)); setValues(next);
    if (clearErrorsOnChange) { const target = event.nativeEvent.target; const name = target instanceof HTMLInputElement || target instanceof HTMLSelectElement || target instanceof HTMLTextAreaElement ? target.name : ""; if (name && serverErrors[name]) setServerErrors((current) => ({ ...current, [name]: undefined })); }
    onChange?.(event);
  };
  const submit = onSubmit ? async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submittingRef.current || externalSubmitting) return;
    submittingRef.current = true;
    const data = new FormData(event.currentTarget); setInternalSubmitting(true); setSubmitMessage(undefined);
    try { const result = await onSubmit(data, event); const nextErrors = result?.errors ?? {}; setServerErrors(nextErrors); onErrorsChange?.(nextErrors); setSubmitMessage(result?.message); }
    catch (reason) { setSubmitMessage(reason instanceof Error ? reason.message : "The form could not be submitted."); }
    finally { submittingRef.current = false; setInternalSubmitting(false); }
  } : undefined;
  const reset = (event: FormEvent<HTMLFormElement>) => {
    setServerErrors({}); setSubmitMessage(undefined); onErrorsChange?.({}); onReset?.(event);
    const form = event.currentTarget;
    queueMicrotask(() => setValues(valuesFrom(new FormData(form))));
  };
  return (
    <form {...props} className={className} data-vc-component="form" data-vc-slot="root" data-vc-state={submitting ? "submitting" : Object.values(resolvedErrors).some(Boolean) ? "invalid" : "idle"} onChange={change} onReset={reset} onSubmit={submit}>
      {(serverError || submitMessage) && <div role="alert" data-vc-slot="server-error">{serverError ?? submitMessage}</div>}
      <div data-vc-form-fields data-vc-slot="fields">
        {fields.map((field) => {
          if ("visibleWhen" in field && field.visibleWhen && !field.visibleWhen(values)) return null;
          const dependentDisabled = "disabledWhen" in field && field.disabledWhen?.(values);
          const fieldDisabled = ("disabled" in field && field.disabled) || dependentDisabled || submitting;
          if (field.type === "checkbox") return <Checkbox key={field.name} name={field.name} label={field.label} description={field.description} required={field.required} disabled={fieldDisabled} defaultChecked={field.defaultChecked} className={field.className} />;
          if (field.type === "file") return <FileUpload key={field.name} name={field.name} label={field.label} description={field.description} required={field.required} disabled={fieldDisabled} accept={field.accept} multiple={field.multiple} maxSize={field.maxSize} error={resolvedErrors[field.name]} className={field.className} />;
          if (field.type === "search-select") return <SearchSelect key={field.name} name={field.name} label={field.label} options={field.options} defaultValue={field.defaultValue} placeholder={field.placeholder} required={field.required} disabled={fieldDisabled} className={field.className} />;
          if (field.type === "custom" && field.selfLabeled) return <div key={field.name} className={field.className} data-vc-form-self-labeled data-vc-slot="field">{field.control}</div>;
          if (field.type === "custom") return <Field key={field.name} label={field.label} description={field.description} error={resolvedErrors[field.name]} required={field.required} className={field.className}>{field.control as React.ReactElement<Record<string, unknown>>}</Field>;
          const control = field.type === "textarea"
            ? <Textarea name={field.name} placeholder={field.placeholder} defaultValue={field.defaultValue} rows={field.rows} disabled={fieldDisabled} invalid={Boolean(resolvedErrors[field.name])} />
            : field.type === "select"
              ? <Select name={field.name} defaultValue={field.defaultValue} disabled={fieldDisabled} invalid={Boolean(resolvedErrors[field.name])}>{field.placeholder && <option value="">{field.placeholder}</option>}{field.options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}</Select>
              : <Input name={field.name} type={field.type} placeholder={field.placeholder} defaultValue={field.defaultValue} disabled={fieldDisabled} invalid={Boolean(resolvedErrors[field.name])} />;
          return <Field key={field.name} label={field.label} description={field.description} error={resolvedErrors[field.name]} required={field.required} className={field.className}>{control}</Field>;
        })}
      </div>
      <div data-vc-form-actions data-vc-slot="actions">{actions}<Button type="submit" loading={submitting} loadingLabel={submittingLabel} data-vc-slot="submit">{submitLabel}</Button></div>
    </form>
  );
}
