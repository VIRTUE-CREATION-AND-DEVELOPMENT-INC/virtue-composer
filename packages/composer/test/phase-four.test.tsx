import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import ActiveFilters from "../src/ActiveFilters";
import AudioPlayer from "../src/AudioPlayer";
import AuditLog from "../src/AuditLog";
import BulkActionBar from "../src/BulkActionBar";
import CartLine from "../src/CartLine";
import CartSummary from "../src/CartSummary";
import ComboboxMultiSelect from "../src/ComboboxMultiSelect";
import CurrencyInput from "../src/CurrencyInput";
import CurrencySelect from "../src/CurrencySelect";
import DateTimePicker from "../src/DateTimePicker";
import DiscountCodeInput from "../src/DiscountCodeInput";
import DocumentPreview from "../src/DocumentPreview";
import DurationInput from "../src/DurationInput";
import FacetFilter from "../src/FacetFilter";
import FieldArray from "../src/FieldArray";
import FilterChip from "../src/FilterChip";
import FormSummary from "../src/FormSummary";
import HoneypotField from "../src/HoneypotField";
import ImageCropper from "../src/ImageCropper";
import ImportPanel from "../src/ImportPanel";
import InlineEdit from "../src/InlineEdit";
import MediaField from "../src/MediaField";
import MediaPicker from "../src/MediaPicker";
import Money from "../src/Money";
import PhoneInput from "../src/PhoneInput";
import PriceRangeInput from "../src/PriceRangeInput";
import ProductOptionSelect from "../src/ProductOptionSelect";
import QuantityInput from "../src/QuantityInput";
import RelationSelect from "../src/RelationSelect";
import ResourceToolbar from "../src/ResourceToolbar";
import SearchInput from "../src/SearchInput";
import SearchResultsSummary from "../src/SearchResultsSummary";
import SortableList from "../src/SortableList";
import StatusSelect from "../src/StatusSelect";
import TimezoneSelect from "../src/TimezoneSelect";
import UploadQueue from "../src/UploadQueue";

const media = [
  { id: "campus", src: "/campus.jpg", alt: "Campus", title: "Campus walk" },
  { id: "classroom", src: "/classroom.jpg", alt: "Classroom", title: "Classroom discussion" },
];

describe("Phase 4A CMS and media", () => {
  it("selects single and multiple media values", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<MediaPicker label="Choose media" items={media} onValueChange={change} name="media" />);
    await user.click(screen.getByRole("button", { name: "Choose media" }));
    await user.click(await screen.findByRole("option", { name: /Campus walk/ }));
    expect(change).toHaveBeenCalledWith(["campus"]);
    expect(document.querySelector("input[name='media']")).toHaveValue("campus");
  });

  it("announces upload progress and runs queue actions", async () => {
    const retry = vi.fn();
    const cancel = vi.fn();
    const remove = vi.fn();
    const user = userEvent.setup();
    render(<UploadQueue items={[
      { id: "one", name: "one.jpg", status: "uploading", progress: 42 },
      { id: "two", name: "two.jpg", status: "error", error: "Network failed" },
      { id: "three", name: "three.jpg", status: "complete" },
    ]} onRetry={retry} onCancel={cancel} onRemove={remove} />);
    expect(screen.getByRole("progressbar", { name: "one.jpg upload progress" })).toHaveAttribute("value", "42");
    await user.click(screen.getByRole("button", { name: "Cancel one.jpg" }));
    await user.click(screen.getByRole("button", { name: "Retry two.jpg" }));
    await user.click(screen.getByRole("button", { name: "Remove three.jpg" }));
    expect(cancel).toHaveBeenCalledWith("one");
    expect(retry).toHaveBeenCalledWith("two");
    expect(remove).toHaveBeenCalledWith("three");
  });

  it("previews and clears a media field", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<MediaField label="Featured image" value={{ id: "campus", src: "/campus.jpg", alt: "Campus", title: "Campus walk" }} onValueChange={change} name="featured" />);
    expect(screen.getByRole("img", { name: "Campus" })).toBeInTheDocument();
    expect(document.querySelector("input[name='featured']")).toHaveValue("campus");
    await user.click(screen.getByRole("button", { name: "Clear Featured image" }));
    expect(change).toHaveBeenCalledWith(undefined);
  });

  it("searches, selects, and removes relations", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<RelationSelect label="Authors" options={[{ value: "ada", label: "Ada Lovelace" }, { value: "grace", label: "Grace Hopper" }]} onValueChange={change} />);
    await user.click(screen.getByRole("combobox", { name: "Authors" }));
    await user.click(await screen.findByRole("option", { name: "Ada Lovelace" }));
    expect(change).toHaveBeenLastCalledWith(["ada"]);
    await user.click(screen.getByRole("button", { name: "Remove Ada Lovelace" }));
    expect(change).toHaveBeenLastCalledWith([]);
  });

  it("renders keyboard-ready sortable items", () => {
    const reorder = vi.fn();
    render(<SortableList items={[{ id: "cover", content: "Cover" }, { id: "detail", content: "Detail" }]} onReorder={reorder} />);
    expect(screen.getByRole("list", { name: "Sortable items" })).toHaveTextContent("Cover");
    expect(screen.getByRole("button", { name: "Move cover" })).toHaveAttribute("aria-roledescription", "sortable");
  });

  it("controls image crop zoom", () => {
    const zoom = vi.fn();
    render(<ImageCropper src="/campus.jpg" alt="Campus" onZoomChange={zoom} />);
    const slider = screen.getByRole("slider", { name: "Zoom" });
    fireEvent.change(slider, { target: { value: "2" } });
    expect(zoom).toHaveBeenCalledWith(2);
    expect(screen.getByRole("img", { name: "Crop Campus" })).toBeInTheDocument();
  });

  it("renders document and audio fallbacks", () => {
    const { container } = render(<><DocumentPreview src="/brief.pdf" title="Project brief" /><AudioPlayer label="Project narration" sources={[{ src: "/narration.mp3", type: "audio/mpeg" }]} /></>);
    expect(screen.getByTitle("Project brief")).toHaveAttribute("src", "/brief.pdf");
    expect(screen.getByRole("link", { name: "Download Project brief" })).toHaveAttribute("href", "/brief.pdf");
    expect(screen.getByLabelText("Project narration")).toHaveAttribute("controls");
    expect(container.querySelector("audio source")).toHaveAttribute("src", "/narration.mp3");
  });
});

