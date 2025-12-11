// Improved markup parser: extract code blocks and inline code first to avoid conflicts,
// process markdown safely on the remaining text, then restore code content.
// Pendekatan: placeholder untuk code fences dan inline code, escape HTML, lalu formatting.

function useMarkUpText(input) {
  if (!input && input !== '') return '';
  let text = String(input);

  // Helpers
  const htmlEscape = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Storage for placeholders
  const codeBlocks = []; // {lang, content}
  const inlineCodes = [];

  // 1) Extract fenced code blocks ```[lang]\n...\n```
  // Capture optional language after opening backticks
  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (m, lang, content) => {
    const idx = codeBlocks.length;
    codeBlocks.push({ lang: lang || '', content });
    return `@@CODEBLOCK_${idx}@@`;
  });

  // 2) Extract inline code `...` (don't cross newlines)
  text = text.replace(/`([^`\n]+)`/g, (m, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(code);
    return `@@INLINECODE_${idx}@@`;
  });

  // 3) Escape remaining HTML to avoid injection and accidental tag parsing
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 4) Hyperlinks (http(s) and www.) — do this before emphasis so links are intact
  // Keep the display same as URL. Add rel and target for safety.
  text = text.replace(
    /(\b(?:https?:\/\/|ftp:\/\/|www\.)[^\s<]+)/gi,
    (m) => {
      const href = m.startsWith('www.') ? 'http://' + m : m;
      return `<a href="${htmlEscape(href)}" target="_blank" rel="noopener noreferrer">${htmlEscape(m)}</a>`;
    }
  );

  // 5) Strikethrough: ~~text~~
  text = text.replace(/~~([\s\S]*?)~~/g, '<s>$1</s>');

  // 6) Bold + Italic: ***text*** or ___text___ (handle first to avoid consuming by later rules)
  text = text.replace(/(\*\*\*|___)([\s\S]*?)\1/g, '<strong><em>$2</em></strong>');

  // 7) Bold: **text** or __text__
  text = text.replace(/(\*\*|__)([\s\S]*?)\1/g, '<strong>$2</strong>');

  // 8) Italic: *text* or _text_
  // Avoid matching stars that are part of list markers by requiring non-space after opening and non-space before closing
  text = text.replace(/(^|[^*_\w-])(\*|_)([^\s][\s\S]*?[^\s])\2([^*_\w-]|$)/g, (m, p1, p2, inner, p4) => {
    return `${p1}<em>${inner}</em>${p4}`;
  });

  // 9) Convert list-item asterisks at line start to bullet (•) — safe because emphasis already handled
  text = text.replace(/^(\s*)\* +/gm, '$1• ');

  // 10) Optional: convert middle asterisk bullets back to • inside lines like "*word" -> "•word"
  text = text.replace(/\b\*(?=[A-Za-z0-9])/g, '•');

  // Trim intermediate whitespace but preserve line breaks
  text = text.replace(/^\s+|\s+$/g, '');

  // 11) Restore inline codes (escape their content and wrap in <code> or <mark> as desired)
  inlineCodes.forEach((code, i) => {
    const placeholder = `@@INLINECODE_${i}@@`;
    const replacement = `<mark class="mark-a">${htmlEscape(code)}</mark>`;
    text = text.replace(new RegExp(escapeRegExp(placeholder), 'g'), replacement);
  });

  // 12) Restore code blocks (wrap in <pre><code>, escape content, include language class if present)
  codeBlocks.forEach((block, i) => {
    const placeholder = `@@CODEBLOCK_${i}@@`;
    const langClass = block.lang ? ` lang-${htmlEscape(block.lang)}` : '';
    const codeHtml = `<pre class="m-0"><code class="line-numbers${langClass}">${htmlEscape(block.content)}</code></pre>`;
    text = text.replace(new RegExp(escapeRegExp(placeholder), 'g'), codeHtml);
  });

  return text;
}
