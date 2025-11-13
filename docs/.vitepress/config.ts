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
      { icon: 'github', link: 'https://github.com/sylphx/molt' }
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
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ]
})