describe("Phase 4B admin workflows", () => {
  it("runs bulk actions and changes workflow status", async () => {
    const action = vi.fn();
    const clear = vi.fn();
    const status = vi.fn();
    const user = userEvent.setup();
    render(<>
      <BulkActionBar selectedCount={3} actions={[{ id: "archive", label: "Archive", destructive: true }]} onAction={action} onClear={clear} />
      <StatusSelect label="Publishing status" options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} defaultValue="draft" onValueChange={status} />
    </>);
    await user.click(screen.getByRole("button", { name: "Archive" }));
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    await user.selectOptions(screen.getByLabelText("Publishing status"), "published");
    expect(action).toHaveBeenCalledWith("archive");
    expect(clear).toHaveBeenCalledOnce();
    expect(status).toHaveBeenCalledWith("published");
  });

  it("toggles filter chips and composes resource controls", async () => {
    const pressed = vi.fn();
    const remove = vi.fn();
    const user = userEvent.setup();
    render(<ResourceToolbar resultCount={18} filters={<FilterChip label="Published" count={18} removable onPressedChange={pressed} onRemove={remove} />} actions={<button>Export</button>} />);
    await user.click(screen.getByRole("button", { name: /^Published/ }));
    await user.click(screen.getByRole("button", { name: "Remove Published filter" }));
    expect(pressed).toHaveBeenCalledWith(true);
    expect(remove).toHaveBeenCalledOnce();
    expect(screen.getByRole("toolbar", { name: "Resource controls" })).toHaveTextContent("18 results");
  });

  it("shows import validation and a semantic preview", () => {
    const file = new File(["name\nAtlas"], "projects.csv", { type: "text/csv" });
    render(<ImportPanel title="Import projects" file={file} columns={[{ key: "name", label: "Name" }]} rows={[{ id: "one", values: { name: "Atlas" }, valid: false }]} errors={[{ id: "bad", row: 1, field: "name", message: "Already exists" }]} onCommit={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Already exists");
    expect(screen.getByRole("table", { name: "Import preview" })).toHaveTextContent("Atlas");
    expect(screen.getByRole("button", { name: "Import" })).toBeDisabled();
  });

  it("structures audit events and change details", async () => {
    const user = userEvent.setup();
    render(<AuditLog items={[{ id: "one", actor: "Maya", action: "updated title", timestamp: "Today", dateTime: "2026-07-18", details: [{ label: "Title", before: "Old", after: "New" }] }]} />);
    expect(screen.getByRole("region", { name: "Audit log" })).toHaveTextContent("Maya");
    await user.click(screen.getByText("View changes"));
    expect(screen.getByText("Before:")).toBeInTheDocument();
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("validates and saves inline edits", async () => {
    const save = vi.fn();
    const user = userEvent.setup();
    render(<InlineEdit label="Project title" value="Atlas" onSave={save} validate={(value) => value.length < 3 ? "Too short" : undefined} />);
    await user.click(screen.getByRole("button", { name: "Edit Project title" }));
    const input = screen.getByRole("textbox", { name: "Project title" });
    await user.clear(input);
    await user.type(input, "A");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Too short");
    await user.clear(input);
    await user.type(input, "Northstar");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(save).toHaveBeenCalledWith("Northstar");
  });
});

describe("Phase 4C advanced forms", () => {
  it("formats and normalizes international phone numbers", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<PhoneInput label="Phone" defaultCountry="CA" countries={[{ code: "CA", label: "Canada" }]} onValueChange={change} name="phone" />);
    await user.type(screen.getByLabelText("Phone"), "4165550123");
    expect(change).toHaveBeenLastCalledWith("+14165550123", true);
    expect(document.querySelector("input[name='phone']")).toHaveValue("+14165550123");
  });

  it("parses currency values into minor units", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<CurrencyInput label="Price" currency="CAD" locale="en-CA" onValueChange={change} name="price" />);
    await user.type(screen.getByLabelText("Price (CAD)"), "12.50");
    expect(change).toHaveBeenLastCalledWith(1250);
    expect(document.querySelector("input[name='price']")).toHaveValue("1250");
  });

  it("normalizes duration changes to minutes", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<DurationInput label="Appointment" defaultValue={90} onValueChange={change} name="duration" />);
    const hours = screen.getByLabelText("Hours");
    await user.clear(hours);
    await user.type(hours, "2");
    expect(change).toHaveBeenLastCalledWith(150);
    expect(screen.getByText("150 minutes")).toBeInTheDocument();
  });

  it("coordinates date, time, timezone, and ISO form values", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const date = new Date(2026, 6, 18, 9, 30);
    render(<DateTimePicker label="Publish" defaultValue={date} onValueChange={change} timezone="America/Toronto" name="publishAt" />);
    expect(screen.getByText("Timezone: America/Toronto")).toBeInTheDocument();
    expect(document.querySelector("input[name='publishAt']")).toHaveValue(date.toISOString());
    await user.clear(screen.getByLabelText("Publish time"));
    fireEvent.change(screen.getByLabelText("Publish time"), { target: { value: "13:45" } });
    expect(change).toHaveBeenCalled();
  });

  it("searches a constrained timezone list", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<TimezoneSelect label="Timezone" timezones={[{ value: "America/Toronto", label: "Toronto" }, { value: "Europe/London", label: "London" }]} onValueChange={change} />);
    await user.click(screen.getByRole("combobox", { name: "Timezone" }));
    await user.click(await screen.findByRole("option", { name: /Toronto/ }));
    expect(change).toHaveBeenCalledWith("America/Toronto");
  });

  it("adds and removes multiple combobox values", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<ComboboxMultiSelect label="Team" options={[{ value: "maya", label: "Maya" }, { value: "jon", label: "Jon" }]} onValueChange={change} />);
    await user.click(screen.getByRole("combobox", { name: "Team" }));
    await user.click(await screen.findByRole("option", { name: "Maya" }));
    expect(change).toHaveBeenLastCalledWith(["maya"]);
    await user.click(screen.getByRole("button", { name: "Remove Maya" }));
    expect(change).toHaveBeenLastCalledWith([]);
  });

  it("adds, reorders, and removes repeatable fields", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    const items = [{ id: "email", value: "Email" }, { id: "phone", value: "Phone" }];
    render(<FieldArray label="Contact methods" items={items} onItemsChange={change} createItem={() => ({ id: "new", value: "New" })} renderItem={(item) => item.value} />);
    await user.click(screen.getByRole("button", { name: "Move item 2 up" }));
    expect(change).toHaveBeenLastCalledWith([items[1], items[0]]);
    await user.click(screen.getByRole("button", { name: "Add item" }));
    expect(change).toHaveBeenLastCalledWith([...items, { id: "new", value: "New" }]);
    await user.click(screen.getByRole("button", { name: "Remove item 1" }));
    expect(change).toHaveBeenLastCalledWith([items[1]]);
  });

  it("focuses form errors and keeps the honeypot inert", async () => {
    const { container } = render(<><FormSummary title="Fix these fields" errors={[{ id: "email", label: "Email", message: "Required" }]} /><HoneypotField name="company_site" /></>);
    await waitFor(() => expect(screen.getByRole("alert")).toHaveFocus());
    expect(screen.getByRole("link", { name: "Email: Required" })).toHaveAttribute("href", "#email");
    const honeypot = container.querySelector("[data-vc-component='honeypot-field']");
    expect(honeypot).toHaveAttribute("aria-hidden", "true");
    expect(honeypot).toHaveAttribute("inert");
    expect(container.querySelector("input[name='company_site']")).toHaveAttribute("tabindex", "-1");
  });
});

