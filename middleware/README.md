# Middleware Documentation

Dokumentasi lengkap untuk sistem middleware aplikasi Indo Tosho.

## Struktur Middleware

```
middleware/
├── admin.ts           # Middleware untuk halaman admin
├── auth.ts            # Middleware untuk autentikasi
├── guest.ts           # Middleware untuk halaman guest
├── utils/             # Utility functions
│   ├── index.ts       # Central exports
│   ├── auth-helper.ts # Helper untuk autentikasi
│   └── admin-helper.ts# Helper untuk admin checks
└── README.md          # Dokumentasi ini
```

## Middleware Types

### 1. Auth Middleware (`auth.ts`)
**Tujuan**: Memastikan user sudah terautentikasi

**Digunakan untuk**:
- Halaman yang memerlukan login (user atau admin)
- Contoh: `/posts/create`, `/posts/edit/[id]`

**Behavior**:
- ✅ User terautentikasi → Allow access
- ❌ User belum login → Redirect ke `/login` dengan query redirect

### 2. Admin Middleware (`admin.ts`)
**Tujuan**: Memastikan user adalah admin

**Digunakan untuk**:
- Halaman admin panel
- Contoh: `/admin/*`

**Behavior**:
- ✅ User adalah admin → Allow access
- ❌ User belum login → Redirect ke `/login`
- ❌ User bukan admin → Error 403

**Features**:
- Multiple validation checks (built-in method + database)
- Auto-sync authStore jika ada perbedaan
- Detailed logging untuk debugging

### 3. Guest Middleware (`guest.ts`)
**Tujuan**: Mencegah user yang sudah login mengakses halaman guest

**Digunakan untuk**:
- Halaman login, register
- Contoh: `/login`, `/register`

**Behavior**:
- ✅ User belum login → Allow access
- ❌ User sudah login → Redirect ke `/`

## Utility Functions

### Auth Helper (`utils/auth-helper.ts`)

#### `initializeAuthStore()`
- Menginisialisasi auth store dengan retry mechanism
- Menghindari hydration mismatch
- Retry hingga 50 attempts (5 detik)

#### `redirectToLogin(redirectPath: string)`
- Redirect ke login dengan query parameter redirect
- Mempertahankan intended destination

#### `redirectToHome()`
- Redirect ke halaman utama

#### `MIDDLEWARE_CONFIG`
- Constants untuk konfigurasi middleware
- MAX_INIT_ATTEMPTS, RETRY_DELAY, ADMIN_ROLE

### Admin Helper (`utils/admin-helper.ts`)

#### `checkAdminRole(authStore)`
- Multiple validation untuk memastikan user adalah admin
- Built-in method + direct database check
- Auto-sync authStore jika diperlukan
- Return: `AdminCheckResult`

#### `createAccessDeniedError(message?)`
- Membuat error 403 dengan pesan yang konsisten
- Custom message optional

#### `logAdminCheck(authStore, result)`
- Logging untuk debugging (hanya di development)
- Menampilkan detail check results

## Penggunaan di Pages

### Untuk halaman yang memerlukan login:
```vue
<script setup>
// Otomatis menggunakan auth middleware
definePageMeta({
  middleware: 'auth'
})
</script>
```

### Untuk halaman admin:
```vue
<script setup>
// Otomatis menggunakan admin middleware
definePageMeta({
  middleware: 'admin'
})
</script>
```

### Untuk halaman guest (login/register):
```vue
<script setup>
// Otomatis menggunakan guest middleware
definePageMeta({
  middleware: 'guest'
})
</script>
```

## Improvements dari Refactoring

### ✅ Sebelum Refactoring
- **Duplikasi kode**: Auth store initialization di 3 file
- **Inconsistent error handling**: Berbeda-beda di setiap middleware
- **Hard to maintain**: Perubahan harus dilakukan di multiple files
- **No centralized config**: Magic numbers tersebar
- **Poor logging**: Console.log tidak terstruktur

### ✅ Setelah Refactoring
- **DRY principle**: Utility functions menghilangkan duplikasi
- **Consistent error handling**: Centralized error creation
- **Easy maintenance**: Perubahan di satu tempat
- **Centralized config**: Constants di satu file
- **Better logging**: Structured logging dengan environment check
- **Type safety**: Interface untuk return types
- **Better documentation**: Comprehensive comments

## Best Practices

1. **Gunakan utility functions**: Jangan duplicate auth initialization
2. **Consistent error messages**: Gunakan helper functions
3. **Environment-aware logging**: Hanya log di development
4. **Type safety**: Gunakan interfaces yang disediakan
5. **Centralized config**: Gunakan MIDDLEWARE_CONFIG untuk constants

## Testing

Untuk testing middleware, gunakan utility functions yang sama:

```typescript
import { initializeAuthStore, checkAdminRole } from '~/middleware/utils'

// Test auth initialization
const authStore = await initializeAuthStore()

// Test admin check
const result = await checkAdminRole(authStore)
```

## Troubleshooting

### Issue: Hydration Mismatch
**Solution**: Middleware sudah skip server-side rendering

### Issue: Auth Store Not Initialized
**Solution**: `initializeAuthStore()` sudah handle dengan retry mechanism

### Issue: Admin Check Inconsistent
**Solution**: `checkAdminRole()` menggunakan multiple validation dan auto-sync

### Issue: Debugging Admin Issues
**Solution**: Enable development logging dengan `logAdminCheck()`