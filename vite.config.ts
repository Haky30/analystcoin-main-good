import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react-chartjs-2',
      'chart.js',
      'react-hot-toast',
      'axios',
      'crypto-js'
    ]
  },
});