describe("Phase 4D search and discovery", () => {
  it("debounces, submits, and clears search", async () => {
    const search = vi.fn();
    const change = vi.fn();
    const user = userEvent.setup();
    render(<SearchInput label="Search projects" debounceMs={1} onSearch={search} onValueChange={change} />);
    await user.type(screen.getByRole("searchbox", { name: "Search projects" }), "Atlas");
    await waitFor(() => expect(search).toHaveBeenLastCalledWith("Atlas"));
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(change).toHaveBeenLastCalledWith("");
  });

  it("selects single and multiple facets", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<FacetFilter label="Category" options={[{ value: "design", label: "Design", count: 12 }, { value: "code", label: "Code", count: 8 }]} onValueChange={change} />);
    await user.click(screen.getByRole("checkbox", { name: /Design/ }));
    expect(change).toHaveBeenCalledWith(["design"]);
  });

  it("removes active filters and announces result context", async () => {
    const remove = vi.fn();
    const clear = vi.fn();
    const user = userEvent.setup();
    render(<><ActiveFilters filters={[{ id: "status", label: "Status", value: "Published" }]} onRemove={remove} onClear={clear} /><SearchResultsSummary query="Atlas" total={12} activeFilterCount={1} /></>);
    await user.click(screen.getByRole("button", { name: "Remove Status Published filter" }));
    await user.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(remove).toHaveBeenCalledWith("status");
    expect(clear).toHaveBeenCalledOnce();
    expect(screen.getByRole("status")).toHaveTextContent("12 results");
  });
});

