import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AlertDialog from "../src/AlertDialog";
import AnchorNav from "../src/AnchorNav";
import AppShell from "../src/AppShell";
import Avatar from "../src/Avatar";
import AvatarGroup from "../src/AvatarGroup";
import BackLink from "../src/BackLink";
import Banner from "../src/Banner";
import Button from "../src/Button";
import Calendar from "../src/Calendar";
import ChartFrame from "../src/ChartFrame";
import ChartLegend from "../src/ChartLegend";
import ChartTooltip from "../src/ChartTooltip";
import CodeBlock from "../src/CodeBlock";
import ContextMenu from "../src/ContextMenu";
import CopyButton from "../src/CopyButton";
import DataGrid from "../src/DataGrid";
import DatePicker from "../src/DatePicker";
import DateRangePicker from "../src/DateRangePicker";
import HoverCard from "../src/HoverCard";
import IconButton from "../src/IconButton";
import ImageGallery from "../src/ImageGallery";
import InlineMessage from "../src/InlineMessage";
import KanbanBoard from "../src/KanbanBoard";
import Lightbox from "../src/Lightbox";
import LoadingOverlay from "../src/LoadingOverlay";
import MarkdownEditor from "../src/MarkdownEditor";
import MobileNav from "../src/MobileNav";
import NumberInput from "../src/NumberInput";
import OtpInput from "../src/OtpInput";
import PasswordInput from "../src/PasswordInput";
import RichTextEditor from "../src/RichTextEditor";
import Scheduler from "../src/Scheduler";
import SegmentedControl from "../src/SegmentedControl";
import SideNav from "../src/SideNav";
import Slider from "../src/Slider";
import SplitButton from "../src/SplitButton";
import Stepper from "../src/Stepper";
import TagInput from "../src/TagInput";
import TimeInput from "../src/TimeInput";
import Timeline from "../src/Timeline";
import TopNav from "../src/TopNav";
import TreeSelect from "../src/TreeSelect";
import TreeView from "../src/TreeView";
import VideoPlayer from "../src/VideoPlayer";
import VirtualList from "../src/VirtualList";

const treeNodes = [
  { id: "work", label: "Work", children: [{ id: "brief", label: "Brief" }] },
  { id: "archive", label: "Archive", disabled: true },
];

const galleryImages = [
  { id: "one", src: "/one.jpg", alt: "First composition", width: 800, height: 600, caption: "First" },
  { id: "two", src: "/two.jpg", alt: "Second composition", width: 800, height: 600, caption: "Second" },
];

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});

