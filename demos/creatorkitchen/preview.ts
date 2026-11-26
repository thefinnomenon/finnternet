/** Remove editor-only controls while keeping the original serialized content. */
export function readOnlyHTML(content: string): string {
  const template = document.createElement('template');
  template.innerHTML = content;
  for (const media of template.content.querySelectorAll(
    '[data-type="media"]',
  )) {
    if (media.getAttribute('src')?.trim()) continue;
    media.className = 'ck-media-placeholder';
    media.textContent = 'Media not added';
  }
  for (const element of template.content.querySelectorAll('[contenteditable]'))
    element.removeAttribute('contenteditable');
  for (const control of template.content.querySelectorAll(
    'input, textarea, select, button',
  ))
    control.setAttribute('disabled', '');
  for (const handle of template.content.querySelectorAll('[data-drag-handle]'))
    handle.remove();
  for (const button of template.content.querySelectorAll(
    '[data-type="callout"] button',
  )) {
    const icon = document.createElement('span');
    icon.className = 'ck-callout-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.innerHTML = button.innerHTML;
    button.replaceWith(icon);
  }
  return template.innerHTML;
}
