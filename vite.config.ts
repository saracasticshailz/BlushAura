import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import defaults from './src/brand.defaults.json';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const name = process.env.VITE_APP_NAME?.trim() || env.VITE_APP_NAME?.trim() || defaults.appName;
  const htmlName = name.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character]!,
  );
  return {
    plugins: [
      react(),
      {
        name: 'app-branding',
        transformIndexHtml: (html) => html.replaceAll('__APP_NAME__', htmlName),
      },
    ],
    server: { proxy: { '/api': 'http://127.0.0.1:8081' } },
    preview: { proxy: { '/api': 'http://127.0.0.1:8081' } },
  };
});
