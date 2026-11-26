export {};

function required<T extends HTMLElement>(
  selector: string,
  constructor: { new (): T },
): T {
  const node = document.querySelector(selector);
  if (!(node instanceof constructor))
    throw new Error(`Whistle preview element missing: ${selector}`);
  return node;
}

const landing = required('#whistle-landing', HTMLDivElement);
const stage = required('#whistle-phone-stage', HTMLDivElement);
const landingFrame = required('#whistle-landing-frame', HTMLIFrameElement);
const exit = required('#whistle-exit-demo', HTMLButtonElement);
const frame = required('#whistle-phone-frame', HTMLIFrameElement);
const systemDark = matchMedia('(prefers-color-scheme: dark)');
let phoneTheme: 'light' | 'dark' | undefined;

function syncTheme(): void {
  const theme = phoneTheme ?? (systemDark.matches ? 'dark' : 'light');
  stage.dataset.theme = theme;
  frame.contentWindow?.postMessage(
    { type: 'whistle:theme', theme },
    location.origin,
  );
}

function startDemo(): void {
  phoneTheme = undefined;
  landing.hidden = true;
  stage.hidden = false;
  syncTheme();
  frame.src = '/demos/whistle/';
  landingFrame.contentWindow?.postMessage(
    { type: 'whistle:pause-media' },
    location.origin,
  );
  exit.focus({ preventScroll: true });
}
window.addEventListener(
  'message',
  (event: MessageEvent<{ type?: string; theme?: string }>) => {
    if (
      event.origin !== location.origin ||
      !event.data ||
      typeof event.data !== 'object'
    )
      return;
    if (
      event.source === landingFrame.contentWindow &&
      event.data.type === 'whistle:play'
    )
      startDemo();
    if (
      event.source === frame.contentWindow &&
      event.data.type === 'whistle:appearance' &&
      (event.data.theme === 'light' || event.data.theme === 'dark')
    ) {
      phoneTheme = event.data.theme;
      stage.dataset.theme = phoneTheme;
    }
  },
);
exit.addEventListener('click', () => {
  stage.hidden = true;
  landing.hidden = false;
  frame.removeAttribute('src');
  landingFrame.focus({ preventScroll: true });
  landingFrame.contentWindow?.postMessage(
    { type: 'whistle:focus-play' },
    location.origin,
  );
});
frame.addEventListener('load', syncTheme);
syncTheme();
systemDark.addEventListener('change', syncTheme);
