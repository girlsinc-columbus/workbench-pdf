# PDF Workbench

A static, client-side PDF utility designed for GitHub Pages.

## Features

- Upload one or multiple PDF files
- View every page as an individual thumbnail
- Drag and drop pages to rearrange the export order
- Combine pages from multiple PDFs
- Select individual pages
- Rotate pages left/right
- Remove pages before export
- Download the arranged PDF
- Extract selected pages into one PDF
- Split selected pages into individual PDFs packaged as ZIP
- Split by custom page ranges such as `1-3; 4-6; 7,9,11-13`
- No server-side PDF upload or storage

## GitHub Pages setup

1. Create a new GitHub repository, for example `pdf-workbench`.
2. Upload these files to the repository root:
   - `index.html`
   - `styles.css`
   - `app.js`
3. Commit the files.
4. In GitHub, open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select your main branch and the `/ (root)` folder, then save.
7. GitHub will provide the public Pages URL after deployment.

## Privacy model

PDFs are processed locally in the browser. This project does not include any backend or upload endpoint. The JavaScript libraries are loaded from jsDelivr CDN, so an internet connection is required to load the app libraries unless you later self-host them inside the repository.

## Libraries

- Mozilla PDF.js — page rendering
- pdf-lib — PDF reconstruction and rotation
- SortableJS — drag-and-drop rearranging
- JSZip — packaging split PDFs into ZIP files

## Limits / browser notes

Very large PDFs can consume substantial browser memory because pages are rendered and source files remain loaded in memory. For ordinary office PDFs, reports, forms, and multi-file assembly, this approach is practical and avoids hosted-service use limits.
