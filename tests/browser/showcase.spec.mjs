import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

for (const viewport of [
  { name: "small-mobile", width: 320, height: 720 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "compact-desktop", width: 1024, height: 768 },
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

for (const viewport of [
  { name: "small-mobile", width: 320, height: 720 },
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "compact-desktop", width: 1024, height: 768 },
  { name: "desktop", width: 1440, height: 900 },
]) {
  test(`${viewport.name} composition sandbox is responsive and accessible`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/sandbox");
    await expect(page.getByRole("heading", { level: 1, name: "Composition sandbox" })).toBeVisible();
    await expect(page.getByText("34 compositions match the current filters.")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("composition sandbox supports natural-language search, pack and family filtering, and blueprint previews", async ({ page }) => {
  await page.goto("/sandbox");
  const search = page.getByRole("searchbox", { name: "Search catalog" });
  await search.fill("impact statistics");
  await expect(page.getByText("1 compositions match the current filters.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proof metric strip" })).toBeVisible();
  await search.fill("");

  const family = page.getByRole("combobox", { name: "Composition family" });
  await family.selectOption("services");
  await expect(page.getByText("2 compositions match the current filters.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Services icon grid" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Services media grid" })).toBeVisible();
  await family.selectOption("content");
  await expect(page.getByText("2 compositions match the current filters.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Content media split" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Content media stacked" })).toBeVisible();
  await family.selectOption("contact");
  await expect(page.getByText("1 compositions match the current filters.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contact form split" })).toBeVisible();

  const pack = page.getByRole("combobox", { name: "Composition pack" });
  await pack.selectOption("guided-workflows");
  await expect(page.getByText("3 compositions match the current filters.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Multi-step selection flow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Estimate flow" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Booking flow" })).toBeVisible();

  await page.locator("[data-vc-segmented-item]", { hasText: "Blueprints" }).click();
  await expect(family).toBeDisabled();
  await expect(pack).toBeDisabled();
  await expect(page.getByText("3 blueprints match the current filters.")).toBeVisible();
  await search.fill("nonprofit");
  await expect(page.getByText("1 blueprints match the current filters.")).toBeVisible();
  const blueprint = page.locator('article[aria-labelledby="community-nonprofit-title"]');
  await expect(blueprint).toBeVisible();
  await expect(blueprint.locator("ol > li")).toHaveCount(6);
  await expect(blueprint.getByText("virtue-composer compose . --blueprint=community-nonprofit")).toBeVisible();
});

test("specialized composition examples expose their core interactions", async ({ page }) => {
  await page.goto("/sandbox");
  const pack = page.getByRole("combobox", { name: "Composition pack" });

  await pack.selectOption("commerce");
  const product = page.locator('article[aria-labelledby="product-detail-gallery-catalog-title"]');
  await expect(product.locator('[data-vc-component="image-gallery"]')).toHaveAttribute("data-vc-selected-id", "front");
  await product.getByRole("button", { name: "Show Interior view of the field bag" }).click();
  await expect(product.locator('[data-vc-component="image-gallery"]')).toHaveAttribute("data-vc-selected-id", "inside");
  await product.getByRole("radio", { name: /Stone/ }).check();
  await expect(product.getByRole("radio", { name: /Stone/ })).toBeChecked();

  await pack.selectOption("guided-workflows");
  const selection = page.locator('article[aria-labelledby="multi-step-selection-flow-catalog-title"]');
  await selection.getByRole("radio", { name: /Launch something new/ }).check();
  await selection.getByRole("button", { name: "Continue" }).click();
  await expect(selection.locator('[data-vc-component="wizard"]')).toHaveAttribute("data-vc-current-step", "audience");

  await pack.selectOption("search");
  const directory = page.locator('article[aria-labelledby="filtered-results-master-detail-catalog-title"]');
  await directory.getByRole("searchbox", { name: "Search results" }).fill("studio");
  await expect(directory.getByRole("status")).toHaveText("1 result");
  await expect(directory.getByRole("heading", { name: "Studio session" })).toBeVisible();

  await pack.selectOption("application");
  const resources = page.locator('article[aria-labelledby="resource-index-catalog-title"]');
  await resources.getByRole("searchbox", { name: "Search resources" }).fill("campaign");
  await resources.getByRole("button", { name: "Search", exact: true }).click();
  await expect(resources.locator('[data-vc-component="data-grid"]')).toBeVisible();
  await expect(resources.locator('[data-vc-component="data-grid"] tbody tr')).toHaveCount(1);
});

test("composition examples exercise disclosure, gallery, dismissal, and form behavior", async ({ page }) => {
  await page.goto("/sandbox");

  const faq = page.locator('article[aria-labelledby="faq-split-accordion-catalog-title"]');
  const question = faq.getByRole("button", { name: "How quickly can we begin?" });
  await question.click();
  await expect(faq.getByText("Most projects begin with a focused discovery session")).toBeVisible();

  const gallery = page.locator('article[aria-labelledby="gallery-featured-grid-catalog-title"]');
  const imageGallery = gallery.locator('[data-vc-component="image-gallery"]');
  await expect(imageGallery).toHaveAttribute("data-vc-selected-id", "one");
  await gallery.getByRole("button", { name: "Show Layered green forms in the second composition" }).click();
  await expect(imageGallery).toHaveAttribute("data-vc-selected-id", "two");

  const announcement = page.locator('article[aria-labelledby="announcement-dismissible-catalog-title"]');
  await announcement.getByRole("button", { name: "Dismiss announcement" }).click();
  await expect(announcement.getByText("Composition sandbox is open")).toBeHidden();

  const newsletter = page.locator('article[aria-labelledby="newsletter-inline-band-catalog-title"]');
  await newsletter.getByRole("textbox", { name: "Email address" }).fill("reader@example.com");
  await newsletter.getByRole("button", { name: "Subscribe" }).click();
  await expect(newsletter.getByRole("alert")).toContainText("Thanks for subscribing.");

  const contact = page.locator('article[aria-labelledby="contact-form-split-catalog-title"]');
  await contact.getByRole("textbox", { name: "Name" }).fill("Kaine");
  await contact.getByRole("textbox", { name: "Email address" }).fill("kaine@example.com");
  await contact.getByRole("textbox", { name: "Message" }).fill("I would like to discuss a new project.");
  await contact.getByRole("button", { name: "Send inquiry" }).click();
  await expect(contact.getByRole("alert")).toContainText("Thanks. Your inquiry has been received.");
});

test("library navigation supports search, keyboard access, and mobile discovery", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.keyboard.press("/");
  const search = page.getByRole("searchbox", { name: "Find a component" });
  await expect(search).toBeFocused();
  await search.fill("Date Range Picker");
  await expect(page.getByText("1 of 128 components")).toBeVisible();
  await page.getByRole("link", { name: "Date Range Picker" }).click();
  await expect(page).toHaveURL(/#date-range-picker$/);
  await search.fill("");
  const stability = page.getByRole("combobox", { name: "Stability" });
  await stability.selectOption("experimental");
  await expect(page.getByText("8 of 128 components")).toBeVisible();
  await stability.selectOption("all");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Library", exact: true }).click();
  const drawer = page.getByRole("dialog", { name: "Component library" });
  await expect(drawer).toBeVisible();
  const mobileSearch = withinDialogSearch(drawer);
  await mobileSearch.fill("Calendar");
  await drawer.getByRole("link", { name: "Calendar", exact: true }).click();
  await expect(drawer).toBeHidden();
  await expect(page).toHaveURL(/#calendar$/);
});

function withinDialogSearch(dialog) {
  return dialog.getByRole("searchbox", { name: "Find a component" });
}

test("showcase remains usable with RTL, reduced motion, forced colors, and 200 percent reflow", async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce", forcedColors: "active" });
  await page.goto("/#date-range-picker");
  await page.evaluate(() => {
    document.documentElement.dir = "rtl";
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const trigger = page.getByRole("button", { name: "Campaign window" });
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Campaign window" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  const results = await new AxeBuilder({ page }).include(".vc-date-range-picker-dialog").withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(results.violations).toEqual([]);
});

test("high-risk visual references remain stable", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Canonical visual references use Chromium rendering.");
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/#calendar");
  await expect(page.locator("#calendar .fixture")).toHaveScreenshot("calendar-fixture.png", { animations: "disabled" });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/#date-range-picker");
  await page.getByRole("button", { name: "Campaign window" }).click();
  await expect(page.getByRole("dialog", { name: "Campaign window" })).toHaveScreenshot("date-range-dialog-mobile.png", {
    animations: "disabled",
    maxDiffPixels: 24,
  });
});

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
    expect(await dropdown.evaluate((element) => getComputedStyle(element).backgroundSize.split(" ")[0])).toBe("16px");
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
