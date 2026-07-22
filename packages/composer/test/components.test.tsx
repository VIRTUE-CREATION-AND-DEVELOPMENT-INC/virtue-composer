import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "../src/Button";
import Dialog from "../src/Dialog";
import Field from "../src/Field";
import Input from "../src/Input";
import Section from "../src/Section";

describe("Virtue Composer foundations", () => {
  it("keeps Section layout-only and polymorphic", () => {
    render(<Section as="header" layout="flex" direction="column" align="center" justify="center" gap="medium">Content</Section>);
    const section = screen.getByText("Content");
    expect(section.tagName).toBe("HEADER");
    expect(section).toHaveAttribute("data-vc-layout", "flex");
    expect(section).toHaveAttribute("data-vc-direction", "column");
    expect(section).toHaveAttribute("data-vc-align", "center");
    expect(section).toHaveAttribute("data-vc-justify", "center");
    expect(section).toHaveAttribute("data-vc-gap", "medium");
  });

  it("reports an inline style passed by a JavaScript consumer", () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => undefined);
    // @ts-expect-error Verifies the runtime guard for untyped JSX consumers.
    render(<Section as="div" style={{ padding: 12 }}>Content</Section>);
    expect(report).toHaveBeenCalledWith(expect.stringContaining("Section does not accept style"));
    expect(screen.getByText("Content")).not.toHaveAttribute("style");
    report.mockRestore();
  });

  it("exposes button loading semantics", () => {
    render(<Button loading loadingLabel="Saving">Save</Button>);
    const button = screen.getByRole("button", { name: /saving/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("associates Field labels, descriptions, and errors", () => {
    render(<Field label="Email" description="Work address" error="Required"><Input /></Field>);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAccessibleDescription("Work address Required");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("opens and closes Dialog with focus-safe primitives", async () => {
    const onOpenChange = vi.fn();
    render(<Dialog trigger={<Button>Open details</Button>} title="Details" onOpenChange={onOpenChange}>Body</Dialog>);
    fireEvent.click(screen.getByRole("button", { name: "Open details" }));
    expect(await screen.findByRole("dialog", { name: "Details" })).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
