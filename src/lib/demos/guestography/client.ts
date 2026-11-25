import { demoProjects } from '../../demo-projects';
import { photos } from './photos';

type Screen = 'create' | 'success' | 'gallery' | 'upload';
type Phase = 'form' | 'processing' | 'ready';
const ASSETS = '/demos/guestography/';
const GENERATION_MS = 8000;
const UPLOAD_MS = 3500;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const { eventTitle } = demoProjects.guestography;

function required<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const element = document.querySelector(selector);
  if (!(element instanceof constructor))
    throw new Error(`Guestography element missing: ${selector}`);
  return element;
}
const root = required('#guestography-demo', HTMLDivElement);
const title = required('#guest-title', HTMLInputElement);
const email = required('#guest-email', HTMLInputElement);
const create = required('#guest-create', HTMLButtonElement);
const name = required('#guest-name', HTMLInputElement);
const nameDialog = required('#guest-name-dialog', HTMLDialogElement);
const viewer = required('#guest-viewer', HTMLDialogElement);
const upload = required('#guest-submit-upload', HTMLButtonElement);
const select = required('#guest-select', HTMLButtonElement);
const gallery = required('#guest-gallery', HTMLDivElement);
const typing = new Set<HTMLInputElement>();
const photoIds = Array.from({ length: 12 }, (_, index) => index);
const selectedIds = [12, 13, 14];
let phase: Phase = 'form';
let hasGuest = false;
let selected = false;
let uploading = false;
let uploaded = false;
let photoIndex = 0;
let createTimer: number | undefined;
let uploadTimer: number | undefined;

function setPhase(next: Phase): void {
  phase = next;
  window.parent.postMessage(
    { type: 'guestography:state', phase: next },
    location.origin,
  );
}
function showScreen(screen: Screen): void {
  root.dataset.screen = screen;
  for (const item of ['create', 'success', 'gallery', 'upload'] as const) {
    required(`#guest-${item}-screen`, HTMLElement).hidden = screen !== item;
  }
  required('#guest-upload-nav', HTMLButtonElement).hidden =
    screen !== 'gallery';
  window.scrollTo(0, 0);
  const heading = document.querySelector(`#guest-${screen}-screen h1`);
  if (heading instanceof HTMLHeadingElement && screen !== 'create')
    heading.focus({ preventScroll: true });
}
function fill(
  input: HTMLInputElement,
  value: string,
  complete: () => void,
): void {
  if (typing.has(input)) return;
  if (input.value === value || reducedMotion.matches) {
    input.value = value;
    complete();
    return;
  }
  typing.add(input);
  let length = 0;
  const tick = () => {
    input.value = value.slice(0, ++length);
    if (length < value.length) window.setTimeout(tick, 32);
    else {
      typing.delete(input);
      complete();
    }
  };
  tick();
}
function updateCreate(): void {
  create.disabled =
    phase !== 'form' ||
    title.value !== eventTitle ||
    email.value !== 'user@finnternet.com';
}
for (const [input, value] of [
  [title, eventTitle],
  [email, 'user@finnternet.com'],
] as const) {
  const typeValue = () => fill(input, value, updateCreate);
  input.addEventListener('focus', typeValue);
  input.addEventListener('click', typeValue);
}
const fillName = () =>
  fill(name, 'Chris Finn', () => {
    required('#guest-continue', HTMLButtonElement).disabled = false;
  });
name.addEventListener('focus', fillName);
name.addEventListener('click', fillName);

function renderGallery(): void {
  gallery.replaceChildren(
    ...photoIds.map((id, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'guest-photo';
      button.setAttribute('aria-label', `Open event photo ${index + 1}`);
      const image = document.createElement('img');
      image.src = `${ASSETS}photo-${id}.jpg`;
      image.alt = `Event photo ${index + 1}`;
      image.loading = 'lazy';
      const photo = photos.find((item) => item.id === id);
      if (photo) {
        image.width = photo.width;
        image.height = photo.height;
      }
      button.append(image);
      button.addEventListener('click', () => openPhoto(index));
      return button;
    }),
  );
}
function showGallery(): void {
  renderGallery();
  showScreen('gallery');
}
function showReady(): void {
  if (phase === 'ready') return;
  window.clearInterval(createTimer);
  showScreen('success');
  setPhase('ready');
}
required('#guest-create-form', HTMLFormElement).addEventListener(
  'submit',
  (event) => {
    event.preventDefault();
    if (create.disabled || phase !== 'form') return;
    setPhase('processing');
    create.disabled = true;
    required('#guest-create-label', HTMLSpanElement).hidden = true;
    required('#guest-create-spinner', HTMLSpanElement).hidden = false;
    const startedAt = Date.now();
    createTimer = window.setInterval(() => {
      if (Date.now() - startedAt >= GENERATION_MS) showReady();
    }, 100);
  },
);
required('#guest-go-gallery', HTMLButtonElement).addEventListener(
  'click',
  showGallery,
);
required('#guest-back-gallery', HTMLButtonElement).addEventListener(
  'click',
  showGallery,
);
required('#guest-upload-nav', HTMLButtonElement).addEventListener(
  'click',
  () => {
    showScreen('upload');
    if (!hasGuest) nameDialog.showModal();
  },
);
required('#guest-name-form', HTMLFormElement).addEventListener(
  'submit',
  (event) => {
    event.preventDefault();
    if (name.value !== 'Chris Finn') return;
    hasGuest = true;
    nameDialog.close();
    select.focus();
  },
);
nameDialog.addEventListener('close', () => select.focus());

