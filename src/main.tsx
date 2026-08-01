// Patch window.fetch if it is getter-only in sandboxed environment
(function() {
  try {
    const desc = Object.getOwnPropertyDescriptor(window, 'fetch') || 
                 (Object.getPrototypeOf(window) && Object.getOwnPropertyDescriptor(Object.getPrototypeOf(window), 'fetch'));
    if (desc && desc.get && !desc.set) {
      let _fetch = desc.get.call(window);
      Object.defineProperty(window, 'fetch', {
        get: () => _fetch,
        set: (v) => { _fetch = v; },
        configurable: true,
        enumerable: true
      });
    }
  } catch (e) {
    // ignore
  }
})();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
