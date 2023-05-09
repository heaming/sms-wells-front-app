import { defineConfig } from 'kw-lib/config/vite';
import { createHash } from 'crypto';

export default defineConfig({
  openVisualizer: false,
  sourcemap: false,
  rollupOptions: {
    output: {
      entryFileNames: 'assets/[name].js',
      chunkFileNames: (chunkInfo) => {
        const hash = createHash('md5')
          .update(Object.values(chunkInfo.modules).map((m) => m.code).join())
          .digest('hex')
          .substr(0, 6);
        return `assets/[name].${hash}.js`;
      },
    },
  },
});
