import { defineConfig } from 'unocss'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import transformerDirectives from '@unocss/transformer-directives'
import presetIcons from '@unocss/preset-icons';
import { presetAttributify } from 'unocss'
import { presetUno } from 'unocss';
export default defineConfig({
    transformers: [
        transformerVariantGroup(),
        transformerDirectives(),
    ],
    presets: [
        presetUno(),
        presetIcons(),
        presetAttributify()
    ]
})