# Perbaikan Deployment Multi-Platform

## Ringkasan

Dokumen ini menjelaskan perbaikan yang telah diimplementasikan untuk mengatasi error `net::ERR_ABORTED` pada deployment Vercel sambil mempertahankan kompatibilitas dengan preset Nitro Cloudflare Pages.

## Masalah yang Diperbaiki

### Error ERR_ABORTED

**Gejala:**
- Error `net::ERR_ABORTED` saat mengakses aplikasi di Vercel
- URL deployment tidak dapat diakses: `https://traeindo-tosho-mirror11qz-ilyasanf-ilyasanfs-projects.vercel.app/`
- Aplikasi berfungsi normal di development dan Cloudflare Pages

**Penyebab:**
1. **Konflik Preset Nitro**: Aplikasi dikonfigurasi dengan preset `cloudflare-pages` tapi di-deploy ke Vercel
2. **Routing Configuration**: `vercel.json` tidak dikonfigurasi dengan benar untuk API routes
3. **Build Output**: Output directory tidak sesuai dengan ekspektasi Vercel
4. **Runtime Compatibility**: Konfigurasi runtime tidak kompatibel dengan Vercel Functions
5. **Invalid Function Runtime**: Error `Function Runtimes must have a valid version` karena format runtime yang salah

## Solusi yang Diimplementasikan

### 1. Deteksi Platform Otomatis

**File: `nuxt.config.ts`**

```javascript
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
```

**Keuntungan:**
- Otomatis mendeteksi platform deployment
- Menggunakan preset yang sesuai untuk setiap platform
- Mempertahankan Cloudflare sebagai default
- Tidak memerlukan perubahan manual saat deploy

### 2. Konfigurasi Nitro Kondisional

```javascript
nitro: {
  experimental: {
    wasm: true
  },
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
      'isomorphic-dompurify': 'unenv/runtime/mock/empty'
    }
  })
}
```

### 3. Perbaikan Vercel Configuration

**File: `vercel.json`**

**Perbaikan Error Runtime:**
Menghapus konfigurasi `functions` yang menyebabkan error `Function Runtimes must have a valid version`. Vercel secara otomatis mendeteksi dan menggunakan runtime yang sesuai untuk Nuxt.js.

```json
{
  // Konfigurasi functions dihapus karena menyebabkan error runtime
  // Vercel otomatis mendeteksi runtime untuk Nuxt.js
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": ".output/public",
  "framework": "nuxtjs"
}
```

**Perbaikan yang dilakukan:**
- Konfigurasi functions untuk API routes
- Proper rewrites untuk routing
- CORS headers untuk API endpoints
- Output directory yang benar
- Runtime Node.js yang kompatibel

### 4. Konfigurasi Supabase Multi-Platform

```javascript
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
}
```

### 5. Route Rules untuk API

```javascript
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
}
```

## Cara Deploy ke Kedua Platform

### Deploy ke Vercel

1. **Setup Environment Variables di Vercel Dashboard:**
   ```
   NUXT_PUBLIC_SUPABASE_URL=https://jayavvymuqkkvvlcaudv.supabase.co
   NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Deploy Command:**
   ```bash
   # Otomatis terdeteksi sebagai Vercel
   vercel --prod
   ```

3. **Build Process:**
   - Preset otomatis berubah ke `vercel`
   - Output directory: `.vercel/output`
   - API functions menggunakan Node.js runtime

### Deploy ke Cloudflare Pages

1. **Setup Environment Variables di Cloudflare Dashboard:**
   ```
   NUXT_PUBLIC_SUPABASE_URL=https://jayavvymuqkkvvlcaudv.supabase.co
   NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Deploy Command:**
   ```bash
   # Build untuk Cloudflare
   npm run build
   
   # Deploy menggunakan Wrangler
   npx wrangler pages deploy .output/public
   ```

3. **Build Process:**
   - Preset otomatis berubah ke `cloudflare-pages`
   - Output directory: `.output/public`
   - API functions menggunakan Cloudflare Workers

## Troubleshooting

### Error 500 pada API Endpoints

**Penyebab:**
- Environment variables tidak terkonfigurasi
- Service role key tidak tersedia

**Solusi:**
1. Verifikasi environment variables di platform dashboard
2. Pastikan `SUPABASE_SERVICE_ROLE_KEY` sudah diset
3. Check logs untuk error detail

### Error 401 Unauthorized

**Penyebab:**
- Session cookies tidak terbaca dengan benar
- Konfigurasi Supabase auth tidak kompatibel

**Solusi:**
1. Pastikan `cookieOptions` sudah dikonfigurasi
2. Verifikasi `secure: true` untuk HTTPS
3. Check browser developer tools untuk cookies

### Error Function Runtimes

**Error:** `Function Runtimes must have a valid version, for example 'now-php@1.0.0'`

**Penyebab:**
- Konfigurasi `functions` di `vercel.json` menggunakan format runtime yang tidak valid
- Vercel tidak mengenali format `nodejs18.x` tanpa versi spesifik

**Solusi:**
1. Hapus konfigurasi `functions` dari `vercel.json`
2. Biarkan Vercel mendeteksi runtime secara otomatis untuk Nuxt.js
3. Vercel akan menggunakan Node.js runtime yang sesuai berdasarkan `package.json`

```json
// SALAH - menyebabkan error runtime
{
  "functions": {
    "server/api/**/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}

// BENAR - biarkan Vercel mendeteksi otomatis
{
  "rewrites": [...],
  "headers": [...]
}
```

### Build Failures

**Penyebab:**
- Preset tidak sesuai dengan platform
- Dependencies tidak kompatibel

**Solusi:**
1. Clear build cache: `rm -rf .nuxt .output`
2. Reinstall dependencies: `npm ci`
3. Verify platform detection: `echo $VERCEL || echo $CF_PAGES`

### API Routes Not Working

**Penyebab:**
- Routing configuration salah
- Functions tidak terdeploy dengan benar

**Solusi:**
1. Check `vercel.json` untuk Vercel
2. Check `_routes.json` untuk Cloudflare
3. Verify API endpoints di platform dashboard

## Testing

### Local Development

```bash
# Test dengan preset default (cloudflare-pages)
npm run dev

# Test dengan preset Vercel
VERCEL=1 npm run dev
```

### Production Testing

```bash
# Build untuk Vercel
VERCEL=1 npm run build

# Build untuk Cloudflare
CF_PAGES=1 npm run build

# Preview build
npm run preview
```

## Monitoring

### Vercel
- Functions logs di Vercel Dashboard
- Performance metrics
- Error tracking

### Cloudflare
- Workers analytics
- Real User Monitoring (RUM)
- Security insights

## Kesimpulan

Perbaikan ini memungkinkan aplikasi untuk:

1. **Deploy ke kedua platform** tanpa perubahan kode
2. **Deteksi otomatis** platform deployment
3. **Konfigurasi optimal** untuk setiap platform
4. **Mempertahankan kompatibilitas** Cloudflare sebagai default
5. **Troubleshooting mudah** dengan dokumentasi lengkap

Dengan implementasi ini, error `ERR_ABORTED` pada Vercel telah teratasi sambil mempertahankan preset Nitro Cloudflare sebagai default sesuai permintaan.