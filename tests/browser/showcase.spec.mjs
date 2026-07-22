import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`${viewport.name} showcase is responsive and accessible`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-vc-showcase-hydrated", "true");
    await expect(page.getByRole("heading", { level: 1, name: "Virtue Composer" })).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);

    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("dialog closes with Escape and returns focus", async ({ page }) => {
  await page.goto("/#dialog");
  await expect(page.locator("html")).toHaveAttribute("data-vc-showcase-hydrated", "true");
  const trigger = page.getByRole("button", { name: "Open dialog" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Publish revision?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-vc-slot="title"]')).toHaveText("Publish revision?");
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("date pickers open as modal dialogs", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#date-picker");

  const dateTrigger = page.getByRole("button", { name: "Publish date" });
  await dateTrigger.click();
  const dateDialog = page.getByRole("dialog", { name: "Publish date" });
  await expect(dateDialog).toBeVisible();
  await expect(dateDialog.locator('[data-vc-component="calendar"]')).toHaveAttribute("data-vc-mode", "single");
  expect(await dateDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dateTrigger).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  const rangeTrigger = page.getByRole("button", { name: "Campaign window" });
  await rangeTrigger.click();
  const rangeDialog = page.getByRole("dialog", { name: "Campaign window" });
  await expect(rangeDialog).toBeVisible();
  await expect(rangeDialog.locator(".vc-calendar-month")).toHaveCount(2);
  await expect(rangeDialog.locator(".vc-calendar-months")).toHaveCSS("flex-direction", "column");
  expect(await rangeDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Shift+Tab");
  expect(await rangeDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);

  const results = await new AxeBuilder({ page })
    .include(".vc-date-range-picker-dialog")
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);

  await rangeDialog.getByRole("button", { name: /Saturday, July 18th, 2026/ }).click();
  await expect(rangeDialog).toBeVisible();
  await rangeDialog.getByRole("button", { name: /Monday, July 20th, 2026/ }).click();
  await expect(rangeDialog).toBeHidden();
  await expect(rangeTrigger).toBeFocused();
  await expect(rangeTrigger).toContainText(/18.*20/);
});

test("component structure and control spacing stay consistent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/#stepper");

  const horizontal = page.getByRole("navigation", { name: "Horizontal publishing progress" });
  const vertical = page.getByRole("navigation", { name: "Vertical publishing progress" });
  await expect(horizontal).toHaveAttribute("data-vc-orientation", "horizontal");
  await expect(vertical).toHaveAttribute("data-vc-orientation", "vertical");
  await expect(horizontal.locator("[data-vc-stepper-connector]")).toHaveCount(3);
  await expect(vertical.locator("[data-vc-stepper-connector]")).toHaveCount(3);

  const horizontalMarkers = await horizontal.locator("[data-vc-stepper-marker]").evaluateAll((markers) => markers.map((marker) => marker.getBoundingClientRect().y));
  expect(new Set(horizontalMarkers.map(Math.round)).size).toBe(1);
  const verticalMarkers = await vertical.locator("[data-vc-stepper-marker]").evaluateAll((markers) => markers.map((marker) => marker.getBoundingClientRect()));
  expect(new Set(verticalMarkers.map((marker) => Math.round(marker.x))).size).toBe(1);
  expect(verticalMarkers[1].y).toBeGreaterThan(verticalMarkers[0].y);

  const toolbar = page.locator("[data-vc-editor-toolbar]");
  await expect(toolbar).toHaveCSS("justify-content", "flex-start");
  await expect(toolbar).toHaveCSS("gap", "7px");

  const inlineEdit = page.locator('[data-vc-component="inline-edit"]');
  await expect(inlineEdit.locator("[data-vc-inline-edit-view]")).toHaveCSS("justify-content", "space-between");
  await inlineEdit.getByRole("button", { name: "Edit Project title" }).click();
  await expect(inlineEdit.locator("[data-vc-inline-edit-field]")).toBeVisible();
  await expect(inlineEdit.locator("[data-vc-inline-edit-actions]")).toBeVisible();

  const dropdowns = [
    page.getByRole("combobox", { name: "Release channel" }).first(),
    page.getByRole("combobox", { name: "Project owner" }),
    page.getByRole("combobox", { name: "Contributors" }),
  ];
  for (const dropdown of dropdowns) {
    await expect(dropdown).toHaveCSS("min-height", "44px");
    await expect(dropdown).toHaveCSS("background-size", "16px");
  }

  const mediaTrigger = page.locator("[data-vc-media-picker-trigger]").first();
  await mediaTrigger.click();
  const mediaDialog = page.getByRole("dialog", { name: "Choose campaign media" });
  await expect(mediaDialog).toBeVisible();
  await mediaDialog.getByRole("option", { name: /Classroom discussion/ }).click();
  await expect(mediaDialog.getByRole("option", { name: /Classroom discussion/ })).toHaveAttribute("aria-selected", "true");
  const stacking = await page.evaluate(() => ({
    overlay: Number.parseInt(getComputedStyle(document.querySelector("[data-vc-media-picker-overlay]")).zIndex, 10),
    content: Number.parseInt(getComputedStyle(document.querySelector("[data-vc-media-picker-content]")).zIndex, 10),
  }));
  expect(stacking.content).toBeGreaterThan(stacking.overlay);
  const results = await new AxeBuilder({ page }).include("[data-vc-media-picker-content]").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
  await mediaDialog.getByRole("button", { name: "Done" }).click();
  await expect(mediaTrigger).toBeFocused();

  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("calendar keeps a fluid seven-column grid", async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/#calendar");
    const calendar = page.locator('[data-vc-component="calendar"]');
    await expect(calendar).toBeVisible();
    await expect(calendar.locator(".vc-calendar-selected .vc-calendar-day-button")).toHaveText("18");
    await expect(calendar.locator(".vc-calendar-week").first().locator(".vc-calendar-day")).toHaveCount(7);

    const overflow = await calendar.evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  }
});

