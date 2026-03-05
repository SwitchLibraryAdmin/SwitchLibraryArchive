# Compact Module List Design
Date: 2026-03-04

## Context

The SD Card Builder at `/builder/index.html` currently uses a verbose vertical list layout. Each module row shows: name, badges, full description text, and RAM cost — resulting in very few modules visible without scrolling. The goal is to fit significantly more modules on screen at once, inspired by Ninite.com's compact checkbox-grid approach.

## Design

### Module List Layout
- Each category section keeps its `<h2>` header
- Modules within a category render in a CSS grid: `grid-template-columns: 1fr 1fr`
- Each module item is a `<label>` containing: custom checkbox + module name only
- Descriptions are hidden from the list; set as `title` attribute on `<label>` for native browser tooltips on hover (no JS needed)
- Required/Recommended badges are retained as small inline indicators after the name (colored dot or micro-badge to avoid forcing line breaks)
- `last-in-group` border logic removed (irrelevant in grid layout)

### Spacing
- Row padding reduced from `14px` to `6px 10px`
- This alone doubles density; combined with 2-column layout gives ~4x more modules per viewport height

### RAM Display
- Remove per-module RAM spans from list rows entirely
- RAM cost already surfaces in the right sidebar when a module is selected — sufficient

### Responsive
- Grid becomes single-column at `max-width: 600px`

### What Stays the Same
- Right sidebar (RAM budget bar, selected list, build button)
- Search/filter logic
- Dark color scheme and CSS custom properties
- Backend integration
- Mobile bottom bar

## Files to Change

- `/builder/index.html` — only file; contains embedded CSS and JS
  - CSS: modify `.mod-row` padding, add `.mod-grid` class, adjust badge styles
  - JS `renderCatalog`: change module HTML template to remove description `<p>` and RAM `<span>`, add `title` attribute, wrap modules in grid container
