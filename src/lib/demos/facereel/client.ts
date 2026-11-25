import { demoProjects } from '../../demo-projects';

type Phase = 'form' | 'processing' | 'ready';
const GENERATION_MS = 8000;
const ASSETS = '/demos/facereel/';
const { username: presetUsername } = demoProjects.facereel;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function required<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const element = document.querySelector(selector);
  if (!(element instanceof constructor))
    throw new Error(`FaceReel element missing: ${selector}`);
  return element;
}

const root = required('#facereel-demo', HTMLDivElement);
const formScreen = required('#demo-form-screen', HTMLDivElement);
const statusScreen = required('#demo-status-screen', HTMLElement);
const statusTitle = required('#demo-status-title', HTMLHeadingElement);
const username = required('#demo-username', HTMLInputElement);
const email = required('#demo-email', HTMLInputElement);
const target = required('#demo-target', HTMLButtonElement);
const generate = required('#demo-generate', HTMLButtonElement);
const video = required('#demo-video', HTMLVideoElement);
const share = required('#demo-share', HTMLButtonElement);
const typing = new Set<HTMLInputElement>();
let phase: Phase = 'form';
let usernameReady = false;
let emailReady = false;
let targetReady = false;
let progressTimer: number | undefined;
let shareFile: File | undefined;

function setPhase(next: Phase): void {
  phase = next;
  root.dataset.phase = next;
  formScreen.hidden = next !== 'form';
  statusScreen.hidden = next === 'form';
  window.parent.postMessage(
    { type: 'facereel:state', phase: next },
    window.location.origin,
  );
}

function updateForm(): void {
  generate.disabled = !usernameReady || !emailReady || !targetReady;
}

function typePreset(
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
    if (length < value.length) window.setTimeout(tick, 38);
    else {
      typing.delete(input);
      complete();
    }
  };
  tick();
}

function fillUsername(): void {
  if (usernameReady) return;
  typePreset(username, presetUsername, () => {
    required('#demo-username-loading', HTMLSpanElement).hidden = false;
    window.setTimeout(
      () => {
        usernameReady = true;
        required('#demo-username-loading', HTMLSpanElement).hidden = true;
        required('#demo-username-check', HTMLSpanElement).hidden = false;
        required('#demo-username-wrap', HTMLDivElement).classList.add(
          'username-valid',
        );
        updateForm();
      },
      reducedMotion.matches ? 0 : 350,
    );
  });
}

function fillEmail(): void {
  if (emailReady) return;
  typePreset(email, 'user@finnternet.com', () => {
    emailReady = true;
    required('#demo-email-check', HTMLSpanElement).hidden = false;
    required('#demo-email-wrap', HTMLDivElement).classList.add('email-valid');
    updateForm();
  });
}

username.addEventListener('focus', fillUsername);
username.addEventListener('click', fillUsername);
email.addEventListener('focus', fillEmail);
email.addEventListener('click', fillEmail);
target.addEventListener('click', () => {
  if (targetReady) return;
  const image = document.createElement('img');
  image.src = `${ASSETS}cristiano.jpg`;
  image.alt = 'Selected target face';
  image.className = 'file-thumbnail';
  image.width = 44;
  image.height = 44;
  required('#demo-target-icon', HTMLSpanElement).replaceChildren(image);
  required('#demo-target-title', HTMLSpanElement).textContent =
    'Target face selected';
  required('#demo-target-filename', HTMLSpanElement).textContent =
    'cristiano.jpg';
  target.setAttribute('aria-pressed', 'true');
  targetReady = true;
  updateForm();
});

function updateProgress(percent: number, stage: string): void {
  statusTitle.textContent = stage;
  required('#demo-progress', HTMLDivElement).setAttribute(
    'aria-valuenow',
    String(percent),
  );
  required('#demo-progress-fill', HTMLDivElement).style.width = `${percent}%`;
  required('#demo-progress-text', HTMLParagraphElement).textContent =
    `${percent}% · ${percent === 100 ? 'completed' : 'processing'}`;
}

