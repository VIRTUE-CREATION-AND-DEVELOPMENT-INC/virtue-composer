import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Menu from "../src/Menu";
import ResizablePanels from "../src/ResizablePanels";
import SearchSelect from "../src/SearchSelect";
import SelectableCardGroup from "../src/SelectableCardGroup";
import Wizard from "../src/Wizard";

describe("Phase 5 component contracts", () => {
  it("provides native single and multiple selectable card semantics", async () => {
    const singleChange = vi.fn();
    const multipleChange = vi.fn();
    const user = userEvent.setup();
    render(<>
      <SelectableCardGroup label="Plan" items={[{ value: "starter", label: "Starter" }, { value: "studio", label: "Studio" }]} defaultValue="starter" onValueChange={singleChange} name="plan" />
      <SelectableCardGroup label="Add-ons" type="multiple" items={[{ value: "audit", label: "Audit log" }, { value: "sso", label: "Single sign-on" }]} defaultValue={["audit"]} onValueChange={multipleChange} name="addons" />
    </>);

    expect(screen.getByRole("radio", { name: "Starter" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "Audit log" })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: "Studio" }));
    await user.click(screen.getByRole("checkbox", { name: "Single sign-on" }));
    expect(singleChange).toHaveBeenCalledWith("studio");
    expect(multipleChange).toHaveBeenCalledWith(["audit", "sso"]);
    expect(document.querySelector("input[name='plan'][value='studio']")).toBeChecked();
  });

  it("resizes and collapses adjacent panels from the keyboard", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<ResizablePanels defaultValue={[40, 60]} onValueChange={change} panels={[
      { id: "list", label: "Project list", content: "Projects", minSize: 20, collapsible: true },
      { id: "details", label: "Project details", content: "Details", minSize: 30 },
    ]} />);

    const separator = screen.getByRole("separator", { name: "Resize Project list and Project details" });
    expect(separator).toHaveAttribute("aria-valuenow", "40");
    await user.click(separator);
    await user.keyboard("{ArrowRight}");
    expect(change).toHaveBeenLastCalledWith([45, 55]);
    await user.keyboard("{Enter}");
    expect(change).toHaveBeenLastCalledWith([0, 100]);
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });

  it("validates wizard steps, moves focus, and completes", async () => {
    const complete = vi.fn();
    let valid = false;
    const user = userEvent.setup();
    render(<Wizard steps={[
      { id: "one", title: "Workspace", content: <p>Workspace form</p>, validate: () => valid ? undefined : "Enter a workspace name." },
      { id: "two", title: "Review", content: <p>Review settings</p> },
    ]} onComplete={complete} />);

    await user.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a workspace name.");
    valid = true;
    await user.click(screen.getByRole("button", { name: "Continue" }));
    const review = screen.getByRole("group", { name: "Review" });
    await waitFor(() => expect(review).toHaveFocus());
    await user.click(screen.getByRole("button", { name: "Complete" }));
    expect(complete).toHaveBeenCalledOnce();
  });
});

describe("consistent overlay and dropdown contracts", () => {
  it("supports controlled menu state and stable anatomy slots", () => {
    const change = vi.fn();
    render(<Menu trigger={<button>Actions</button>} items={[{ id: "edit", label: "Edit" }]} open onOpenChange={change} />);
    expect(screen.getByRole("menu")).toHaveAttribute("data-vc-component", "menu");
    expect(screen.getByRole("menuitem", { name: "Edit" })).toHaveAttribute("data-vc-slot", "item");
  });

  it("supports controlled searchable dropdown placement state", async () => {
    const openChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchSelect label="Owner" options={[{ value: "maya", label: "Maya Chen" }]} defaultOpen onOpenChange={openChange} side="top" align="end" />);
    expect(screen.getByRole("combobox", { name: "Owner" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("option", { name: "Maya Chen" }));
    expect(openChange).toHaveBeenCalledWith(false);
  });
});
