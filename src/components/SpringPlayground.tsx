import {
  createMemo,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
} from 'solid-js';
import { translations, type Locale } from '../lib/i18n';

interface Props {
  locale: Locale;
  compact?: boolean;
}

export default function SpringPlayground(props: Props) {
  const t = translations[props.locale];
  const id = createUniqueId();
  const [stiffness, setStiffness] = createSignal(120);
  const [damping, setDamping] = createSignal(14);
  const [position, setPosition] = createSignal(95);
  const [reducedMotion, setReducedMotion] = createSignal(false);
  let frame = 0;
  let mounted = false;

  const spring = createMemo(() => {
    const start = 65;
    const end = 260 + position() - 20;
    const points = Array.from(
      { length: 16 },
      (_, i) => `${start + ((i + 1) * (end - start)) / 17},${i % 2 ? 91 : 65}`,
    );
    return `M40 78H${start} L${points.join(' L')} L${end} 78 H${260 + position()}`;
  });

  const replay = () => {
    cancelAnimationFrame(frame);
    setPosition(95);
    if (!mounted || reducedMotion()) return;
    let x = 95;
    let velocity = 0;
    let previous = 0;
    let elapsed = 0;
    const animate = (time: number) => {
      const dt = previous ? Math.min((time - previous) / 1000, 0.04) : 0;
      previous = time;
      elapsed += dt;
      // Small fixed substeps keep the spring stable at every supported slider value.
      const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
      for (let i = 0; i < steps; i++) {
        velocity += ((-stiffness() * x - damping() * velocity) * dt) / steps;
        x += (velocity * dt) / steps;
      }
      setPosition(x);
      if ((Math.abs(x) < 0.02 && Math.abs(velocity) < 0.02) || elapsed > 10) {
        setPosition(0);
        return;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
  };

  onMount(() => {
    mounted = true;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        cancelAnimationFrame(frame);
        setPosition(0);
      }
    };
    updateMotion();
    preference.addEventListener('change', updateMotion);
    if (!preference.matches) replay();
    onCleanup(() => {
      cancelAnimationFrame(frame);
      preference.removeEventListener('change', updateMotion);
    });
  });

  return (
    <div class={`spring-playground${props.compact ? ' spring-compact' : ''}`}>
      <div class="spring-stage">
        <svg
          viewBox="0 0 520 156"
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>{t.playground}</title>
          <desc id={`${id}-desc`}>{t.demoDescription}</desc>
          <defs>
            <pattern
              id={`${id}-grid`}
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path d="M20 0H0V20" class="spring-grid-line" fill="none" />
            </pattern>
          </defs>
          <rect width="520" height="156" fill={`url(#${id}-grid)`} />
          <path
            d="M40 38v80M28 44l12-12M28 58l12-12M28 72l12-12M28 86l12-12M28 100l12-12M28 114l12-12"
            class="spring-wall"
            fill="none"
          />
          <line
            x1="280"
            x2="280"
            y1="22"
            y2="135"
            class="spring-rest"
            stroke-dasharray="5 5"
          />
          <path d={spring()} class="spring-coil" fill="none" />
          <rect
            x={260 + position()}
            y="59"
            width="39"
            height="39"
            class="spring-block"
          />
        </svg>
      </div>
      <div class="spring-inputs">
        <div class="spring-control">
          <label for={`${id}-stiffness`}>
            {t.stiffness}
            <output>{stiffness()}</output>
          </label>
          <input
            id={`${id}-stiffness`}
            type="range"
            min="30"
            max="260"
            step="1"
            value={stiffness()}
            onInput={(event) => {
              setStiffness(event.currentTarget.valueAsNumber);
              replay();
            }}
          />
        </div>
        <div class="spring-control">
          <label for={`${id}-damping`}>
            {t.damping}
            <output>{damping()}</output>
          </label>
          <input
            id={`${id}-damping`}
            type="range"
            min="1"
            max="35"
            step="1"
            value={damping()}
            onInput={(event) => {
              setDamping(event.currentTarget.valueAsNumber);
              replay();
            }}
          />
        </div>
        <button
          type="button"
          class="retro-button replay-button"
          onClick={replay}
          disabled={reducedMotion()}
        >
          <span aria-hidden="true">↻</span> {t.replay}
        </button>
      </div>
      <p class="spring-hint" aria-live="polite">
        {reducedMotion() ? t.reducedMotion : t.demoHint}
      </p>
      <noscript>
        <p>{t.demoDescription}</p>
      </noscript>
    </div>
  );
}
