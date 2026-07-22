# Component Roadmap

Composer grows by reusable behavior and accessibility contracts. Project-owned visual composition remains outside the package.

## Shipped

- Phase 1, version 0.1: 19 structural, action, field, choice, feedback, loading, and overlay primitives.
- Phase 2, version 0.2: 21 navigation, disclosure, form, data, async, command, and carousel primitives. See [PHASE-2.md](PHASE-2.md).
- Phase 3, version 0.3: 44 application navigation, advanced input, data workflow, editor, and media primitives. See [PHASE-3.md](PHASE-3.md).
- Phase 4, version 0.4: 36 CMS/media, admin, advanced form, search, and commerce workflow components. See [PHASE-4.md](PHASE-4.md).
- Optimization release, version 0.5: retained all 120 contracts while narrowing client boundaries, standardizing component anatomy and controlled state, strengthening dense responsive workflows, and upgrading CLI enforcement and project initialization.

## Phase 3: Complete Application Toolkit (Shipped)

Phase 3 targets 44 additional components in three implementation waves, bringing the planned library to 84 components. Each wave must ship through the registry, wrappers, showcase, Doctor, install/upgrade smoke tests, and browser accessibility QA before the next starts.

### Wave A: Everyday Controls And Navigation

1. Navigation: `AppShell`, `SideNav`, `TopNav`, `MobileNav`, `Stepper`, `AnchorNav`, `BackLink`, `SegmentedControl`.
2. Actions: `IconButton`, `CopyButton`, `SplitButton`.
3. Inputs: `NumberInput`, `PasswordInput`, `OtpInput`, `DatePicker`, `DateRangePicker`, `TimeInput`, `Slider`, `TagInput`.
4. Overlays and feedback: `AlertDialog`, `ContextMenu`, `HoverCard`, `Banner`, `InlineMessage`, `LoadingOverlay`.

Wave A establishes contracts that occur across marketing sites, dashboards, admin tools, onboarding, and account settings without forcing a specific visual identity.

### Wave B: Rich Data Workflows

1. Data navigation: `TreeView`, `TreeSelect`, `VirtualList`, `Timeline`.
2. Data interaction: `DataGrid`, `Calendar`, `Scheduler`, `KanbanBoard`.
3. Visualization framing: `ChartFrame`, `ChartLegend`, `ChartTooltip`.

Use proven engines for virtualization, date arithmetic, drag-and-drop, grids, and charts. Composer owns accessible adapters and project-facing contracts; it does not hand-roll those engines.

### Wave C: Content And Media Workflows

1. Editing: `RichTextEditor`, `MarkdownEditor`, `CodeBlock`.
2. Media: `Avatar`, `AvatarGroup`, `ImageGallery`, `Lightbox`, `VideoPlayer`.

These components ship with product-level fixtures and explicit editor and media dependencies.

## Explicit Project Ownership

`Hero`, generic `Card`, branded `Header` and `Footer`, typography wrappers, marketing sections, pricing layouts, testimonial layouts, and decorative surfaces remain project or profile compositions. Promote one only when repeated cross-project behavior proves a stable contract.

## Phase 3 Gates

- Write the registry API and fixture before implementation.
- Keep server-compatible components server-compatible and client boundaries narrow.
- Use established engines for complex rules, focus, parsing, dates, virtualization, drag-and-drop, editing, and media.
- Add `upgrade` markers for every new foundation CSS block.
- Preserve customized project wrappers during upgrades.
- Require focused unit tests plus desktop/mobile keyboard and axe checks.
- Keep package components visually neutral; only behavior-required geometry belongs in foundation CSS.

All Phase 3 gates are represented in the 0.3 verification pipeline. Future candidates are ranked from observed project evidence in [PORTFOLIO-COMPONENT-BACKLOG.md](PORTFOLIO-COMPONENT-BACKLOG.md).

## Phase 4: Workflow Infrastructure (Shipped)

Phase 4 brings the library to 120 components in five implementation waves:

1. CMS and media: `MediaPicker`, `UploadQueue`, `MediaField`, `RelationSelect`, `SortableList`, `ImageCropper`, `DocumentPreview`, and `AudioPlayer`.
2. Admin workflows: `BulkActionBar`, `StatusSelect`, `FilterChip`, `ResourceToolbar`, `ImportPanel`, `AuditLog`, and `InlineEdit`.
3. Advanced forms: `PhoneInput`, `CurrencyInput`, `DurationInput`, `DateTimePicker`, `TimezoneSelect`, `ComboboxMultiSelect`, `FieldArray`, `FormSummary`, and `HoneypotField`.
4. Search and discovery: `SearchInput`, `FacetFilter`, `ActiveFilters`, and `SearchResultsSummary`.
5. Commerce: `QuantityInput`, `Money`, `CurrencySelect`, `ProductOptionSelect`, `CartLine`, `CartSummary`, `DiscountCodeInput`, and `PriceRangeInput`.

Phase 4 follows the same registry-first, generated-wrapper, preserved-upgrade, focused-test, and browser accessibility gates established in Phase 3.