test("scheduler assigns colliding events to separate lanes", async ({ page }) => {
  await page.goto("/#scheduler");
  const events = page.locator("[data-vc-scheduler-event]");
  await expect(events).toHaveCount(3);
  const [first, second] = await Promise.all([events.nth(0).boundingBox(), events.nth(1).boundingBox()]);

  expect(first).not.toBeNull();
  expect(second).not.toBeNull();
  expect(first.x + first.width <= second.x || second.x + second.width <= first.x).toBe(true);
  await expect(page.locator("[data-vc-scheduler-now]")).toBeVisible();
});

test("data grid columns resize from the keyboard", async ({ page }) => {
  await page.goto("/#data-grid");
  const resizer = page.getByRole("separator", { name: "Resize project column" });
  const before = Number(await resizer.getAttribute("aria-valuenow"));
  await resizer.focus();
  await page.keyboard.press("ArrowRight");
  await expect(resizer).toHaveAttribute("aria-valuenow", String(before + 10));
});

test("empty Kanban columns remain visible drop targets", async ({ page }) => {
  await page.goto("/#kanban-board");
  const emptyColumn = page.locator('[data-vc-kanban-column][data-vc-state="empty"]');
  await expect(emptyColumn).toBeVisible();
  await expect(emptyColumn).toContainText("Drop items here");
});

test("image gallery exposes selection state", async ({ page }) => {
  await page.goto("/#image-gallery");
  const gallery = page.locator('[data-vc-component="image-gallery"]');
  await expect(gallery).toHaveAttribute("data-vc-selected-id", "campus");
  await page.getByRole("button", { name: "Show Students in a classroom discussion" }).click();
  await expect(gallery).toHaveAttribute("data-vc-selected-id", "classroom");
});
