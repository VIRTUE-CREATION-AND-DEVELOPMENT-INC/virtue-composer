# Portfolio Component Backlog

This backlog is based on repeated frontend patterns under `Projects/[Web Apps]`, including 11 active projects with Virtue skill matrices. Six are `cms-backed-site`, with additional `content-site`, `service-business`, `ecommerce`, and general website profiles. Archived booking and client applications are secondary evidence only.

The promotion rule is behavioral reuse: Composer should own interaction, semantics, validation, and accessibility. Projects continue to own cards, branded sections, visual composition, domain copy, data fetching, and persistence.

## Phase 4 Adoption

The 36-component Phase 4 release implements every candidate below plus the cross-project gaps identified during API freezing: `ImageCropper`, `DocumentPreview`, `AudioPlayer`, `TimezoneSelect`, `FieldArray`, `SearchInput`, `FacetFilter`, `ActiveFilters`, `DiscountCodeInput`, and `PriceRangeInput`. This document remains the project evidence for those contracts rather than an unshipped release list.

## Priority 1: Repeated Active-Project Infrastructure

| Candidate | Active-project evidence | Composer contract |
| --- | --- | --- |
| `MediaPicker` | `balik` has `MediaPickerField` and a full media library; CMS forms in `balik`, `recinda6ix`, and `virtuecreation` select or preview assets. | Searchable image/video selection dialog, selected value, preview, clear, loading/error/empty states, single/multiple mode. Storage APIs remain project adapters. |
| `UploadQueue` | `balik` tracks per-file metadata and upload progress; `recinda6ix` validates media and exposes upload progress; several CMS projects include media storage skills. | File queue, per-item progress/state, retry/remove, aggregate completion, cancellation hooks, and announcements. Signing and transport stay project-owned. |
| `RelationSelect` | `recinda6ix` has searchable many-relation selection; CMS managers repeatedly map relation IDs into forms. | Search, single/multiple selection, selected count, async states, hidden form values, and optional virtualization. |
| `BulkActionBar` | Admin tables and collection managers recur in `Precision-paint-pros`, `balik`, `bgr-main`, `recinda6ix`, and `virtuecreation`. | Selection count, clear selection, guarded bulk actions, pending state, and destructive confirmation. Data mutations remain project callbacks. |
| `StatusSelect` | CMS records repeatedly carry draft, published, archived, active, review, and paused states across `balik`, `bgr-main`, `recinda6ix`, and `virtuecreation`. | Labeled status option descriptor, current value, tone metadata, disabled transitions, and change callback. Workflow rules remain project-owned. |
| `FilterChip` | `simple-search` has `FilterPill`; admin projects repeat compact applied-filter controls around tables. | Toggle/removable filter semantics, optional count, pressed state, clear action, and keyboard operation. |
| `QuantityInput` | `vocedoro` and `bgr-main` both implement cart quantity increment/decrement controls; Phase 3 `NumberInput` is close but lacks commerce-oriented zero/remove and stock messaging. | Integer stepper with stock bounds, zero/remove policy, pending state, compact labels, and change reason. |
| `Money` | `vocedoro` centralizes currency formatting and `bgr-main` repeats product, cart, order, and checkout prices. | Locale/currency formatting, ranges, sale/original values, and accessible spoken output. Exchange rates and pricing stay outside Composer. |
| `CurrencySelect` | `vocedoro` has a provider-backed selector and both ecommerce projects display currency-sensitive commerce. | Currency option descriptors, compact/full labeling, controlled value, native form behavior, and optional symbol/region metadata. |

## Priority 2: Strong Workflow Evidence

