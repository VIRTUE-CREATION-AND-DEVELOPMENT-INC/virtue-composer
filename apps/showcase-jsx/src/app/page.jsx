import { componentRegistry } from "@virtuecreation/composer-registry";
import Showcase from "./showcase";

export default function Home() {
  return <Showcase components={componentRegistry} />;
}
