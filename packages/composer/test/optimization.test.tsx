import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "../src/Button";
import DataGrid from "../src/DataGrid";
import Field from "../src/Field";
import Input from "../src/Input";
import SearchSelect from "../src/SearchSelect";
import Section from "../src/Section";
import StatusSelect from "../src/StatusSelect";

const statuses = [
  { value: "draft", label: "Draft", tone: "neutral" as const },
  { value: "live", label: "Live", tone: "success" as const },
];

describe("optimization contracts", () => {
  it("adds stable root and internal slots without replacing legacy markers", () => {
    const { container } = render(<Section><Button loading>Save</Button><Field label="Email"><Input /></Field></Section>);
    expect(container.querySelector('[data-vc-component="section"]')).toHaveAttribute("data-vc-slot", "root");
    expect(container.querySelector('[data-vc-component="button"]')).toHaveAttribute("data-vc-state", "loading");
    expect(container.querySelector('[data-vc-button-label]')).toHaveAttribute("data-vc-slot", "label");
    expect(container.querySelector('[data-vc-field-label]')).toHaveAttribute("data-vc-slot", "label");
  });

  it("updates an uncontrolled value and reports it once", () => {
    const onValueChange = vi.fn();
    render(<StatusSelect label="Status" options={statuses} defaultValue="draft" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "live" } });
    expect(screen.getByLabelText("Status")).toHaveValue("live");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("live");
  });

  it("keeps a controlled value owned by its caller", () => {
    const onValueChange = vi.fn();
    render(<StatusSelect label="Status" options={statuses} value="draft" onValueChange={onValueChange} />);
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "live" } });
    expect(screen.getByLabelText("Status")).toHaveValue("draft");
    expect(onValueChange).toHaveBeenCalledWith("live");
  });

  it("exposes selector state and named styling slots", () => {
    const { container } = render(<SearchSelect label="Owner" options={[{ value: "kaine", label: "Kaine" }]} />);
    const root = container.querySelector('[data-vc-component="search-select"]');
    expect(root).toHaveAttribute("data-vc-state", "closed");
    expect(root?.querySelector('[data-vc-slot="trigger"]')).toBeInTheDocument();
  });

  it("exposes stable data-grid structure slots", () => {
    const { container } = render(<DataGrid rows={[{ id: "atlas", name: "Atlas" }]} columns={[{ id: "name", header: "Name", accessorKey: "name", sortable: true }]} />);
    expect(container.querySelector('[data-vc-slot="table"]')).toBeInTheDocument();
    expect(container.querySelector('[data-vc-slot="sort-trigger"]')).toHaveTextContent("Name");
    expect(container.querySelector('[data-vc-slot="row"] [data-vc-slot="cell"]')).toHaveTextContent("Atlas");
  });
});
