type Phase = 'form' | 'processing' | 'ready';
type HostMessage =
  | { type: 'instamosaic:show-result' }
  | { type: 'instamosaic:theme'; theme: 'light' | 'dark' };

function required<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const node = document.querySelector(selector);
  if (!(node instanceof constructor))
    throw new Error(`Demo element missing: ${selector}`);
  return node;
}

const root = required('#instamosaic-demo', HTMLDivElement);
const username = required('#demo-username', HTMLInputElement);
const email = required('#demo-email', HTMLInputElement);
const photo = required('#demo-photo', HTMLButtonElement);
const form = required('#demo-form', HTMLFormElement);
const generate = required('#demo-generate', HTMLButtonElement);
const formScreen = required('#demo-form-screen', HTMLDivElement);
const statusScreen = required('#demo-status-screen', HTMLElement);
const statusTitle = required('#demo-status-title', HTMLHeadingElement);
const statusDescription = required(
  '#demo-status-description',
  HTMLParagraphElement,
);
const artwork = required('#demo-artwork', HTMLDivElement);
const image = required('#demo-artwork-image', HTMLImageElement);
const progress = required('#demo-progress', HTMLDivElement);
const progressFill = required('#demo-progress-fill', HTMLDivElement);
const zoomIn = required('#demo-zoom-in', HTMLButtonElement);
const zoomOut = required('#demo-zoom-out', HTMLButtonElement);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const timers = new Set<number>();
const pendingInputs = new Set<HTMLInputElement>();
let phase: Phase = 'form';
let usernameReady = false;
let emailReady = false;
let photoReady = false;
let zoom = 100;
let drag: {
  pointerId: number;
  x: number;
  y: number;
  left: number;
  top: number;
} | null = null;

function notify(message: object): void {
  if (window.parent !== window)
    window.parent.postMessage(message, window.location.origin);
}

function after(milliseconds: number, action: () => void): void {
  const id = window.setTimeout(() => {
    timers.delete(id);
    action();
  }, milliseconds);
  timers.add(id);
}

function setPhase(next: Phase): void {
  phase = next;
  required('#demo-landing-brand', HTMLDivElement).hidden = next !== 'form';
  required('#demo-status-brand', HTMLAnchorElement).hidden = next === 'form';
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  notify({ type: 'instamosaic:state', phase: next });
}

function updateForm(): void {
  generate.disabled = !(usernameReady && emailReady && photoReady);
}

function typePreset(
  input: HTMLInputElement,
  value: string,
  complete: () => void,
): void {
  if (phase !== 'form' || pendingInputs.has(input) || input.value === value)
    return;
  pendingInputs.add(input);
  if (reducedMotion.matches) {
    input.value = value;
    pendingInputs.delete(input);
    complete();
    return;
  }
  let length = 0;
  const tick = () => {
    length += 1;
    input.value = value.slice(0, length);
    if (length < value.length) after(38, tick);
    else {
      pendingInputs.delete(input);
      complete();
    }
  };
  tick();
}

function fillUsername(): void {
  typePreset(username, 'neymarjr', () => {
    required('#demo-username-check', HTMLSpanElement).textContent = '…';
    after(reducedMotion.matches ? 0 : 350, () => {
      usernameReady = true;
      required('#demo-username-wrap', HTMLDivElement).classList.add(
        'username-valid',
      );
      required('#demo-username-check', HTMLSpanElement).textContent = '✓';
      updateForm();
    });
  });
}

function fillEmail(): void {
  typePreset(email, 'user@finnternet.com', () => {
    emailReady = true;
    required('#demo-email-wrap', HTMLDivElement).classList.add('email-valid');
    required('#demo-email-check', HTMLSpanElement).textContent = '✓';
    updateForm();
  });
}

username.addEventListener('focus', fillUsername);
username.addEventListener('click', fillUsername);
email.addEventListener('focus', fillEmail);
email.addEventListener('click', fillEmail);
photo.addEventListener('click', () => {
  photoReady = true;
  required('#demo-photo-thumb', HTMLImageElement).hidden = false;
  required('#demo-photo-icon', HTMLSpanElement).hidden = true;
  required('#demo-photo-title', HTMLSpanElement).textContent =
    'Mosaic image selected';
  required('#demo-photo-subtitle', HTMLSpanElement).textContent = 'neymar.jpg';
  photo.setAttribute('aria-pressed', 'true');
  updateForm();
});

function updateProgress(value: number, label: string): void {
  progress.setAttribute('aria-valuenow', String(value));
  progressFill.style.width = `${value}%`;
  required('#demo-progress-number', HTMLSpanElement).textContent = `${value}%`;
  required('#demo-progress-stage', HTMLSpanElement).textContent = label;
  statusDescription.textContent = label;
  required('#demo-announcement', HTMLParagraphElement).textContent = label;
}

function setZoom(value: number): void {
  zoom = Math.min(400, Math.max(100, value));
  image.style.width = `${zoom}%`;
  required('#demo-zoom-label', HTMLOutputElement).value = `${zoom}%`;
  zoomIn.disabled = zoom >= 400;
  zoomOut.disabled = zoom <= 100;
  if (zoom === 100) {
    artwork.scrollLeft = 0;
    artwork.scrollTop = 0;
  }
}