describe("Phase 4E commerce", () => {
  it("bounds quantities and exposes remove-at-minimum behavior", async () => {
    const change = vi.fn();
    const remove = vi.fn();
    const user = userEvent.setup();
    render(<QuantityInput label="Atlas print" defaultValue={1} max={2} allowRemove onValueChange={change} onRemove={remove} />);
    await user.click(screen.getByRole("button", { name: "Increase Atlas print" }));
    expect(change).toHaveBeenCalledWith(2, "increment");
    await user.click(screen.getByRole("button", { name: "Decrease Atlas print" }));
    await user.click(screen.getByRole("button", { name: "Remove Atlas print" }));
    expect(remove).toHaveBeenCalledOnce();
  });

  it("formats sale money and changes currency", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<><Money value={80} originalValue={100} currency="CAD" locale="en-CA" /><CurrencySelect label="Currency" options={[{ code: "CAD", name: "Canadian dollar", symbol: "$" }, { code: "USD", name: "US dollar", symbol: "$" }]} defaultValue="CAD" onValueChange={change} /></>);
    expect(screen.getByText(/Sale price/).closest('[data-vc-component="money"]')).toHaveTextContent("$100.00");
    await user.selectOptions(screen.getByLabelText("Currency"), "USD");
    expect(change).toHaveBeenCalledWith("USD");
  });

  it("disables unavailable product options", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<ProductOptionSelect label="Size" options={[{ value: "m", label: "Medium" }, { value: "l", label: "Large", available: false }]} onValueChange={change} />);
    expect(screen.getByRole("radio", { name: /Large/ })).toBeDisabled();
    await user.click(screen.getByRole("radio", { name: "Medium" }));
    expect(change).toHaveBeenCalledWith("m");
  });

  it("composes cart lines and semantic totals", () => {
    render(<><CartLine id="atlas" product="Atlas print" details="18 × 24" media={<img src="/atlas.jpg" alt="Atlas print" />} price={<Money value={80} currency="CAD" />} quantity="Qty 1" /><CartSummary rows={[{ id: "subtotal", label: "Subtotal", value: "$80" }, { id: "shipping", label: "Shipping", value: "$10" }]} total="$90" /></>);
    expect(screen.getByRole("article", { name: "Atlas print" })).toHaveTextContent("Qty 1");
    expect(screen.getByRole("region", { name: "Order summary" })).toHaveTextContent("Total$90");
  });

  it("applies and removes discount codes", async () => {
    const apply = vi.fn();
    const remove = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<DiscountCodeInput label="Discount code" onApply={apply} onRemove={remove} />);
    await user.type(screen.getByLabelText("Discount code"), "SAVE20");
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(apply).toHaveBeenCalledWith("SAVE20");
    rerender(<DiscountCodeInput label="Discount code" onApply={apply} onRemove={remove} appliedCode="SAVE20" success="Discount applied" />);
    await user.click(screen.getByRole("button", { name: "Remove SAVE20" }));
    expect(remove).toHaveBeenCalledOnce();
  });

  it("keeps price slider and numeric bounds synchronized", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<PriceRangeInput label="Price" currency="CAD" min={0} max={500} defaultValue={[50, 250]} onValueChange={change} />);
    const minimum = screen.getByRole("spinbutton", { name: "Minimum (CAD)" });
    await user.clear(minimum);
    await user.type(minimum, "75");
    expect(change).toHaveBeenLastCalledWith([75, 250]);
    expect(screen.getByText(/\$75/)).toBeInTheDocument();
  });
});
