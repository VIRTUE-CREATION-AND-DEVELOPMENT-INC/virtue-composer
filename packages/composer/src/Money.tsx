import VisuallyHidden from "./VisuallyHidden";

type MoneyBaseProps = { currency: string; locale?: string; minimumFractionDigits?: number; maximumFractionDigits?: number; className?: string };
type MajorMoneyProps = MoneyBaseProps & { value: number; valueMinor?: never; originalValue?: number; originalValueMinor?: never; rangeEnd?: number; rangeEndMinor?: never };
type MinorMoneyProps = MoneyBaseProps & { value?: never; valueMinor: number; originalValue?: never; originalValueMinor?: number; rangeEnd?: never; rangeEndMinor?: number };
export type MoneyProps = MajorMoneyProps | MinorMoneyProps;

export default function Money({ value, valueMinor, currency, locale = "en-US", minimumFractionDigits, maximumFractionDigits, originalValue, originalValueMinor, rangeEnd, rangeEndMinor, className }: MoneyProps) {
  const currencyDigits = new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  const formatter = new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits, maximumFractionDigits });
  const divisor = 10 ** currencyDigits;
  const amount = valueMinor !== undefined ? valueMinor / divisor : value;
  if (amount === undefined) throw new Error("Virtue Composer: Money requires valueMinor or the legacy value prop.");
  const originalAmount = originalValueMinor !== undefined ? originalValueMinor / divisor : originalValue;
  const rangeAmount = rangeEndMinor !== undefined ? rangeEndMinor / divisor : rangeEnd;
  const current = formatter.format(amount);
  const label = rangeAmount !== undefined ? `${current} to ${formatter.format(rangeAmount)}` : originalAmount !== undefined ? `Sale price ${current}, originally ${formatter.format(originalAmount)}` : current;
  return <span className={className} data-vc-component="money" data-vc-slot="root" data-vc-units={valueMinor !== undefined ? "minor" : "major"} data-vc-sale={originalAmount !== undefined || undefined}>
    <VisuallyHidden>{label}</VisuallyHidden>
    <span aria-hidden="true">{rangeAmount !== undefined ? <>{current} – {formatter.format(rangeAmount)}</> : originalAmount !== undefined ? <><s>{formatter.format(originalAmount)}</s> {current}</> : current}</span>
  </span>;
}
