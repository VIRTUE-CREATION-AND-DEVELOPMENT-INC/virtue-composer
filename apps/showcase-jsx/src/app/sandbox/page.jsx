import { blueprintRegistry, compositionRegistry } from "@virtuecreation/composer-registry";
import CompositionSandbox from "./CompositionSandbox";

export const metadata = {
  title: "Composition Sandbox · Virtue Composer",
  description: "Search, preview, and copy Virtue Composer project-owned composition wireframes.",
};

export default function SandboxPage() {
  return <CompositionSandbox compositions={compositionRegistry} blueprints={blueprintRegistry} />;
}
