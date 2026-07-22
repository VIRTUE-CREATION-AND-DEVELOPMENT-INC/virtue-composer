import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Button from "../src/Button";
import Calendar from "../src/Calendar";
import DataGrid from "../src/DataGrid";
import DatePicker from "../src/DatePicker";
import DateRangePicker from "../src/DateRangePicker";
import ImageGallery from "../src/ImageGallery";
import KanbanBoard from "../src/KanbanBoard";
import Scheduler from "../src/Scheduler";
import UploadQueue from "../src/UploadQueue";

describe("calendar infrastructure", () => {
  it("layers stable Composer classes onto DayPicker", () => {
    const date = new Date(2026, 6, 18);
    const { container } = render(<Calendar mode="single" defaultMonth={date} selected={date} ariaLabel="Editorial calendar" />);
    expect(container.querySelector(".vc-calendar-picker.rdp-root")).toBeInTheDocument();
    expect(container.querySelector(".vc-calendar-caption")).toBeInTheDocument();
    expect(container.querySelector(".vc-calendar-day-button")).toBeInTheDocument();
    expect(container.querySelector(".vc-calendar-selected")).toBeInTheDocument();
  });

  it("uses the shared Calendar inside modal date pickers", async () => {
    const user = userEvent.setup();
    const { container } = render(<>
      <DatePicker label="Publish date" />
      <DateRangePicker label="Campaign window" />
    </>);
    const dateTrigger = screen.getByRole("button", { name: "Publish date" });
    await user.click(dateTrigger);
    expect(screen.getByRole("dialog", { name: "Publish date" })).toHaveClass("vc-date-picker-dialog");
    expect(document.querySelector('[data-vc-component="calendar"]')).toHaveAttribute("aria-label", "Publish date calendar");
    expect(container.querySelector('[data-vc-component="date-picker"]')).toHaveAttribute("data-vc-state", "open");
    await user.keyboard("{Escape}");
    expect(dateTrigger).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Campaign window" }));
    const rangeDialog = screen.getByRole("dialog", { name: "Campaign window" });
    expect(rangeDialog).toHaveClass("vc-date-range-picker-dialog");
    expect(rangeDialog.querySelectorAll(".vc-calendar-month")).toHaveLength(2);
  });

  it("keeps the range dialog open until the second date is selected", async () => {
    const user = userEvent.setup();
    render(<DateRangePicker label="Campaign window" defaultValue={{ from: new Date(2026, 6, 18), to: new Date(2026, 6, 24) }} />);
    const trigger = screen.getByRole("button", { name: "Campaign window" });

    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Campaign window" });
    await user.click(within(dialog).getByRole("button", { name: /Saturday, July 18th, 2026/ }));
    expect(dialog).toBeVisible();

    await user.click(within(dialog).getByRole("button", { name: /Monday, July 20th, 2026/ }));
    expect(screen.queryByRole("dialog", { name: "Campaign window" })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveTextContent(/18.*20/);
  });
});

describe("structured workspace infrastructure", () => {
  it("lays out overlapping and compact schedule events", () => {
    const date = new Date(2026, 6, 18);
    const { container } = render(<Scheduler date={date} startHour={9} endHour={12} pixelsPerMinute={0.8} currentTime={new Date(2026, 6, 18, 10, 15)} events={[
      { id: "short", title: "Standup", start: new Date(2026, 6, 18, 9, 30), end: new Date(2026, 6, 18, 10) },
      { id: "overlap", title: "Planning", start: new Date(2026, 6, 18, 9, 45), end: new Date(2026, 6, 18, 10, 45) },
    ]} />);
    const standup = screen.getByRole("button", { name: /Standup/ });
    const planning = screen.getByRole("button", { name: /Planning/ });
    expect(standup).toHaveAttribute("data-vc-compact", "true");
    expect(standup.style.getPropertyValue("--vc-scheduler-lane-width")).toBe("50%");
    expect(planning.style.getPropertyValue("--vc-scheduler-lane-left")).toBe("50%");
    expect(container.querySelector("[data-vc-scheduler-now]")).toBeInTheDocument();
  });

  it("resizes DataGrid columns with the keyboard", () => {
    render(<DataGrid rows={[{ id: "atlas", name: "Atlas" }]} columns={[{ id: "name", header: "Name", accessorKey: "name", size: 150 }]} />);
    const separator = screen.getByRole("separator", { name: "Resize name column" });
    expect(separator).toHaveAttribute("aria-valuenow", "150");
    fireEvent.keyDown(separator, { key: "ArrowRight" });
    expect(separator).toHaveAttribute("aria-valuenow", "160");
  });

  it("exposes empty Kanban columns as drop targets", () => {
    const { container } = render(<KanbanBoard columns={[{ id: "done", title: "Done", items: [] }]} onMove={vi.fn()} empty="Drop items here" />);
    expect(container.querySelector('[data-vc-column-id="done"]')).toHaveAttribute("data-vc-state", "empty");
    expect(container.querySelector('[data-vc-slot="empty"]')).toHaveTextContent("Drop items here");
  });
});

describe("media infrastructure", () => {
  it("exposes gallery selection and media slots", async () => {
    const user = userEvent.setup();
    const { container } = render(<ImageGallery images={[
      { id: "one", src: "/one.jpg", alt: "First", width: 800, height: 600 },
      { id: "two", src: "/two.jpg", alt: "Second", width: 800, height: 600 },
    ]} />);
    await user.click(screen.getByRole("button", { name: "Show Second" }));
    expect(container.querySelector('[data-vc-component="image-gallery"]')).toHaveAttribute("data-vc-selected-id", "two");
    expect(container.querySelector('[data-vc-slot="primary"] [data-vc-slot="image"]')).toHaveAttribute("alt", "Second");
  });

  it("summarizes upload error state with stable slots", () => {
    const { container } = render(<UploadQueue items={[{ id: "one", name: "brief.pdf", status: "error", error: "Upload failed" }]} onRetry={vi.fn()} />);
    expect(container.querySelector('[data-vc-component="upload-queue"]')).toHaveAttribute("data-vc-state", "error");
    expect(container.querySelector('[data-vc-slot="error"]')).toHaveTextContent("Upload failed");
    expect(container.querySelector('[data-vc-slot="retry"]')).toBeInTheDocument();
  });
});
