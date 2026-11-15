# Girls Inc. PDF Workbench v5.4

## v5.4 improvements
- Source PDFs and their individual page cards now use a seven-color sequence: Blue, Yellow, Orange, Green, Red, Purple, Cyan. The sequence repeats from Blue for the eighth PDF. Colors stay assigned to the uploaded PDF when source cards are reordered.
- Hovering over a source PDF name shows its complete filename.
- The page preview now uses the available modal space and waits for layout before rendering, preventing the undersized first-open preview.

# Girls Inc. PDF Workbench — v5

A browser-based PDF arranging and splitting tool branded for Girls Inc. of Columbus & Phenix-Russell. PDF processing stays in the browser; the app does not upload document contents to a server.

## New in v5

### Whole-PDF workflow
- A **Source PDFs** strip appears above the individual page workspace.
- Drag source PDF cards left/right to reorder entire PDFs.
- Reordering a source PDF gathers its currently included pages back into a block while preserving the **current edited internal order** of those pages.
- Drag an entire source PDF from the Source PDFs strip directly into the individual page grid.
- A large **INSERT N-PAGE PDF HERE** marker shows the exact insertion point.
- Whole-PDF movement is a **MOVE**, not a duplicate/copy.
- Deleted pages stay deleted when a PDF is moved.

### Source PDF cards
- Compact by default.
- Use **Expand** to see view-only thumbnails of all original pages.
- Pages removed from the project are visibly marked as removed.
- Expanded thumbnails are reference-only; page editing remains in the main workspace.

### Better large-document editing
- Page drag-and-drop uses automatic scrolling near the browser edges.
- **Go to page #** jumps directly to a page and highlights it.
- **Move selected before/after page #** allows precise long-distance moves.
- Multiple selected pages move together and preserve their current relative order.

### Selection behavior
- Click = select one page.
- Ctrl+Click / Cmd+Click = add or remove individual pages from the selection.
- Shift+Click = select a continuous range from the most recent selection anchor.

### Undo / Redo
- Visible **Undo** and **Redo** buttons.
- Ctrl+Z / Cmd+Z = Undo.
- Ctrl+Y / Cmd+Y = Redo.
- Ctrl+Shift+Z / Cmd+Shift+Z = Redo.
- Undo/Redo covers page moves, whole-PDF moves, source-PDF reorder, deletion, rotation, bulk moves, and Reset Arrangement.
- Editing history is kept for up to 100 actions.

### Performance
- Page and source thumbnails use lazy rendering so large projects do not try to render every PDF page immediately.

### Reset vs Clear
- **Reset arrangement** restores all currently included pages to original upload/file order and original page order. Deleted pages remain deleted. Rotations are preserved.
- **Clear project** removes every loaded PDF and clears editing history.

## Existing functionality retained
- Upload multiple PDFs.
- Individual page thumbnails.
- Drag individual pages into a new order.
- Rotate pages individually or as a selection.
- Delete pages.
- Extract selected pages into one PDF.
- Split selected pages into individual PDFs inside a ZIP.
- Split by custom ranges.
- Custom filename dialog for all download operations.
- Girls Inc. of Columbus & Phenix-Russell branding and embedded logo.

## Update an existing GitHub Pages installation

1. Download and unzip the v5 package.
2. In your existing GitHub repository, replace these files in the repository root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md` (optional, but recommended)
3. Commit the changes. Example commit message:

   `Add whole-PDF arranging, navigator, undo-redo, and large-file improvements`

4. If GitHub Pages is already configured to deploy from the `main` branch and `/ (root)`, no Pages setting changes are needed.
5. After deployment completes, use **Ctrl+F5** on Windows to force-refresh the site if the old version is cached.

## Files

- `index.html` — application layout, embedded Girls Inc. logo, controls, templates, and dialogs.
- `styles.css` — Girls Inc. styling, source PDF strip, page workspace, insertion marker, and responsive layout.
- `app.js` — PDF loading, arranging, whole-document movement, undo/redo, selection, lazy rendering, splitting, and export logic.

## External browser libraries

The app loads these libraries from jsDelivr:
- PDF.js
- pdf-lib
- SortableJS
- JSZip

The PDF documents themselves are processed locally in the browser.

## v5.2 logo update
The header now uses `girls-inc-columbus-phenix-russell-logo-transparent.png`, a transparent-background version of the supplied affiliate logo. Keep this PNG in the same repository folder as `index.html`.


## Version 5.3 interface update

- The page arrangement workspace is now on the left, with the source PDF list in a vertical right-side panel.
- Source PDFs can be reordered top-to-bottom. The source panel scrolls vertically and auto-scrolls while dragging near its edges.
- Individual page thumbnails remain on the left and retain all existing selection, reorder, rotate, delete, move, undo/redo, split, and download behaviors.
- Click a page thumbnail to open a full-size page preview. Close the preview or use Previous/Next to browse pages, then return to the same arrangement.
- On narrow screens, the source PDF panel moves above the page workspace for usability.
- This is a layout and preview update; PDF processing remains local in the browser.
