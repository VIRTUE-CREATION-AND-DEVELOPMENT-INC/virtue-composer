"use client";

import { useState } from "react";
import {
  ColorPicker,
  EditableList,
  Field,
  Input,
  MentionInput,
  RatingInput,
  ResizablePanels,
  SelectableCardGroup,
  TransferList,
  Wizard,
} from "@/components/composer";
import { Demo } from "./showcase";

const planOptions = [
  { value: "starter", label: "Starter", description: "A focused foundation for a small team.", trailing: "$24" },
  { value: "studio", label: "Studio", description: "Shared workflows, review, and publishing.", trailing: "$68" },
  { value: "enterprise", label: "Enterprise", description: "Custom controls and support.", trailing: "Talk to us", disabled: true },
];

export default function PhaseFiveShowcase() {
  const [plan, setPlan] = useState("studio");
  const [workspaceName, setWorkspaceName] = useState("");
  const [reviewers, setReviewers] = useState(["maya"]);
  const [accent, setAccent] = useState("#0f6b5b");
  const [rating, setRating] = useState(4);
  const [comment, setComment] = useState("Thanks @Maya ");

  return <>
    <Demo id="selectable-card-group" title="Selectable Card Group" detail="Radio and checkbox semantics power selectable surfaces while projects own the card treatment." phase="5A">
      <SelectableCardGroup
        label="Workspace plan"
        description="Choose the plan that matches this launch."
        items={planOptions}
        value={plan}
        onValueChange={setPlan}
        name="workspacePlan"
        required
      />
      <p className="fixture-value">Selected plan: {plan}</p>
    </Demo>

    <Demo id="resizable-panels" title="Resizable Panels" detail="Pointer and keyboard resizing, bounds, orientation, and collapse behavior share one project-stylable split view." phase="5A">
      <ResizablePanels
        className="resizable-panels-demo"
        ariaLabel="Project explorer"
        defaultValue={[38, 62]}
        panels={[
          { id: "projects", label: "Projects", minSize: 20, collapsible: true, content: <div className="panel-demo"><p className="eyebrow">Projects</p><strong>Atlas</strong><span>Northstar</span><span>Harbor</span></div> },
          { id: "details", label: "Project details", minSize: 35, content: <div className="panel-demo"><p className="eyebrow">Selected project</p><h3>Atlas</h3><p>Foundation components for internal publishing tools.</p></div> },
        ]}
      />
      <p className="fixture-value">Use arrow keys, Home, or End on the divider. Press Enter to collapse or restore Projects.</p>
    </Demo>

    <Demo id="wizard" title="Wizard" detail="Stepper progress, validation, async completion, focus movement, and project-owned form content compose into one workflow." phase="5A">
      <Wizard
        className="wizard-demo"
        ariaLabel="Workspace setup"
        steps={[
          {
            id: "workspace",
            title: "Workspace",
            description: "Name the workspace",
            validate: () => workspaceName.trim() ? undefined : "Enter a workspace name to continue.",
            content: <Field label="Workspace name" description="Visible to everyone on the team."><Input value={workspaceName} onChange={(event) => setWorkspaceName(event.currentTarget.value)} placeholder="Atlas" /></Field>,
          },
          { id: "access", title: "Access", description: "Set collaboration", content: <div><h3>Invite collaborators</h3><p>Invitations can also be sent after setup.</p></div> },
          { id: "review", title: "Review", description: "Confirm settings", content: <div><h3>Ready to create</h3><p>Your workspace and access settings are ready for review.</p></div> },
        ]}
        onComplete={() => undefined}
      />
    </Demo>

    <Demo id="transfer-list" title="Transfer List" detail="Searchable dual lists coordinate assignment, ordering, keyboard selection, and repeated form values." phase="5B">
      <TransferList label="Project reviewers" description="Assign people who can approve this release." items={[{ value: "maya", label: "Maya Chen", description: "Design systems" }, { value: "jon", label: "Jon Bell", description: "Platform" }, { value: "ari", label: "Ari Lane", description: "Operations" }, { value: "lee", label: "Lee Park", description: "External reviewer", disabled: true }]} value={reviewers} onValueChange={setReviewers} name="reviewers" />
      <p className="fixture-value">Assigned: {reviewers.join(", ") || "none"}</p>
    </Demo>

    <Demo id="color-picker" title="Color Picker" detail="Native color entry, validated hex values, presets, and form serialization share one labeled field." phase="5B">
      <ColorPicker label="Brand accent" description="Used for active and selected states." value={accent} onValueChange={setAccent} presets={[{ value: "#0f6b5b", label: "Forest" }, { value: "#345995", label: "Ocean" }, { value: "#b84a62", label: "Rose" }]} name="accent" />
      <p className="fixture-value">Selected color: {accent}</p>
    </Demo>

    <Demo id="rating-input" title="Rating Input" detail="A compact rating preserves radio-group semantics, clear behavior, read-only display, and form submission." phase="5B">
      <RatingInput label="Release confidence" value={rating} onValueChange={setRating} allowClear name="confidence" />
    </Demo>

    <Demo id="mention-input" title="Mention Input" detail="Textarea composition gains searchable suggestions, keyboard selection, and stable mention identifiers." phase="5B">
      <MentionInput label="Review comment" value={comment} onValueChange={setComment} placeholder="Type @ to mention a collaborator" items={[{ id: "maya", label: "Maya Chen", value: "Maya", description: "Design systems" }, { id: "jon", label: "Jon Bell", value: "Jon", description: "Platform" }, { id: "ari", label: "Ari Lane", value: "Ari", description: "Operations" }]} />
    </Demo>

    <Demo id="editable-list" title="Editable List" detail="Repeatable records support add, edit, async validation, save errors, removal, reordering, and focus restoration." phase="5B">
      <EditableList label="Release checklist" defaultItems={[{ id: "brief", value: "Approve launch brief", metadata: "Required" }, { id: "assets", value: "Confirm campaign assets" }]} createItem={() => ({ id: `check-${Date.now()}`, value: "New checklist item" })} validate={(value) => value.trim() ? undefined : "Enter a checklist item."} minItems={1} maxItems={6} />
    </Demo>
  </>;
}
