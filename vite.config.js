import { fileURLToPath, URL } from 'node:url'
import Unocss from 'unocss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
/* global process */
export default defineConfig({
  plugins: [
    vue(),
    Unocss()
  ],
  base: process.env.NODE_ENV === "production" ? "/vue2023-week3/" : "/",
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