select.addEventListener('click', () => {
  if (!hasGuest) {
    nameDialog.showModal();
    return;
  }
  if (uploading || uploaded) return;
  selected = true;
  required('#guest-selected-count', HTMLSpanElement).textContent = '3 files';
  const list = required('#guest-files', HTMLUListElement);
  list.replaceChildren(
    ...selectedIds.map((id, index) => {
      const row = document.createElement('li');
      const thumbnail = document.createElement('img');
      thumbnail.src = `${ASSETS}photo-${id}.jpg`;
      thumbnail.alt = '';
      thumbnail.width = 40;
      thumbnail.height = 40;
      const filename = document.createElement('span');
      filename.textContent = `IMG_${String(4821 + index)}.JPG`;
      const progress = document.createElement('span');
      progress.id = `guest-file-${id}-progress`;
      progress.className = 'guest-file-progress';
      row.append(thumbnail, filename, progress);
      return row;
    }),
  );
  upload.disabled = false;
});
required('#guest-upload-form', HTMLFormElement).addEventListener(
  'submit',
  (event) => {
    event.preventDefault();
    if (!selected || uploading || uploaded || !hasGuest) return;
    uploading = true;
    upload.disabled = true;
    select.disabled = true;
    required('#guest-upload-label', HTMLSpanElement).hidden = true;
    required('#guest-upload-spinner', HTMLSpanElement).hidden = false;
    required('#guest-upload-announcement', HTMLParagraphElement).textContent =
      'Uploading 3 photos';
    const startedAt = Date.now();
    uploadTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      for (const [index, id] of selectedIds.entries()) {
        const percent = Math.min(
          100,
          Math.max(
            0,
            Math.round(((elapsed - index * 300) / (UPLOAD_MS - 600)) * 100),
          ),
        );
        const progress = required(
          `#guest-file-${id}-progress`,
          HTMLSpanElement,
        );
        progress.textContent = percent === 100 ? '✓' : `${percent}%`;
        progress.style.setProperty('--progress', `${percent}%`);
        progress.setAttribute(
          'aria-label',
          `Photo ${index + 1}: ${percent}% uploaded`,
        );
      }
      if (elapsed >= UPLOAD_MS) {
        window.clearInterval(uploadTimer);
        uploading = false;
        uploaded = true;
        photoIds.unshift(...selectedIds);
        if (root.dataset.screen === 'gallery') renderGallery();
        const label = required('#guest-upload-label', HTMLSpanElement);
        label.textContent = 'UPLOADED';
        label.hidden = false;
        required('#guest-upload-spinner', HTMLSpanElement).hidden = true;
        required(
          '#guest-upload-announcement',
          HTMLParagraphElement,
        ).textContent = '3 photos uploaded successfully';
      }
    }, 100);
  },
);

function openPhoto(index: number): void {
  photoIndex = (index + photoIds.length) % photoIds.length;
  const id = photoIds[photoIndex];
  if (id === undefined) return;
  const image = required('#guest-viewer-image', HTMLImageElement);
  image.src = `${ASSETS}photo-${id}.jpg`;
  image.alt = `Event photo ${photoIndex + 1} of ${photoIds.length}`;
  const download = required('#guest-download', HTMLAnchorElement);
  download.href = image.src;
  download.download = `guestography-photo-${photoIndex + 1}.jpg`;
  required('#guest-photo-position', HTMLSpanElement).textContent = image.alt;
  if (!viewer.open) viewer.showModal();
}
required('#guest-close-viewer', HTMLButtonElement).addEventListener(
  'click',
  () => viewer.close(),
);
required('#guest-prev', HTMLButtonElement).addEventListener('click', () =>
  openPhoto(photoIndex - 1),
);
required('#guest-next', HTMLButtonElement).addEventListener('click', () =>
  openPhoto(photoIndex + 1),
);
viewer.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    openPhoto(photoIndex - 1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    openPhoto(photoIndex + 1);
  }
});
window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (event.origin !== location.origin || event.source !== window.parent)
    return;
  const data = event.data;
  if (!data || typeof data !== 'object' || !('type' in data)) return;
  if (
    data.type === 'guestography:theme' &&
    'theme' in data &&
    (data.theme === 'light' || data.theme === 'dark')
  )
    document.documentElement.dataset.theme = data.theme;
  if (data.type === 'guestography:show-result') {
    showReady();
    showGallery();
  }
});
window.addEventListener('pagehide', (event) => {
  if (!event.persisted) {
    window.clearInterval(createTimer);
    window.clearInterval(uploadTimer);
  }
});
setPhase('form');
