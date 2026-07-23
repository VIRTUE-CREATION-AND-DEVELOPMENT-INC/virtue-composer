# CLI And Contract

## CLI Resolution

Use the first available command:

1. `./node_modules/.bin/virtue-composer`
2. `npx --no-install @virtuecreation/composer-cli`
3. `npx @virtuecreation/composer-cli@0.6.0`
4. `node "$VIRTUE_COMPOSER_ROOT/packages/cli/bin/virtue-composer.mjs"`

Do not run `npx virtue-composer`; no public package exists at that name. Normal initialization installs the compatible scoped CLI as a pinned dev dependency, which provides the local `virtue-composer` binary.

Supported commands:

- `init [project] [--npm|--local[=/path]] [--components=Section,Button] [--source-root=path] [--wrapper-root=path] [--foundation-css=path] [--import-alias=alias] [--force] [--json]`: detect or explicitly set project structure, install config, manifest, selected JSX wrappers, foundation CSS, and pinned package dependencies. Omitting `--components` retains the full compatibility set.
- `add [project] --components=Money,...`: add selected wrappers and manifest records without replacing existing wrappers.
- `upgrade [project] [--components=Name,...|--all] [--npm|--local[=/path]] [--json]`: upgrade the installed manifest set and foundation blocks while preserving existing wrapper files.
- `inspect [project] [--component=id-or-title] [--category=name] [--used] [--compact] [--candidates] [--json]`: report project detection and focused available, wrapped, and used component records, optionally including replacement candidates.
- `doctor [project] [--strict] [--json]`: detect contract drift, boundary violations, and registered selection findings. Strict mode fails on warnings.
- `report [project] [--candidates] [--json]`: compact per-file usage report, optionally including registry-driven replacement candidates with confidence, stability, wrapper status, and add commands.
- `compositions [project] [--composition=id-or-title] [--pack=name] [--family=name] [--query=text] [--blueprint=id-or-title] [--compact] [--json]`: search copyable composition and blueprint contracts using structured intent metadata.
- `compose [project] [--compositions=id,id|--pack=id|--blueprint=id] [--force] [--json]`: copy project-owned composition JSX and CSS individually, by specialized pack, or by page blueprint; install required wrappers; and update the project manifest without replacing adaptations by default.

Normal projects install the public package with `npm install`. Composer contributors may explicitly use `--local=/absolute/path/to/packages/composer` and `npm install --install-links` while testing unpublished changes.

## Canonical Contract

The authoritative registry is the combined export of:

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.json`

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.phase-3.json`

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.phase-4.json`

`$VIRTUE_COMPOSER_ROOT/packages/registry/components.phase-5.json`

When working inside a consuming project, run `inspect --used --compact --json` and `report --candidates --json`, then request full records only for components relevant to the task. Compact records identify component stability and introduction version. Full records include decision guidance (`use`, `avoid`, alternatives, companions, and responsive considerations), structured selection hints, and `propContracts` that distinguish rendered React content, descriptor arrays, normalized form values, and caller-managed state.

## Composition Contracts

`Form` normally wraps custom controls in `Field`. Set `selfLabeled: true` when a custom control already owns its label, description, required state, and error:

```jsx
<Form
  fields={[{
    type: "custom",
    name: "contactMethod",
    selfLabeled: true,
    control: (
      <RadioGroup
        id="contact-method"
        name="contactMethod"
        label="Contact method"
        options={contactOptions}
        error={errors.contactMethod}
      />
    ),
  }]}
/>
```

`RadioGroup.name` submits its selected value through `FormData`. `PhoneInput.name` submits its normalized E.164 value, while `PhoneInput.id` gives `FormSummary` a stable link target. Pass validation text directly to a self-labeling control because `Form.errors` applies only to controls wrapped by `Field`.

Prop names are not interchangeable contracts. `ActionGroup.actions` accepts `ActionDescriptor[]`; `EmptyState.actions` accepts rendered React content:

```jsx
<EmptyState
  title="All done"
  actions={<ActionGroup actions={completionActions} />}
/>
```

`ProgressBar` renders the numeric `value` supplied by the project. It does not derive scroll position or workflow completion. `Carousel` is for a bounded slide collection, not a replacement for project-specific horizontal narratives or page-transition systems.

Version 0.6 inventory adds experimental `SelectableCardGroup`, `ResizablePanels`, `Wizard`, `TransferList`, `ColorPicker`, `RatingInput`, `MentionInput`, and `EditableList` to the Version 0.5 inventory below:

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

Version 0.6 composition inventory:

- FAQ: `faq-split-accordion`, `faq-stacked-list`
- Services: `services-icon-grid`, `services-media-grid`
- Process: `process-numbered-steps`, `timeline-alternating-media`
- Proof: `proof-metric-strip`, `testimonials-editorial-list`, `partners-logo-wall`
- Collections: `gallery-featured-grid`, `stories-featured-plus-grid`, `people-profile-grid`, `events-featured-list`
- Capture: `newsletter-inline-band`, `announcement-dismissible`
- Participation: `participation-pathways`, `location-contact-cards`
- Contact: `contact-form-split`
- General content: `content-media-split`, `content-media-stacked`
- Outcomes: `confirmation-next-actions`
- Commerce pack: `product-collection`, `product-detail-gallery`, `cart-checkout-summary`
- Guided-workflows pack: `multi-step-selection-flow`, `estimate-flow`, `booking-flow`
- Search pack: `filtered-results-master-detail`
- Application pack: `auth-shell`, `dashboard-overview`, `resource-index`, `resource-editor-detail`
- Immersive pack: `horizontal-story`, `chaptered-presentation`
- Page blueprints: `community-nonprofit`, `editorial-portfolio`, `service-business`

Doctor enforces local wrapper imports, Composer controls in place of raw controls, layout-only `Section` props, explicit Section semantics, registered component-selection hints, required project files, contract versions, and foundation CSS presence. Layout-bearing `div` elements and a missing root CSS import remain advisory unless the project raises their configured severity. Generated projects expose strict enforcement through `npm run composer:check`.
