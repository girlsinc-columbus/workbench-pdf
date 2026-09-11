import * as pdfjsLib from 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs';
import { PDFDocument, degrees } from 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';
import Sortable from 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.6/+esm';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';

const state = {
  sources: new Map(),
  pages: [],
  selected: new Set(),
  nextSourceId: 1,
  sortable: null,
};

const $ = (id) => document.getElementById(id);
const els = {
  fileInput: $('fileInput'),
  dropZone: $('dropZone'),
  workspace: $('workspace'),
  splitSection: $('splitSection'),
  pageGrid: $('pageGrid'),
  statusText: $('statusText'),
  selectionText: $('selectionText'),
  pageCardTemplate: $('pageCardTemplate'),
  toast: $('toast'),
  selectAllBtn: $('selectAllBtn'),
  clearSelectionBtn: $('clearSelectionBtn'),
  rotateLeftBtn: $('rotateLeftBtn'),
  rotateRightBtn: $('rotateRightBtn'),
  deleteBtn: $('deleteBtn'),
  resetBtn: $('resetBtn'),
  downloadArrangedBtn: $('downloadArrangedBtn'),
  extractSelectedBtn: $('extractSelectedBtn'),
  splitSelectedBtn: $('splitSelectedBtn'),
  rangeInput: $('rangeInput'),
  splitRangesBtn: $('splitRangesBtn'),
  filenameModal: $('filenameModal'),
  filenameModalTitle: $('filenameModalTitle'),
  filenameModalDescription: $('filenameModalDescription'),
  filenameInput: $('filenameInput'),
  filenameExtension: $('filenameExtension'),
  filenameHint: $('filenameHint'),
  filenameCancelBtn: $('filenameCancelBtn'),
  filenameConfirmBtn: $('filenameConfirmBtn'),
};

function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => els.toast.classList.remove('show'), 2600);
}

function safeBaseName(name) {
  return name
    .replace(/\.(pdf|zip)$/i, '')
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim() || 'document';
}

function suggestedSourceName(suffix) {
  const firstSource = state.sources.values().next().value;
  const base = firstSource ? safeBaseName(firstSource.fileName) : 'document';
  return `${base}-${suffix}`;
}

