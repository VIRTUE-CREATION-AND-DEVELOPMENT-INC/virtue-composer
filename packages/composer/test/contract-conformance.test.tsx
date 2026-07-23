import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import CommandMenu from "../src/CommandMenu";
import DatePicker from "../src/DatePicker";
import DateRangePicker from "../src/DateRangePicker";
import FacetFilter from "../src/FacetFilter";
import Form from "../src/Form";
import MediaField from "../src/MediaField";
import MentionInput from "../src/MentionInput";
import RichTextEditor from "../src/RichTextEditor";

describe("controlled and uncontrolled contract conformance", () => {
  it("supports uncontrolled command menu state and closes after selection", async () => {
    const select = vi.fn();
    const change = vi.fn();
    const user = userEvent.setup();
    render(<CommandMenu defaultOpen onOpenChange={change} groups={[{ id: "project", items: [{ id: "open", label: "Open project" }] }]} onSelect={select} />);

    await user.click(screen.getByRole("option", { name: "Open project" }));
    expect(select).toHaveBeenCalledWith(expect.objectContaining({ id: "open" }));
    expect(change).toHaveBeenLastCalledWith(false);
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Command menu" })).not.toBeInTheDocument());
  });

  it("exposes controlled disclosure state for facet filters", async () => {
    const openChange = vi.fn();
    const user = userEvent.setup();
    render(<FacetFilter label="Status" options={[{ value: "ready", label: "Ready" }]} collapsible open={false} onOpenChange={openChange} />);

    await user.click(screen.getByRole("button", { name: "Show Status" }));
    expect(openChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("checkbox", { name: "Ready" })).not.toBeInTheDocument();
  });

  it("supports an uncontrolled media field value", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<MediaField label="Featured media" defaultValue={{ id: "campus", src: "/campus.jpg", alt: "Campus" }} onValueChange={change} name="featured" />);

    expect(screen.getByRole("img", { name: "Campus" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear Featured media" }));
    expect(change).toHaveBeenCalledWith(undefined);
    expect(screen.getByText("No media selected")).toBeInTheDocument();
    expect(document.querySelector("input[name='featured']")).toHaveValue("");
  });
});

describe("date and locale contract conformance", () => {
  it("keeps explicit date changes draft-only when cancelled", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker label="Publish" commitMode="explicit" defaultValue={new Date(2026, 6, 18)} onValueChange={change} />);

    await user.click(screen.getByRole("button", { name: "Publish" }));
    const dialog = screen.getByRole("dialog", { name: "Publish" });
    await user.click(within(dialog).getByRole("button", { name: /Monday, July 20th, 2026/ }));
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Publish" })).toHaveTextContent("July 18th, 2026");
  });

  it("applies range bounds and RTL direction to the shared calendar", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker label="Campaign" min={new Date(2026, 6, 10)} max={new Date(2026, 6, 24)} defaultValue={{ from: new Date(2026, 6, 18), to: new Date(2026, 6, 20) }} dir="rtl" />);

    await user.click(screen.getByRole("button", { name: "Campaign" }));
    const dialog = screen.getByRole("dialog", { name: "Campaign" });
    expect(within(dialog).getByRole("button", { name: /Wednesday, July 8th, 2026/ })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: /Saturday, July 25th, 2026/ })).toBeDisabled();
    expect(dialog.querySelector(".vc-calendar-picker")).toHaveAttribute("dir", "rtl");
  });
});

describe("editor and composition conformance", () => {
  it("does not select a mention while an IME composition is active", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<MentionInput label="Comment" items={[{ id: "maya", label: "Maya Chen", value: "Maya" }]} onValueChange={change} />);
    const input = screen.getByRole("combobox", { name: "Comment" });

    await user.type(input, "Hello @Ma");
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(input).toHaveValue("Hello @Ma");
    expect(screen.getByRole("option", { name: /Maya Chen/ })).toBeInTheDocument();
  });

  it("synchronizes externally controlled rich text content", async () => {
    const { rerender } = render(<RichTextEditor label="Article" content="<p>First version</p>" />);
    expect(await screen.findByText("First version")).toBeInTheDocument();
    rerender(<RichTextEditor label="Article" content="<p>Second version</p>" />);
    await waitFor(() => expect(screen.getByText("Second version")).toBeInTheDocument());
    expect(screen.queryByText("First version")).not.toBeInTheDocument();
  });
});

describe("form transition conformance", () => {
  it("prevents duplicate asynchronous submissions", async () => {
    let finish: (() => void) | undefined;
    const submit = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<Form fields={[{ name: "title", type: "text", label: "Title" }]} onSubmit={submit} />);
    const form = document.querySelector("form")!;

    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(submit).toHaveBeenCalledTimes(1);
    finish?.();
    await waitFor(() => expect(screen.getByRole("button", { name: "Submit" })).toBeEnabled());
  });

  it("restores dependent field state after a native reset", async () => {
    const user = userEvent.setup();
    render(<Form fields={[
      { name: "kind", type: "select", label: "Kind", defaultValue: "basic", options: [{ value: "basic", label: "Basic" }, { value: "advanced", label: "Advanced" }] },
      { name: "notes", type: "text", label: "Notes", visibleWhen: (values) => values.kind === "advanced" },
    ]} />);

    await user.selectOptions(screen.getByRole("combobox", { name: "Kind" }), "advanced");
    expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
    document.querySelector<HTMLFormElement>("form")!.reset();
    await waitFor(() => expect(screen.queryByRole("textbox", { name: "Notes" })).not.toBeInTheDocument());
  });
});
