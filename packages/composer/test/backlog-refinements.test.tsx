import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ColorPicker from "../src/ColorPicker";
import DataGrid from "../src/DataGrid";
import DateRangePicker from "../src/DateRangePicker";
import EditableList from "../src/EditableList";
import Form from "../src/Form";
import InlineEdit from "../src/InlineEdit";
import MediaPicker from "../src/MediaPicker";
import MentionInput from "../src/MentionInput";
import RatingInput from "../src/RatingInput";
import RichTextEditor from "../src/RichTextEditor";
import Scheduler from "../src/Scheduler";
import TransferList from "../src/TransferList";

describe("Phase 5B backlog components", () => {
  it("moves checked values between transfer panels and serializes them", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<TransferList label="Reviewers" items={[{ value: "maya", label: "Maya" }, { value: "jon", label: "Jon" }]} defaultValue={["maya"]} onValueChange={change} name="reviewers" />);
    await user.click(screen.getByRole("checkbox", { name: "Jon" }));
    await user.click(screen.getByRole("button", { name: "Add selected" }));
    expect(change).toHaveBeenLastCalledWith(["maya", "jon"]);
    expect(document.querySelectorAll("input[name='reviewers']")).toHaveLength(2);
  });

  it("validates colors and selects presets", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<ColorPicker label="Accent" defaultValue="#000000" onValueChange={change} presets={[{ value: "#0f6b5b", label: "Forest" }]} />);
    await user.click(screen.getByRole("button", { name: "Forest" }));
    expect(change).toHaveBeenCalledWith("#0f6b5b");
    const input = screen.getByRole("textbox", { name: "Accent value" });
    await user.clear(input); await user.type(input, "bad");
    expect(screen.getByRole("alert")).toHaveTextContent("six-digit hexadecimal");
  });

  it("uses radio semantics for rating changes and clearing", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<RatingInput label="Confidence" defaultValue={2} onValueChange={change} allowClear />);
    await user.click(screen.getByRole("radio", { name: "4 of 5" }));
    expect(change).toHaveBeenCalledWith(4);
    await user.click(screen.getByRole("button", { name: "Clear rating" }));
    expect(change).toHaveBeenLastCalledWith(0);
  });

  it("inserts mentions through the combobox suggestion list", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<MentionInput label="Comment" items={[{ id: "maya", label: "Maya Chen", value: "Maya" }]} onValueChange={change} />);
    const input = screen.getByRole("combobox", { name: "Comment" });
    await user.type(input, "Hello @Ma");
    await user.click(screen.getByRole("option", { name: /Maya Chen/ }));
    expect(change).toHaveBeenLastCalledWith("Hello @Maya ");
  });

  it("adds, validates, and saves editable list items", async () => {
    const save = vi.fn(); const user = userEvent.setup();
    render(<EditableList label="Checklist" defaultItems={[{ id: "one", value: "Review" }]} createItem={() => ({ id: "two", value: "" })} validate={(value) => value ? undefined : "Required"} onItemSave={save} />);
    await user.click(screen.getByRole("button", { name: "Add item" }));
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
    await user.type(screen.getByRole("textbox", { name: "Item 2" }), "Publish");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(save).toHaveBeenCalledWith({ id: "two", value: "Publish" });
  });
});

