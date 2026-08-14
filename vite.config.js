import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "path";

export default defineConfig(({ mode }) => {

  return {
    plugins: [vue()],
    resolve: {
        alias: {
          "@": resolve(__dirname, "src"),
        },
      },
      css: {
        preprocessorOptions: {
          scss: {
            silenceDeprecations: ['import', 'global-builtin', 'color-functions'],
          },
        },
      },
    }
})