function askForFilename({ title, description, defaultName, extension }) {
  return new Promise((resolve) => {
    const cleanExtension = extension.startsWith('.') ? extension : `.${extension}`;
    let settled = false;

    els.filenameModalTitle.textContent = title;
    els.filenameModalDescription.textContent = description;
    els.filenameInput.value = safeBaseName(defaultName);
    els.filenameExtension.textContent = cleanExtension;
    els.filenameHint.textContent = `The ${cleanExtension} extension will be added automatically.`;
    els.filenameModal.classList.remove('hidden');

    const cleanup = () => {
      els.filenameModal.classList.add('hidden');
      els.filenameConfirmBtn.removeEventListener('click', confirm);
      els.filenameCancelBtn.removeEventListener('click', cancel);
      els.filenameModal.removeEventListener('click', backdropCancel);
      document.removeEventListener('keydown', keyHandler);
    };

    const finish = (value) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(value);
    };

    const confirm = () => {
      const typed = els.filenameInput.value.replace(new RegExp(`${cleanExtension.replace('.', '\\.')}$$`, 'i'), '');
      const base = safeBaseName(typed);
      if (!base) return showToast('Enter a file name.');
      finish(`${base}${cleanExtension}`);
    };

    const cancel = () => finish(null);
    const backdropCancel = (event) => {
      if (event.target === els.filenameModal) cancel();
    };
    const keyHandler = (event) => {
      if (event.key === 'Escape') cancel();
      if (event.key === 'Enter' && document.activeElement === els.filenameInput) confirm();
    };

    els.filenameConfirmBtn.addEventListener('click', confirm);
    els.filenameCancelBtn.addEventListener('click', cancel);
    els.filenameModal.addEventListener('click', backdropCancel);
    document.addEventListener('keydown', keyHandler);

    requestAnimationFrame(() => {
      els.filenameInput.focus();
      els.filenameInput.select();
    });
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function updateSummary() {
  const fileCount = state.sources.size;
  const pageCount = state.pages.length;
  els.statusText.textContent = pageCount
    ? `${fileCount} PDF${fileCount === 1 ? '' : 's'} loaded • ${pageCount} page${pageCount === 1 ? '' : 's'}`
    : 'No PDFs loaded.';
  els.selectionText.textContent = `${state.selected.size} selected`;
  els.workspace.classList.toggle('hidden', pageCount === 0);
  els.splitSection.classList.toggle('hidden', pageCount === 0);
  els.dropZone.classList.toggle('hidden', pageCount > 0);
}

async function addFiles(fileList) {
  const files = [...fileList].filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
  if (!files.length) {
    showToast('Please choose PDF files.');
    return;
  }

  for (const file of files) {
    try {
      const bytes = await file.arrayBuffer();
      const sourceId = `src-${state.nextSourceId++}`;
      const renderBytes = bytes.slice(0);
      const exportBytes = bytes.slice(0);
      const pdfjsDoc = await pdfjsLib.getDocument({ data: renderBytes }).promise;
      const pdfLibDoc = await PDFDocument.load(exportBytes);
      state.sources.set(sourceId, { id: sourceId, fileName: file.name, pdfjsDoc, pdfLibDoc });

      for (let pageIndex = 0; pageIndex < pdfjsDoc.numPages; pageIndex++) {
        state.pages.push({
          id: uid(),
          sourceId,
          sourcePageIndex: pageIndex,
          rotation: 0,
        });
      }
    } catch (err) {
      console.error(err);
      showToast(`Could not open ${file.name}. It may be encrypted or damaged.`);
    }
  }

  renderPageGrid();
}

function renderPageGrid() {
  els.pageGrid.innerHTML = '';
  state.pages.forEach((page, i) => {
    const node = els.pageCardTemplate.content.firstElementChild.cloneNode(true);
    node.dataset.pageId = page.id;
    node.classList.toggle('selected', state.selected.has(page.id));
    node.querySelector('.index-badge').textContent = i + 1;

    const source = state.sources.get(page.sourceId);
    node.querySelector('.source-name').textContent = source.fileName;
    node.querySelector('.source-page').textContent = `Original page ${page.sourcePageIndex + 1}${page.rotation ? ` • ${page.rotation}°` : ''}`;

    const toggle = () => {
      if (state.selected.has(page.id)) state.selected.delete(page.id);
      else state.selected.add(page.id);
      node.classList.toggle('selected', state.selected.has(page.id));
      updateSummary();
    };

    node.querySelector('.select-toggle').addEventListener('click', (e) => { e.stopPropagation(); toggle(); });
    node.querySelector('.thumb-wrap').addEventListener('click', toggle);
    node.querySelector('.mini-rotate-left').addEventListener('click', (e) => { e.stopPropagation(); rotateOne(page.id, -90); });
    node.querySelector('.mini-rotate-right').addEventListener('click', (e) => { e.stopPropagation(); rotateOne(page.id, 90); });
    node.querySelector('.mini-delete').addEventListener('click', (e) => { e.stopPropagation(); removePages([page.id]); });

    els.pageGrid.appendChild(node);
    renderThumbnail(page, node.querySelector('canvas'));
  });

  if (!state.sortable) {
    state.sortable = new Sortable(els.pageGrid, {
      animation: 160,
      draggable: '.page-card',
      ghostClass: 'sortable-ghost',
      dragClass: 'sortable-drag',
      onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        const [moved] = state.pages.splice(evt.oldIndex, 1);
        state.pages.splice(evt.newIndex, 0, moved);
        renderPageGrid();
      },
    });
  }

  updateSummary();
}

async function renderThumbnail(pageRef, canvas) {
  try {
    const source = state.sources.get(pageRef.sourceId);
    const page = await source.pdfjsDoc.getPage(pageRef.sourcePageIndex + 1);
    const baseViewport = page.getViewport({ scale: 1, rotation: (page.rotate + pageRef.rotation) % 360 });
    const maxW = 260;
    const maxH = 330;
    const scale = Math.min(maxW / baseViewport.width, maxH / baseViewport.height, 1.4);
    const viewport = page.getViewport({ scale, rotation: (page.rotate + pageRef.rotation) % 360 });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${Math.floor(viewport.width)}px`;
    canvas.style.height = `${Math.floor(viewport.height)}px`;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport, transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null }).promise;
  } catch (err) {
    console.error(err);
  }
}

function rotateOne(pageId, delta) {
  const page = state.pages.find(p => p.id === pageId);
  if (!page) return;
  page.rotation = (page.rotation + delta + 360) % 360;
  renderPageGrid();
}

function rotateSelected(delta) {
  if (!state.selected.size) return showToast('Select at least one page first.');
  state.pages.forEach(page => {
    if (state.selected.has(page.id)) page.rotation = (page.rotation + delta + 360) % 360;
  });
  renderPageGrid();
}

function removePages(ids) {
  const remove = new Set(ids);
  state.pages = state.pages.filter(p => !remove.has(p.id));
  ids.forEach(id => state.selected.delete(id));
  renderPageGrid();
}

function selectedPagesInOrder() {
  return state.pages.filter(p => state.selected.has(p.id));
}

async function buildPdf(pageRefs) {
  const out = await PDFDocument.create();
  for (const ref of pageRefs) {
    const source = state.sources.get(ref.sourceId);
    const [copied] = await out.copyPages(source.pdfLibDoc, [ref.sourcePageIndex]);
    if (ref.rotation) {
      const current = copied.getRotation().angle || 0;
      copied.setRotation(degrees((current + ref.rotation) % 360));
    }
    out.addPage(copied);
  }
  return out.save();
}

async function downloadArranged() {
  if (!state.pages.length) return;
  const filename = await askForFilename({
    title: 'Name your arranged PDF',
    description: 'Choose the name for the rearranged PDF you are about to create.',
    defaultName: suggestedSourceName('arranged'),
    extension: '.pdf',
  });
  if (!filename) return;

  const bytes = await buildPdf(state.pages);
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), filename);
}

async function extractSelected() {
  const refs = selectedPagesInOrder();
  if (!refs.length) return showToast('Select the pages you want to extract.');

  const filename = await askForFilename({
    title: 'Name your extracted PDF',
    description: 'Choose the name for the PDF containing your selected pages.',
    defaultName: suggestedSourceName('selected-pages'),
    extension: '.pdf',
  });
  if (!filename) return;

  const bytes = await buildPdf(refs);
  downloadBlob(new Blob([bytes], { type: 'application/pdf' }), filename);
}

async function splitSelected() {
  const refs = selectedPagesInOrder();
  if (!refs.length) return showToast('Select the pages you want to split.');

  const filename = await askForFilename({
    title: 'Name your split-page ZIP',
    description: 'Choose the ZIP name. Each selected page will be saved as a separate PDF inside it.',
    defaultName: suggestedSourceName('split-pages'),
    extension: '.zip',
  });
  if (!filename) return;

  const zipBase = safeBaseName(filename);
  const zip = new window.JSZip();
  for (let i = 0; i < refs.length; i++) {
    const ref = refs[i];
    const bytes = await buildPdf([ref]);
    zip.file(`${zipBase}-page-${String(i + 1).padStart(3, '0')}.pdf`, bytes);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, filename);
}

function parseRanges(input, pageCount) {
  const groups = input.split(';').map(s => s.trim()).filter(Boolean);
  if (!groups.length) throw new Error('Enter at least one range.');

  return groups.map(group => {
    const nums = [];
    for (const token of group.split(',').map(s => s.trim()).filter(Boolean)) {
      if (/^\d+$/.test(token)) {
        nums.push(Number(token));
      } else {
        const match = token.match(/^(\d+)\s*-\s*(\d+)$/);
        if (!match) throw new Error(`Invalid range: ${token}`);
        let a = Number(match[1]);
        let b = Number(match[2]);
        const step = a <= b ? 1 : -1;
        for (let n = a; ; n += step) {
          nums.push(n);
          if (n === b) break;
        }
      }
    }
    if (!nums.length) throw new Error(`Empty range group: ${group}`);
    nums.forEach(n => {
      if (n < 1 || n > pageCount) throw new Error(`Page ${n} is outside 1-${pageCount}.`);
    });
    return nums;
  });
}

async function splitRanges() {
  if (!state.pages.length) return;
  let groups;
  try {
    groups = parseRanges(els.rangeInput.value, state.pages.length);
  } catch (err) {
    return showToast(err.message);
  }

  const filename = await askForFilename({
    title: 'Name your range-split ZIP',
    description: 'Choose the ZIP name. Each range will become a separate PDF inside it.',
    defaultName: suggestedSourceName('split-ranges'),
    extension: '.zip',
  });
  if (!filename) return;

  const zipBase = safeBaseName(filename);
  const zip = new window.JSZip();
  for (let i = 0; i < groups.length; i++) {
    const refs = groups[i].map(n => state.pages[n - 1]);
    const bytes = await buildPdf(refs);
    const label = groups[i].join('-');
    zip.file(`${zipBase}-${String(i + 1).padStart(2, '0')}-pages-${label}.pdf`, bytes);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(blob, filename);
}

function resetAll() {
  state.sources.clear();
  state.pages = [];
  state.selected.clear();
  state.nextSourceId = 1;
  els.fileInput.value = '';
  els.rangeInput.value = '';
  renderPageGrid();
}

els.fileInput.addEventListener('change', (e) => addFiles(e.target.files));
els.selectAllBtn.addEventListener('click', () => { state.pages.forEach(p => state.selected.add(p.id)); renderPageGrid(); });
els.clearSelectionBtn.addEventListener('click', () => { state.selected.clear(); renderPageGrid(); });
els.rotateLeftBtn.addEventListener('click', () => rotateSelected(-90));
els.rotateRightBtn.addEventListener('click', () => rotateSelected(90));
els.deleteBtn.addEventListener('click', () => {
  if (!state.selected.size) return showToast('Select at least one page first.');
  removePages([...state.selected]);
});
els.resetBtn.addEventListener('click', resetAll);
els.downloadArrangedBtn.addEventListener('click', downloadArranged);
els.extractSelectedBtn.addEventListener('click', extractSelected);
els.splitSelectedBtn.addEventListener('click', splitSelected);
els.splitRangesBtn.addEventListener('click', splitRanges);

['dragenter', 'dragover'].forEach(type => els.dropZone.addEventListener(type, (e) => {
  e.preventDefault();
  els.dropZone.classList.add('dragover');
}));
['dragleave', 'drop'].forEach(type => els.dropZone.addEventListener(type, (e) => {
  e.preventDefault();
  els.dropZone.classList.remove('dragover');
}));
els.dropZone.addEventListener('drop', (e) => addFiles(e.dataTransfer.files));

updateSummary();
