import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import fs from 'fs';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monacoEditorPlugin(),
    Components({
      resolvers: [ElementPlusResolver()]
    }),
    fileList()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@topology3D': path.resolve(__dirname, './src/topology3D')
    }
  },
  server: {
    proxy: {}
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          // 'primary-color': '#1890ff'
          // "link-color": "#fb8501",
          // "table-row-hover-bg": "#fb850103",
          // "tree-node-selected-bg": "#fb850100",
        },
        javascriptEnabled: true
      }
    }
  }
});

function fileList() {
  return {
    name: 'vite-plugin-3d-files',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const { url } = req;

        if (url.startsWith('/3d/') && url.endsWith('/')) {
          const pwd = path.join(__dirname, 'public', url);
          const files = fs.readdirSync(pwd, {
            withFileTypes: true
          });

          const list = [];
          for (const item of files) {
            if (item.isDirectory()) {
              list.push({ name: item.name, type: 'directory' });
            } else {
              list.push({ name: item.name });
            }
          }
          res.end(JSON.stringify(list));
        } else {
          next();
        }
      });
    }
  };
}

function getStat(path: string) {
  return new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        resolve(false);
      } else {
        resolve(stats);
      }
    });
  });
}
