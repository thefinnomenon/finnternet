import {
  audioClips,
  isAudioClip,
  type AudioClip,
  type TextChange,
} from './model';

type Annotation = 'tooltip' | 'audiolink';
interface Options {
  editor: HTMLDivElement;
  getRange: () => Range | null;
  setRange: (range: Range) => void;
  onChange: () => void;
  onNotice: (message: string) => void;
  apply: (range: Range, change: TextChange) => Range | null;
}
function element<T extends HTMLElement>(
  selector: string,
  kind: { new (): T },
): T {
  const node = document.querySelector(selector);
  if (!(node instanceof kind))
    throw new Error(`Annotation element missing: ${selector}`);
  return node;
}

export function initLearningAnnotations(options: Options): {
  reset: () => void;
} {
  const { editor, getRange, setRange, onChange, onNotice, apply } = options;
  const dialog = element('#ck-annotation-dialog', HTMLDialogElement);
  const form = element('#ck-annotation-form', HTMLFormElement);
  const tooltipInput = element('#ck-tooltip-text', HTMLInputElement);
  const audioSelect = element('#ck-audio-file', HTMLSelectElement);
  const previewAudio = element('#ck-play-selected-audio', HTMLButtonElement);
  const remove = element('#ck-remove-annotation', HTMLButtonElement);
  const tooltip = element('#ck-inline-tooltip', HTMLDivElement);
  const player = element('#ck-audio-player', HTMLAudioElement);
  const audioError = element('#ck-audio-error', HTMLParagraphElement);
  let pending: {
    kind: Annotation;
    range: Range;
    hasAnnotation: boolean;
  } | null = null;
  let tooltipTrigger: HTMLElement | null = null;
  let described: HTMLElement | null = null;
  let hideTimer: ReturnType<typeof setTimeout> | undefined;
  let playing: HTMLElement | null = null;
  let playback = 0;

  function hideTooltip(): void {
    clearTimeout(hideTimer);
    tooltip.hidden = true;
    described?.removeAttribute('aria-describedby');
    described = null;
    tooltipTrigger = null;
  }
  function showTooltip(
    trigger: HTMLElement,
    owner = trigger,
    content = trigger.dataset.tooltipContent,
  ): void {
    if (!content) return;
    hideTooltip();
    tooltipTrigger = trigger;
    described = owner;
    owner.setAttribute('aria-describedby', tooltip.id);
    tooltip.textContent = content;
    tooltip.hidden = false;
    const bounds = trigger.getBoundingClientRect();
    const width = tooltip.offsetWidth;
    const height = tooltip.offsetHeight;
    tooltip.style.left = `${Math.max(8, Math.min(innerWidth - width - 8, bounds.left + bounds.width / 2 - width / 2))}px`;
    tooltip.style.top = `${Math.max(8, bounds.top - height - 8 >= 8 ? bounds.top - height - 8 : Math.min(innerHeight - height - 8, bounds.bottom + 8))}px`;
  }
  function scheduleHide(): void {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      if (tooltipTrigger?.matches(':hover') || tooltip.matches(':hover'))
        return;
      if (tooltipTrigger?.contains(document.activeElement)) return;
      hideTooltip();
    }, 150);
  }
  function stopAudio(): void {
    playback++;
    player.pause();
    if (player.readyState) player.currentTime = 0;
    if (playing) {
      playing.removeAttribute('data-playing');
      playing.setAttribute('aria-pressed', 'false');
      playing.setAttribute(
        'aria-label',
        playing.dataset.playLabel ?? 'Play audio',
      );
    }
    playing = null;
  }
  function toggleAudio(clip: AudioClip, trigger: HTMLElement): void {
    const wasPlaying = playing === trigger && !player.paused;
    stopAudio();
    if (wasPlaying) return;
    audioError.hidden = true;
    const run = playback;
    playing = trigger;
    trigger.dataset.playLabel =
      trigger.getAttribute('aria-label') ?? 'Play audio';
    trigger.setAttribute('aria-label', `Pause audio: ${audioClips[clip].text}`);
    trigger.setAttribute('aria-pressed', 'true');
    trigger.dataset.playing = 'true';
    player.src = `/demos/creatorkitchen/${audioClips[clip].file}`;
    void player.play().catch(() => {
      if (run !== playback) return;
      stopAudio();
      audioError.hidden = false;
    });
  }

  function existingMark(range: Range, kind: Annotation): HTMLElement | null {
    const node = range.commonAncestorContainer;
    const parent = node instanceof HTMLElement ? node : node.parentElement;
    const mark = parent?.closest(`[data-type="${kind}"]`);
    return mark instanceof HTMLElement && editor.contains(mark) ? mark : null;
  }
  function openAnnotation(kind: Annotation): void {
    hideTooltip();
    const range = getRange();
    if (!range) return;
    const existing = existingMark(range, kind);
    if (existing) range.selectNodeContents(existing);
    if (!range.toString().trim()) {
      onNotice('Select some text first.');
      return;
    }
    if (
      range.cloneContents().querySelector('p, h1, h2, h3, blockquote, figure')
    ) {
      onNotice('Select text within one paragraph.');
      return;
    }
    const marks = Array.from(
      range.cloneContents().querySelectorAll(`[data-type="${kind}"]`),
    ).filter(
      (node): node is HTMLElement =>
        node instanceof HTMLElement && Boolean(node.textContent?.trim()),
    );
    const previous = existing ?? marks[0];
    pending = {
      kind,
      range: range.cloneRange(),
      hasAnnotation: Boolean(previous),
    };
    element('#ck-annotation-heading', HTMLHeadingElement).textContent =
      kind === 'tooltip' ? 'Tooltip' : 'Audio link';
    element('#ck-annotation-selection', HTMLParagraphElement).textContent =
      range.toString();
    element('#ck-tooltip-fields', HTMLElement).hidden = kind !== 'tooltip';
    element('#ck-audio-fields', HTMLElement).hidden = kind !== 'audiolink';
    tooltipInput.required = kind === 'tooltip';
    tooltipInput.value = previous?.dataset.tooltipContent ?? '';
    tooltipInput.setCustomValidity('');
    audioSelect.value = isAudioClip(previous?.dataset.audioClip)
      ? previous.dataset.audioClip
      : 'hello';
    previewAudio.dataset.audioClip = audioSelect.value;
    remove.hidden = !previous;
    dialog.showModal();
    if (kind === 'tooltip') tooltipInput.focus();
    else audioSelect.focus();
  }
  function restoreEditor(range: Range): void {
    setRange(range.cloneRange());
    dialog.close();
    editor.focus({ preventScroll: true });
    const selection = getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    onChange();
  }
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!pending || !editor.contains(pending.range.commonAncestorContainer))
      return;
    const { kind, range } = pending;
    const content = tooltipInput.value.trim();
    if (kind === 'tooltip' && !content) {
      tooltipInput.setCustomValidity('Add tooltip text.');
      tooltipInput.reportValidity();
      return;
    }
    stopAudio();
    let next: Range | null;
    if (kind === 'tooltip') {
      next = apply(range, { kind: 'tooltip', value: content });
    } else {
      const clip = audioSelect.value;
      if (!isAudioClip(clip)) return;
      next = apply(range, { kind: 'audio', value: clip });
    }
    if (!next) return;
    pending = null;
    restoreEditor(next);
  });
  remove.addEventListener('click', () => {
    if (!pending?.hasAnnotation) return;
    stopAudio();
    const { kind, range } = pending;
    const next = apply(range, {
      kind: kind === 'tooltip' ? 'tooltip' : 'audio',
    });
    if (!next) return;
    pending = null;
    restoreEditor(next);
  });
  tooltipInput.addEventListener('input', () =>
    tooltipInput.setCustomValidity(''),
  );
  audioSelect.addEventListener('change', () => {
    stopAudio();
    previewAudio.dataset.audioClip = audioSelect.value;
  });
  element('#ck-add-tooltip', HTMLButtonElement).addEventListener('click', () =>
    openAnnotation('tooltip'),
  );
  element('#ck-add-audio', HTMLButtonElement).addEventListener('click', () =>
    openAnnotation('audiolink'),
  );
  dialog.addEventListener('close', () => {
    pending = null;
    stopAudio();
  });
  player.addEventListener('ended', stopAudio);
  document.addEventListener('pointerover', (event) => {
    const trigger =
      event.target instanceof Element
        ? event.target.closest('[data-tooltip-content]')
        : null;
    if (trigger instanceof HTMLElement && trigger !== tooltipTrigger)
      showTooltip(trigger);
    if (tooltip.contains(event.target instanceof Node ? event.target : null))
      clearTimeout(hideTimer);
  });
  document.addEventListener('pointerout', scheduleHide);
  document.addEventListener('focusin', (event) => {
    const target = event.target;
    const trigger =
      target instanceof HTMLElement
        ? (target.closest('[data-tooltip-content]') ??
          (target.matches('[data-audio-clip]')
            ? target.querySelector('[data-tooltip-content]')
            : null))
        : null;
    if (target instanceof HTMLElement && trigger instanceof HTMLElement) {
      const explanations = Array.from(
        target.querySelectorAll<HTMLElement>('[data-tooltip-content]'),
      );
      const content =
        explanations.length > 1
          ? explanations
              .map(
                (mark) => `${mark.textContent}: ${mark.dataset.tooltipContent}`,
              )
              .join(' · ')
          : trigger.dataset.tooltipContent;
      showTooltip(trigger, target, content);
    } else hideTooltip();
    if (
      target instanceof HTMLElement &&
      target.matches('[data-type]') &&
      editor.contains(target)
    ) {
      const range = document.createRange();
      range.selectNodeContents(target);
      setRange(range);
    }
  });
  document.addEventListener('focusout', scheduleHide);
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const audio = event.target.closest('[data-audio-clip]');
    if (
      audio instanceof HTMLElement &&
      !editor.contains(audio) &&
      isAudioClip(audio.dataset.audioClip)
    ) {
      event.preventDefault();
      toggleAudio(audio.dataset.audioClip, audio);
    }
    const trigger = event.target.closest('[data-tooltip-content]');
    if (trigger instanceof HTMLElement)
      showTooltip(trigger, audio instanceof HTMLElement ? audio : trigger);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hideTooltip();
    const target = event.target;
    if (
      target instanceof HTMLElement &&
      editor.contains(target) &&
      (event.metaKey || event.ctrlKey)
    ) {
      if (event.key === '/' || event.key === '"') {
        event.preventDefault();
        openAnnotation(event.key === '/' ? 'tooltip' : 'audiolink');
        return;
      }
    }
    if (!(target instanceof HTMLElement) || target.tagName === 'BUTTON') return;
    if (
      (event.key === 'Enter' || event.key === ' ') &&
      target.matches('[data-audio-clip]') &&
      !editor.contains(target) &&
      isAudioClip(target.dataset.audioClip)
    ) {
      event.preventDefault();
      toggleAudio(target.dataset.audioClip, target);
    }
  });
  function repositionTooltip(): void {
    if (
      !tooltip.hidden &&
      tooltipTrigger &&
      described &&
      described.contains(document.activeElement)
    ) {
      showTooltip(tooltipTrigger, described, tooltip.textContent ?? undefined);
    } else hideTooltip();
  }
  document.addEventListener('scroll', repositionTooltip, true);
  window.addEventListener('resize', repositionTooltip);
  window.addEventListener('pagehide', stopAudio);
  return {
    reset: () => {
      hideTooltip();
      stopAudio();
      audioError.hidden = true;
    },
  };
}
