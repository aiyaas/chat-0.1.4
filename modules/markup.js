function useMarkUpText(text) {
  // STEP 1: Isolate multiline code blocks ```...``` so no one else touches them
  const codeBlocks = [];
  text = text.replace(/```([\s\S]*?)```/g, (match, p1) => {
    const key = `{{CODEBLOCK_${codeBlocks.length}}}`;
    codeBlocks.push(`<pre class="m-0"><code class="lang-js line-numbers">${p1}</code></pre>`);
    
    return key;
  });

  // STEP 2: Run all other markdown safely
  const applyFormatting = (txt, type) => {
    switch (type) {
      case 'MultilineCode':
        // Already handled at STEP 1
        return txt;
      case 'InlineCode':
        return txt.replace(/`([^`]+)`/g, '<mark class="mark-a">$1</mark>');
      case 'Strikethrough':
        return txt.replace(/~~(.*?)~~/g, '<s>$1</s>');
      case 'Thick':
        return txt.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
      case 'EncodeHTML':
        return txt.replace(/<(.*?)>/g, '&#60;$1&#62;');
      case 'HyperLink':
        return txt.replace(/\b((?:https?|ftp):\/\/[^\s]+)/g, '<a href="$1">$1</a>');
      case 'SensorsWords':
        return txt.replace(new RegExp([].join('|'), 'gi'), '****');
      case 'BulletToAsterisk':
        return txt.replace(/\•/g, '*');
      case 'MiddleDot':
        return txt.replace(/\b\*(?=[a-zA-Z])/g, '•');
      case 'Italicize':
        return txt.replace(/_(.*?)_/g, '<i>$1</i>');
      case 'NumberedList':
        let num = 0;
        return txt.replace(/\* \w+/gi, m => `${num++}. ${m.slice(1)}`);
      default:
        return txt;
    }
  };

  [
    'Strikethrough',
    'Thick',
    'EncodeHTML',
    'HyperLink',
    'InlineCode',
    'SensorsWords',
    'BulletToAsterisk',
    'MiddleDot',
    'Italicize',
    'NumberedList'
  ].forEach(f => {
    text = applyFormatting(text, f);
  });

  // STEP 3: Restore the code blocks untouched
  text = text.replace(/{{CODEBLOCK_(\d+)}}/g, (_, i) => codeBlocks[i]);

  return text.trim();
}