describe("Phase 3A application structure and navigation", () => {
  it("composes an application shell with semantic navigation", () => {
    render(
      <AppShell
        header={<TopNav items={[{ id: "home", label: "Home", href: "/", current: true }]} actions={<Button>Account</Button>} />}
        navigation={<SideNav groups={[{ id: "main", label: "Workspace", items: [{ id: "projects", label: "Projects", href: "/projects", badge: "3" }, { id: "locked", label: "Locked", href: "/locked", disabled: true }] }]} />}
        footer="Footer"
      >
        Dashboard
      </AppShell>,
    );

    expect(screen.getByRole("link", { name: "Skip to main content" })).toHaveAttribute("href", "#main-content");
    expect(screen.getByRole("main")).toHaveTextContent("Dashboard");
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("Locked").closest("span[aria-disabled='true']")).toBeInTheDocument();
  });

  it("opens the mobile navigation drawer", async () => {
    const user = userEvent.setup();
    render(<MobileNav trigger={<Button>Open navigation</Button>} groups={[{ id: "main", items: [{ id: "projects", label: "Projects", href: "/projects" }] }]} />);
    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(await screen.findByRole("dialog", { name: "Navigation" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Mobile navigation" })).toHaveTextContent("Projects");
  });

  it("renders progress, anchor, and back navigation states", () => {
    render(<>
      <Stepper ariaLabel="Horizontal progress" items={[{ id: "details", label: "Details", status: "complete", href: "/details" }, { id: "review", label: "Review", status: "current" }]} />
      <Stepper ariaLabel="Vertical progress" orientation="vertical" items={[{ id: "details", label: "Details", status: "complete" }, { id: "review", label: "Review", status: "current" }]} />
      <AnchorNav items={[{ id: "overview", label: "Overview", href: "#overview", current: true }]} />
      <BackLink href="/projects">Projects</BackLink>
    </>);
    const horizontal = screen.getByRole("navigation", { name: "Horizontal progress" });
    const vertical = screen.getByRole("navigation", { name: "Vertical progress" });
    expect(horizontal).toHaveAttribute("data-vc-orientation", "horizontal");
    expect(vertical).toHaveAttribute("data-vc-orientation", "vertical");
    expect(horizontal.querySelector("[data-vc-stepper-list]")).toHaveAttribute("tabindex", "0");
    expect(vertical.querySelector("[data-vc-stepper-list]")).not.toHaveAttribute("tabindex");
    expect(horizontal.querySelectorAll("[data-vc-stepper-connector]")).toHaveLength(1);
    expect(vertical.querySelectorAll("[data-vc-stepper-connector]")).toHaveLength(1);
    expect(within(vertical).getByText("Review").closest("div")).toHaveAttribute("aria-current", "step");
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("aria-current", "location");
    expect(screen.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
  });

  it("changes a segmented selection", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<SegmentedControl ariaLabel="View" defaultValue="grid" onValueChange={change} items={[{ value: "grid", label: "Grid" }, { value: "list", label: "List" }]} />);
    await user.click(screen.getByRole("radio", { name: "List" }));
    expect(change).toHaveBeenCalledWith("list");
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("data-state", "on");
  });
});

describe("Phase 3A actions and inputs", () => {
  it("runs icon, copy, and split button actions", async () => {
    const iconAction = vi.fn();
    const primaryAction = vi.fn();
    const menuAction = vi.fn();
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, "writeText");
    render(<>
      <IconButton label="Refresh" icon="R" onClick={iconAction} />
      <CopyButton value="composer" resetAfter={10} />
      <SplitButton label="Publish" onClick={primaryAction} menuIcon="M" items={[{ id: "draft", label: "Save draft" }]} onAction={menuAction} />
    </>);
    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await user.click(screen.getByRole("button", { name: "Copy" }));
    expect(clipboard).toHaveBeenCalledWith("composer");
    expect(screen.getByText("Copied")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Publish" }));
    await user.click(screen.getByRole("button", { name: "More actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Save draft" }));
    expect(iconAction).toHaveBeenCalledOnce();
    expect(primaryAction).toHaveBeenCalledOnce();
    expect(menuAction).toHaveBeenCalledWith("draft");
  });

  it("bounds number values and reveals passwords", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<><NumberInput label="Seats" defaultValue={2} min={1} max={3} onValueChange={change} /><PasswordInput label="Password" defaultValue="secret" /></>);
    await user.click(screen.getByRole("button", { name: "Increase Seats" }));
    expect(screen.getByRole("spinbutton", { name: "Seats" })).toHaveValue(3);
    expect(screen.getByRole("button", { name: "Increase Seats" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: "Show password" }));
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(change).toHaveBeenCalledWith(3);
  });

  it("accepts one-time codes, times, tags, and slider changes", async () => {
    const otpChange = vi.fn();
    const tagChange = vi.fn();
    const sliderChange = vi.fn();
    const user = userEvent.setup();
    render(<>
      <OtpInput label="Verification code" length={4} onChange={otpChange} />
      <TimeInput label="Start time" defaultValue="09:30" />
      <TagInput label="Tags" defaultValue={["system"]} onValueChange={tagChange} />
      <Slider label="Volume" defaultValue={[25]} step={5} showValue onValueChange={sliderChange} />
    </>);
    const otp = document.querySelector("input[data-input-otp]") as HTMLInputElement;
    fireEvent.change(otp, { target: { value: "1234" } });
    expect(otpChange).toHaveBeenCalledWith("1234");
    expect(screen.getByLabelText("Start time")).toHaveValue("09:30");
    await user.type(screen.getByRole("textbox", { name: "Tags" }), "layout{Enter}");
    expect(tagChange).toHaveBeenLastCalledWith(["system", "layout"]);
    const slider = screen.getByRole("slider", { name: "Volume" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(sliderChange).toHaveBeenCalled();
    expect(screen.getByText("30")).toBeInTheDocument();
  });

  it("renders date selection primitives and hidden form values", () => {
    const date = new Date(2026, 6, 18);
    const range = { from: date, to: new Date(2026, 6, 20) };
    const { container } = render(<>
      <DatePicker label="Publish date" defaultValue={date} name="publishDate" />
      <DateRangePicker label="Campaign dates" defaultValue={range} startName="start" endName="end" />
      <Calendar mode="single" selected={date} ariaLabel="Editorial calendar" />
    </>);
    expect(screen.getByRole("button", { name: "Publish date" })).toHaveTextContent("July 18th, 2026");
    expect(container.querySelector("input[name='publishDate']")).toHaveValue("2026-07-18");
    expect(container.querySelector("input[name='start']")).toHaveValue("2026-07-18");
    expect(screen.getByLabelText("Editorial calendar")).toBeInTheDocument();
  });
});

describe("Phase 3A overlays and feedback", () => {
  it("confirms alert dialogs and selects context actions", async () => {
    const confirm = vi.fn();
    const contextAction = vi.fn();
    const user = userEvent.setup();
    render(<>
      <AlertDialog trigger={<Button>Delete project</Button>} title="Delete project?" description="This cannot be undone." onConfirm={confirm} destructive />
      <ContextMenu items={[{ id: "rename", label: "Rename" }]} onAction={contextAction}><span>Project row</span></ContextMenu>
    </>);
    await user.click(screen.getByRole("button", { name: "Delete project" }));
    await user.click(await screen.findByRole("button", { name: "Confirm" }));
    expect(confirm).toHaveBeenCalledOnce();
    fireEvent.contextMenu(screen.getByText("Project row"));
    await user.click(await screen.findByRole("menuitem", { name: "Rename" }));
    expect(contextAction).toHaveBeenCalledWith("rename");
  });

  it("renders hover details and feedback states", async () => {
    const dismiss = vi.fn();
    const user = userEvent.setup();
    render(<>
      <HoverCard trigger={<a href="/ada">Ada</a>} defaultOpen>Profile details</HoverCard>
      <Banner title="Maintenance" dismissible onDismiss={dismiss}>Scheduled tonight.</Banner>
      <InlineMessage tone="danger" title="Could not save">Try again.</InlineMessage>
      <LoadingOverlay active label="Saving"><button>Editor</button></LoadingOverlay>
    </>);
    expect(await screen.findByText("Profile details")).toBeVisible();
    expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
    expect(screen.getByRole("status", { name: "Saving" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editor" }).parentElement).toHaveAttribute("inert");
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(dismiss).toHaveBeenCalledOnce();
    expect(screen.queryByText("Scheduled tonight.")).not.toBeInTheDocument();
  });
});

describe("Phase 3B structured data", () => {
  it("renders tree navigation and selects a leaf from tree select", async () => {
    const select = vi.fn();
    const user = userEvent.setup();
    render(<><TreeView nodes={treeNodes} defaultExpandedIds={["work"]} ariaLabel="Files" /><TreeSelect label="Document" nodes={treeNodes} onValueChange={select} /></>);
    expect(screen.getByRole("tree", { name: "Files" })).toHaveTextContent("Brief");
    await user.click(screen.getByRole("combobox", { name: "Document" }));
    const options = await screen.findByRole("tree", { name: "Document options" });
    const brief = within(options).getByRole("treeitem", { name: "Brief" });
    await user.dblClick(brief);
    expect(select).toHaveBeenCalledWith("brief");
    expect(screen.getByRole("combobox", { name: "Document" })).toHaveTextContent("Brief");
  });

  it("renders virtualized and chronological collections", () => {
    render(<>
      <VirtualList items={["Alpha", "Beta"]} height={120} renderItem={(item) => item} />
      <Timeline items={[{ id: "one", title: "Created", date: "Today", status: "complete", content: "Initial version" }]} />
    </>);
    expect(screen.getByRole("list", { name: "Items" })).toBeInTheDocument();
    expect(screen.getByRole("list", { name: "Timeline" })).toHaveTextContent("Created");
  });

  it("sorts and selects data grid rows", async () => {
    const selection = vi.fn();
    const user = userEvent.setup();
    render(<DataGrid caption="Projects" selectable onSelectedIdsChange={selection} rows={[{ id: "z", name: "Zulu" }, { id: "a", name: "Alpha" }]} columns={[{ id: "name", header: "Name", accessorKey: "name", sortable: true }]} />);
    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Alpha");
    await user.click(screen.getByRole("checkbox", { name: "Select row a" }));
    expect(selection).toHaveBeenCalledWith(["a"]);
    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "ascending");
  });

  it("renders schedules and kanban controls", async () => {
    const event = { id: "review", title: "Design review", start: new Date(2026, 6, 18, 10), end: new Date(2026, 6, 18, 11), status: "confirmed" };
    const select = vi.fn();
    const move = vi.fn();
    const user = userEvent.setup();
    render(<>
      <Scheduler date={new Date(2026, 6, 18)} events={[event]} onEventSelect={select} />
      <KanbanBoard columns={[{ id: "todo", title: "To do", items: [{ id: "brief", content: "Write brief" }] }, { id: "done", title: "Done", items: [] }]} onMove={move} />
    </>);
    await user.click(screen.getByRole("button", { name: /Design review/ }));
    expect(select).toHaveBeenCalledWith(event);
    expect(screen.getByRole("region", { name: "Kanban board" })).toHaveTextContent("Write brief");
    expect(screen.getByRole("button", { name: "Move item brief" })).toBeEnabled();
  });

  it("frames charts with legends and tooltips", () => {
    render(<ChartFrame title="Revenue" description="Monthly" legend={<ChartLegend items={[{ id: "actual", label: "Actual", color: "#000", value: "$20k" }]} />} summary="Up 12%"><div aria-label="Chart plot">Plot</div><ChartTooltip label="July" items={[{ id: "actual", label: "Actual", value: "$20k" }]} /></ChartFrame>);
    expect(screen.getByRole("figure", { name: "Revenue" })).toHaveTextContent("Monthly");
    expect(screen.getByRole("list", { name: "Chart legend" })).toHaveTextContent("$20k");
    expect(screen.getByRole("tooltip")).toHaveTextContent("July");
  });
});

describe("Phase 3C authoring and media", () => {
  it("edits rich text and markdown content", async () => {
    const markdownChange = vi.fn();
    const user = userEvent.setup();
    render(<><RichTextEditor label="Article" content="<p>Hello</p>" /><MarkdownEditor label="Notes" defaultValue="**Bold**" onValueChange={markdownChange} /></>);
    expect(await screen.findByRole("toolbar", { name: "Article formatting" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Article" })).toHaveTextContent("Hello");
    await user.clear(screen.getByRole("textbox", { name: "Notes markdown" }));
    await user.type(screen.getByRole("textbox", { name: "Notes markdown" }), "# Heading");
    expect(markdownChange).toHaveBeenCalled();
    await user.click(screen.getByRole("radio", { name: "Preview" }));
    expect(screen.getByRole("heading", { name: "Heading" })).toBeInTheDocument();
  });

  it("renders and copies code", async () => {
    const user = userEvent.setup();
    const clipboard = vi.spyOn(navigator.clipboard, "writeText");
    const { container } = render(<CodeBlock code={"const ready = true;\nreturn ready;"} language="js" label="Example" showLineNumbers />);
    expect(container.querySelectorAll("[data-vc-code-line]")).toHaveLength(2);
    await user.click(screen.getByRole("button", { name: "Copy code" }));
    expect(clipboard).toHaveBeenCalledWith("const ready = true;\nreturn ready;");
  });

  it("renders avatar fallbacks and group overflow", async () => {
    render(<><Avatar alt="Ada Lovelace" fallback="AL" fallbackDelay={0} /><AvatarGroup max={2} items={[{ id: "a", alt: "Ada", fallback: "A", fallbackDelay: 0 }, { id: "g", alt: "Grace", fallback: "G", fallbackDelay: 0 }, { id: "k", alt: "Katherine", fallback: "K", fallbackDelay: 0 }]} /></>);
    expect(await screen.findByLabelText("Ada Lovelace")).toHaveTextContent("AL");
    expect(screen.getByRole("group", { name: "People" })).toHaveTextContent("+1");
    expect(screen.getByLabelText("1 more")).toBeInTheDocument();
  });

  it("selects gallery media and navigates an uncontrolled lightbox by keyboard", async () => {
    const selected = vi.fn();
    const user = userEvent.setup();
    render(<>
      <ImageGallery images={galleryImages} onSelectedIdChange={selected} />
      <Lightbox images={galleryImages} trigger={<Button>Open images</Button>} />
    </>);
    await user.click(screen.getByRole("button", { name: "Show Second composition" }));
    expect(selected).toHaveBeenCalledWith("two");
    expect(screen.getByRole("img", { name: "Second composition" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open images" }));
    expect(await screen.findByRole("dialog", { name: "Image viewer" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByText("2 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Image viewer" })).not.toBeInTheDocument());
  });

  it("renders video sources, tracks, and accessible controls", () => {
    const { container } = render(<VideoPlayer label="Composer introduction" poster="/poster.jpg" sources={[{ src: "/composer.mp4", type: "video/mp4" }]} tracks={[{ src: "/captions.vtt", kind: "captions", srcLang: "en", label: "English", default: true }]} />);
    expect(screen.getByLabelText("Composer introduction")).toHaveAttribute("controls");
    expect(container.querySelector("source")).toHaveAttribute("src", "/composer.mp4");
    expect(container.querySelector("track")).toHaveAttribute("kind", "captions");
  });
});
