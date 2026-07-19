import VisuallyHidden from "./VisuallyHidden";

export type MoneyProps = { value: number; currency: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number; originalValue?: number; rangeEnd?: number; className?: string };

export default function Money({ value, currency, locale = "en-US", minimumFractionDigits, maximumFractionDigits, originalValue, rangeEnd, className }: MoneyProps) {
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits, maximumFractionDigits });
  const current = formatter.format(value);
  const label = rangeEnd !== undefined ? `${current} to ${formatter.format(rangeEnd)}` : originalValue !== undefined ? `Sale price ${current}, originally ${formatter.format(originalValue)}` : current;
  return <span className={className} data-vc-component="money" data-vc-sale={originalValue !== undefined || undefined}>
    <VisuallyHidden>{label}</VisuallyHidden>
    <span aria-hidden="true">{rangeEnd !== undefined ? <>{current} – {formatter.format(rangeEnd)}</> : originalValue !== undefined ? <><s>{formatter.format(originalValue)}</s> {current}</> : current}</span>
  </span>;
}
