# @virtuecreation/composer

The runtime package for Virtue Composer, a structural and behavioral component foundation for React 19 and Next.js 15 or newer.

Projects should import Composer through their generated local wrapper layer. Initialize that layer with the Composer CLI:

```bash
npx @virtuecreation/composer-cli init .
npm install
```

Application code then imports from the project alias:

```jsx
import { Button, Section } from "@/components/composer";
```

Composer owns component structure, behavior, accessibility, and layout semantics. The consuming project owns visual design, surfaces, dimensions, spacing, and typography.
