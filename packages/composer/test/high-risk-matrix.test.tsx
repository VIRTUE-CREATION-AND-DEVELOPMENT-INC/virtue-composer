import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import DataGrid from "../src/DataGrid";
import MediaPicker from "../src/MediaPicker";
import Scheduler from "../src/Scheduler";
import TransferList from "../src/TransferList";

describe("high-risk state combinations", () => {
  it("combines controlled selection, sorting, filtering, visibility, and pinning in DataGrid", () => {
    const rows = [
      { id: "atlas", name: "Atlas", owner: "Maya" },
      { id: "harbor", name: "Harbor", owner: "Ari" },
    ];
    const { container } = render(<DataGrid
      rows={rows}
      columns={[
        { id: "name", header: "Name", accessorKey: "name", sortable: true },
        { id: "owner", header: "Owner", accessorKey: "owner" },
      ]}
      selectable
      selectedIds={["atlas"]}
      sorting={[{ id: "name", desc: true }]}
      globalFilter="Atlas"
      columnVisibility={{ owner: false }}
      pinnedColumns={{ left: ["name"], right: [] }}
    />);

    expect(screen.queryByRole("columnheader", { name: "Owner" })).not.toBeInTheDocument();
    expect(screen.getByRole("row", { name: /Atlas/ })).toHaveAttribute("data-vc-selected", "true");
    expect(container.querySelector('[data-vc-slot="cell"][data-vc-pinned="left"]')).toHaveTextContent("Atlas");
    expect(container.querySelector('[data-vc-component="data-grid"]')).toHaveAttribute("data-vc-sorted", "true");
  });

  it("clips a cross-day scheduler event into both visible days", () => {
    render(<Scheduler
      view="week"
      weekStartsOn={1}
      date={new Date(2026, 6, 20)}
      startHour={0}
      endHour={24}
      events={[{ id: "overnight", title: "Overnight release", start: new Date(2026, 6, 21, 23), end: new Date(2026, 6, 22, 1) }]}
    />);

    expect(screen.getAllByRole("button", { name: /Overnight release/ })).toHaveLength(2);
  });

  it("preserves transfer selections while the visible list is filtered", async () => {
    const change = vi.fn();
    const user = userEvent.setup();
    render(<TransferList label="Reviewers" items={[{ value: "maya", label: "Maya" }, { value: "jon", label: "Jon" }]} onValueChange={change} />);

    await user.click(screen.getByRole("checkbox", { name: "Jon" }));
    await user.type(screen.getByRole("searchbox", { name: "Filter items, Available" }), "Maya");
    expect(screen.queryByRole("checkbox", { name: "Jon" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add selected" }));
    expect(change).toHaveBeenLastCalledWith(["jon"]);
  });

  it("preserves media selections across paginated item replacement", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<MediaPicker label="Assets" multiple defaultValue={["one"]} items={[{ id: "one", src: "/one.jpg", alt: "One", title: "One" }]} name="assets" />);
    await user.click(screen.getByRole("button", { name: "1 selected" }));
    rerender(<MediaPicker label="Assets" multiple defaultValue={["one"]} items={[{ id: "two", src: "/two.jpg", alt: "Two", title: "Two" }]} name="assets" />);

    expect(document.querySelector("input[name='assets']")).toHaveValue("one");
    expect(screen.getByRole("dialog", { name: "Assets" })).toBeVisible();
  });
});
