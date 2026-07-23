"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Command as CommandIcon, Folder, Inbox, List, MoreHorizontal, Plus, Search, Settings, Upload, X } from "lucide-react";
import {
  Accordion,
  ActionGroup,
  AppShell,
  Badge,
  Breadcrumbs,
  Button,
  ButtonLink,
  Callout,
  Carousel,
  Checkbox,
  CommandMenu,
  DataTable,
  DetailRows,
  Dialog,
  Disclosure,
  Drawer,
  EmptyState,
  Field,
  FileUpload,
  FilterBar,
  Form,
  Input,
  ListView,
  MasterDetailLayout,
  Menu,
  Pagination,
  Popover,
  ProgressBar,
  RadioGroup,
  ResourceBoundary,
  SearchSelect,
  Section,
  Select,
  Skeleton,
  Spinner,
  Tabs,
  Textarea,
  Toast,
  Toggle,
  Tooltip,
  useToast,
  VisuallyHidden,
} from "@/components/composer";
import PhaseThreeShowcase from "./phase-three-showcase";
import PhaseFourShowcase from "./phase-four-showcase";
import PhaseFiveShowcase from "./phase-five-showcase";

const layers = ["structure", "navigation", "action", "field", "choice", "disclosure", "data", "content", "media", "feedback", "loading", "overlay"];

const projectRows = [
  { id: "atlas", name: "Atlas", owner: "Maya Chen", status: "Active", updated: "Today" },
  { id: "northstar", name: "Northstar", owner: "Jon Bell", status: "Review", updated: "Yesterday" },
  { id: "harbor", name: "Harbor", owner: "Ari Lane", status: "Paused", updated: "Jul 14" },
];

const projectColumns = [
  { id: "name", header: "Project", accessor: "name", sortable: true },
  { id: "owner", header: "Owner", accessor: "owner", sortable: true },
  { id: "status", header: "Status", accessor: "status", cell: (row) => <Badge tone={row.status === "Active" ? "success" : row.status === "Review" ? "warning" : "neutral"}>{row.status}</Badge> },
  { id: "updated", header: "Updated", accessor: "updated", align: "end" },
];

const ownerOptions = [
  { value: "maya", label: "Maya Chen", description: "Design systems" },
  { value: "jon", label: "Jon Bell", description: "Platform engineering" },
  { value: "ari", label: "Ari Lane", description: "Product operations" },
];

export function Demo({ id, title, detail, phase = 1, children }) {
  return (
    <Section as="article" id={id} className="component-demo" layout="grid" gap="large">
      <Section as="header" className="component-heading" layout="flex" justify="between" align="start" gap="medium" wrap>
        <Section as="div" layout="grid" gap="small">
          <p className="eyebrow">Phase {phase} primitive</p>
          <h2>{title}</h2>
          <p>{detail}</p>
        </Section>
        <Badge tone="success">Ready</Badge>
      </Section>
      <Section as="div" className="fixture" layout="flex" direction="column" gap="medium">{children}</Section>
    </Section>
  );
}

function ToastFixture() {
  const { toast } = useToast();
  return <Button onClick={() => toast({ title: "Revision published", description: "Atlas is now visible to the workspace.", tone: "success" })}>Show notification</Button>;
}

