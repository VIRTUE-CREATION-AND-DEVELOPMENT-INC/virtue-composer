"use client";

import { useState } from "react";
import { Archive, Check, FileText, Search, Trash2, Upload } from "lucide-react";
import {
  ActiveFilters,
  AudioPlayer,
  AuditLog,
  Badge,
  BulkActionBar,
  Button,
  CartLine,
  CartSummary,
  ComboboxMultiSelect,
  CurrencyInput,
  CurrencySelect,
  DateTimePicker,
  DiscountCodeInput,
  DocumentPreview,
  DurationInput,
  FacetFilter,
  FieldArray,
  FilterChip,
  FormSummary,
  HoneypotField,
  ImageCropper,
  ImportPanel,
  InlineEdit,
  MediaField,
  MediaPicker,
  Money,
  PhoneInput,
  PriceRangeInput,
  ProductOptionSelect,
  QuantityInput,
  RelationSelect,
  ResourceToolbar,
  SearchInput,
  SearchResultsSummary,
  Select,
  Section,
  SortableList,
  StatusSelect,
  TimezoneSelect,
  UploadQueue,
} from "@/components/composer";
import { Demo } from "./showcase";

const mediaItems = [
  { id: "campus", src: "/media/campus-walk.jpg", alt: "Students walking across a campus", title: "Campus walk", metadata: "JPG · 1.4 MB" },
  { id: "classroom", src: "/media/classroom-discussion.jpg", alt: "Students in a classroom discussion", title: "Classroom discussion", metadata: "JPG · 1.9 MB" },
  { id: "reading", src: "/media/reading-together.jpg", alt: "Students reading together", title: "Reading together", metadata: "JPG · 1.1 MB" },
];

const relationOptions = [
  { value: "maya", label: "Maya Chen", description: "Design systems" },
  { value: "jon", label: "Jon Bell", description: "Platform engineering" },
  { value: "ari", label: "Ari Lane", description: "Product operations" },
];

const currencyOptions = [
  { code: "CAD", name: "Canadian dollar", symbol: "$", region: "Canada" },
  { code: "USD", name: "US dollar", symbol: "$", region: "United States" },
  { code: "EUR", name: "Euro", symbol: "€", region: "European Union" },
];

const publishDate = new Date(2026, 6, 18, 13, 30);

