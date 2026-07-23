import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import Accordion from "../src/Accordion";
import ActionGroup from "../src/ActionGroup";
import Breadcrumbs from "../src/Breadcrumbs";
import Button from "../src/Button";
import Carousel from "../src/Carousel";
import CommandMenu from "../src/CommandMenu";
import DataTable from "../src/DataTable";
import DetailRows from "../src/DetailRows";
import Disclosure from "../src/Disclosure";
import Drawer from "../src/Drawer";
import EmptyState from "../src/EmptyState";
import FileUpload from "../src/FileUpload";
import FilterBar from "../src/FilterBar";
import Form from "../src/Form";
import ListView from "../src/ListView";
import MasterDetailLayout from "../src/MasterDetailLayout";
import Menu from "../src/Menu";
import Pagination from "../src/Pagination";
import Popover from "../src/Popover";
import ProgressBar from "../src/ProgressBar";
import RadioGroup from "../src/RadioGroup";
import ResourceBoundary from "../src/ResourceBoundary";
import SearchSelect from "../src/SearchSelect";
import Tabs from "../src/Tabs";
import ToastProvider, { useToast } from "../src/Toast";

describe("Phase 2 navigation and disclosure", () => {
  it("associates tabs and panels", async () => {
    const user = userEvent.setup();
    render(<Tabs items={[{ id: "one", label: "One", content: "First" }, { id: "two", label: "Two", content: "Second" }]} />);
    await user.click(screen.getByRole("tab", { name: "Two" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Second");
  });

  it("marks the current breadcrumb and pagination page", () => {
    render(<><Breadcrumbs items={[{ id: "home", label: "Home", href: "/" }, { id: "project", label: "Project" }]} /><Pagination page={3} pageCount={8} onPageChange={() => {}} /></>);
    expect(screen.getByText("Project")).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 3, current page" })).toHaveAttribute("aria-current", "page");
  });

  it("opens menu, popover, drawer, disclosure, and accordion content", async () => {
    const user = userEvent.setup();
    const action = vi.fn();
    render(<>
      <Menu trigger={<Button>Menu</Button>} items={[{ id: "edit", label: "Edit" }]} onAction={action} />
      <Popover trigger={<Button>Popover</Button>}>Popover body</Popover>
      <Drawer trigger={<Button>Drawer</Button>} title="Drawer title">Drawer body</Drawer>
      <Disclosure summary="Details">Disclosure body</Disclosure>
      <Accordion items={[{ id: "answer", title: "Question", content: "Answer" }]} />
    </>);
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Edit" }));
    expect(action).toHaveBeenCalledWith("edit");
    fireEvent.click(screen.getByRole("button", { name: "Popover" }));
    expect(await screen.findByText("Popover body")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Drawer" }));
    expect(await screen.findByRole("dialog", { name: "Drawer title" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close drawer" }));
    fireEvent.click(screen.getByText("Details"));
    expect(screen.getByText("Disclosure body").closest("details")).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: /Question/ }));
    expect(screen.getByText("Answer")).toBeVisible();
  });
});

describe("Phase 2 forms and data", () => {
  it("submits descriptor forms with associated controls", () => {
    const submit = vi.fn();
    render(<Form fields={[{ name: "name", type: "text", label: "Name", defaultValue: "Ada" }, { name: "role", type: "select", label: "Role", options: [{ value: "admin", label: "Admin" }], defaultValue: "admin" }]} onSubmit={(data) => submit(Object.fromEntries(data))} />);
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form")!);
    expect(submit).toHaveBeenCalledWith({ name: "Ada", role: "admin" });
  });

  it("submits self-labeling custom controls without adding a duplicate Field label", () => {
    const submit = vi.fn();
    render(<Form fields={[{
      type: "custom",
      name: "topic",
      selfLabeled: true,
      control: <RadioGroup label="Topic" name="topic" defaultValue="repairs" options={[{ value: "repairs", label: "Repairs" }, { value: "sales", label: "Sales" }]} />,
    }]} onSubmit={(data) => submit(Object.fromEntries(data))} />);

    expect(screen.getAllByText("Topic")).toHaveLength(1);
    fireEvent.submit(screen.getByRole("button", { name: "Submit" }).closest("form")!);
    expect(submit).toHaveBeenCalledWith({ topic: "repairs" });
  });

  it("selects searchable options and reports uploaded files", async () => {
    const onFiles = vi.fn();
    render(<><SearchSelect label="Owner" options={[{ value: "ada", label: "Ada Lovelace" }, { value: "grace", label: "Grace Hopper" }]} /><FileUpload label="Assets" onFilesChange={onFiles} /></>);
    fireEvent.click(screen.getByRole("combobox", { name: "Owner" }));
    fireEvent.click(await screen.findByText("Grace Hopper"));
    expect(screen.getByRole("combobox", { name: "Owner" })).toHaveTextContent("Grace Hopper");
    const file = new File(["hello"], "brief.txt", { type: "text/plain" });
    fireEvent.change(screen.getByLabelText(/Choose files/), { target: { files: [file] } });
    expect(onFiles).toHaveBeenCalledWith([file]);
    expect(screen.getByText("brief.txt")).toBeInTheDocument();
  });

  it("renders semantic details, lists, and master-detail panes", () => {
    render(<><DetailRows items={[{ id: "status", label: "Status", value: "Ready" }]} /><ListView items={[{ id: "one", title: "Project one", description: "Active" }]} /><MasterDetailLayout master="Projects" detail="Project details" /></>);
    expect(screen.getByText("Status").tagName).toBe("DT");
    expect(screen.getByRole("list", { name: "Items" })).toHaveTextContent("Project one");
    expect(screen.getByRole("complementary", { name: "Items" })).toHaveTextContent("Projects");
    expect(screen.getByRole("region", { name: "Details" })).toHaveTextContent("Project details");
  });

  it("sorts tables and updates filters", () => {
    const change = vi.fn();
    render(<><DataTable rows={[{ id: "2", name: "Zulu" }, { id: "1", name: "Alpha" }]} columns={[{ id: "name", header: "Name", accessor: "name", sortable: true }]} /><FilterBar filters={[{ id: "query", type: "search", label: "Search" }]} values={{ query: "" }} onValuesChange={change} /></>);
    fireEvent.click(screen.getByRole("button", { name: "Name" }));
    expect(screen.getAllByRole("row")[1]).toHaveTextContent("Alpha");
    fireEvent.change(screen.getByRole("searchbox", { name: "Search" }), { target: { value: "atlas" } });
    expect(change).toHaveBeenCalledWith({ query: "atlas" });
  });
});

describe("Phase 2 feedback and advanced utilities", () => {
  it("moves resource boundaries through loading, error, empty, and ready", () => {
    const { rerender } = render(<ResourceBoundary status="loading" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading");
    rerender(<ResourceBoundary status="error" errorMessage="Try later" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Try later");
    rerender(<ResourceBoundary status="empty" emptyTitle="No records" />);
    expect(screen.getByRole("heading", { name: "No records" })).toBeInTheDocument();
    rerender(<ResourceBoundary status="ready">Ready data</ResourceBoundary>);
    expect(screen.getByText("Ready data")).toBeInTheDocument();
  });

  it("labels determinate and indeterminate progress", () => {
    const { rerender } = render(<ProgressBar label="Upload" value={40} showValue />);
    expect(screen.getByRole("progressbar", { name: "Upload" })).toHaveAttribute("value", "40");
    expect(screen.getByText("40%")).toBeInTheDocument();
    rerender(<ProgressBar label="Processing" />);
    expect(screen.getByRole("progressbar", { name: "Processing" })).not.toHaveAttribute("value");
  });

  it("rejects descriptor objects passed directly to EmptyState actions", () => {
    const report = vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() => render(
      // @ts-expect-error Verifies the runtime guard for JavaScript consumers.
      <EmptyState title="Complete" actions={[{ id: "continue", label: "Continue" }]} />,
    )).toThrow(/Render descriptor actions with <ActionGroup/);
    report.mockRestore();
  });

  it("accepts a rendered ActionGroup in EmptyState actions", () => {
    render(<EmptyState title="Complete" actions={<ActionGroup actions={[{ id: "continue", label: "Continue" }]} />} />);
    expect(screen.getByRole("group", { name: "Actions" })).toBeInTheDocument();
  });

  it("publishes and dismisses toast notifications", async () => {
    function Trigger() { const { toast } = useToast(); return <Button onClick={() => toast({ title: "Saved", description: "Changes published" })}>Notify</Button>; }
    render(<ToastProvider><Trigger /></ToastProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Notify" }));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Dismiss notification" }));
    await waitFor(() => expect(screen.queryByText("Saved")).not.toBeInTheDocument());
  });

  it("opens command search and renders an accessible carousel", () => {
    function CommandFixture() { const [open, setOpen] = useState(false); return <><Button onClick={() => setOpen(true)}>Commands</Button><CommandMenu open={open} onOpenChange={setOpen} groups={[{ id: "main", heading: "Main", items: [{ id: "create", label: "Create project" }] }]} onSelect={() => {}} /></>; }
    render(<><CommandFixture /><Carousel slides={[{ id: "one", content: "Slide one" }, { id: "two", content: "Slide two" }]} /></>);
    expect(screen.getByRole("region", { name: "Carousel" })).toBeInTheDocument();
    expect(screen.getAllByRole("group", { name: /of 2/ })).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Commands" }));
    expect(screen.getByRole("dialog", { name: "Command menu" })).toBeInTheDocument();
  });

  it("changes pagination pages", () => {
    const change = vi.fn();
    render(<Pagination page={2} pageCount={4} onPageChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(change).toHaveBeenCalledWith(3);
  });
});
