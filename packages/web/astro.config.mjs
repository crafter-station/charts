// @ts-check
import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';

const crafterTheme = JSON.parse(
  readFileSync(new URL('./src/themes/crafter-charts.json', import.meta.url), 'utf-8')
);

export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: crafterTheme,
    },
  },
});
