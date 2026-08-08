import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/mfe.ts',
      formats: ['es'],
      fileName: () => 'yum-cart-checkout.js',
    },
    outDir: 'dist/mfe',
    sourcemap: true,
    target: 'es2020',
    rolldownOptions: {
      output: { codeSplitting: false },
    },
  },
});
