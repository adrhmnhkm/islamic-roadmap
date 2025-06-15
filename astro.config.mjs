import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  integrations: [tailwind(), react()],
  vite: {
    optimizeDeps: {
      include: ['react', 'react-dom']
    },
    define: {
      'process.env.BREVO_API_KEY': JSON.stringify(process.env.BREVO_API_KEY),
      'process.env.BREVO_LIST_ID': JSON.stringify(process.env.BREVO_LIST_ID)
    }
  }
});