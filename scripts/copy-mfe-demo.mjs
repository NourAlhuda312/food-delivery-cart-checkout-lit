import { copyFile, mkdir } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
await copyFile('mfe-demo.html', 'dist/mfe-demo.html');
