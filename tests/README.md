# Testing Documentation

## Overview

Proyek ini menggunakan Vitest sebagai framework testing dengan dukungan untuk unit testing dan integration testing. Semua test dilengkapi dengan database mocking untuk memastikan isolasi dan konsistensi.

## Struktur Testing

```
tests/
├── mocks/
│   └── database.ts          # Mock database implementation
├── unit/
│   └── AppHeader.unit.test.ts # Unit tests untuk komponen AppHeader
└── README.md                 # Dokumentasi testing
```

## Mock Database

### Features

- **MockDatabase**: Implementasi lengkap database dalam memori
- **CRUD Operations**: Create, Read, Update, Delete untuk users, posts, dan activities
- **Statistics**: Tracking untuk views, downloads, likes, dan user statistics
- **Activity Logging**: Pencatatan aktivitas user dan sistem
- **Reset Functionality**: Reset database ke state awal untuk setiap test

### Mock Data

- **Users**: Admin dan user biasa dengan berbagai role
- **Posts/Anime**: Data anime dengan kategori, rating, dan metadata lengkap
- **Activities**: Log aktivitas sistem dan user
- **Statistics**: Data statistik untuk dashboard dan analytics

## Unit Tests

### AppHeader Component Tests

File: `tests/unit/AppHeader.unit.test.ts`

#### Test Categories:

1. **Database Integration**
    - Search functionality dengan database mocking
    - Database operations (create, read, update)
    - Post creation dan retrieval

2. **Authentication dengan Database**
    - User login dengan data dari mock database
    - User logout dengan activity logging
    - Session management

3. **Category Management**
    - Dynamic category loading dari database
    - Category filtering dengan database query
    - Category synchronization

4. **Error Handling**
    - Invalid user data handling
    - Invalid post data handling
    - User deletion operations
    - Post update operations

5. **Performance Testing**
    - Large dataset operations
    - Database statistics operations
    - Activity logging operations

## Menjalankan Tests

### Semua Tests

```bash
npm test
```

### Unit Tests Spesifik

```bash
# AppHeader unit tests
npx vitest run tests/unit/AppHeader.unit.test.ts

# Dengan watch mode
npx vitest tests/unit/AppHeader.unit.test.ts

# Dengan coverage
npx vitest run tests/unit/AppHeader.unit.test.ts --coverage
```

### Test Options

```bash
# Verbose output
npx vitest run tests/unit/AppHeader.unit.test.ts --reporter=verbose

# Run specific test
npx vitest run tests/unit/AppHeader.unit.test.ts -t "should handle search"

# Debug mode
npx vitest run tests/unit/AppHeader.unit.test.ts --no-coverage --reporter=basic
```

## Mock Store Configuration

### Auth Store Mock

```typescript
const mockAuthStore = {
    isAuthenticated: false,
    currentUser: null,
    login: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn()
};
```

### Anime Store Mock

```typescript
const mockAnimeStore = {
    searchQuery: "",
    selectedCategory: "",
    categories: [],
    updateFilter: vi.fn(),
    search: vi.fn(),
    getCategories: vi.fn(),
    filters: {
        search: "",
        category: "Semua Kategori",
        sortBy: "title",
        sortOrder: "asc"
    }
};
```

### Theme Store Mock

```typescript
const mockThemeStore = {
    isDark: false,
    toggleTheme: vi.fn()
};
```

## Best Practices

### 1. Database Mocking

- Selalu reset database di `beforeEach`
- Gunakan data yang konsisten dan realistis
- Test dengan berbagai skenario data (kosong, penuh, invalid)

### 2. Store Mocking

- Reset semua mock functions di `beforeEach`
- Gunakan `vi.fn()` untuk semua methods yang perlu di-track
- Pastikan state store konsisten dengan test scenario

### 3. Component Testing

- Test user interactions (click, input, change)
- Verify store method calls dengan `toHaveBeenCalledWith`
- Test error states dan edge cases
- Gunakan data-testid untuk selector yang stabil

### 4. Async Testing

- Gunakan `await` untuk semua async operations
- Test loading states dan error handling
- Verify final state setelah async operations selesai

## Troubleshooting

### Common Issues

1. **Mock tidak terpanggil**
    - Pastikan mock di-reset di `beforeEach`
    - Verify selector element exists sebelum trigger event
    - Check component mounting dan plugin registration

2. **Vue warnings**
    - Pastikan semua plugins di-register dengan benar
    - Check component dependencies dan imports
    - Verify mock implementations sesuai dengan interface asli

3. **Database state issues**
    - Selalu panggil `mockDb.reset()` di `beforeEach`
    - Verify data consistency antar tests
    - Check mock data structure sesuai dengan interface

### Debug Tips

```typescript
// Log mock calls untuk debugging
console.log(mockAnimeStore.updateFilter.mock.calls);

// Check component state
console.log(wrapper.vm.$data);

// Verify element existence
console.log(wrapper.find("selector").exists());
```

## Coverage Goals

- **Unit Tests**: 90%+ coverage untuk komponen utama
- **Integration Tests**: 80%+ coverage untuk user flows
- **Database Operations**: 100% coverage untuk CRUD operations
- **Error Handling**: 100% coverage untuk error scenarios

## Contributing

Ketika menambah test baru:

1. Ikuti struktur dan naming convention yang ada
2. Tambahkan mock data yang realistis
3. Test happy path dan error cases
4. Update dokumentasi jika diperlukan
5. Pastikan semua test pass sebelum commit

## Dependencies

- **Vitest**: Test framework
- **@vue/test-utils**: Vue component testing utilities
- **Pinia**: State management (mocked)
- **Vue Router**: Routing (mocked)
- **Custom Mock Database**: In-memory database implementation
