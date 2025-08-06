# Indo Tosho - Anime Database

A modern, responsive anime database application built with Nuxt.js 3, Vue 3, Tailwind CSS, Pinia, and Supabase. This application provides a clean and intuitive interface for browsing, discovering, and managing anime series with user authentication and administrative features.

## Features

### Core Features
- 🎨 **Modern UI/UX**: Clean, responsive design that works on all devices
- 📱 **Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- 🔍 **Advanced Search**: Search by title, genre, studio, or submitter
- 🏷️ **Category Filtering**: Filter anime by categories
- 📊 **Sorting Options**: Sort by title, rating, date, or downloads
- 📄 **Pagination**: Efficient data browsing with customizable items per page
- ⭐ **Detailed Views**: Comprehensive anime information pages
- 🌙 **Theme Support**: Light and dark mode compatibility with system preference detection
- ♿ **Accessible**: Built with accessibility best practices
- 🧪 **Well Tested**: Comprehensive unit tests with high coverage

### Authentication & User Management
- 🔐 **User Authentication**: Secure login/register with Supabase Auth
- 👤 **User Profiles**: Personal user accounts and profile management
- 🔑 **Password Reset**: Secure password recovery functionality
- 🛡️ **Role-based Access**: Different access levels for users and administrators

### Administrative Features
- 👨‍💼 **Admin Dashboard**: Administrative interface for content management
- 📝 **Content Management**: Add, edit, and manage anime entries
- 📊 **Analytics**: View statistics and user engagement metrics

## Tech Stack

### Core Technologies
- **Framework**: [Nuxt.js 3](https://nuxt.com/) - Full-stack Vue.js framework
- **Frontend**: [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- **Backend**: [Supabase](https://supabase.com/) - Open source Firebase alternative
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with JWT tokens

### UI & Styling
- **CSS Framework**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- **Typography**: [@tailwindcss/typography](https://tailwindcss.com/docs/typography-plugin) - Beautiful typographic defaults
- **UI Components**: [Headless UI](https://headlessui.com/) - Unstyled, accessible UI components
- **Icons**: [Heroicons](https://heroicons.com/) - Beautiful hand-crafted SVG icons
- **Notifications**: [Vue Toastification](https://vue-toastification.maronato.dev/) - Toast notifications
- **Modals**: [MicroModal](https://micromodal.vercel.app/) - Lightweight modal library

### Development & Testing
- **State Management**: [Pinia](https://pinia.vuejs.org/) - Vue store library
- **Testing Framework**: [Vitest](https://vitest.dev/) - Fast unit testing framework
- **Test Utils**: [@vue/test-utils](https://test-utils.vuejs.org/) - Vue component testing utilities
- **Coverage**: [@vitest/coverage-v8](https://vitest.dev/guide/coverage.html) - Code coverage reports
- **TypeScript**: Full TypeScript support for better development experience
- **Linting**: [ESLint](https://eslint.org/) with Nuxt configuration
- **Formatting**: [Prettier](https://prettier.io/) - Code formatter

### External APIs
- **Jikan API**: MyAnimeList unofficial API for anime data
- **Mock Database**: Custom mock service for development and testing

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm 8.0.0 or higher

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

### Available Scripts

#### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run generate` - Generate static site
- `npm run preview` - Preview production build
- `npm run postinstall` - Prepare Nuxt after installation

#### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:watch` - Run tests in watch mode (explicit)
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ui` - Run tests with UI interface

#### Code Quality
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Lint and fix code automatically
- `npm run typecheck` - Run TypeScript type checking
- `npm run check-format` - Check code formatting with Prettier
- `npm run format` - Format code with Prettier

## Testing

This project includes comprehensive unit tests covering:

- **Components**: Vue components including AnimeTable, AppHeader, AppPagination, BackButton
- **Pages**: Page components including home, anime detail, authentication pages
- **Stores**: Pinia store logic for anime data and authentication
- **Services**: Mock database, Supabase client, and Jikan API services
- **Composables**: Custom Vue composables and utilities
- **Middleware**: Route protection and authentication middleware

### Test Environment
- **Test Runner**: Vitest with Happy DOM environment
- **Component Testing**: Vue Test Utils for component mounting and interaction
- **Mocking**: Comprehensive mocks for Supabase, external APIs, and browser APIs
- **Coverage**: V8 coverage reports with detailed metrics
- **UI Testing**: Vitest UI for interactive test debugging

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Features Overview

### Home Page (`/`)
- **Hero Section**: Welcome message and application description
- **Statistics Cards**: Display total anime, categories, and pages
- **Search & Filter**: Advanced search with category filtering
- **Anime Table**: Responsive table/card layout for anime listing
- **Pagination**: Navigate through large datasets efficiently
- **Active Filters**: Visual representation of applied filters
- **Load More**: Progressive loading for better performance

### Authentication Pages
- **Login Page (`/login`)**: Secure user authentication with Supabase
- **Register Page (`/register`)**: User registration with validation
- **Password Reset (`/reset-password`)**: Secure password recovery

### Anime Detail Page (`/anime/[id]`)
- **Cover Image**: High-quality anime artwork
- **Basic Information**: Title, rating, episodes, year, status, studio
- **Download Statistics**: Size, downloads, views, likes
- **Genres**: Tagged genre categories with color coding
- **Description**: Detailed anime synopsis with markdown support
- **Technical Details**: Quality, format, audio/subtitle languages
- **Submitter Information**: User who uploaded the content
- **Comments System**: User comments with markdown support
- **Breadcrumb Navigation**: Easy navigation back to listings

### Administrative Features (`/admin/*`)
- **Admin Dashboard**: Overview of system statistics
- **Content Management**: Add, edit, and manage anime entries
- **User Management**: Manage user accounts and permissions

### Posts System (`/posts/*`)
- **Blog/News Posts**: Content management system for announcements
- **Post Categories**: Organized content categorization
- **Rich Text Editor**: Markdown support for post creation

### Responsive Design
- **Desktop**: Full-featured table layout with all information visible
- **Tablet**: Optimized layout with adjusted spacing and sizing
- **Mobile**: Card-based layout with essential information prioritized
- **Portrait/Landscape**: Adapts to device orientation changes
- **Dark/Light Theme**: Automatic theme detection with manual override

## Environment Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
NUXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NUXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Development Server
PORT=3000
HMR_PORT=24678
```

Refer to `.env.example` for a complete list of available environment variables.

## Data Sources

### Mock Database
The application includes a comprehensive mock database service (`services/mockDatabase.ts`) that:
- Simulates real API calls with realistic anime data
- Provides full CRUD operations for testing
- Includes pagination, filtering, and search functionality
- Contains over 150 anime entries with detailed metadata

### External APIs
- **Jikan API**: Integration with MyAnimeList unofficial API for additional anime data
- **Supabase**: Real-time database and authentication backend

## Accessibility

The application follows web accessibility best practices:
- **Semantic HTML**: Proper HTML5 semantic elements
- **ARIA Labels**: Comprehensive ARIA attributes for screen readers
- **Keyboard Navigation**: Full keyboard accessibility support
- **Color Contrast**: WCAG compliant color schemes
- **Focus Management**: Proper focus indicators and management
- **Screen Reader Support**: Optimized for assistive technologies

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile Browsers**: iOS Safari 14+, Chrome Mobile 90+
- **Progressive Enhancement**: Graceful degradation for older browsers

## Contributing

Contributions are welcome! Please read the contributing guidelines and ensure all tests pass before submitting a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
