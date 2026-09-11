# Girls Inc. PDF Workbench

A static, client-side PDF utility branded for **Girls Inc. of Columbus & Phenix-Russell** and designed for GitHub Pages.

## Current features

- Upload one or multiple PDF files
- View every page as an individual thumbnail
- Drag and drop pages to rearrange the export order
- Combine pages from multiple PDFs
- Select individual pages
- Rotate pages left/right
- Remove pages before export
- Download the arranged PDF
- Extract selected pages into one PDF
- Split selected pages into individual PDFs packaged as a ZIP
- Split by custom page ranges such as `1-3; 4-6; 7,9,11-13`
- **Filename prompt before every download/export**
- No server-side PDF upload or storage

## Filename behavior

Every export opens a branded filename dialog before the file is created:

1. **Download arranged PDF** → prompts for a `.pdf` filename
2. **Download selected pages** → prompts for a `.pdf` filename
3. **Download selected pages as ZIP** → prompts for a `.zip` filename
4. **Download range PDFs as ZIP** → prompts for a `.zip` filename

The extension is displayed separately and added automatically. Invalid Windows/macOS filename characters are replaced safely.

For ZIP exports, the chosen ZIP base name is also used to name the PDF files inside the ZIP.

## Girls Inc. branding

The interface uses the Girls Inc. brand palette:

- Girls Inc. Red — `#ED1849`
- White — `#FFFFFF`
- PMS 430 Gray — `#949CA1`
- Black — `#000000`
- Cranberry — `#920526`
- Pacific Blue — `#009FB7`
- Saffron — `#FF9C33`
- Electric Lemon — `#EEFF41`

The page header identifies **Girls Inc. of Columbus & Phenix-Russell**, and the interface includes a Strong • Smart • Bold brand treatment.

## Updating an existing GitHub repository

If the original PDF Workbench is already deployed, replace these files in the repository root:

- `index.html`
- `styles.css`
- `app.js`
- `README.md` (recommended, but not required for the app itself)

### Easiest update method on GitHub.com

1. Open the repository.
2. Open `index.html`.
3. Choose the pencil/edit button.
4. Replace the entire file contents with the new `index.html` and commit the change.
5. Repeat for `styles.css` and `app.js`.
6. Optionally replace `README.md` as well.
7. GitHub Pages will redeploy automatically after the commits reach the branch configured under **Settings → Pages**.

### Easier method when replacing all files

1. Download and unzip the updated package.
2. In the GitHub repository, choose **Add file → Upload files**.
3. Drag the updated `index.html`, `styles.css`, `app.js`, and `README.md` into the upload area.
4. GitHub will warn that files with those names already exist; the new versions will replace them in the commit.
5. Add a commit message such as `Add filename prompts and Girls Inc branding`.
6. Commit directly to `main` (or merge the update into the branch used by GitHub Pages).
7. Open **Settings → Pages** if needed to confirm the site is still deploying from the correct branch and `/ (root)` folder.

## Privacy model

PDFs are processed locally in the browser. This project does not include any backend or upload endpoint. The JavaScript libraries are loaded from jsDelivr CDN, so an internet connection is required to load the app libraries unless they are later self-hosted inside the repository.

## Libraries

- Mozilla PDF.js — page rendering
- pdf-lib — PDF reconstruction and rotation
- SortableJS — drag-and-drop rearranging
- JSZip — packaging split PDFs into ZIP files

## Limits / browser notes

Very large PDFs can consume substantial browser memory because pages are rendered and source files remain loaded in memory. For ordinary office PDFs, reports, forms, and multi-file assembly, this approach is practical and avoids hosted-service use limits.

## Affiliate logo asset

The header now uses `girls-inc-columbus-phenix-russell-logo.jpg`. Keep this image in the same folder as `index.html` when publishing to GitHub Pages.

