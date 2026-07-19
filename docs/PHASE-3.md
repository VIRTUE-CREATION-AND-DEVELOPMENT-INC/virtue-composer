# Phase 3: Complete Application Toolkit

Version 0.3 adds 44 components and brings Virtue Composer to 84 registered contracts. The release expands Composer from page primitives into application infrastructure while preserving project ownership of dimensions, surfaces, typography, color, content, and branded composition.

## Phase 3A: Everyday Controls And Navigation

- Application navigation: `AppShell`, `SideNav`, `TopNav`, `MobileNav`, `Stepper`, `AnchorNav`, `BackLink`, `SegmentedControl`.
- Actions: `IconButton`, `CopyButton`, `SplitButton`.
- Inputs: `NumberInput`, `PasswordInput`, `OtpInput`, `DatePicker`, `DateRangePicker`, `TimeInput`, `Slider`, `TagInput`.
- Overlays and feedback: `AlertDialog`, `ContextMenu`, `HoverCard`, `Banner`, `InlineMessage`, `LoadingOverlay`.

## Phase 3B: Rich Data Workflows

- Data navigation: `TreeView`, `TreeSelect`, `VirtualList`, `Timeline`.
- Data interaction: `DataGrid`, `Calendar`, `Scheduler`, `KanbanBoard`.
- Visualization framing: `ChartFrame`, `ChartLegend`, `ChartTooltip`.

`DataGrid` is the interactive counterpart to `DataTable`; it adds row selection, controlled sorting, filtering, column sizing, and pinning. Chart components frame a renderer but do not prescribe or bundle a charting visual language.

## Phase 3C: Content And Media

- Editing: `RichTextEditor`, `MarkdownEditor`, `CodeBlock`.
- Media: `Avatar`, `AvatarGroup`, `ImageGallery`, `Lightbox`, `VideoPlayer`.

Composer owns editing, preview, clipboard, fallback, selection, modal, and native media behavior. Consuming projects own document typography, media crops, asset policy, toolbar appearance, and content layout.

## Engine Policy

Phase 3 adapters use established engines rather than reimplementing complex interaction rules:

- Radix UI for dialogs, context menus, hover cards, avatars, sliders, and segmented controls.
- Headless Tree for tree state and keyboard behavior.
- TanStack Table and Virtual for data grids and virtualized lists.
- dnd-kit for pointer and keyboard Kanban movement.
- React DayPicker and date-fns for dates and schedules.
- Tiptap for rich-text editing.
- input-otp and React Markdown with GFM for focused input and content parsing.

These dependencies remain internal to package components. Projects consume stable Composer props through generated local JSX wrappers.

## Registry And Upgrade

The canonical inventory combines `packages/registry/components.json` and `packages/registry/components.phase-3.json`. Registry generation produces package exports, 84 local wrappers, wrapper indexes, project manifests, and synchronized foundation CSS.

`virtue-composer upgrade .` adds missing wrappers and every missing marked CSS phase block without replacing customized wrappers or existing project CSS. Local consumers must rebuild the Composer package before reinstalling after package source changes:

```bash
npm run build --workspace @virtuecreation/composer
virtue-composer upgrade /path/to/project
cd /path/to/project
npm install
```

## Verification Contract

Phase 3 is covered by focused interaction tests, registry validation and drift checks, CLI upgrade tests, initialized and upgraded consumer builds, showcase type checking and production build, Doctor, lint, and desktop/mobile browser accessibility QA.