function showReady(): void {
  if (phase === 'ready') return;
  window.clearInterval(progressTimer);
  updateProgress(100, 'Your FaceReel is ready');
  required('#demo-wait-message', HTMLDivElement).hidden = true;
  required('#demo-results', HTMLDivElement).hidden = false;
  // The video and poster are requested only after the result is shown.
  video.preload = 'metadata';
  video.poster = `${ASSETS}poster.jpg`;
  video.src = `${ASSETS}facereel.mp4`;
  setPhase('ready');
  window.scrollTo(0, 0);
  statusTitle.focus({ preventScroll: true });
}

const stages = [
  { at: 0, label: 'Queued' },
  { at: 5, label: 'Downloading your photos' },
  { at: 23, label: 'Validating your photos' },
  { at: 36, label: 'Detecting faces' },
  { at: 56, label: 'Aligning faces' },
  { at: 72, label: 'Creating video frames' },
  { at: 84, label: 'Rendering your FaceReel' },
  { at: 94, label: 'Uploading your completed video' },
  { at: 98, label: 'Finishing up' },
];

required('#demo-form', HTMLFormElement).addEventListener('submit', (event) => {
  event.preventDefault();
  if (generate.disabled || phase !== 'form') return;
  const startedAt = Date.now();
  setPhase('processing');
  updateProgress(0, 'Queued');
  window.scrollTo(0, 0);
  statusTitle.focus({ preventScroll: true });
  progressTimer = window.setInterval(() => {
    const elapsed = Date.now() - startedAt;
    if (elapsed >= GENERATION_MS) {
      showReady();
      return;
    }
    const percent = Math.min(99, Math.round((elapsed / GENERATION_MS) * 100));
    let label = 'Queued';
    for (const stage of stages) if (percent >= stage.at) label = stage.label;
    updateProgress(percent, label);
  }, 160);
});

function showActionMessage(text: string): void {
  const message = required('#demo-action-message', HTMLParagraphElement);
  message.textContent = text;
  message.hidden = false;
}

share.addEventListener('click', async () => {
  if (!navigator.share) {
    showActionMessage(
      'Sharing is not supported in this browser. You can download the video instead.',
    );
    return;
  }
  share.disabled = true;
  const label = required('#demo-share-label', HTMLSpanElement);
  label.textContent = 'Preparing video…';
  try {
    let file = shareFile;
    if (!file) {
      const response = await fetch(`${ASSETS}facereel.mp4`);
      if (!response.ok)
        throw new Error('The video could not be loaded for sharing.');
      file = new File([await response.blob()], 'facereel-cristiano.mp4', {
        type: 'video/mp4',
      });
      shareFile = file;
    }
    if (!navigator.canShare?.({ files: [file] })) {
      showActionMessage(
        'Sharing video files is not supported in this browser. You can download the video instead.',
      );
      return;
    }
    if (navigator.userActivation && !navigator.userActivation.isActive) {
      showActionMessage(
        'Your video is ready to share. Tap Share video again to open the share sheet.',
      );
      return;
    }
    await navigator.share({
      files: [file],
      title: 'My FaceReel',
      text: 'Made with FaceReel.net',
    });
  } catch (error) {
    if (!(error instanceof DOMException && error.name === 'AbortError')) {
      showActionMessage(
        error instanceof Error ? error.message : 'Unable to share the video.',
      );
    }
  } finally {
    share.disabled = false;
    label.textContent = 'Share video';
  }
});

window.addEventListener('message', (event: MessageEvent<unknown>) => {
  if (event.origin !== window.location.origin || event.source !== window.parent)
    return;
  const value = event.data;
  if (!value || typeof value !== 'object' || !('type' in value)) return;
  if (
    value.type === 'facereel:theme' &&
    'theme' in value &&
    (value.theme === 'light' || value.theme === 'dark')
  ) {
    document.documentElement.dataset.theme = value.theme;
  }
  if (value.type === 'facereel:show-result') showReady();
});
window.addEventListener('pagehide', (event) => {
  // Cached pages resume this timer, which catches up using elapsed wall time.
  if (!event.persisted) window.clearInterval(progressTimer);
});
setPhase('form');
