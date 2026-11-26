/** @jsxImportSource react */
import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { BubbleMenu, isTextSelection, type Editor } from '@tiptap/react';
import {
  RiPlayLine,
  RiPauseLine,
  RiLinkUnlinkM,
  RiExternalLinkLine,
} from 'react-icons/ri';
import { uploadFile } from './services';

interface Props {
  editor: Editor;
  audioLinkToolbar: MutableRefObject<'show' | 'hide'>;
}
function audioAttributes(editor: Editor): { src: string; title: string } {
  const value: unknown = editor.getAttributes('audiolink');
  return {
    src:
      value &&
      typeof value === 'object' &&
      'src' in value &&
      typeof value.src === 'string'
        ? value.src
        : '',
    title:
      value &&
      typeof value === 'object' &&
      'title' in value &&
      typeof value.title === 'string'
        ? value.title
        : '',
  };
}
export default function AudioLinkInput({ editor, audioLinkToolbar }: Props) {
  const { src, title } = audioAttributes(editor);
  const input = useRef<HTMLInputElement>(null);
  const audio = useRef<HTMLAudioElement>();
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    const player = new Audio(src || undefined);
    audio.current = player;
    setPlaying(false);
    setError('');
    const started = () => setPlaying(true);
    const stopped = () => setPlaying(false);
    const ended = () => {
      setPlaying(false);
      player.currentTime = 0;
    };
    const failed = () => {
      setPlaying(false);
      setError('Couldn’t play this file. Choose another audio file.');
    };
    player.addEventListener('play', started);
    player.addEventListener('pause', stopped);
    player.addEventListener('ended', ended);
    player.addEventListener('error', failed);
    return () => {
      player.removeEventListener('play', started);
      player.removeEventListener('pause', stopped);
      player.removeEventListener('ended', ended);
      player.removeEventListener('error', failed);
      player.pause();
      if (audio.current === player) audio.current = undefined;
    };
  }, [src]);
  async function attach(file: File): Promise<void> {
    try {
      const source = await uploadFile(file);
      const chain = editor
        .chain()
        .focus()
        .extendMarkRange('audiolink')
        .unsetMark('link')
        .setMark('audiolink', { src: source, title: file.name });
      if (editor.isActive('tooltip')) {
        const tooltip: unknown = editor.getAttributes('tooltip');
        const content =
          tooltip &&
          typeof tooltip === 'object' &&
          'data-tooltip-content' in tooltip &&
          typeof tooltip['data-tooltip-content'] === 'string'
            ? tooltip['data-tooltip-content']
            : '';
        chain.setMark('tooltip', {
          'data-tooltip-content': content,
          activeLink: true,
        });
      }
      chain.setTextSelection(editor.state.selection.$head.pos).run();
    } catch {
      setError('Couldn’t attach the file. Choose an audio file and try again.');
    }
  }
  function toggle(): void {
    const player = audio.current;
    if (!player) return;
    if (!player.paused) {
      player.pause();
      player.currentTime = 0;
    } else {
      setError('');
      void player
        .play()
        .catch(() =>
          setError('Couldn’t play this file. Choose another audio file.'),
        );
    }
  }
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="audioLinkInput"
      tippyOptions={{
        maxWidth: 360,
        placement: 'bottom',
        interactive: true,
        onHide() {
          const player = audio.current;
          if (player && !player.paused) {
            player.pause();
            player.currentTime = 0;
          }
        },
      }}
      shouldShow={({ view, state, from, to }) => {
        const show =
          audioLinkToolbar.current !== 'hide' &&
          view.hasFocus() &&
          !state.selection.empty &&
          !(
            isTextSelection(state.selection) &&
            !state.doc.textBetween(from, to).length
          );
        if (!show) audio.current?.pause();
        return show;
      }}
      className="ck-audio-toolbar"
    >
      <input
        ref={input}
        type="file"
        accept="audio/*"
        hidden
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) void attach(file);
          event.currentTarget.value = '';
        }}
      />
      <div className="ck-audio-row" role="toolbar" aria-label="Audio link">
        <button
          type="button"
          className="ck-audio-file"
          title={title || 'Choose an audio file'}
          onClick={() => input.current?.click()}
        >
          {title || 'Choose an audio file…'}
        </button>
        <button
          type="button"
          className="ck-tool-button"
          aria-label={playing ? 'Stop audio' : 'Play audio'}
          disabled={!src}
          onClick={toggle}
        >
          {playing ? (
            <RiPauseLine aria-hidden="true" />
          ) : (
            <RiPlayLine aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          className="ck-tool-button"
          aria-label="Open link to file"
          disabled={!src}
          onClick={() => window.open(src, '_blank', 'noopener,noreferrer')}
        >
          <RiExternalLinkLine aria-hidden="true" />
        </button>
        <button
          type="button"
          className="ck-tool-button"
          aria-label="Remove audio link"
          disabled={!src}
          onClick={() =>
            editor
              .chain()
              .focus()
              .extendMarkRange('audiolink')
              .unsetMark('audiolink')
              .run()
          }
        >
          <RiLinkUnlinkM aria-hidden="true" />
        </button>
      </div>
      {error && (
        <p className="ck-audio-error" role="alert">
          {error}
        </p>
      )}
    </BubbleMenu>
  );
}