function complete(): void {
  timers.forEach((id) => window.clearTimeout(id));
  timers.clear();
  formScreen.hidden = true;
  statusScreen.hidden = false;
  image.src = '/demos/instamosaic/mosaic.jpg';
  image.alt =
    'Photo mosaic of Neymar. Zoom in to see the individual photographs.';
  image.width = 1440;
  image.height = 2160;
  artwork.className =
    'status-image-wrap status-image-complete status-image-portrait';
  required('#demo-status-hero', HTMLDivElement).classList.add(
    'status-hero-complete',
  );
  required('#demo-processing-overlay', HTMLDivElement).hidden = true;
  updateProgress(100, 'Ready');
  required('#demo-processing-note', HTMLParagraphElement).hidden = true;
  required('#demo-preview-controls', HTMLDivElement).hidden = false;
  required('#demo-results', HTMLDivElement).hidden = false;
  statusTitle.textContent = 'Your mosaic is ready.';
  statusDescription.hidden = true;
  required('#demo-announcement', HTMLParagraphElement).textContent =
    'Your mosaic is ready.';
  setZoom(100);
  setPhase('ready');
  statusTitle.focus({ preventScroll: true });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (generate.disabled || phase !== 'form') return;
  formScreen.hidden = true;
  statusScreen.hidden = false;
  generate.disabled = true;
  updateProgress(4, 'Checking Instagram…');
  setPhase('processing');
  statusTitle.focus({ preventScroll: true });
  const stages = [
    [950, 18, 'Downloading and analyzing photos…'],
    [2500, 43, 'Matching photos to mosaic tiles…'],
    [4400, 72, 'Building your mosaic…'],
    [6100, 92, 'Preparing your preview…'],
    [7300, 100, 'Finishing touches…'],
  ] satisfies [number, number, string][];
  stages.forEach(([delay, value, label]) =>
    after(delay, () => updateProgress(value, label)),
  );
  after(8000, complete);
});

zoomIn.addEventListener('click', () => setZoom(zoom + 75));
zoomOut.addEventListener('click', () => setZoom(zoom - 75));
artwork.addEventListener('pointerdown', (event) => {
  if (phase !== 'ready' || zoom === 100 || event.pointerType !== 'mouse')
    return;
  if (event.target instanceof Element && event.target.closest('button')) return;
  drag = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    left: artwork.scrollLeft,
    top: artwork.scrollTop,
  };
  artwork.focus({ preventScroll: true });
  artwork.setPointerCapture(event.pointerId);
  artwork.classList.add('status-image-dragging');
  event.preventDefault();
});
artwork.addEventListener('pointermove', (event) => {
  if (!drag || drag.pointerId !== event.pointerId) return;
  artwork.scrollLeft = drag.left - (event.clientX - drag.x);
  artwork.scrollTop = drag.top - (event.clientY - drag.y);
});
const stopDragging = () => {
  drag = null;
  artwork.classList.remove('status-image-dragging');
};
artwork.addEventListener('pointerup', stopDragging);
artwork.addEventListener('pointercancel', stopDragging);
artwork.addEventListener('lostpointercapture', stopDragging);
required('#demo-fullscreen', HTMLButtonElement).addEventListener(
  'click',
  async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await artwork.requestFullscreen();
    } catch {
      const message = required('#demo-share-message', HTMLParagraphElement);
      message.hidden = false;
      message.textContent =
        'Your browser could not open the image in fullscreen.';
    }
  },
);
required('#demo-share-reveal', HTMLButtonElement).addEventListener(
  'click',
  async () => {
    const message = required('#demo-share-message', HTMLParagraphElement);
    message.hidden = true;
    const url = new URL(
      '/demos/instamosaic/reveal.mp4',
      window.location.origin,
    ).toString();
    try {
      if (navigator.share)
        await navigator.share({
          title: 'InstaMosaic for @neymarjr',
          text: 'Built from 80 Instagram photos.',
          url,
        });
      else {
        await navigator.clipboard.writeText(url);
        message.textContent = 'Reveal video link copied.';
        message.hidden = false;
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      message.textContent =
        error instanceof Error
          ? error.message
          : 'Unable to share the reveal video.';
      message.hidden = false;
    }
  },
);

function isHostMessage(value: unknown): value is HostMessage {
  if (!value || typeof value !== 'object' || !('type' in value)) return false;
  return (
    value.type === 'instamosaic:show-result' ||
    (value.type === 'instamosaic:theme' &&
      'theme' in value &&
      (value.theme === 'light' || value.theme === 'dark'))
  );
}

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (
    event.source !== window.parent ||
    event.origin !== window.location.origin ||
    !isHostMessage(event.data)
  )
    return;
  if (event.data.type === 'instamosaic:show-result') complete();
  else document.documentElement.dataset.theme = event.data.theme;
});

window.addEventListener('load', () => {
  notify({ type: 'instamosaic:state', phase });
});
root.dataset.ready = 'true';
