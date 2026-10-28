import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Design-unit macros for CSS, so stylesheets can be written in Figma pixels:
 *   u(48)  -> calc(48 * var(--u))   fluid unit (min of width/height ratio to the 1440x870 frame)
 *   ux(72) -> calc(72 * var(--ux))  width-only unit, used for horizontal gutters
 *   t(11)  -> max(calc(11 * var(--u)), calc(11 * var(--t-floor)))  small text with a readability floor
 */
function designUnits(): Plugin {
  return {
    name: 'kolaba-design-units',
    enforce: 'pre',
    transform(code, id) {
      if (!/\.css(\?|$)/.test(id)) return null;
      return code.replace(/\b(ux|u|t)\((-?\d*\.?\d+)\)/g, (_m, fn: string, n: string) => {
        if (fn === 'u') return `calc(${n} * var(--u))`;
        if (fn === 'ux') return `calc(${n} * var(--ux))`;
        return `max(calc(${n} * var(--u)), calc(${n} * var(--t-floor)))`;
      });
    },
  };
}

const repoName = 'kolaba-invest';

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? `/${repoName}/` : '/',
  plugins: [designUnits(), react()],
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    // The only large chunk is the lazily loaded Natural Earth geodata for slide 06.
    chunkSizeWarningLimit: 800,
  },
});
