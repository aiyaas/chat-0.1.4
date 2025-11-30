// Apply highlighting block by block after DOM update
// https://prismjs.com/
const debounce = (func, delay) => { let timeout; return () => { clearTimeout(timeout); timeout = setTimeout(func, delay);};};

const observer = new MutationObserver(debounce(() => {
  document.querySelectorAll('pre code').forEach((block, index) => {
    setTimeout(() => {
      return Prism.highlightElement(block);
    }, index * 100); // Delay each block by 100ms
  });
}, 500)); // Debounce delay 500ms

observer.observe(document.body, {
  childList: true,
  subtree: true,
});