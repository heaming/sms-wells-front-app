import { defineConfig } from 'kw-lib/config/vite';
import { createHash } from 'crypto';

export default defineConfig({
  openVisualizer: false,
  sourcemap: false,
  rollupOptions: {
    output: {
      entryFileNames: (chunkInfo) => {
        const hash = createHash('md5')
          .update(Object.values(chunkInfo.modules).map((m) => m.code).join())
          .digest('hex')
          .substr(0, 6);
        return `assets/[name].${hash}.js`;
      },
      chunkFileNames: (chunkInfo) => {
        if (chunkInfo.name === 'plugin-vue_export-helper') {
          return 'assets/[name].js';
        }
        const hash = createHash('md5')
          .update(Object.values(chunkInfo.modules).map((m) => m.code).join())
          .digest('hex')
          .substr(0, 6);
        return `assets/[name].${hash}.js`;
      },
    },
  },
});
