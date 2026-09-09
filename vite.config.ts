import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
export default defineConfig({
  base: './',
  plugins: [react(), {
    name: 'production-security-policy',
    apply: 'build',
    transformIndexHtml() {
      return [{tag:'meta',attrs:{'http-equiv':'Content-Security-Policy',content:"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; manifest-src 'self'; connect-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"},injectTo:'head-prepend'},
      {tag:'meta',attrs:{name:'referrer',content:'no-referrer'},injectTo:'head-prepend'}];
    },
  }],
  resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 5173 },
});
