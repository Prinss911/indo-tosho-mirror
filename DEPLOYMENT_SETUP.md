# Deployment Setup Guide

## Cloudflare Pages Environment Variables

Untuk mengatasi error 500 pada deployment, Anda perlu mengatur environment variables berikut di Cloudflare Pages dashboard:

### 1. Login ke Cloudflare Dashboard
- Buka [Cloudflare Dashboard](https://dash.cloudflare.com/)
- Pilih project Indo Tosho
- Masuk ke tab **Settings** > **Environment Variables**

### 2. Tambahkan Environment Variables

Tambahkan variabel berikut untuk **Production**:

```
NUXT_PUBLIC_SUPABASE_URL=https://jayavvymuqkkvvlcaudv.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWF2dnltdXFra3Z2bGNhdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDQ3ODgsImV4cCI6MjA2Nzk4MDc4OH0.sJBe0uaHUg3W15MtLfT7pe75LZxi5FGtygSRYHFW9tw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWF2dnltdXFra3Z2bGNhdWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQwNDc4OCwiZXhwIjoyMDY3OTgwNzg4fQ.9DNB201dDLBk009YwZfVmW-0wyPsoDLWCy1pFb8Frus
NODE_OPTIONS=--no-deprecation --no-warnings
NODE_NO_WARNINGS=1
```

### 3. Build Settings di Cloudflare Pages

Pastikan build settings sebagai berikut:
- **Build command**: `npm run build`
- **Build output directory**: `.output/public`
- **Root directory**: `/` (kosong)
- **Node.js version**: `22`

## GitHub Secrets Setup

Untuk GitHub Actions, tambahkan secrets berikut di repository settings:

### 1. Buka GitHub Repository Settings
- Masuk ke repository Indo Tosho
- Klik **Settings** > **Secrets and variables** > **Actions**

### 2. Tambahkan Repository Secrets

Tambahkan secrets berikut:

```
NUXT_PUBLIC_SUPABASE_URL=https://jayavvymuqkkvvlcaudv.supabase.co
NUXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWF2dnltdXFra3Z2bGNhdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MDQ3ODgsImV4cCI6MjA2Nzk4MDc4OH0.sJBe0uaHUg3W15MtLfT7pe75LZxi5FGtygSRYHFW9tw
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpheWF2dnltdXFra3Z2bGNhdWR2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQwNDc4OCwiZXhwIjoyMDY3OTgwNzg4fQ.9DNB201dDLBk009YwZfVmW-0wyPsoDLWCy1pFb8Frus
```

## Troubleshooting

### Error 500 pada API Endpoints

Jika masih mengalami error 500:

1. **Periksa Environment Variables**: Pastikan semua environment variables sudah ter-set dengan benar
2. **Clear Build Cache**: Di Cloudflare Pages, lakukan rebuild dengan clear cache
3. **Periksa Logs**: Cek function logs di Cloudflare dashboard untuk error details
4. **Database Migration**: Pastikan semua migrasi database sudah ter-apply

### Langkah Verifikasi

1. Setelah mengatur environment variables, lakukan redeploy
2. Test API endpoints:
   - `https://indotosho.pololer.my.id/api/posts` (GET)
   - `https://indotosho.pololer.my.id/api/categories` (GET)
3. Test pembuatan post di `https://indotosho.pololer.my.id/posts/create`

## Catatan Penting

- **Jangan commit environment variables ke repository**
- **Gunakan secrets yang berbeda untuk production dan development**
- **Regenerate keys secara berkala untuk keamanan**
- **Monitor logs secara rutin untuk mendeteksi issues**