import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Molt',
  description: 'High-performance data transformation stack',
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Benchmarks', link: '/benchmarks' },
      {
        text: 'Packages',
        items: [
          { text: 'JSON', link: '/packages/json/' },
          { text: 'YAML', link: '/packages/yaml/' },
          { text: 'TOML', link: '/packages/toml/' },
          { text: 'INI', link: '/packages/ini/' },
          { text: 'CSV', link: '/packages/csv/' },
          { text: 'XML', link: '/packages/xml/' },
          { text: 'MessagePack', link: '/packages/msgpack/' },
          { text: 'TOON', link: '/packages/toon/' },
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'Getting Started', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Quick Start', link: '/guide/quick-start' },
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Type Preservation', link: '/guide/type-preservation' },
            { text: 'Dirty Input', link: '/guide/dirty-input' },
            { text: 'Performance', link: '/guide/performance' },
          ]
        }
      ],
      
      '/packages/json/': [
        {
          text: 'JSON Package',
          items: [
            { text: 'Overview', link: '/packages/json/' },
            { text: 'Parsing', link: '/packages/json/parsing' },
            { text: 'Serialization', link: '/packages/json/serialization' },
            { text: 'Type Preservation', link: '/packages/json/types' },
            { text: 'Streaming', link: '/packages/json/streaming' },
            { text: 'Validation', link: '/packages/json/validation' },
          ]
        }
      ],

      '/packages/yaml/': [
        {
          text: 'YAML Package',
          items: [
            { text: 'Overview', link: '/packages/yaml/' },
            { text: 'Parsing', link: '/packages/yaml/parsing' },
            { text: 'Serialization', link: '/packages/yaml/serialization' },
          ]
        }
      ],

      '/packages/toml/': [
        {
          text: 'TOML Package',
          items: [
            { text: 'Overview', link: '/packages/toml/' },
            { text: 'Parsing', link: '/packages/toml/parsing' },
            { text: 'Serialization', link: '/packages/toml/serialization' },
          ]
        }
      ],

      '/packages/csv/': [
        {
          text: 'CSV Package',
          items: [
            { text: 'Overview', link: '/packages/csv/' },
            { text: 'Parsing', link: '/packages/csv/parsing' },
            { text: 'Serialization', link: '/packages/csv/serialization' },
            { text: 'WASM Acceleration', link: '/packages/csv/wasm' },
          ]
        }
      ],

      '/packages/xml/': [
        {
          text: 'XML Package',
          items: [
            { text: 'Overview', link: '/packages/xml/' },
            { text: 'Parsing', link: '/packages/xml/parsing' },
            { text: 'Serialization', link: '/packages/xml/serialization' },
            { text: 'Dirty XML', link: '/packages/xml/dirty' },
          ]
        }
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/SylphxAI/molt' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Sylphx'
    },

    search: {
      provider: 'local'
    }
  },

  head: [
    // Favicons
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],

    // PWA icons
    ['link', { rel: 'manifest', href: '/manifest.json' }],

    // Meta tags
    ['meta', { name: 'theme-color', content: '#3b82f6' }],
    ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
    ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],

    // Open Graph
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'Molt' }],
    ['meta', { property: 'og:title', content: 'Molt - High-Performance Data Transformation' }],
    ['meta', { property: 'og:description', content: 'High-performance data transformation stack for JSON, YAML, TOML, CSV, XML, INI, MessagePack, and TOON. Up to 415x faster than alternatives.' }],
    ['meta', { property: 'og:image', content: 'https://molt.vercel.app/og-image.png' }],
    ['meta', { property: 'og:url', content: 'https://molt.vercel.app' }],

    // Twitter Card
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'Molt - High-Performance Data Transformation' }],
    ['meta', { name: 'twitter:description', content: 'High-performance data transformation stack. Up to 415x faster than alternatives.' }],
    ['meta', { name: 'twitter:image', content: 'https://molt.vercel.app/og-image.png' }],

    // Additional SEO
    ['meta', { name: 'keywords', content: 'data transformation, JSON parser, YAML parser, TOML parser, CSV parser, XML parser, INI parser, MessagePack, high performance, TypeScript' }],
    ['meta', { name: 'author', content: 'Sylphx' }]
  ]
})
