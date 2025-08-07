// https://nuxt.com/docs/api/configuration/nuxt-config

// Deteksi platform deployment
const isVercel = process.env.VERCEL || process.env.VERCEL_ENV
const isCloudflare = process.env.CF_PAGES || process.env.CLOUDFLARE_PAGES

// Tentukan preset berdasarkan platform
const getNitroPreset = () => {
  if (isVercel) {
    return 'vercel'
  }
  if (isCloudflare) {
    return 'cloudflare-pages'
  }
  // Default ke cloudflare-pages untuk development dan deployment lainnya
  return 'cloudflare-pages'
}

export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { 
    enabled: true,
    timeline: {
      enabled: true
    }
  },
  // Suppress Node.js deprecation warnings
  nitro: {
    experimental: {
      wasm: true
    },
    // Suppress punycode deprecation warning
    rollupConfig: {
      external: ['punycode']
    },
    preset: getNitroPreset(),
    prerender: {
      autoSubfolderIndex: false
    },
    // Konfigurasi khusus berdasarkan platform
    ...(isVercel ? {
      // Konfigurasi untuk Vercel
      output: {
        dir: '.vercel/output'
      }
    } : {
      // Konfigurasi untuk Cloudflare Workers
      replace: {
        'isomorphic-dompurify': 'false'
      },
      alias: {
        // Fallback untuk isomorphic-dompurify di Cloudflare Workers
        'isomorphic-dompurify': 'unenv/runtime/mock/empty'
      }
    })
  },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  supabase: {
    redirect: false,
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY,
    // Konfigurasi cookie untuk kompatibilitas multi-platform
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: true // Penting untuk HTTPS
    },
    clientOptions: {
      auth: {
        flowType: 'pkce',
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true
      }
    }
  },
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    public: {
      supabase: {
        url: process.env.NUXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
      }
    }
  },
  css: ['~/assets/css/main.css'],
  devServer: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    // Konfigurasi untuk stabilitas development server
    https: false,
    open: false,
    // Tambahkan headers untuk mengatasi CORS dan caching issues
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  vite: {
    server: {
      host: '0.0.0.0',
      port: process.env.PORT || 3000,
      hmr: {
        port: process.env.HMR_PORT || 24678,
        host: '0.0.0.0',
        overlay: false
      },
      // Tambahkan konfigurasi untuk stabilitas development
      fs: {
        strict: false
      },
      watch: {
        usePolling: false,
        interval: 100
      }
    },
    // Optimasi untuk mengatasi error ERR_ABORTED
    optimizeDeps: {
      include: [
        'vue',
        'vue-router',
        '@heroicons/vue/24/outline',
        '@heroicons/vue/24/solid',
        'vue-toastification'
      ],
      exclude: ['isomorphic-dompurify']
    },
    // Suppress Vite client warnings
    define: {
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
    },
    // Konfigurasi build untuk development yang lebih stabil
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router'],
            ui: ['@heroicons/vue/24/outline', '@heroicons/vue/24/solid']
          }
        }
      }
    }
  },
  // Router configuration to suppress warnings
  router: {
    options: {
      strict: false
    }
  },
  // Suppress Vite client route warnings
  ssr: true,
  routeRules: {
    '/@vite/client': { prerender: false, index: false },
    '/.well-known/**': { prerender: false, index: false },
    // Konfigurasi khusus untuk API routes
    '/api/**': { 
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    }
  },
  // Suppress middleware warnings
  experimental: {
    payloadExtraction: false
  },
  // Logging configuration to suppress warnings
  logLevel: 'info',
  // Suppress specific warnings
  build: {
    transpile: ['vue-toastification']
  },
  app: {
    head: {
      title: 'Anime Database',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Modern anime database with clean UI/UX' }
      ],
      htmlAttrs: {
        class: 'no-js'
      },
      script: [
        {
          innerHTML: `
            (function() {
              try {
                const theme = localStorage.getItem('theme') || 'system';
                const isDark = theme === 'dark' || 
                  (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
                
                // Prevent FOUC by ensuring styles are applied immediately
                document.documentElement.style.visibility = 'visible';
              } catch (e) {
                console.warn('Theme initialization failed:', e);
                // Fallback to light mode
                document.documentElement.classList.remove('dark');
                document.documentElement.style.visibility = 'visible';
              }
            })();
          `,
          type: 'text/javascript'
        }
      ]
    }
  }
})
