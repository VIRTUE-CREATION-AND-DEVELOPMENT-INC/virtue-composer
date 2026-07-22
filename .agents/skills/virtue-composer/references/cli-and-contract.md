# CLI And Contract

## CLI Resolution

Use the first available command:

1. `./node_modules/.bin/virtue-composer`
2. `npx --no-install @virtuecreation/composer-cli`
3. `npx @virtuecreation/composer-cli@0.5.0`
4. `node "$VIRTUE_COMPOSER_ROOT/packages/cli/bin/virtue-composer.mjs"`

Do not run `npx virtue-composer`; no public package exists at that name. Normal initialization installs the compatible scoped CLI as a pinned dev dependency, which provides the local `virtue-composer` binary.

Supported commands:

- `init [project] [--npm|--local[=/path]] [--components=Section,Button] [--source-root=path] [--wrapper-root=path] [--foundation-css=path] [--import-alias=alias] [--force] [--json]`: detect or explicitly set project structure, install config, manifest, selected JSX wrappers, foundation CSS, and pinned package dependencies. Omitting `--components` retains the full compatibility set.
- `add [project] --components=Money,...`: add selected wrappers and manifest records without replacing existing wrappers.
- `upgrade [project] [--components=Name,...|--all] [--npm|--local[=/path]] [--json]`: upgrade the installed manifest set and foundation blocks while preserving existing wrapper files.
- `inspect [project] [--component=id-or-title] [--category=name] [--used] [--compact] [--json]`: report project detection and focused available, wrapped, and used component records.
- `doctor [project] [--json]`: detect contract drift and boundary violations.
- `report [project] [--json]`: compact usage report for components imported by application source.

Normal projects install the public package with `npm install`. Composer contributors may explicitly use `--local=/absolute/path/to/packages/composer` and `npm install --install-links` while testing unpublished changes.

## Canonical Contract

The authoritative registry is the combined export of:

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.json`

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.phase-3.json`

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.phase-4.json`

When working inside a consuming project, prefer focused `inspect --used --compact --json` output, then request full records only for components relevant to the task.

Version 0.5 inventory:

- Structure: `Section`, `VisuallyHidden`
- Navigation: `Tabs`, `Breadcrumbs`, `Pagination`, `AppShell`, `SideNav`, `TopNav`, `MobileNav`, `Stepper`, `AnchorNav`, `BackLink`, `SegmentedControl`
- Actions: `Button`, `ButtonLink`, `ActionGroup`, `IconButton`, `CopyButton`, `SplitButton`, `BulkActionBar`
- Fields: `Field`, `Input`, `Textarea`, `Select`, `NumberInput`, `PasswordInput`, `OtpInput`, `DatePicker`, `DateRangePicker`, `TimeInput`, `Slider`, `TagInput`, `RelationSelect`, `StatusSelect`, `PhoneInput`, `CurrencyInput`, `DurationInput`, `DateTimePicker`, `TimezoneSelect`, `ComboboxMultiSelect`, `FieldArray`, `HoneypotField`, `SearchInput`, `QuantityInput`, `CurrencySelect`, `DiscountCodeInput`, `PriceRangeInput`
- Choices: `Checkbox`, `RadioGroup`, `Toggle`, `FilterChip`, `FacetFilter`, `ProductOptionSelect`
- Disclosure: `Disclosure`, `Accordion`
- Data and forms: `Form`, `SearchSelect`, `FileUpload`, `DetailRows`, `ListView`, `DataTable`, `FilterBar`, `MasterDetailLayout`, `TreeView`, `TreeSelect`, `VirtualList`, `Timeline`, `DataGrid`, `Calendar`, `Scheduler`, `KanbanBoard`, `SortableList`, `ResourceToolbar`, `ImportPanel`, `AuditLog`, `InlineEdit`, `ActiveFilters`, `SearchResultsSummary`, `CartLine`, `CartSummary`
- Content and visualization: `ChartFrame`, `ChartLegend`, `ChartTooltip`, `RichTextEditor`, `MarkdownEditor`, `CodeBlock`, `Money`
- Feedback: `Badge`, `Callout`, `EmptyState`, `Toast`, `Banner`, `InlineMessage`, `FormSummary`
- Loading and resources: `Spinner`, `Skeleton`, `ResourceBoundary`, `ProgressBar`, `LoadingOverlay`
- Overlays and commands: `Dialog`, `Tooltip`, `Menu`, `Popover`, `Drawer`, `CommandMenu`, `AlertDialog`, `ContextMenu`, `HoverCard`
- Media interaction: `Carousel`, `Avatar`, `AvatarGroup`, `ImageGallery`, `Lightbox`, `VideoPlayer`, `MediaPicker`, `UploadQueue`, `MediaField`, `ImageCropper`, `DocumentPreview`, `AudioPlayer`

Doctor enforces local wrapper imports, Composer controls in place of raw controls, layout-only `Section` props, required project files, contract versions, and foundation CSS presence. Layout-bearing `div` elements and a missing root CSS import are warnings.
