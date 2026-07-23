"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Button from "./Button";
import Stepper from "./Stepper";
import useControllableState from "./useControllableState";

export type WizardStep = {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  content: ReactNode;
  validate?: () => string | undefined | Promise<string | undefined>;
  disabled?: boolean;
};

export type WizardProps = {
  steps: WizardStep[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (stepId: string) => void;
  onComplete?: () => void | Promise<void>;
  orientation?: "horizontal" | "vertical";
  previousLabel?: string;
  nextLabel?: string;
  completeLabel?: string;
  pendingLabel?: string;
  ariaLabel?: string;
  className?: string;
};

export default function Wizard({
  steps,
  value,
  defaultValue = steps[0]?.id ?? "",
  onValueChange,
  onComplete,
  orientation = "horizontal",
  previousLabel = "Back",
  nextLabel = "Continue",
  completeLabel = "Complete",
  pendingLabel = "Working",
  ariaLabel = "Wizard progress",
  className,
}: WizardProps) {
  const [currentId, setCurrentId] = useControllableState({ value, defaultValue, onChange: onValueChange });
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const didMountRef = useRef(false);
  const foundIndex = steps.findIndex((step) => step.id === currentId);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const currentStep = steps[currentIndex];
  const activeId = currentStep?.id ?? "";

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    panelRefs.current[activeId]?.focus();
  }, [activeId]);

  const validate = async () => {
    if (!currentStep?.validate) return true;
    const message = await currentStep.validate();
    setError(message);
    return !message;
  };

  const next = async () => {
    if (!currentStep || pending) return;
    setPending(true);
    try {
      if (!(await validate())) return;
      const nextStep = steps.slice(currentIndex + 1).find((step) => !step.disabled);
      if (nextStep) {
        setError(undefined);
        setCurrentId(nextStep.id);
      } else {
        await onComplete?.();
      }
    } finally {
      setPending(false);
    }
  };

  const previous = () => {
    const previousStep = [...steps.slice(0, currentIndex)].reverse().find((step) => !step.disabled);
    if (!previousStep) return;
    setError(undefined);
    setCurrentId(previousStep.id);
  };

  if (!currentStep) return null;

  const nextStep = steps.slice(currentIndex + 1).find((step) => !step.disabled);

  return (
    <div className={className} data-vc-component="wizard" data-vc-slot="root" data-vc-state={pending ? "pending" : error ? "error" : "ready"} data-vc-current-step={currentStep.id}>
      <Stepper
        ariaLabel={ariaLabel}
        orientation={orientation}
        items={steps.map((step, index) => ({
          id: step.id,
          label: step.title,
          description: step.description,
          disabled: step.disabled,
          status: step.disabled ? "upcoming" : index < currentIndex ? "complete" : index === currentIndex ? error ? "error" : "current" : "upcoming",
        }))}
      />
      <div data-vc-slot="panels">
        {steps.map((step, index) => <div
          key={step.id}
          ref={(node) => { panelRefs.current[step.id] = node; }}
          role="group"
          aria-label={typeof step.title === "string" ? step.title : `Step ${index + 1}`}
          aria-current={step.id === currentStep.id ? "step" : undefined}
          hidden={step.id !== currentStep.id}
          tabIndex={step.id === currentStep.id ? -1 : undefined}
          data-vc-slot="panel"
          data-vc-step-id={step.id}
        >{step.content}</div>)}
      </div>
      {error && <p role="alert" data-vc-slot="error">{error}</p>}
      <div data-vc-slot="actions">
        <Button onClick={previous} disabled={pending || currentIndex === 0} data-vc-slot="previous">{previousLabel}</Button>
        <Button onClick={() => void next()} loading={pending} loadingLabel={pendingLabel} data-vc-slot="next">{nextStep ? nextLabel : completeLabel}</Button>
      </div>
    </div>
  );
}