describe("high-value refinements", () => {
  it("keeps explicit date ranges draft-only until Apply", async () => {
    const change = vi.fn(); const user = userEvent.setup();
    render(<DateRangePicker label="Campaign" commitMode="explicit" defaultValue={{ from: new Date(2026, 6, 18), to: new Date(2026, 6, 24) }} onValueChange={change} />);
    await user.click(screen.getByRole("button", { name: "Campaign" }));
    const dialog = screen.getByRole("dialog", { name: "Campaign" });
    await user.click(within(dialog).getByRole("button", { name: /Saturday, July 18th, 2026/ }));
    expect(dialog).toBeVisible(); expect(change).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole("button", { name: /Monday, July 20th, 2026/ }));
    expect(dialog).toBeVisible();
    await user.click(within(dialog).getByRole("button", { name: "Apply dates" }));
    expect(change).toHaveBeenCalledWith(expect.objectContaining({ from: expect.any(Date), to: expect.any(Date) }));
  });

  it("configures the rich editor toolbar and removes it in read-only mode", async () => {
    const { rerender } = render(<RichTextEditor label="Article" content="Hello" controls={["bold", "ordered-list"]} toolbarOverflow="scroll" />);
    const toolbar = await screen.findByRole("toolbar", { name: "Article formatting" });
    expect(within(toolbar).getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(within(toolbar).getByRole("button", { name: "Numbered list" })).toBeInTheDocument();
    expect(toolbar).toHaveAttribute("data-vc-overflow", "scroll");
    rerender(<RichTextEditor label="Article" content="Hello" editable={false} />);
    expect(screen.queryByRole("toolbar", { name: "Article formatting" })).not.toBeInTheDocument();
  });

  it("maps asynchronous inline save errors and rolls back the draft", async () => {
    const user = userEvent.setup();
    render(<InlineEdit label="Title" value="Atlas" rollbackOnError onSave={async () => "Already exists"} />);
    await user.click(screen.getByRole("button", { name: "Edit Title" }));
    const input = screen.getByRole("textbox", { name: "Title" }); await user.clear(input); await user.type(input, "Northstar");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Already exists"); expect(input).toHaveValue("Atlas");
  });

  it("supports remote media search and controlled pagination", async () => {
    const query = vi.fn(); const page = vi.fn(); const user = userEvent.setup();
    render(<MediaPicker label="Assets" items={[{ id: "one", src: "/one.jpg", alt: "One", title: "One" }]} onQueryChange={query} page={1} pageCount={3} onPageChange={page} />);
    await user.click(screen.getByRole("button", { name: "Assets" }));
    await user.type(screen.getByRole("combobox", { name: "Search media" }), "campus");
    expect(query).toHaveBeenCalled(); await user.click(screen.getByRole("button", { name: "Next" })); expect(page).toHaveBeenCalledWith(2);
  });

  it("supports column visibility and virtual rows", () => {
    const { container } = render(<DataGrid rows={Array.from({ length: 30 }, (_, index) => ({ id: String(index), name: `Project ${index}`, owner: "Maya" }))} columns={[{ id: "name", header: "Name", accessorKey: "name" }, { id: "owner", header: "Owner", accessorKey: "owner" }]} defaultColumnVisibility={{ owner: false }} virtualize height={120} />);
    expect(screen.queryByRole("columnheader", { name: "Owner" })).not.toBeInTheDocument();
    expect(container.querySelector('[data-vc-component="data-grid"]')).toHaveAttribute("data-vc-virtualized", "true");
  });

  it("moves and resizes scheduler events from the keyboard", () => {
    const change = vi.fn(); const event = { id: "review", title: "Review", start: new Date(2026, 6, 18, 10), end: new Date(2026, 6, 18, 11) };
    render(<Scheduler date={new Date(2026, 6, 18)} events={[event]} onEventChange={change} />);
    const button = screen.getByRole("button", { name: /Review/ }); fireEvent.keyDown(button, { key: "ArrowDown", altKey: true });
    expect(change).toHaveBeenLastCalledWith(event, expect.objectContaining({ reason: "move" }));
    fireEvent.keyDown(button, { key: "ArrowDown", altKey: true, shiftKey: true }); expect(change).toHaveBeenLastCalledWith(event, expect.objectContaining({ reason: "resize" }));
  });

  it("shows dependent fields and maps server form errors", async () => {
    const user = userEvent.setup();
    render(<Form fields={[{ name: "kind", type: "select", label: "Kind", defaultValue: "basic", options: [{ value: "basic", label: "Basic" }, { value: "advanced", label: "Advanced" }] }, { name: "notes", type: "text", label: "Notes", visibleWhen: (values) => values.kind === "advanced" }]} onSubmit={async () => ({ errors: { notes: "Required" }, message: "Review the form" })} />);
    expect(screen.queryByRole("textbox", { name: "Notes" })).not.toBeInTheDocument();
    await user.selectOptions(screen.getByRole("combobox", { name: "Kind" }), "advanced"); expect(screen.getByRole("textbox", { name: "Notes" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Submit" })); expect(await screen.findByRole("alert")).toHaveTextContent("Review the form"); expect(screen.getByText("Required")).toBeInTheDocument();
  });
});
