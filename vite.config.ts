import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@/components': '/src/components',
      '@/pages': '/src/pages',
      '@/hooks': '/src/hooks',
      '@/store': '/src/store',
      '@/services': '/src/services',
      '@/types': '/src/types',
      '@/utils': '/src/utils',
      '@/theme': '/src/theme',
    },
  },
  server: {
    port: 3000,
    open: true,
proxy: {
      '/api': {
        target: 'https://test.myfamilydoc.it:443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/auth': {
        target: 'https://test.myfamilydoc.it:443',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
    },
  
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
});
/**
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },

  // ⬇️ SOLO IN DEV
  server: command === 'serve'
    ? {
        port: 3000,
        open: true,
        proxy: {
          '/api': {
            target: 'https://test.myfamilydoc.it',
            changeOrigin: true,
            secure: false,
          },
        },
      }
    : undefined,

  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'mui-vendor': ['@mui/material', '@mui/icons-material'],
        },
      },
    },
  },
}));
*/