function LibraryNavigation({ components, query, onQueryChange, layer, onLayerChange, stability, onStabilityChange, activeId, onNavigate, inputId }) {
  const normalized = query.trim().toLowerCase();
  const visible = components.filter((component) => {
    const searchText = [component.title, component.id, component.layer, component.stability, ...(component.states ?? []), ...(component.accessibilityChecks ?? []), ...(component.replaces ?? []), component.guidance?.use, component.guidance?.avoid, ...(component.guidance?.alternatives ?? []), ...(component.guidance?.companions ?? [])].filter(Boolean).join(" ").toLowerCase();
    return (layer === "all" || component.layer === layer) && (stability === "all" || component.stability === stability) && (!normalized || searchText.includes(normalized));
  });
  const groups = layers.map((name) => ({ name, items: visible.filter((component) => component.layer === name) })).filter((group) => group.items.length);
  return <div className="library-navigation">
    <div className="library-navigation-controls">
      <label htmlFor={inputId}>Find a component</label>
      <div className="library-navigation-search"><Search size={15} aria-hidden="true" /><Input id={inputId} type="search" value={query} onChange={(event) => onQueryChange(event.currentTarget.value)} placeholder={`Search ${components.length} components`} /></div>
      <label htmlFor={`${inputId}-layer`}>Layer</label>
      <Select id={`${inputId}-layer`} value={layer} onChange={(event) => onLayerChange(event.currentTarget.value)}><option value="all">All layers</option>{layers.map((name) => <option key={name} value={name}>{name}</option>)}</Select>
      <label htmlFor={`${inputId}-stability`}>Stability</label>
      <Select id={`${inputId}-stability`} value={stability} onChange={(event) => onStabilityChange(event.currentTarget.value)}><option value="all">All levels</option><option value="stable">Stable</option><option value="beta">Beta</option><option value="experimental">Experimental</option></Select>
      <p className="library-navigation-count" aria-live="polite">{visible.length} of {components.length} components</p>
    </div>
    <nav aria-label="Component library">
      {groups.map((group) => <details key={group.name} {...(normalized || layer !== "all" || group.items.some((item) => item.id === activeId) ? { open: true } : {})}>
        <summary><span>{group.name}</span><span>{group.items.length}</span></summary>
        <div>{group.items.map((component) => <a key={component.id} href={`#${component.id}`} aria-label={component.title} aria-current={activeId === component.id ? "location" : undefined} onClick={() => onNavigate?.(component.id)}><span>{component.title}</span><small aria-hidden="true">{component.stability}</small></a>)}</div>
      </details>)}
      {groups.length === 0 && <p className="library-navigation-empty">No components match “{query}”.</p>}
    </nav>
  </div>;
}

