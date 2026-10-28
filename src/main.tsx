import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/montserrat/800.css';
import './styles/tokens.css';
import './styles/global.css';
import { ContentProvider } from './content';
import { App } from './App';

if (import.meta.env.DEV) {
  // QA helper: lets automated checks fast-forward animations (dev builds only).
  import('gsap').then(({ default: gsap }) => Object.assign(window, { __gsap: gsap }));
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ContentProvider locale="en">
      <App />
    </ContentProvider>
  </StrictMode>,
);
