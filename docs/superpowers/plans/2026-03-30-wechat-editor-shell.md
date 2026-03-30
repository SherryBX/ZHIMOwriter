# WeChat Markdown Editor Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first React + Vite + TypeScript shell for a WeChat official account Markdown editor with import, large editing area, and live preview.

**Architecture:** Use a single-page editor shell mounted from `src/App.tsx`. Keep article content as Markdown string state, parse it into lightweight preview nodes, and isolate import behavior, editor UI, and preview rendering behind focused components with CSS variables for future theming.

**Tech Stack:** React, Vite, TypeScript, CSS

---

## File Structure

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/data/mockMarkdown.ts`
- Create: `src/utils/markdown.ts`
- Create: `src/components/editor-shell/AppHeader.tsx`
- Create: `src/components/editor-shell/BlockLibrarySidebar.tsx`
- Create: `src/components/editor-shell/EditorWorkspace.tsx`
- Create: `src/components/editor-shell/PreviewPanel.tsx`
- Create: `src/components/editor-shell/PreviewPhone.tsx`
- Create: `src/styles/index.css`
- Modify: `src/App.test.tsx`

### Task 1: Scaffold the app

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`

- [ ] Step 1: Initialize a Vite React TypeScript app in the current directory.
- [ ] Step 2: Install dependencies and confirm the dev server can start.
- [ ] Step 3: Remove scaffold defaults that do not fit the editor shell.

### Task 2: Define the Markdown content model

**Files:**
- Create: `src/data/mockMarkdown.ts`
- Create: `src/utils/markdown.ts`

- [ ] Step 1: Add realistic starter Markdown content for a WeChat article.
- [ ] Step 2: Parse supported Markdown constructs into preview-friendly nodes.
- [ ] Step 3: Keep parsing scope intentionally small: headings, paragraphs, blockquotes, and unordered lists.

### Task 3: Build the editor shell components

**Files:**
- Create: `src/App.tsx`
- Create: `src/components/editor-shell/AppHeader.tsx`
- Create: `src/components/editor-shell/BlockLibrarySidebar.tsx`
- Create: `src/components/editor-shell/EditorWorkspace.tsx`
- Create: `src/components/editor-shell/PreviewPanel.tsx`
- Create: `src/components/editor-shell/PreviewPhone.tsx`
- Modify: `src/App.test.tsx`

- [ ] Step 1: Assemble the page-level editor shell from focused components.
- [ ] Step 2: Replace the middle card list with a large Markdown `textarea`.
- [ ] Step 3: Add a header import action that loads local `.md` or `.txt` content into editor state.
- [ ] Step 4: Render parsed Markdown in the preview area with a phone-style article frame.

### Task 4: Style the initial experience

**Files:**
- Create: `src/styles/index.css`

- [ ] Step 1: Add CSS variables for background, surface, border, text, accent, shadow, and spacing.
- [ ] Step 2: Increase the overall working area and reduce decorative roundness.
- [ ] Step 3: Style the middle area like a real Markdown writing surface rather than stacked content cards.
- [ ] Step 4: Add responsive behavior so the preview panel stacks on narrower screens.

### Task 5: Verify the shell

**Files:**
- Verify: entire project

- [ ] Step 1: Run the build command and confirm it succeeds.
- [ ] Step 2: Run the development server command long enough to confirm the app boots without immediate errors.
- [ ] Step 3: Check that the finished page contains the required four regions, a Markdown editor, import affordance, and synchronized preview content.

## Self-Review

- Spec coverage: the plan covers the approved single-page Markdown editor shell, import behavior, synchronized preview, and layout adjustments.
- Placeholder scan: no `TODO`, `TBD`, or implied steps remain.
- Type consistency: all references use a Markdown string source and a parsed preview-node rendering approach.