export default function PhaseFourShowcase() {
  const [mediaIds, setMediaIds] = useState(["campus"]);
  const [featured, setFeatured] = useState({ id: "campus", src: "/media/campus-walk.jpg", alt: "Students walking across a campus", title: "Campus walk" });
  const [relations, setRelations] = useState(["maya"]);
  const [galleryOrder, setGalleryOrder] = useState([
    { id: "cover", content: <span><strong>Cover image</strong><small>Campus walk</small></span> },
    { id: "detail", content: <span><strong>Detail image</strong><small>Classroom discussion</small></span> },
    { id: "closing", content: <span><strong>Closing image</strong><small>Reading together</small></span> },
  ]);
  const [status, setStatus] = useState("review");
  const [projectTitle, setProjectTitle] = useState("Atlas learning series");
  const [contactMethods, setContactMethods] = useState([{ id: "email", label: "Email", value: "hello@atlas.test" }]);
  const [search, setSearch] = useState("Atlas");
  const [facets, setFacets] = useState(["published"]);
  const [activeFilters, setActiveFilters] = useState([{ id: "status", label: "Status", value: "Published" }, { id: "type", label: "Type", value: "Article" }]);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState();

  return <>
    <Demo id="media-picker" title="Media Picker" detail="Searchable asset selection stays independent from storage and delivery APIs." phase="4A">
      <MediaPicker label="Choose campaign media" items={mediaItems} value={mediaIds} onValueChange={setMediaIds} multiple name="campaignMedia" />
      <p className="fixture-value">Selected IDs: {mediaIds.join(", ") || "None"}</p>
    </Demo>
    <Demo id="upload-queue" title="Upload Queue" detail="Per-file progress, retry, cancellation, completion, and announcements share one queue contract." phase="4A">
      <UploadQueue items={[
        { id: "one", name: "campus-walk.jpg", status: "complete", progress: 100, size: "1.4 MB" },
        { id: "two", name: "classroom-discussion.jpg", status: "uploading", progress: 64, size: "1.9 MB" },
        { id: "three", name: "transcript.pdf", status: "error", error: "Upload interrupted", size: "420 KB" },
      ]} onRetry={() => undefined} onCancel={() => undefined} onRemove={() => undefined} />
    </Demo>
    <Demo id="media-field" title="Media Field" detail="Selection, preview, clearing, upload, and validation compose into a reusable CMS field." phase="4A">
      <MediaField
        label="Featured media"
        value={featured}
        onValueChange={setFeatured}
        description="Used in social previews and listing pages."
        picker={<MediaPicker label="Select from library" items={mediaItems} onValueChange={(ids) => { const item = mediaItems.find((candidate) => candidate.id === ids[0]); if (item) setFeatured(item); }} />}
        upload={<Button icon={<Upload size={16} />}>Upload new</Button>}
        name="featuredMedia"
      />
    </Demo>
    <Demo id="relation-select" title="Relation Select" detail="Searchable single or multiple record relationships return stable project IDs." phase="4A">
      <RelationSelect label="Contributors" options={relationOptions} value={relations} onValueChange={setRelations} name="contributors" />
    </Demo>
    <Demo id="sortable-list" title="Sortable List" detail="Pointer and keyboard reordering provide a stable ordered callback." phase="4A">
      <SortableList items={galleryOrder} onReorder={setGalleryOrder} ariaLabel="Gallery order" />
    </Demo>
    <Demo id="image-cropper" title="Image Cropper" detail="A proven crop engine exposes pan, zoom, aspect, and pixel results without owning image processing." phase="4A">
      <ImageCropper className="cropper-demo" src="/media/campus-walk.jpg" alt="students crossing campus" aspect={16 / 9} />
    </Demo>
    <Demo id="document-preview" title="Document Preview" detail="Documents retain a titled preview and an explicit download fallback." phase="4A">
      <DocumentPreview className="document-demo" src="/media/classroom-discussion.jpg" title="Campaign reference" type="image" downloadName="campaign-reference.jpg" />
    </Demo>
    <Demo id="audio-player" title="Audio Player" detail="Native playback accepts multiple sources and caption or description tracks." phase="4A">
      <AudioPlayer label="Foundation narration" sources={[{ src: "/media/foundation.mp4", type: "video/mp4" }]} />
    </Demo>

    <Demo id="bulk-action-bar" title="Bulk Action Bar" detail="Selection count, guarded actions, pending state, and clearing stay coordinated." phase="4B">
      <BulkActionBar selectedCount={3} actions={[{ id: "publish", label: "Publish", icon: <Check size={16} /> }, { id: "archive", label: "Archive", icon: <Archive size={16} /> }, { id: "delete", label: "Delete", icon: <Trash2 size={16} />, destructive: true }]} onAction={() => undefined} onClear={() => undefined} />
    </Demo>
    <Demo id="status-select" title="Status Select" detail="Workflow options carry display tone, descriptions, and disabled transitions." phase="4B">
      <StatusSelect label="Publishing status" value={status} onValueChange={setStatus} options={[{ value: "draft", label: "Draft", tone: "neutral" }, { value: "review", label: "In review", tone: "warning" }, { value: "published", label: "Published", tone: "success" }, { value: "archived", label: "Archived", disabled: true, description: "Requires approval" }]} />
    </Demo>
    <Demo id="filter-chip" title="Filter Chip" detail="Compact filters expose pressed, count, disabled, and removable states." phase="4B">
      <Section as="div" layout="flex" gap="small" wrap><FilterChip label="Published" defaultPressed count={18} /><FilterChip label="Draft" count={6} /><FilterChip label="Owner: Maya" pressed removable onRemove={() => undefined} /></Section>
    </Demo>
    <Demo id="resource-toolbar" title="Resource Toolbar" detail="Search, filtering, view controls, result status, and actions gain one predictable toolbar order." phase="4B">
      <ResourceToolbar search={<SearchInput label="Search records" value={search} onValueChange={setSearch} />} filters={<FilterChip label="Published" defaultPressed />} resultCount={18} actions={<Button>New article</Button>} />
    </Demo>
    <Demo id="import-panel" title="Import Panel" detail="File selection, validation reporting, preview, reset, and commit states form a complete import boundary." phase="4B">
      <ImportPanel title="Import projects" description="Review mapped records before committing." file={{ name: "projects.csv" }} columns={[{ key: "name", label: "Project" }, { key: "owner", label: "Owner" }]} rows={[{ id: "atlas", values: { name: "Atlas", owner: "Maya Chen" } }, { id: "harbor", values: { name: "Harbor", owner: "Ari Lane" } }]} onCommit={() => undefined} onReset={() => undefined} />
    </Demo>
    <Demo id="audit-log" title="Audit Log" detail="Actors, timestamps, actions, and structured before-and-after values build on chronological semantics." phase="4B">
      <AuditLog items={[
        { id: "publish", actor: "Maya Chen", action: "published the article", timestamp: "Today at 13:42", dateTime: "2026-07-18T13:42:00-04:00", summary: "Version 4 is now public." },
        { id: "title", actor: "Jon Bell", action: "updated the title", timestamp: "Today at 11:08", dateTime: "2026-07-18T11:08:00-04:00", details: [{ label: "Title", before: "Atlas program", after: "Atlas learning series" }] },
      ]} />
    </Demo>
    <Demo id="inline-edit" title="Inline Edit" detail="View, edit, validation, save, cancel, and focus restoration remain one accessible interaction." phase="4B">
      <InlineEdit label="Project title" value={projectTitle} onSave={setProjectTitle} validate={(value) => value.trim().length < 3 ? "Use at least three characters." : undefined} />
    </Demo>

    <Demo id="phone-input" title="Phone Input" detail="Country-aware formatting produces normalized E.164 values through a proven parsing engine." phase="4C">
      <PhoneInput id="contact-phone" label="Contact number" defaultCountry="CA" defaultValue="+1 416 555 0123" name="phone" description="Used for delivery updates." />
    </Demo>
    <Demo id="currency-input" title="Currency Input" detail="Locale-aware entry emits minor units for precise storage and calculations." phase="4C">
      <CurrencyInput label="Campaign budget" currency="CAD" locale="en-CA" defaultValue={129900} name="budget" />
    </Demo>
    <Demo id="duration-input" title="Duration Input" detail="Hours and minutes normalize into one bounded duration value." phase="4C">
      <DurationInput label="Workshop length" defaultValue={90} name="duration" description="Includes the discussion period." />
    </Demo>
    <Demo id="date-time-picker" title="Date Time Picker" detail="Date, time, timezone context, bounds, and ISO form serialization stay coordinated." phase="4C">
      <DateTimePicker label="Publish article" defaultValue={publishDate} timezone="America/Toronto" name="publishAt" />
    </Demo>
    <Demo id="timezone-select" title="Timezone Select" detail="Searchable IANA zones include their current UTC offsets." phase="4C">
      <TimezoneSelect label="Workspace timezone" defaultValue="America/Toronto" timezones={[{ value: "America/Toronto", label: "Toronto" }, { value: "America/Vancouver", label: "Vancouver" }, { value: "Europe/London", label: "London" }, { value: "Asia/Tokyo", label: "Tokyo" }]} name="timezone" />
    </Demo>
    <Demo id="combobox-multi-select" title="Combobox Multi Select" detail="Search, many-selection, removal, and repeated form values share a single field contract." phase="4C">
      <ComboboxMultiSelect label="Reviewers" options={relationOptions} defaultValue={["maya", "jon"]} name="reviewers" />
    </Demo>
    <Demo id="field-array" title="Field Array" detail="Repeatable form rows gain stable IDs, ordering, limits, and announced counts." phase="4C">
      <FieldArray label="Contact methods" items={contactMethods} onItemsChange={setContactMethods} createItem={() => ({ id: crypto.randomUUID(), label: "New method", value: "" })} renderItem={(item) => <span><strong>{item.label}</strong><small>{item.value || "Not set"}</small></span>} />
    </Demo>
    <Demo id="form-summary" title="Form Summary" detail="Submission state and linked field errors receive the appropriate focus and announcement priority." phase="4C">
      <FormSummary title="Two fields need attention" errors={[{ id: "project-name", label: "Project name", message: "Enter a unique name." }, { id: "project-owner", label: "Owner", message: "Choose an owner." }]} focusOnMount={false} />
    </Demo>
    <Demo id="honeypot-field" title="Honeypot Field" detail="A configurable bot trap stays outside assistive technology and keyboard navigation." phase="4C">
      <HoneypotField name="company_website" /><p className="fixture-value">The inert field is present in the form contract and intentionally hidden.</p>
    </Demo>

    <Demo id="search-input" title="Search Input" detail="Immediate value changes, debounced search, explicit submission, clearing, and loading share one search landmark." phase="4D">
      <SearchInput label="Search projects" value={search} onValueChange={setSearch} onSearch={() => undefined} placeholder="Project name or owner" />
    </Demo>
    <Demo id="facet-filter" title="Facet Filter" detail="Single or multiple facets include counts, disabled options, and optional disclosure." phase="4D">
      <FacetFilter label="Publishing state" options={[{ value: "published", label: "Published", count: 18 }, { value: "draft", label: "Draft", count: 6 }, { value: "archived", label: "Archived", count: 2 }]} value={facets} onValueChange={setFacets} collapsible />
    </Demo>
    <Demo id="active-filters" title="Active Filters" detail="Applied filters form a labeled list with precise remove and clear actions." phase="4D">
      <ActiveFilters filters={activeFilters} onRemove={(id) => setActiveFilters((current) => current.filter((filter) => filter.id !== id))} onClear={() => setActiveFilters([])} />
    </Demo>
    <Demo id="search-results-summary" title="Search Results Summary" detail="Query, result total, active filters, sorting, and empty context stay connected." phase="4D">
      <SearchResultsSummary query={search} total={18} activeFilterCount={activeFilters.length} sort={<label>Sort <Select defaultValue="updated"><option value="updated">Recently updated</option><option value="name">Name</option></Select></label>} />
    </Demo>

    <Demo id="quantity-input" title="Quantity Input" detail="Stock bounds, remove-at-zero policy, pending state, and change reasons support cart updates." phase="4E">
      <QuantityInput label="Atlas print" value={quantity} onValueChange={setQuantity} max={4} allowRemove onRemove={() => setQuantity(0)} stockMessage="Four available" />
    </Demo>
    <Demo id="money" title="Money" detail="Locale and currency formatting support sale, range, and spoken-value output." phase="4E">
      <Section as="div" layout="flex" gap="large" wrap><Money valueMinor={8000} originalValueMinor={10000} currency="CAD" locale="en-CA" /><Money valueMinor={4500} rangeEndMinor={7500} currency="CAD" locale="en-CA" /></Section>
    </Demo>
    <Demo id="currency-select" title="Currency Select" detail="Currency codes, symbols, names, and regions support compact or complete project displays." phase="4E">
      <CurrencySelect label="Store currency" options={currencyOptions} defaultValue="CAD" name="currency" />
    </Demo>
    <Demo id="product-option-select" title="Product Option Select" detail="Variants expose selection, pricing context, and unavailable stock as a labeled choice group." phase="4E">
      <ProductOptionSelect label="Print size" defaultValue="medium" options={[{ value: "small", label: "12 × 16", price: "$45" }, { value: "medium", label: "18 × 24", price: "$80" }, { value: "large", label: "24 × 36", price: "$120", available: false, description: "Restocking soon" }]} />
    </Demo>
    <Demo id="cart-line" title="Cart Line" detail="Product content, media, price, quantity, actions, and mutation status form a behavior-first cart row." phase="4E">
      <CartLine id="atlas-print" product="Atlas campus print" details={<><p>18 × 24 · Matte</p><Badge>In stock</Badge></>} media={<img src="/media/campus-walk.jpg" alt="Atlas campus print" />} price={<Money valueMinor={8000} currency="CAD" locale="en-CA" />} quantity={<QuantityInput label="Atlas print quantity" value={quantity} onValueChange={setQuantity} max={4} />} actions={<Button>Remove</Button>} />
    </Demo>
    <Demo id="cart-summary" title="Cart Summary" detail="Project-calculated subtotal, discounts, delivery, tax, and total retain semantic relationships." phase="4E">
      <CartSummary rows={[{ id: "subtotal", label: "Subtotal", value: <Money valueMinor={8000} currency="CAD" /> }, { id: "discount", label: "Studio discount", value: <Money valueMinor={-1200} currency="CAD" />, tone: "discount" }, { id: "shipping", label: "Shipping", value: "Free" }]} total={<Money valueMinor={6800} currency="CAD" />} actions={<Button>Continue to checkout</Button>} note="Taxes calculated at checkout." />
    </Demo>
    <Demo id="discount-code-input" title="Discount Code Input" detail="Apply, pending, success, error, and removal states stay announced and duplicate-safe." phase="4E">
      <DiscountCodeInput label="Discount code" onApply={(code) => setDiscount(code)} appliedCode={discount} onRemove={() => setDiscount(undefined)} success={discount ? "Discount applied." : undefined} />
    </Demo>
    <Demo id="price-range-input" title="Price Range Input" detail="Two-thumb selection and numeric bounds remain synchronized with locale-aware output." phase="4E">
      <PriceRangeInput label="Price range" currency="CAD" locale="en-CA" min={0} max={500} defaultValue={[50, 250]} minName="minPrice" maxName="maxPrice" />
    </Demo>
  </>;
}
