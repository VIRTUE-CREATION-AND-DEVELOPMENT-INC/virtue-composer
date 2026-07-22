"use client";

import { useState } from "react";
import { Check, ChevronLeft, Copy, Eye, Menu as MenuIcon, MoreHorizontal, Plus, Search, Settings, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AnchorNav,
  Avatar,
  AvatarGroup,
  BackLink,
  Banner,
  Button,
  Calendar,
  ChartFrame,
  ChartLegend,
  ChartTooltip,
  CodeBlock,
  ContextMenu,
  CopyButton,
  DataGrid,
  DatePicker,
  DateRangePicker,
  HoverCard,
  IconButton,
  ImageGallery,
  InlineMessage,
  KanbanBoard,
  Lightbox,
  LoadingOverlay,
  MarkdownEditor,
  MobileNav,
  NumberInput,
  OtpInput,
  PasswordInput,
  RichTextEditor,
  Scheduler,
  Section,
  SegmentedControl,
  SideNav,
  Slider,
  SplitButton,
  Stepper,
  TagInput,
  TimeInput,
  Timeline,
  TopNav,
  TreeSelect,
  TreeView,
  VideoPlayer,
  VirtualList,
} from "@/components/composer";
import { Demo } from "./showcase";

const navGroups = [{ id: "workspace", label: "Workspace", items: [
  { id: "overview", label: "Overview", href: "#app-shell", current: true },
  { id: "projects", label: "Projects", href: "#data-grid", badge: "12" },
  { id: "settings", label: "Settings", href: "#number-input", icon: <Settings size={15} /> },
] }];

const treeNodes = [
  { id: "brand", label: "Brand", children: [{ id: "logos", label: "Logos" }, { id: "photography", label: "Photography" }] },
  { id: "campaigns", label: "Campaigns", children: [{ id: "summer", label: "Summer launch" }, { id: "editorial", label: "Editorial" }] },
];

const gridRows = [
  { id: "atlas", project: "Atlas", owner: "Maya Chen", status: "Ready" },
  { id: "northstar", project: "Northstar", owner: "Jon Bell", status: "Review" },
  { id: "harbor", project: "Harbor", owner: "Ari Lane", status: "Paused" },
];

const media = [
  { id: "campus", src: "/media/campus-walk.jpg", alt: "Students walking across a campus", width: 1400, height: 933, caption: "Campus walk" },
  { id: "classroom", src: "/media/classroom-discussion.jpg", alt: "Students in a classroom discussion", width: 1800, height: 1013, caption: "Classroom discussion" },
  { id: "reading", src: "/media/reading-together.jpg", alt: "Students reading together", width: 1400, height: 2100, caption: "Reading together" },
];

const scheduleDate = new Date(2026, 6, 18);
const scheduleEvents = [
  { id: "standup", title: "Project standup", start: new Date(2026, 6, 18, 9, 30), end: new Date(2026, 6, 18, 10), status: "confirmed" },
  { id: "planning", title: "Release planning", start: new Date(2026, 6, 18, 9, 45), end: new Date(2026, 6, 18, 10, 45), description: "Northstar", status: "planning" },
  { id: "review", title: "Design review", start: new Date(2026, 6, 18, 13), end: new Date(2026, 6, 18, 14, 30), description: "Atlas release", status: "review" },
];

