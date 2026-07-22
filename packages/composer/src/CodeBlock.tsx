import type { ReactNode } from "react";
import CopyButton from "./CopyButton";

export type CodeBlockProps = { code: string; language?: string; label?: ReactNode; copyLabel?: ReactNode; showLineNumbers?: boolean; className?: string };

export default function CodeBlock({ code, language = "text", label, copyLabel = "Copy code", showLineNumbers = false, className }: CodeBlockProps) {
  const lines = code.replace(/\n$/, "").split("\n");
  return <figure className={className} data-vc-component="code-block" data-vc-slot="root" data-vc-language={language}>{(label || copyLabel) && <figcaption data-vc-code-caption>{label && <span>{label}</span>}<CopyButton value={code} label={copyLabel} copiedLabel="Copied" /></figcaption>}<pre tabIndex={0}><code className={`language-${language}`}>{showLineNumbers ? lines.map((line, index) => <span key={index} data-vc-code-line data-vc-line-number={index + 1}>{line}{index < lines.length - 1 ? "\n" : ""}</span>) : code}</code></pre></figure>;
}
