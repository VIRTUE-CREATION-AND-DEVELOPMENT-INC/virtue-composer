const image = (alt) => ({
  src: "/composition-placeholder.svg",
  alt,
  width: 1200,
  height: 800,
});

export const sampleProps = {
  "faq-split-accordion": {
    description: "Clear answers remove friction while a direct support path stays close at hand.",
    items: [
      { question: "How quickly can we begin?", answer: "Most projects begin with a focused discovery session and a shared delivery outline." },
      { question: "Can the scope change?", answer: "Yes. The structure is designed to adapt as priorities and evidence become clearer." },
      { question: "What happens after launch?", answer: "Ongoing support can cover iteration, measurement, content, and operational handoff." },
    ],
    supportAction: { href: "#sandbox-contact", label: "Talk with the team" },
  },
  "faq-stacked-list": {
    description: "Short answers remain visible so readers can compare them without opening controls.",
    items: [
      { question: "Who is this for?", answer: "Teams that need a flexible baseline without inheriting someone else’s visual identity." },
      { question: "What can be changed?", answer: "Copy, layout, media, styling, and project behavior remain completely project-owned." },
      { question: "What stays shared?", answer: "Behavioral primitives, accessibility contracts, and structural guidance." },
    ],
  },
  "services-icon-grid": {
    description: "Equal-weight capabilities make the offer easy to scan.",
    items: [
      { icon: "01", title: "Strategy", description: "Clarify the audience, desired outcome, and constraints before implementation.", href: "#strategy" },
      { icon: "02", title: "Design", description: "Shape a visual system around real content and interaction requirements.", href: "#design" },
      { icon: "03", title: "Delivery", description: "Build, verify, launch, and leave the project ready for iteration.", href: "#delivery" },
    ],
  },
  "services-media-grid": {
    description: "Visual context helps visitors understand the shape and outcome of each service.",
    items: [
      { title: "Focused foundations", description: "A durable structure for a new site or product direction.", image: image("Abstract shapes representing a project foundation"), href: "#foundations" },
      { title: "Growth iterations", description: "Measured improvements to content, journeys, and conversion paths.", image: image("Abstract shapes representing measured growth"), href: "#growth" },
    ],
  },
  "process-numbered-steps": {
    description: "A concise sequence sets expectations without pretending every project is identical.",
    steps: [
      { title: "Frame", description: "Define the outcome, audience, and evidence." },
      { title: "Compose", description: "Arrange the right structural patterns." },
      { title: "Adapt", description: "Fit the content, behavior, and visual system." },
      { title: "Verify", description: "Test responsive behavior, accessibility, and delivery." },
    ],
  },
  "timeline-alternating-media": {
    description: "Milestones create a readable narrative without hiding chronological order.",
    entries: [
      { label: "Foundation", title: "The first shared system", description: "Repeated project patterns became a reusable behavioral foundation.", image: image("Abstract visual for the foundation milestone") },
      { label: "Evidence", title: "The portfolio shaped the catalog", description: "Real sites revealed which arrangements were broadly reusable.", image: image("Abstract visual for the evidence milestone") },
      { label: "Composition", title: "Wireframes became adaptable code", description: "Natural-language selection now leads to copyable project baselines.", image: image("Abstract visual for the composition milestone") },
    ],
  },
  "proof-metric-strip": {
    title: "Evidence at a useful scale",
    metrics: [
      { value: "34", label: "Composition catalog", note: "Project-owned wireframes" },
      { value: "13", label: "Active apps reviewed", note: "Primary portfolio evidence" },
      { value: "3", label: "Page blueprints", note: "Adaptable starting flows" },
    ],
  },
  "testimonials-editorial-list": {
    description: "Detailed quotes carry context, attribution, and a concrete outcome.",
    items: [
      { quote: "We started from a clear structure and still ended with something that felt entirely ours.", name: "Maya Chen", role: "Studio director", outcome: "Launched in six weeks" },
      { quote: "The baseline removed repetitive decisions without narrowing the design direction.", name: "Jon Bell", role: "Product lead", outcome: "Reduced rework across three routes" },
    ],
  },
  "partners-logo-wall": {
    description: "Text marks keep this wireframe neutral while preserving the intended relationship structure.",
    items: [
      { name: "Northstar", mark: "NORTHSTAR", href: "#northstar" },
      { name: "Harbor", mark: "HARBOR", href: "#harbor" },
      { name: "Fieldwork", mark: "FIELDWORK", href: "#fieldwork" },
      { name: "Common", mark: "COMMON", href: "#common" },
    ],
  },
  "gallery-featured-grid": {
    description: "A selected image leads while the full collection remains keyboard accessible.",
    images: [
      { id: "one", ...image("Layered green forms in the featured composition"), caption: "Featured direction" },
      { id: "two", ...image("Layered green forms in the second composition"), caption: "Supporting direction" },
      { id: "three", ...image("Layered green forms in the third composition"), caption: "Alternate direction" },
    ],
  },
  "stories-featured-plus-grid": {
    description: "One lead story establishes priority before the supporting archive.",
    featured: { meta: "Case study · 8 min", title: "Building a baseline without prescribing the finish", description: "How structural reuse and project ownership can reinforce each other.", image: image("Abstract media for the featured story"), href: "#featured-story" },
    items: [
      { meta: "Field note · 4 min", title: "What repeated across thirteen sites", description: "Patterns that survived changes in audience, brand, and business model.", image: image("Abstract media for the first supporting story"), href: "#field-note" },
      { meta: "Guide · 6 min", title: "From description to composition", description: "How selection metadata helps an agent choose a useful starting point.", image: image("Abstract media for the second supporting story"), href: "#guide" },
    ],
  },
  "people-profile-grid": {
    description: "Profiles keep names, roles, portraits, and useful context together.",
    people: [
      { name: "Ari Lane", role: "Design systems", bio: "Connects reusable structure to expressive project design.", image: image("Portrait placeholder for Ari Lane") },
      { name: "Maya Chen", role: "Content strategy", bio: "Shapes the information hierarchy around audience needs.", image: image("Portrait placeholder for Maya Chen") },
      { name: "Jon Bell", role: "Frontend engineering", bio: "Builds accessible interactions and durable delivery systems.", image: image("Portrait placeholder for Jon Bell") },
    ],
  },
  "events-featured-list": {
    description: "Visitors can understand what is happening, when, where, and what to do next.",
    featured: { dateTime: "2026-09-12T18:00:00-04:00", dateLabel: "September 12", title: "Community build night", description: "A practical evening for turning an idea into a working public prototype.", timeLabel: "6:00 PM", location: "Studio Hall", href: "#build-night" },
    upcoming: [
      { dateTime: "2026-09-28T10:00:00-04:00", dateLabel: "September 28", title: "Open workshop", description: "Bring a page or flow that needs a stronger structure.", timeLabel: "10:00 AM", location: "Online", href: "#workshop" },
      { dateTime: "2026-10-08T19:00:00-04:00", dateLabel: "October 8", title: "Portfolio review", description: "A focused review of story, hierarchy, and presentation.", timeLabel: "7:00 PM", location: "Main Library", href: "#portfolio-review" },
    ],
  },
  "newsletter-inline-band": {
    description: "A short monthly note about new patterns, evidence, and releases.",
  },
  "announcement-dismissible": {
    title: "Composition sandbox is open",
    message: "Explore the initial catalog and copy a wireframe into a Composer project.",
    action: { href: "#catalog", label: "Browse catalog" },
  },
  "participation-pathways": {
    description: "Different levels of commitment remain distinct and easy to compare.",
    pathways: [
      { title: "Join", description: "Become part of the ongoing program and contribute regularly.", href: "#join", actionLabel: "Join the program" },
      { title: "Volunteer", description: "Offer time or expertise around a specific initiative.", href: "#volunteer", actionLabel: "See opportunities" },
      { title: "Support", description: "Fund access, materials, and long-term delivery.", href: "#support", actionLabel: "Support the work" },
    ],
  },
  "location-contact-cards": {
    description: "Addresses and opening hours are grouped around the action a visitor needs.",
    locations: [
      { name: "Downtown studio", address: ["140 King Street", "Toronto, ON"], hours: [{ label: "Mon–Fri", value: "9–6" }, { label: "Saturday", value: "10–4" }], href: "#downtown" },
      { name: "East workshop", address: ["28 Broadview Avenue", "Toronto, ON"], hours: [{ label: "Tue–Fri", value: "10–7" }, { label: "Sunday", value: "11–3" }], href: "#east" },
    ],
  },
  "contact-form-split": {
    description: "Share a little context and the right person will respond within two business days.",
    contactMethods: [
      { label: "Email", value: "hello@example.com", href: "mailto:hello@example.com" },
      { label: "Phone", value: "+1 416 555 0142", href: "tel:+14165550142" },
    ],
  },
  "content-media-split": {
    eyebrow: "Built to adapt",
    title: "One structure, many useful stories",
    description: "Use the same arrangement for an about section, program overview, feature explanation, place introduction, or focused service narrative—then let the project own its content and visual direction.",
    image: image("Abstract landscape supporting a flexible text and media story"),
    caption: "Supporting media should add context, not repeat the heading.",
    action: { href: "#content-split", label: "Explore the approach" },
  },
  "content-media-stacked": {
    eyebrow: "In focus",
    title: "Give the setting room before explaining the detail",
    description: "A wide image can establish mood, place, or project context before the supporting copy and next action.",
    image: image("Wide abstract composition establishing an editorial setting"),
    caption: "Featured media with an optional project-owned caption.",
    action: { href: "#content-stacked", label: "Read the full story" },
  },
  "confirmation-next-actions": {
    description: "We sent a confirmation and the team will respond within two business days.",
    reference: "VC-2048",
    actions: [
      { href: "#summary", label: "Review submission" },
      { href: "/", label: "Return to library" },
    ],
  },
  "product-collection": {
    description: "A neutral commerce grid keeps product hierarchy visible without prescribing a brand finish.",
    products: [
      { id: "field-bag", name: "Field bag", description: "A compact everyday carry.", priceMinor: 12800, currency: "CAD", badge: "New", href: "#field-bag", image: image("Product placeholder for the field bag") },
      { id: "desk-tray", name: "Desk tray", description: "A simple home for daily tools.", priceMinor: 6400, currency: "CAD", href: "#desk-tray", image: image("Product placeholder for the desk tray") },
      { id: "travel-case", name: "Travel case", description: "Organized storage on the move.", priceMinor: 9200, currency: "CAD", href: "#travel-case", image: image("Product placeholder for the travel case") },
    ],
  },
  "product-detail-gallery": {
    title: "Field bag",
    description: "A configurable product detail baseline with enough structure for a confident purchase decision.",
    priceMinor: 12800,
    currency: "CAD",
    images: [
      { id: "front", ...image("Front view of the field bag"), caption: "Front view" },
      { id: "inside", ...image("Interior view of the field bag"), caption: "Interior" },
      { id: "detail", ...image("Material detail of the field bag"), caption: "Material detail" },
    ],
    options: [
      { value: "black", label: "Black", description: "Core color" },
      { value: "stone", label: "Stone", description: "Seasonal color" },
      { value: "navy", label: "Navy", description: "Returning soon", available: false },
    ],
  },
  "cart-checkout-summary": {
    items: [
      { id: "field-bag", name: "Field bag", details: "Black · Standard", priceMinor: 12800, quantity: 1, image: image("Field bag cart thumbnail") },
      { id: "desk-tray", name: "Desk tray", details: "Stone", priceMinor: 6400, quantity: 2, image: image("Desk tray cart thumbnail") },
    ],
    rows: [
      { id: "subtotal", label: "Subtotal", valueMinor: 25600 },
      { id: "shipping", label: "Shipping", valueMinor: 1200 },
    ],
    totalMinor: 26800,
    currency: "CAD",
  },
  "multi-step-selection-flow": {
    description: "A description-led selector breaks a recommendation into choices that remain easy to revise.",
    steps: [
      { id: "goal", title: "Goal", description: "What should improve?", prompt: "Choose your primary goal", options: [
        { value: "launch", label: "Launch something new", description: "Create a clear starting structure." },
        { value: "improve", label: "Improve an existing journey", description: "Find and remove friction." },
      ] },
      { id: "audience", title: "Audience", description: "Who is it for?", prompt: "Choose the main audience", options: [
        { value: "customers", label: "Customers", description: "People evaluating or buying." },
        { value: "members", label: "Members", description: "People participating over time." },
        { value: "team", label: "Internal team", description: "People operating the system." },
      ] },
      { id: "needs", title: "Needs", description: "What must it do?", prompt: "Choose all required capabilities", multiple: true, options: [
        { value: "content", label: "Explain", description: "Present a clear narrative." },
        { value: "capture", label: "Capture", description: "Collect useful information." },
        { value: "transact", label: "Transact", description: "Support a purchase or booking." },
      ] },
    ],
  },
  "estimate-flow": {
    description: "Scope and timing choices lead to a qualified planning range instead of a false fixed quote.",
    serviceOptions: [
      { value: "strategy", label: "Strategy", description: "Audience, content, and direction.", trailing: "$" },
      { value: "design", label: "Design", description: "Interface and visual system.", trailing: "$$" },
      { value: "build", label: "Build", description: "Production implementation.", trailing: "$$$" },
    ],
    timingOptions: [
      { value: "standard", label: "Standard", description: "A balanced delivery pace." },
      { value: "priority", label: "Priority", description: "A compressed schedule." },
    ],
    estimate: { minimumMinor: 1200000, maximumMinor: 2200000, currency: "CAD" },
  },
  "booking-flow": {
    description: "The same staged baseline can support consultations, appointments, repairs, tours, or classes.",
    services: [
      { value: "consultation", label: "Consultation", description: "45 minutes · Online", trailing: "$80" },
      { value: "workshop", label: "Working session", description: "90 minutes · Studio", trailing: "$180" },
    ],
    times: [
      { value: "0900", label: "9:00 AM" },
      { value: "1130", label: "11:30 AM" },
      { value: "1400", label: "2:00 PM" },
      { value: "1630", label: "4:30 PM" },
    ],
  },
  "filtered-results-master-detail": {
    description: "Search, filters, results, and detail remain connected within one adaptable directory baseline.",
    facets: [
      { id: "type", label: "Type", options: [{ value: "program", label: "Programs", count: 3 }, { value: "service", label: "Services", count: 5 }] },
      { id: "format", label: "Format", options: [{ value: "online", label: "Online", count: 4 }, { value: "in-person", label: "In person", count: 4 }] },
    ],
    results: [
      { id: "foundation", title: "Foundation program", description: "A structured starting point for new teams.", metadata: "Program · Online", detail: "Build shared context, define the work, and leave with a usable delivery outline.", facets: { type: ["program"], format: ["online"] } },
      { id: "review", title: "Interface review", description: "A focused review of an existing journey.", metadata: "Service · Online", detail: "Identify hierarchy, interaction, accessibility, and implementation improvements.", facets: { type: ["service"], format: ["online"] } },
      { id: "studio", title: "Studio session", description: "A collaborative in-person working block.", metadata: "Service · In person", detail: "Bring a concrete page or workflow and work through it with the team.", facets: { type: ["service"], format: ["in-person"] } },
    ],
  },
  "auth-shell": {
    description: "Account access stays focused, legible, and connected to recovery and creation paths.",
  },
  "dashboard-overview": {
    description: "A calm application overview prioritizes status, movement, and recent work.",
    metrics: [
      { label: "Active projects", value: "24", change: "+3 this month" },
      { label: "Open tasks", value: "86", change: "12 due soon" },
      { label: "Completion", value: "78%", change: "+6 points" },
      { label: "Response time", value: "2.4h", change: "Within target" },
    ],
    chart: [
      { label: "Mon", value: 18 },
      { label: "Tue", value: 32 },
      { label: "Wed", value: 25 },
      { label: "Thu", value: 46 },
      { label: "Fri", value: 38 },
    ],
    rows: [
      { id: "one", name: "Homepage review", status: "In progress", value: "8 tasks" },
      { id: "two", name: "Content migration", status: "Ready", value: "24 items" },
      { id: "three", name: "Launch checklist", status: "Blocked", value: "3 issues" },
    ],
  },
  "resource-index": {
    description: "Search, selection, sorting, and creation form a reusable operational index.",
    rows: [
      { id: "one", name: "Homepage", type: "Page", status: "Published", updated: "2026-07-22" },
      { id: "two", name: "Summer campaign", type: "Campaign", status: "Draft", updated: "2026-07-21" },
      { id: "three", name: "Welcome email", type: "Message", status: "Review", updated: "2026-07-19" },
      { id: "four", name: "Member guide", type: "Document", status: "Published", updated: "2026-07-16" },
    ],
  },
  "resource-editor-detail": {
    title: "Edit summer campaign",
    description: "Primary content and secondary record context stay together without crowding the editor.",
    fields: [
      { type: "text", name: "title", label: "Title", required: true, defaultValue: "Summer campaign" },
      { type: "textarea", name: "summary", label: "Summary", rows: 5, defaultValue: "A concise campaign summary." },
      { type: "select", name: "status", label: "Status", defaultValue: "draft", options: [{ value: "draft", label: "Draft" }, { value: "review", label: "In review" }, { value: "published", label: "Published" }] },
    ],
    metadata: [
      { label: "Owner", value: "Maya Chen" },
      { label: "Created", value: "July 12, 2026" },
      { label: "Last updated", value: "July 22, 2026" },
      { label: "Identifier", value: "campaign-2048" },
    ],
  },
  "horizontal-story": {
    description: "Ordered scroll-snapping scenes support intentional horizontal narratives without turning the pattern into a generic carousel.",
    chapters: [
      { id: "signal", title: "Notice the signal", description: "Begin with the moment that changes the reader’s understanding.", image: image("Abstract scene representing the first signal") },
      { id: "shift", title: "Follow the shift", description: "Reveal how the situation changes through a focused second scene.", image: image("Abstract scene representing a shift") },
      { id: "result", title: "Arrive at the result", description: "End with the concrete outcome and a clear sense of what follows.", image: image("Abstract scene representing the result") },
    ],
  },
  "chaptered-presentation": {
    description: "Persistent anchor navigation makes a substantial story easy to scan, enter, and revisit.",
    chapters: [
      { id: "context", title: "Context", description: "Establish the situation, audience, and constraints before presenting the work.", image: image("Abstract presentation image for context") },
      { id: "approach", title: "Approach", description: "Explain the key decisions and how the system responded to real needs.", image: image("Abstract presentation image for approach") },
      { id: "outcome", title: "Outcome", description: "Show what changed, what was learned, and what should happen next.", image: image("Abstract presentation image for outcome") },
    ],
  },
};
