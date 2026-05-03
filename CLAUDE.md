# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev          # watch mode (esbuild, no type checking)
pnpm build        # type check (tsc -noEmit) then esbuild production bundle
pnpm lint         # currently a no-op placeholder
pnpm lint:fix     # currently a no-op placeholder
```

There is no test suite. The build output is `main.js` in the repo root (consumed directly by Obsidian).

## Architecture

This plugin extends Obsidian's native **Workspaces** core plugin. It requires that core plugin to be enabled; `Utils.isNativePluginEnabled` guards all workspace operations.

### Monkey-patching strategy

`src/main.ts` uses `monkey-around` to wrap three methods on `WorkspacePluginInstance`:

- `saveWorkspace` → emits `workspace-save`
- `deleteWorkspace` → emits `workspace-delete`
- `loadWorkspace` → emits `workspace-load` (also intercepts mode loads and applies file overrides)

All plugin logic is driven by these custom events registered in `registerEventHandlers()`.

### Workspace Modes

Modes are **regular Obsidian workspaces** stored in the same `workspaces` map, distinguished by a `mode:` prefix in their name (e.g. `"Mode: Writing"`). `Utils.isMode(name)` checks for this prefix. When the native plugin "loads" a mode name, the monkey-patched `loadWorkspace` intercepts it, keeps the current layout, and only swaps Obsidian's appearance/editor settings.

### Per-workspace metadata

Each workspace object in the native plugin's `workspaces` map stores plugin-specific data under the key `"workspaces-plus:settings-v1"` (constant `SETTINGS_ATTR` in `utils.ts` and both modal files). This includes: `mode`, `description`, `fileOverrides`, `explorerFoldState`, `saveSidebar`.

### File overrides

Per-pane file substitutions configured in settings. On workspace load, `Utils.applyFileOverrides()` resolves template strings (via `renderTemplateString` — supports `{{date}}`, `{{time}}`, relative math) and periodic-note paths before injecting them into the workspace layout tree.

### Key source files

| File | Purpose |
|---|---|
| `src/main.ts` | Plugin entry point, event wiring, settings lifecycle, status bar |
| `src/utils.ts` | Workspace/mode helpers, file-override resolution, template rendering |
| `src/settings.ts` | `WorkspacesPlusSettings` type, defaults, settings tab UI |
| `src/workspaceModal.ts` | Fuzzy workspace switcher modal |
| `src/modeModal.ts` | Fuzzy mode switcher modal |
| `src/obsidian.d.ts` | Type augmentations for undocumented Obsidian internals |