export default function PhaseThreeShowcase() {
  const [view, setView] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [board, setBoard] = useState([
    { id: "planned", title: "Planned", items: [{ id: "brief", content: "Write launch brief" }, { id: "assets", content: "Collect campaign assets" }] },
    { id: "active", title: "Active", items: [{ id: "review", content: "Review responsive layouts" }] },
    { id: "done", title: "Done", description: "Approved work", items: [] },
  ]);

  const moveCard = ({ itemId, fromColumnId, toColumnId, toIndex }) => {
    setBoard((current) => {
      const source = current.find((column) => column.id === fromColumnId);
      const item = source?.items.find((candidate) => candidate.id === itemId);
      if (!item) return current;
      return current.map((column) => {
        const without = column.items.filter((candidate) => candidate.id !== itemId);
        if (column.id !== toColumnId) return { ...column, items: without };
        const next = [...without];
        next.splice(toIndex, 0, item);
        return { ...column, items: next };
      });
    });
  };

  return <>
    <Demo id="app-shell" title="App Shell" detail="A skip link and semantic regions establish application structure without owning page dimensions." phase="3A">
      <div className="app-shell-map" aria-label="App shell regions"><span>Skip link</span><span>Header slot</span><span>Navigation slot</span><span>Main content slot</span><span>Footer slot</span></div>
    </Demo>
    <Demo id="side-nav" title="Side Nav" detail="Grouped routes carry current, disabled, icon, and badge states." phase="3A">
      <SideNav groups={navGroups} ariaLabel="Project navigation" />
    </Demo>
    <Demo id="top-nav" title="Top Nav" detail="Primary routes and project-owned actions share a horizontal navigation contract." phase="3A">
      <TopNav items={[{ id: "work", label: "Work", href: "#top-nav", current: true }, { id: "library", label: "Library", href: "#image-gallery" }, { id: "billing", label: "Billing", href: "#top-nav", disabled: true }]} actions={<IconButton label="Search" icon={<Search size={16} />} />} />
    </Demo>
    <Demo id="mobile-nav" title="Mobile Nav" detail="The same navigation descriptors compose into a focus-managed mobile drawer." phase="3A">
      <MobileNav trigger={<Button icon={<MenuIcon size={16} />}>Open navigation</Button>} groups={navGroups} />
    </Demo>
    <Demo id="stepper" title="Stepper" detail="Workflow progress exposes complete, current, upcoming, and error states." phase="3A">
      <Section as="div" layout="grid" className="stepper-examples">
        <section className="stepper-example" aria-labelledby="horizontal-stepper-label">
          <h3 id="horizontal-stepper-label">Horizontal</h3>
          <Stepper ariaLabel="Horizontal publishing progress" items={[{ id: "brief", label: "Brief", status: "complete" }, { id: "compose", label: "Compose", description: "Current step", status: "current" }, { id: "review", label: "Review", status: "upcoming" }, { id: "publish", label: "Publish", status: "upcoming" }]} />
        </section>
        <section className="stepper-example stepper-example-vertical" aria-labelledby="vertical-stepper-label">
          <h3 id="vertical-stepper-label">Vertical</h3>
          <Stepper orientation="vertical" ariaLabel="Vertical publishing progress" items={[{ id: "brief", label: "Brief", description: "Project goals and scope", status: "complete" }, { id: "compose", label: "Compose", description: "Current step", status: "current" }, { id: "review", label: "Review", description: "Editorial approval", status: "upcoming" }, { id: "publish", label: "Publish", description: "Release to readers", status: "upcoming" }]} />
        </section>
      </Section>
    </Demo>
    <Demo id="anchor-nav" title="Anchor Nav" detail="In-page landmarks retain current-location semantics." phase="3A">
      <AnchorNav items={[{ id: "overview", label: "Overview", href: "#app-shell", current: true }, { id: "fields", label: "Fields", href: "#number-input" }, { id: "media", label: "Media", href: "#image-gallery" }]} />
    </Demo>
    <Demo id="back-link" title="Back Link" detail="Back navigation remains a real link with optional project-owned iconography." phase="3A">
      <BackLink href="#app-shell" icon={<ChevronLeft size={16} />}>All components</BackLink>
    </Demo>
    <Demo id="segmented-control" title="Segmented Control" detail="Mutually exclusive view modes support pointer and arrow-key selection." phase="3A">
      <SegmentedControl ariaLabel="Project view" value={view} onValueChange={setView} items={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }, { value: "timeline", label: "Timeline" }]} /><p className="fixture-value">Current view: {view}</p>
    </Demo>
    <Demo id="icon-button" title="Icon Button" detail="Compact actions require an explicit accessible label." phase="3A">
      <Section as="div" layout="flex" gap="small"><IconButton label="Add item" icon={<Plus size={18} />} /><IconButton label="Delete item" icon={<Trash2 size={18} />} /><IconButton label="More actions" icon={<MoreHorizontal size={18} />} /></Section>
    </Demo>
    <Demo id="copy-button" title="Copy Button" detail="Clipboard writing includes a temporary announced confirmation state." phase="3A">
      <CopyButton value="npm install @virtuecreation/composer" icon={<Copy size={16} />} />
    </Demo>
    <Demo id="split-button" title="Split Button" detail="A primary command and related action menu remain one keyboard-friendly group." phase="3A">
      <SplitButton label="Publish" onClick={() => undefined} menuIcon={<MoreHorizontal size={16} />} items={[{ id: "schedule", label: "Schedule" }, { id: "draft", label: "Save draft" }]} />
    </Demo>
    <Demo id="number-input" title="Number Input" detail="Increment and decrement controls enforce numeric bounds." phase="3A">
      <NumberInput label="Team seats" defaultValue={4} min={1} max={12} description="One seat per collaborator." />
    </Demo>
    <Demo id="password-input" title="Password Input" detail="Password visibility changes without replacing the labeled field." phase="3A">
      <PasswordInput label="Workspace password" placeholder="Enter a secure password" showIcon={<Eye size={16} />} />
    </Demo>
    <Demo id="otp-input" title="OTP Input" detail="A single accessible input renders stable visual code slots." phase="3A">
      <OtpInput label="Verification code" length={6} description="Enter the code sent to your email." />
    </Demo>
    <Demo id="date-picker" title="Date Picker" detail="Single-date selection returns a native Date value and optional form field." phase="3A">
      <DatePicker label="Publish date" defaultValue={scheduleDate} name="publishDate" />
    </Demo>
    <Demo id="date-range-picker" title="Date Range Picker" detail="A connected date interval uses the same calendar engine and form semantics." phase="3A">
      <DateRangePicker label="Campaign window" defaultValue={{ from: scheduleDate, to: new Date(2026, 6, 24) }} startName="campaignStart" endName="campaignEnd" />
    </Demo>
    <Demo id="time-input" title="Time Input" detail="Native time entry preserves labels, descriptions, and validation state." phase="3A">
      <TimeInput label="Review time" defaultValue="13:30" description="Shown in the workspace timezone." />
    </Demo>
    <Demo id="slider" title="Slider" detail="Single and ranged values support keyboard adjustment and visible value feedback." phase="3A">
      <Slider label="Approval threshold" defaultValue={[25, 75]} step={5} showValue />
    </Demo>
    <Demo id="tag-input" title="Tag Input" detail="Delimited keyboard entry, removal, hidden form values, and limits share one contract." phase="3A">
      <TagInput label="Project tags" defaultValue={["launch", "editorial"]} name="tags" maxTags={5} />
    </Demo>
    <Demo id="alert-dialog" title="Alert Dialog" detail="Destructive confirmation interrupts safely with explicit cancel and confirm actions." phase="3A">
      <AlertDialog trigger={<Button>Delete revision</Button>} title="Delete this revision?" description="This action cannot be undone." confirmLabel="Delete revision" onConfirm={() => undefined} destructive />
    </Demo>
    <Demo id="context-menu" title="Context Menu" detail="Secondary pointer actions remain available through an accessible menu surface." phase="3A">
      <ContextMenu items={[{ id: "open", label: "Open" }, { id: "duplicate", label: "Duplicate" }, { id: "separator", separator: true }, { id: "archive", label: "Archive", destructive: true }]}><div className="context-target">Right-click this project row</div></ContextMenu>
    </Demo>
    <Demo id="hover-card" title="Hover Card" detail="Supplemental previews open from hover or keyboard focus without becoming dialogs." phase="3A">
      <HoverCard trigger={<a href="#avatar">Maya Chen</a>} openDelay={100}><Section as="div" className="person-preview" layout="flex" gap="small" align="center"><Avatar alt="Maya Chen" fallback="MC" fallbackDelay={0} /><span><strong>Maya Chen</strong><small>Design systems</small></span></Section></HoverCard>
    </Demo>
    <Demo id="banner" title="Banner" detail="Page-level notices support actions, tones, and optional local dismissal." phase="3A">
      <Banner title="Scheduled maintenance" dismissible actions={<Button>View status</Button>}>Publishing will pause for ten minutes tonight.</Banner>
    </Demo>
    <Demo id="inline-message" title="Inline Message" detail="Compact contextual feedback adopts the correct live-region behavior." phase="3A">
      <Section as="div" layout="grid" gap="small"><InlineMessage tone="success" title="Saved">The project brief is current.</InlineMessage><InlineMessage tone="danger" title="Could not publish">Resolve the required fields.</InlineMessage></Section>
    </Demo>
    <Demo id="loading-overlay" title="Loading Overlay" detail="A busy layer can temporarily make underlying work inert without unmounting it." phase="3A">
      <LoadingOverlay active={loading} label="Refreshing projects"><Section as="div" className="loading-sample" layout="grid" gap="small"><h3>Atlas workspace</h3><p>Project data remains mounted while refreshing.</p></Section></LoadingOverlay><Button onClick={() => setLoading((current) => !current)}>{loading ? "Show content" : "Show loading"}</Button>
    </Demo>

    <Demo id="tree-view" title="Tree View" detail="Hierarchical resources support expansion, selection, hotkeys, and primary actions." phase="3B">
      <TreeView nodes={treeNodes} defaultExpandedIds={["brand"]} ariaLabel="Asset folders" />
    </Demo>
    <Demo id="tree-select" title="Tree Select" detail="Leaf selection combines a popover field with the same navigable tree model." phase="3B">
      <TreeSelect label="Destination folder" nodes={treeNodes} defaultValue="logos" name="folder" />
    </Demo>
    <Demo id="virtual-list" title="Virtual List" detail="Large collections render only the visible window while retaining list semantics." phase="3B">
      <VirtualList className="virtual-demo" items={Array.from({ length: 1000 }, (_, index) => `Project ${String(index + 1).padStart(4, "0")}`)} getItemKey={(item) => item} renderItem={(item, index) => <span><strong>{item}</strong><small>Row {index + 1}</small></span>} height={260} />
    </Demo>
    <Demo id="timeline" title="Timeline" detail="Chronological activity exposes dates, status, supporting copy, and custom content." phase="3B">
      <Timeline items={[{ id: "created", title: "Project created", date: "09:12", description: "Maya started Atlas.", status: "complete" }, { id: "review", title: "Review requested", date: "11:40", description: "Three collaborators notified.", status: "current" }, { id: "publish", title: "Publish", date: "Pending", status: "upcoming" }]} />
    </Demo>
    <Demo id="data-grid" title="Data Grid" detail="TanStack Table supplies sorting, selection, resizing, filtering, and pinning state." phase="3B">
      <DataGrid caption="Workspace projects" rows={gridRows} selectable pinnedColumns={{ left: ["__select__", "project"] }} columns={[{ id: "project", header: "Project", accessorKey: "project", sortable: true, minSize: 140 }, { id: "owner", header: "Owner", accessorKey: "owner", sortable: true }, { id: "status", header: "Status", accessorKey: "status" }]} defaultSorting={[{ id: "project", desc: false }]} />
    </Demo>
    <Demo id="calendar" title="Calendar" detail="A shared DayPicker contract exposes stable navigation, day, selection, range, and responsive month hooks." phase="3B">
      <Calendar mode="single" defaultMonth={scheduleDate} selected={scheduleDate} fixedWeeks showOutsideDays ariaLabel="Editorial calendar" />
    </Demo>
    <Demo id="scheduler" title="Scheduler" detail="Scaled time slots, compact events, collision lanes, and current-time context form a project-stylable day schedule." phase="3B">
      <Scheduler date={scheduleDate} events={scheduleEvents} startHour={8} endHour={17} pixelsPerMinute={0.8} currentTime={new Date(2026, 6, 18, 11, 20)} ariaLabel="Friday schedule" />
    </Demo>
    <Demo id="kanban-board" title="Kanban Board" detail="Pointer and keyboard drag sensors move cards across semantic columns, including empty drop targets." phase="3B">
      <KanbanBoard columns={board} onMove={moveCard} empty="Drop items here" />
    </Demo>
    <Demo id="chart-frame" title="Chart Frame" detail="Titles, summaries, actions, legends, and plots gain one semantic figure boundary." phase="3B">
      <ChartFrame title="Weekly completions" description="Last six weeks" actions={<IconButton label="Chart options" icon={<MoreHorizontal size={16} />} />} summary="Completion volume increased 18%."><div className="bar-chart" role="img" aria-label="Weekly completion bars">{[42, 58, 50, 76, 68, 88].map((value, index) => <span key={index} style={{ height: `${value}%` }} />)}</div></ChartFrame>
    </Demo>
    <Demo id="chart-legend" title="Chart Legend" detail="Chart series labels, swatches, values, and hidden state remain renderer-agnostic." phase="3B">
      <ChartLegend items={[{ id: "complete", label: "Complete", color: "#111111", value: "68" }, { id: "review", label: "In review", color: "#777777", value: "14" }, { id: "blocked", label: "Blocked", color: "#d4d4d4", value: "3" }]} />
    </Demo>
    <Demo id="chart-tooltip" title="Chart Tooltip" detail="Active chart coordinates can map into a consistent label-value tooltip." phase="3B">
      <ChartTooltip label="Week 28" items={[{ id: "complete", label: "Complete", value: "18", color: "#111111" }, { id: "review", label: "In review", value: "4", color: "#777777" }]} />
    </Demo>

    <Demo id="rich-text-editor" title="Rich Text Editor" detail="Tiptap owns editing behavior while project styles own the toolbar and document surface." phase="3C">
      <RichTextEditor label="Project article" content="<h2>Atlas release</h2><p>Compose structured content with familiar formatting controls.</p>" />
    </Demo>
    <Demo id="markdown-editor" title="Markdown Editor" detail="Write, preview, and split modes render GitHub-flavored Markdown." phase="3C">
      <MarkdownEditor label="Release notes" defaultMode="split" defaultValue={"## Version 0.3\n\n- 44 new components\n- Keyboard-ready interactions\n- Project-owned styling"} rows={8} />
    </Demo>
    <Demo id="code-block" title="Code Block" detail="Language metadata, optional line numbers, focus, and clipboard behavior wrap project code." phase="3C">
      <CodeBlock label="Component import" language="jsx" showLineNumbers code={'import { AppShell } from "@/components/composer";\n\nexport default function Page() {\n  return <AppShell>Workspace</AppShell>;\n}'} />
    </Demo>
    <Demo id="avatar" title="Avatar" detail="Images fall back predictably to project-provided initials or icons." phase="3C">
      <Section as="div" layout="flex" gap="small" align="center"><Avatar src="/media/reading-together.jpg" alt="Maya Chen" fallback="MC" /><Avatar alt="Jon Bell" fallback="JB" fallbackDelay={0} /></Section>
    </Demo>
    <Demo id="avatar-group" title="Avatar Group" detail="Overlapping people remain a labeled group with deterministic overflow." phase="3C">
      <AvatarGroup max={3} items={[{ id: "maya", src: "/media/reading-together.jpg", alt: "Maya Chen", fallback: "MC" }, { id: "jon", alt: "Jon Bell", fallback: "JB", fallbackDelay: 0 }, { id: "ari", alt: "Ari Lane", fallback: "AL", fallbackDelay: 0 }, { id: "sora", alt: "Sora Kim", fallback: "SK", fallbackDelay: 0 }]} />
    </Demo>
    <Demo id="image-gallery" title="Image Gallery" detail="A primary image, captions, and selectable thumbnails use optimized Next.js media." phase="3C">
      <ImageGallery images={media} />
    </Demo>
    <Demo id="lightbox" title="Lightbox" detail="A modal media viewer supports buttons, arrow keys, focus return, and controlled state." phase="3C">
      <Lightbox images={media} trigger={<Button>Open image viewer</Button>} />
    </Demo>
    <Demo id="video-player" title="Video Player" detail="Native video sources, tracks, posters, and playback attributes remain declarative." phase="3C">
      <VideoPlayer label="Foundation in motion" poster="/media/campus-walk.jpg" sources={[{ src: "/media/foundation.mp4", type: "video/mp4" }]} />
    </Demo>
  </>;
}
