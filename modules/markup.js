// Improved INCE-like markup processor
// Goals:
// - Prevent conflicts between different markdown marks (e.g. ``` ``` and `...`, ***bold+italic***, links, etc.)
// - Be "smart": extract and protect code spans/blocks first, apply transformations on the rest,
//   then restore the protected parts safely (with escaping).
// - Handle combined marks (*** = bold+italic), bold (**), italic (_), strikethrough (~~), links,
//   and numbered lists from lines starting with '* ' (convert to <ol>).
// - Provide optional sensor-word censorship list and option to encode HTML input.
//
// Usage (backwards-compatible):
//   useMarkUpText(text)
// or with options:
//   useMarkUpText(text, { encodeHtml: true, sensors: ['badword'] })
function useMarkUpText(inputText, options = {}) {
  if (typeof inputText !== 'string' || inputText.length === 0) return '';

  const opts = {
    encodeHtml: options.encodeHtml ?? true,
    sensors: Array.isArray(options.sensors) ? options.sensors : [],
  };

  let text = String(inputText);

  // storage for extracted segments to avoid double-processing
  const placeholders = {
    codeBlocks: [],
    inlineCodes: [],
  };

  const makePlaceholder = (type, idx) => `__INTERNAL_${type.toUpperCase()}_${idx}__`;

  // Helper: escape HTML (for safe output)
  const escapeHtml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // 1) Extract fenced code blocks ```...``` (preserve exact content)
  //    supports optional language after opening ```
  text = text.replace(/```([\s\S]*?)```/g, (match, p1) => {
    const idx = placeholders.codeBlocks.length;
    placeholders.codeBlocks.push(p1); // store raw content
    return makePlaceholder('CODE_BLOCK', idx);
  });

  // 2) Extract inline code `...` (not in code blocks because already removed)
  //    avoid matching backticks inside backticks by using a simple non-greedy regex
  text = text.replace(/`([^`\n]+?)`/g, (match, p1) => {
    const idx = placeholders.inlineCodes.length;
    placeholders.inlineCodes.push(p1);
    return makePlaceholder('INLINE_CODE', idx);
  });

  // 3) Optionally encode any remaining HTML in user input so tags won't be executed
  if (opts.encodeHtml) {
    text = escapeHtml(text);
  }

  // 4) Apply other markdown transforms (on the safe text)
  // Process combined patterns first to avoid conflicts:
  //  - bold+italic (***text***)
  text = text.replace(/\*\*\*([\s\S]+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  //  - strikethrough ~~text~~
  text = text.replace(/~~([\s\S]+?)~~/g, '<s>$1</s>');

  //  - bold **text**
  text = text.replace(/\*\*([\s\S]+?)\*\*/g, '<strong>$1</strong>');

  //  - italic _text_
  //    avoid changing underscores inside words by requiring surrounding non-word or boundaries
  text = text.replace(/(^|[\s\W])_([^_\s][\s\S]*?[^_\s])_(?=$|[\s\W])/g, (m, p1, p2) => {
    return `${p1}<em>${p2}</em>`;
  });

  //  - MiddleDot: convert leading "*" used as visual marker to "•" when it's followed by a letter
  text = text.replace(/(^|\s)\*(?=[A-Za-z0-9])/g, '$1•');

  //  - Convert bare URLs to anchors (http, https, ftp). Added rel and target for safety.
  //    Use a conservative URL regex.
  text = text.replace(/\b((?:https?|ftp):\/\/[^\s<>"'`]+)/g, (m) => {
    const href = m;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer nofollow">${href}</a>`;
  });

  //  - Handle numbered lists from lines starting with '* ':
  //    Convert contiguous groups of lines that start with '* ' into <ol><li>..</li></ol>
  text = text.replace(/(^|\n)((?:\* [^\n]+\n?)+)/g, (m, p1, p2) => {
    // p2 contains the group of lines like "* item\n* item\n"
    const items = p2.split(/\n/).filter(Boolean).map((line) => line.replace(/^\*\s+/, '').trim());
    if (items.length === 0) return p2;
    const ol = '<ol>' + items.map((it) => `<li>${it}</li>`).join('') + '</ol>';
    return (p1 === '') ? ol : `\n${ol}`;
  });

  //  - BulletToAsterisk: convert bullet '•' (middle dot) back to '*' if desired
  //    (We keep middle dot conversion above, so don't reverse it here.)

  //  - SensorsWords: censor a list of words (if provided)
  if (opts.sensors.length > 0) {
    // Build a safe regex that matches whole words (case-insensitive)
    const safeWords = opts.sensors.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).filter(Boolean);
    if (safeWords.length > 0) {
      const sensorRe = new RegExp(`\\b(${safeWords.join('|')})\\b`, 'gi');
      text = text.replace(sensorRe, (m) => '*'.repeat(m.length));
    }
  }

  // 5) Restore inline code placeholders (escape inner content and wrap in <code> or <mark>)
  placeholders.inlineCodes.forEach((raw, i) => {
    const safe = escapeHtml(raw);
    // Use <mark> to emulate original design for inline code
    const html = `<mark class="mark-a">${safe}</mark>`;
    text = text.replace(makePlaceholder('INLINE_CODE', i), html);
  });

  // 6) Restore fenced code block placeholders, wrap in <pre><code> and escape content.
  placeholders.codeBlocks.forEach((raw, i) => {
    // We preserved raw content between backticks; escape it to avoid HTML injection,
    // then put into a code block. We can try to detect language if provided, but since
    // we extracted with a simple regex we only have raw content here.
    const safe = escapeHtml(raw);
    const html = `<pre class="m-0"><code class="lang-js line-numbers">${safe}</code></pre>`;
    text = text.replace(makePlaceholder('CODE_BLOCK', i), html);
  });

  // 7) Trim and return
  return String(text).trim();
}

// Export for CommonJS / browser compatibility (depending on environment)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { useMarkUpText };
} else {
  window.useMarkUpText = useMarkUpText;
}
