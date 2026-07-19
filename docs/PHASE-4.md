# Phase 4: Workflow Infrastructure

Phase 4 ships 36 components in version 0.4, bringing Virtue Composer to 120 registered contracts. It fills the repeated workflow layer between low-level controls and project-owned application composition.

## Wave 4A: CMS And Media

- `MediaPicker`: storage-agnostic searchable single or multiple asset selection.
- `UploadQueue`: queued, uploading, complete, error, retry, cancellation, and removal states.
- `MediaField`: selected media preview, clearing, picker slot, upload slot, validation, and form value.
- `RelationSelect`: searchable single or many record relationships using stable IDs.
- `SortableList`: pointer and keyboard ordering through dnd-kit.
- `ImageCropper`: pan, zoom, aspect, and crop result behavior through react-easy-crop.
- `DocumentPreview`: titled PDF or image preview with a download fallback.
- `AudioPlayer`: native multi-source audio and text-track support.

Storage, upload transport, signing, persistence, media transforms, and content policy remain project adapters.

## Wave 4B: Admin Workflows

- `BulkActionBar`, `StatusSelect`, `FilterChip`, and `ResourceToolbar`.
- `ImportPanel`, `AuditLog`, and `InlineEdit`.

These components own selection context, workflow semantics, validation display, focus restoration, and accessible action structure. Queries, mutations, permissions, import parsing, and business transition rules stay project-owned.

## Wave 4C: Advanced Forms

- `PhoneInput`, backed by libphonenumber-js and normalized to E.164 when valid.
- `CurrencyInput`, represented in integer minor units.
- `DurationInput`, normalized to minutes.
- `DateTimePicker`, serialized as ISO date-time data.
- `TimezoneSelect`, using IANA timezone identifiers and current offsets.
- `ComboboxMultiSelect`, `FieldArray`, `FormSummary`, and `HoneypotField`.

Projects remain responsible for server validation. Client normalization and honeypots supplement rather than replace authoritative checks.

## Wave 4D: Search And Discovery

- `SearchInput`, `FacetFilter`, `ActiveFilters`, and `SearchResultsSummary`.

Composer coordinates query entry, debounce behavior, filter semantics, result context, and announcements. Search execution, ranking, pagination, and URL synchronization remain project concerns.

## Wave 4E: Commerce

- `QuantityInput`, `Money`, `CurrencySelect`, and `ProductOptionSelect`.
- `CartLine`, `CartSummary`, `DiscountCodeInput`, and `PriceRangeInput`.

Composer owns interaction and accessible value presentation. Catalog data, stock authority, pricing, exchange rates, taxes, discounts, checkout, and payment processing stay outside the package.

## Release Contract

- The canonical Phase 4 records live in `packages/registry/components.phase-4.json`.
- Registry generation emits root and subpath exports, 120 JSX wrappers, wrapper indexes, and manifests.
- The marked `vc:phase-4` foundation block contains behavior-required geometry only and is appended safely by `upgrade`.
- The JavaScript showcase includes one live fixture for every Phase 4 registry ID.
- Focused tests cover all 36 components, including normalization, selection, validation, async, and commerce behavior.
- Desktop and mobile browser QA must cover interaction, overflow, broken assets, keyboard operation, and axe violations before release.

`Hero`, generic `Card`, branded navigation, marketing sections, payment elements, authentication screens, provider-specific maps, and CMS schema builders remain project or integration concerns.