| Candidate | Evidence | Composer contract |
| --- | --- | --- |
| `PhoneInput` | Service/contact flows recur across `Precision-paint-pros`, `bgr-main`, `route83co`, `recinda6ix`, and `vocedoro`; archived booking infrastructure includes a dedicated phone field. | Country-aware formatting, raw and display values, extension support, validation hooks, and autocomplete semantics. Use a proven phone engine. |
| `CurrencyInput` | Ecommerce price forms in `bgr-main`; archived booking fields provide direct precedent. | Minor-unit-safe entry, locale formatting, min/max, currency label, and parse/format callbacks. |
| `DurationInput` | Scheduling/service data appears in active CMS projects and dedicated archived booking fields. | Unit-aware duration entry, normalization to minutes/seconds, bounds, and readable output. |
| `DateTimePicker` | Active event/admin flows and archived booking forms repeatedly pair dates with times. | Coordinated date/time selection, timezone label, min/max, serialization hooks, and validation. Compose existing `DatePicker` and `TimeInput`. |
| `ComboboxMultiSelect` | CMS relation fields, filters, gallery assignments, and content taxonomies repeatedly need searchable many-selection. | Async search, grouped options, tags/summary, deselection, keyboard navigation, and form values. |
| `SortableList` | Gallery ordering and content ordering appear in `balik`, `bgr-main`, and CMS managers. | Pointer and keyboard reordering, drag handle, disabled items, announcements, and ordered callback. |
| `MediaField` | `recinda6ix` combines URL entry, file upload, media preview, removal, validation, and status. | Composable selected-media field that can use `MediaPicker` or upload adapters and render image/video/file previews. |
| `FormSummary` | Public and admin forms repeatedly implement success/error messages and field-level completion state. | Error summary linked to fields, submission status, focus-on-failure, pending state, and assertive/polite announcements. |
| `HoneypotField` | `virtuecreation` and public-form security in `recinda6ix` repeat bot-trap infrastructure. | Visually and accessibly excluded trap field with configurable name and autocomplete protection. It supplements, not replaces, server validation. |

## Priority 3: Admin And Commerce Composition

These are useful after the lower-level contracts above stabilize:

- `ResourceToolbar`: search, filters, view mode, result count, refresh, import/export, and actions around `DataGrid` or `ListView`.
- `ImportPanel`: file selection, format requirements, validation report, preview, and commit states. Service and add-on imports in archived booking are strong secondary evidence.
- `AuditLog`: actor, timestamp, action, metadata, and expandable change detail; likely composed from `Timeline`.
- `InlineEdit`: view/edit state, save/cancel, pending state, validation, and focus restoration for table or detail values.
- `ProductOptionSelect`: variant/size availability, disabled stock, selected option, and change callback across both ecommerce projects.
- `CartLine`: quantity, variant, remove, price, pending/error states, and project-rendered product content. This should be a behavioral composite, not a styled product card.
- `CartSummary`: subtotal/discount/shipping/tax descriptors and checkout action slots; calculations remain project-owned.
- `SearchResultsSummary`: query, total, active filters, sort, and empty-state relationship for search-heavy sites.

## Keep Project-Owned

Do not promote generic `Card`, `Hero`, branded `Header` or `Footer`, testimonial layouts, FAQ layouts, CTA bands, feature grids, page transitions, decorative reveal effects, pricing sections, product cards, or marketing typography. They recur by name but differ in visual and content structure; existing Composer primitives already cover their shared behavior.

Likewise, `AdminShell`, `PageHeader`, and `PublicNavbar` should remain project compositions built from `AppShell`, navigation, `Section`, actions, and project CSS unless future projects reveal an additional stable interaction contract.

## Shipped Release Slice

Version 0.4 shipped the strongest coherent CMS and commerce utility wave:

1. `MediaPicker`, `UploadQueue`, `RelationSelect`, `SortableList`.
2. `BulkActionBar`, `StatusSelect`, `FilterChip`, `ResourceToolbar`.
3. `QuantityInput`, `Money`, `CurrencySelect`, `ProductOptionSelect`.
4. `PhoneInput`, `CurrencyInput`, `DurationInput`, `DateTimePicker`, `FormSummary`, `HoneypotField`.

The release includes frozen APIs, dependency review, canonical registry records, JSX fixtures, upgrade-safe foundation geometry, focused tests, and Doctor-compatible generated wrappers. Cross-project adoption should continue to inform contract version 2 changes rather than expanding APIs speculatively.