export default function Showcase({ components }) {
  const [page, setPage] = useState(3);
  const [filters, setFilters] = useState({ query: "", status: "active", archived: false });
  const [commandOpen, setCommandOpen] = useState(false);
  const [navQuery, setNavQuery] = useState("");
  const [navLayer, setNavLayer] = useState("all");
  const [navStability, setNavStability] = useState("all");
  const [activeId, setActiveId] = useState(components[0]?.id ?? "");
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const componentIds = useRef(new Set(components.map((component) => component.id)));
  const activeComponent = components.find((component) => component.id === activeId);
  useEffect(() => {
    document.documentElement.dataset.vcShowcaseHydrated = "true";
    return () => { delete document.documentElement.dataset.vcShowcaseHydrated; };
  }, []);
  useEffect(() => {
    const hashId = window.location.hash.slice(1); if (componentIds.current.has(hashId)) setActiveId(hashId);
    const observer = new IntersectionObserver((entries) => { const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0]; if (visible) setActiveId(visible.target.id); }, { rootMargin: "-20% 0px -79%", threshold: 0 });
    components.forEach((component) => { const node = document.getElementById(component.id); if (node) observer.observe(node); });
    const keydown = (event) => { if (event.key === "/" && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLSelectElement)) { event.preventDefault(); document.getElementById("component-search")?.focus(); } };
    window.addEventListener("keydown", keydown); return () => { observer.disconnect(); window.removeEventListener("keydown", keydown); };
  }, [components]);
  return (
    <AppShell className="shell" navigation={
      <Section as="div" className="sidebar" layout="flex" direction="column" justify="between" gap="large">
        <Section as="div" layout="grid" gap="large"><Section as="div" layout="grid" gap="small"><p className="wordmark">Virtue Composer</p><p className="muted">Contract v1 · {components.length} components</p></Section><LibraryNavigation components={components} query={navQuery} onQueryChange={setNavQuery} layer={navLayer} onLayerChange={setNavLayer} stability={navStability} onStabilityChange={setNavStability} activeId={activeId} inputId="component-search" onNavigate={setActiveId} /></Section>
        <p className="muted">JSX consumer · TSX internals</p>
      </Section>
    }>
      <Section as="div" className="workspace" layout="flex" direction="column">
        <div className="mobile-library-bar"><div><span>Browsing</span><strong>{activeComponent?.title ?? "Component library"}</strong></div><Drawer side="left" open={mobileNavigationOpen} onOpenChange={setMobileNavigationOpen} trigger={<Button icon={<List size={16} />}>Library</Button>} title="Component library" description={`${components.length} reusable contracts`}><LibraryNavigation components={components} query={navQuery} onQueryChange={setNavQuery} layer={navLayer} onLayerChange={setNavLayer} stability={navStability} onStabilityChange={setNavStability} activeId={activeId} inputId="mobile-component-search" onNavigate={(id) => { setActiveId(id); setMobileNavigationOpen(false); }} /></Drawer></div>
        <Section as="header" className="workbench-header" layout="flex" justify="between" align="center" gap="medium" wrap>
          <Section as="div" layout="grid" gap="small">
            <p className="eyebrow">Component workbench</p>
            <h1>Virtue Composer</h1>
            <p>{components.length} composable contracts. Behavior comes from Composer; every visible decision comes from this project.</p>
          </Section>
          <ButtonLink href="#section" icon={<ArrowRight size={16} />} iconPosition="end">Browse primitives</ButtonLink>
        </Section>

        <Section as="div" className="content" layout="flex" direction="column">
          <Demo id="section" title="Section" detail="Layout composition without surface, spacing, or visual ownership.">
            <Section as="div" className="section-sample" layout="flex" direction="column" align="center" justify="center" gap="small">
              <p className="eyebrow">Nested composition</p><h3>Centered content stays structural</h3><p>Project classes control the dimensions and finish.</p>
            </Section>
          </Demo>
          <Demo id="visually-hidden" title="Visually Hidden" detail="Accessible context remains available without visual duplication.">
            <Tooltip content="Settings"><Button aria-label="Open settings" icon={<Settings size={18} />}><VisuallyHidden>Open settings</VisuallyHidden></Button></Tooltip>
          </Demo>
          <Demo id="button" title="Button" detail="Default, disabled, loading, and icon states share one behavioral contract.">
            <Section as="div" layout="flex" align="center" gap="small" wrap>
              <Button icon={<Plus size={16} />}>Create item</Button><Button disabled>Unavailable</Button><Button loading loadingLabel="Saving">Save</Button><Button aria-label="Dismiss" icon={<X size={18} />}><VisuallyHidden>Dismiss</VisuallyHidden></Button>
            </Section>
          </Demo>
          <Demo id="button-link" title="Button Link" detail="Navigation that adopts the project's action styling.">
            <ButtonLink href="#fields" icon={<ArrowRight size={16} />} iconPosition="end">Continue to fields</ButtonLink>
          </Demo>
          <Demo id="action-group" title="Action Group" detail="Descriptor-driven action clusters preserve order and accessible grouping.">
            <ActionGroup actions={[{ id: "save", label: "Save changes", icon: <Check size={16} /> }, { id: "docs", label: "View docs", href: "#section" }]} />
          </Demo>
          <Section id="fields" as="div" />
          <Demo id="field" title="Field" detail="Labels, supporting copy, required state, and errors remain correctly associated.">
            <Section as="div" className="form-grid" layout="grid" columns={2} gap="medium">
              <Field label="Project name" description="Visible to your team." required><Input placeholder="Atlas" /></Field>
              <Field label="Workspace slug" error="This slug is already in use."><Input defaultValue="atlas" invalid /></Field>
            </Section>
          </Demo>
          <Demo id="input" title="Input" detail="A native text input with stable invalid and disabled semantics.">
            <Section as="div" className="form-grid" layout="grid" columns={2} gap="medium"><Field label="Email"><Input type="email" placeholder="name@company.com" /></Field><Field label="Disabled"><Input disabled defaultValue="Locked" /></Field></Section>
          </Demo>
          <Demo id="textarea" title="Textarea" detail="Native multiline input composed through the same Field contract.">
            <Field label="Project brief" description="Describe the intended outcome."><Textarea rows={4} placeholder="A focused internal tool for..." /></Field>
          </Demo>
          <Demo id="select" title="Select" detail="Native option selection with project-level styling.">
            <Field label="Release channel"><Select defaultValue="stable"><option value="stable">Stable</option><option value="preview">Preview</option></Select></Field>
          </Demo>
          <Demo id="checkbox" title="Checkbox" detail="A labeled binary choice with optional supporting context.">
            <Checkbox label="Include archived projects" description="Archived records will appear in search results." defaultChecked />
          </Demo>
          <Demo id="radio-group" title="Radio Group" detail="Arrow-key navigation and selection behavior are provided by Radix.">
            <RadioGroup label="Density" description="Choose how much information appears at once." defaultValue="comfortable" options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }, { value: "spacious", label: "Spacious", disabled: true }]} />
          </Demo>
          <Demo id="toggle" title="Toggle" detail="A switch for immediate binary settings.">
            <Toggle label="Automatic publishing" description="Publish approved revisions immediately." defaultChecked />
          </Demo>
          <Demo id="badge" title="Badge" detail="Status text remains meaningful beyond its color.">
            <Section as="div" layout="flex" gap="small" wrap>{["neutral", "info", "success", "warning", "danger"].map((tone) => <Badge key={tone} tone={tone}>{tone}</Badge>)}</Section>
          </Demo>
          <Demo id="callout" title="Callout" detail="Contextual feedback supports appropriate live-region roles.">
            <Callout title="Ready for review" tone="success" actions={<Button>Review changes</Button>}>All required checks passed.</Callout>
          </Demo>
          <Demo id="empty-state" title="Empty State" detail="A semantic blank state with a clear recovery action.">
            <EmptyState title="No saved views" message="Save a filter set to return to it quickly." icon={<Inbox size={24} />} actions={<Button icon={<Plus size={16} />}>Save this view</Button>} />
          </Demo>
          <Demo id="spinner" title="Spinner" detail="A labeled status indicator with reduced-motion support.">
            <Section as="div" layout="flex" align="center" gap="large"><Spinner size="small" /><Spinner /><Spinner size="large" /></Section>
          </Demo>
          <Demo id="skeleton" title="Skeleton" detail="Decorative loading geometry leaves status announcements to its parent.">
            <Section as="div" className="skeleton-stack" layout="grid" gap="small"><Skeleton shape="line" /><Skeleton shape="line" /><Skeleton shape="block" /></Section>
          </Demo>
          <Demo id="dialog" title="Dialog" detail="Focus management, dismissal, and labeling are supplied by Radix.">
            <Dialog trigger={<Button>Open dialog</Button>} title="Publish revision?" description="This will make the latest approved revision visible." actions={<ActionGroup align="end" actions={[{ id: "publish", label: "Publish" }]} />}><p>You can create another revision after publishing.</p></Dialog>
          </Demo>
          <Demo id="tooltip" title="Tooltip" detail="Brief labels for icon controls appear on hover and keyboard focus.">
            <Tooltip content="Project settings"><Button aria-label="Project settings" icon={<Settings size={18} />}><VisuallyHidden>Project settings</VisuallyHidden></Button></Tooltip>
          </Demo>

          <Demo id="tabs" title="Tabs" detail="Keyboard navigation and panel relationships are supplied without prescribing the tab treatment." phase={2}>
            <Tabs ariaLabel="Project views" defaultValue="overview" items={[
              { id: "overview", label: "Overview", content: <p>Release health, ownership, and current activity.</p> },
              { id: "activity", label: "Activity", content: <p>Recent publishing and review events appear here.</p> },
              { id: "automations", label: "Automations", content: <p>Automations are unavailable for this workspace.</p>, disabled: true },
            ]} />
          </Demo>
          <Demo id="breadcrumbs" title="Breadcrumbs" detail="A semantic location trail for nested routes." phase={2}>
            <Breadcrumbs items={[{ id: "home", label: "Home", href: "#section" }, { id: "projects", label: "Projects", href: "#list-view" }, { id: "atlas", label: "Atlas", current: true }]} />
          </Demo>
          <Demo id="pagination" title="Pagination" detail="Controlled page navigation supports both callbacks and route-backed links." phase={2}>
            <Pagination page={page} pageCount={12} onPageChange={setPage} />
          </Demo>
          <Demo id="menu" title="Menu" detail="A compact action surface with disabled, destructive, and separator states." phase={2}>
            <Menu
              trigger={<Button aria-label="Project actions" icon={<MoreHorizontal size={18} />}><VisuallyHidden>Project actions</VisuallyHidden></Button>}
              items={[{ id: "rename", label: "Rename project" }, { id: "duplicate", label: "Duplicate" }, { id: "disabled", label: "Move workspace", disabled: true }, { id: "split", separator: true }, { id: "archive", label: "Archive", destructive: true }]}
            />
          </Demo>
          <Demo id="popover" title="Popover" detail="Contextual controls stay anchored to their trigger with managed focus." phase={2}>
            <Popover trigger={<Button icon={<Settings size={16} />}>View options</Button>} title="View density" align="start">
              <RadioGroup label="Density" defaultValue="comfortable" options={[{ value: "compact", label: "Compact" }, { value: "comfortable", label: "Comfortable" }]} />
            </Popover>
          </Demo>
          <Demo id="drawer" title="Drawer" detail="Edge-mounted work preserves focus, dismissal, and accessible labeling." phase={2}>
            <Drawer
              trigger={<Button>Open details</Button>}
              title="Project details"
              description="Update ownership without leaving the current view."
              actions={<ActionGroup align="end" actions={[{ id: "save-drawer", label: "Save changes" }]} />}
            >
              <Section as="div" layout="grid" gap="medium"><Field label="Project name"><Input defaultValue="Atlas" /></Field><SearchSelect label="Owner" defaultValue="maya" options={ownerOptions} /></Section>
            </Drawer>
          </Demo>
          <Demo id="toast" title="Toast" detail="Transient feedback is announced and dismissible without coupling it to page layout." phase={2}>
            <Toast><ToastFixture /></Toast>
          </Demo>
          <Demo id="disclosure" title="Disclosure" detail="Native expandable content for a single optional region." phase={2}>
            <Disclosure summary="Advanced publishing options"><Checkbox label="Require a final approval" description="Hold the revision until an owner approves it." /></Disclosure>
          </Demo>
          <Demo id="accordion" title="Accordion" detail="Single or multiple panels receive complete keyboard and expanded-state behavior." phase={2}>
            <Accordion defaultValue="retention" items={[
              { id: "retention", title: "How long is revision history kept?", content: <p>Revision history is retained for the lifetime of the workspace.</p> },
              { id: "access", title: "Who can publish?", content: <p>Owners and editors with publishing permission can publish.</p> },
            ]} />
          </Demo>
          <Demo id="form" title="Form" detail="Descriptors compose existing field primitives into consistent data-entry workflows." phase={2}>
            <Form
              className="project-form"
              submitLabel="Create project"
              fields={[
                { name: "project", type: "text", label: "Project name", placeholder: "Atlas", required: true },
                { name: "owner", type: "search-select", label: "Owner", options: ownerOptions, defaultValue: "maya" },
                { name: "channel", type: "select", label: "Release channel", options: [{ value: "stable", label: "Stable" }, { value: "preview", label: "Preview" }], defaultValue: "stable" },
                { name: "visibility", type: "custom", selfLabeled: true, control: <RadioGroup id="project-visibility" name="visibility" label="Visibility" defaultValue="team" options={[{ value: "team", label: "Team" }, { value: "private", label: "Private" }]} /> },
                { name: "updates", type: "checkbox", label: "Send progress updates", description: "Notify collaborators when this project changes." },
              ]}
              onSubmit={() => undefined}
            />
          </Demo>
          <Demo id="search-select" title="Search Select" detail="Searchable option selection handles larger datasets while preserving form submission." phase={2}>
            <SearchSelect name="owner" label="Project owner" defaultValue="jon" options={ownerOptions} />
          </Demo>
          <Demo id="file-upload" title="File Upload" detail="Native file selection and drag-and-drop share one labeled input contract." phase={2}>
            <FileUpload label="Reference files" description="PDF, PNG, or JPG up to 10 MB." accept=".pdf,.png,.jpg,.jpeg" multiple maxSize={10 * 1024 * 1024} dropLabel="Choose references or drop them here" />
          </Demo>
          <Demo id="detail-rows" title="Detail Rows" detail="Label-value metadata stays scannable and semantic across project layouts." phase={2}>
            <DetailRows ariaLabel="Atlas project details" items={[
              { id: "status", label: "Status", value: <Badge tone="success">Active</Badge> },
              { id: "owner", label: "Owner", value: "Maya Chen", description: "Design systems" },
              { id: "release", label: "Latest release", value: "v2.4.0" },
            ]} />
          </Demo>
          <Demo id="list-view" title="List View" detail="Repeated resources support leading, metadata, links, and trailing status content." phase={2}>
            <ListView ariaLabel="Projects" items={projectRows.map((project) => ({ id: project.id, title: project.name, href: `#${project.id}`, description: `Owned by ${project.owner}`, metadata: `Updated ${project.updated}`, leading: <Folder size={18} />, trailing: <Badge tone={project.status === "Active" ? "success" : "neutral"}>{project.status}</Badge> }))} />
          </Demo>
          <Demo id="data-table" title="Data Table" detail="Semantic tabular data gains controlled or local column sorting." phase={2}>
            <DataTable caption="Project delivery status" rows={projectRows} columns={projectColumns} defaultSort={{ columnId: "name", direction: "ascending" }} />
          </Demo>
          <Demo id="filter-bar" title="Filter Bar" detail="Search, select, and toggle filters share one controlled value object." phase={2}>
            <FilterBar
              values={filters}
              onValuesChange={setFilters}
              onReset={() => setFilters({ query: "", status: "", archived: false })}
              filters={[
                { id: "query", type: "search", label: "Search", placeholder: "Find projects" },
                { id: "status", type: "select", label: "Status", options: [{ value: "active", label: "Active" }, { value: "review", label: "In review" }, { value: "paused", label: "Paused" }], placeholder: "All statuses" },
                { id: "archived", type: "toggle", label: "Archived" },
              ]}
            />
          </Demo>
          <Demo id="master-detail-layout" title="Master Detail Layout" detail="A responsive two-pane relationship leaves pane surfaces and dimensions to the project." phase={2}>
            <MasterDetailLayout
              master={<ListView items={projectRows.map((project) => ({ id: project.id, title: project.name, description: project.owner, trailing: <Badge tone={project.id === "atlas" ? "success" : "neutral"}>{project.status}</Badge> }))} />}
              detail={<Section as="div" className="detail-panel" layout="grid" gap="medium"><Section as="div" layout="grid" gap="small"><p className="eyebrow">Selected project</p><h3>Atlas</h3><p>Foundation components for internal publishing tools.</p></Section><DetailRows items={[{ id: "owner", label: "Owner", value: "Maya Chen" }, { id: "release", label: "Release", value: "v2.4.0" }]} /></Section>}
            />
          </Demo>
          <Demo id="resource-boundary" title="Resource Boundary" detail="Loading, error, empty, and ready states remain interchangeable around project content." phase={2}>
            <Section as="div" className="resource-grid" layout="grid" columns={2} gap="medium">
              <ResourceBoundary status="loading" loadingLabel="Loading projects" />
              <ResourceBoundary status="error" errorMessage="The project service did not respond." onRetry={() => undefined} />
              <ResourceBoundary status="empty" emptyTitle="No matching projects" emptyMessage="Try a broader filter." />
              <ResourceBoundary status="ready"><Callout title="Projects ready" tone="success">Three projects matched this view.</Callout></ResourceBoundary>
            </Section>
          </Demo>
          <Demo id="progress-bar" title="Progress Bar" detail="Determinate and indeterminate progress expose native progress semantics." phase={2}>
            <Section as="div" layout="grid" gap="medium"><ProgressBar label="Component migration" value={28} max={40} showValue /><ProgressBar label="Preparing preview" showValue /></Section>
          </Demo>
          <Demo id="command-menu" title="Command Menu" detail="A searchable command surface opens from an explicit trigger or the platform shortcut." phase={2}>
            <Button icon={<CommandIcon size={16} />} onClick={() => setCommandOpen(true)}>Open command menu</Button>
            <CommandMenu
              open={commandOpen}
              onOpenChange={setCommandOpen}
              onSelect={() => undefined}
              groups={[
                { id: "projects", heading: "Projects", items: [{ id: "search", label: "Search projects", description: "Find a project by name", icon: <Search size={16} />, shortcut: "S" }, { id: "create", label: "Create project", description: "Start from the Composer template", icon: <Plus size={16} />, shortcut: "N" }] },
                { id: "workspace", heading: "Workspace", items: [{ id: "settings", label: "Workspace settings", icon: <Settings size={16} /> }, { id: "upload", label: "Import references", icon: <Upload size={16} /> }] },
              ]}
            />
          </Demo>
          <Demo id="carousel" title="Carousel" detail="Embla supplies touch, drag, snap, and navigation behavior while slides remain project content." phase={2}>
            <Carousel ariaLabel="Featured projects" options={{ align: "start" }} slides={projectRows.map((project, index) => ({ id: project.id, label: `${project.name}, slide ${index + 1} of ${projectRows.length}`, content: <Section as="div" className="carousel-slide" layout="grid" gap="small"><p className="eyebrow">{project.status}</p><h3>{project.name}</h3><p>Owned by {project.owner}</p><Badge tone={project.status === "Active" ? "success" : "neutral"}>Updated {project.updated}</Badge></Section> }))} />
          </Demo>
          <PhaseThreeShowcase />
          <PhaseFourShowcase />
          <PhaseFiveShowcase />
        </Section>
      </Section>
    </AppShell>
  );
}
