@AGENTS.md

## Hydration Rules

- Always add `suppressHydrationWarning` to `<html>` and `<body>` in `app/layout.tsx`. Browser extensions inject attributes (style, class, data-*) between SSR and hydration causing mismatches. This is the standard Next.js fix — it only suppresses the warning on that element, not its children.
