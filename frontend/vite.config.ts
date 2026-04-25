import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendBase = env.VITE_BACKEND_API_BASE?.trim();
  let proxy;

  if (backendBase) {
    const targetUrl = new URL(backendBase);
    proxy = {
      '/__gas_api__': {
        target: targetUrl.origin,
        changeOrigin: true,
        rewrite: (path: string) =>
          path.replace(/^\/__gas_api__/, targetUrl.pathname),
      },
    };
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy,
    },
  };
});
