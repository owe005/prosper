# Prosper

A modern financial tracking and management application built with Vue 3, TypeScript, and Supabase.

## Features

- Interactive financial dashboards and visualizations
- Transaction tracking and management
- Dark/Light theme support
- Responsive design
- Secure authentication via Supabase

## Tech Stack

- Vue 3 with Composition API
- TypeScript
- Supabase for backend and authentication
- Chart.js and ApexCharts for visualizations
- D3.js for advanced data visualization
- Tailwind CSS for styling
- Pinia for state management
- Vue Router for navigation

## Getting Started

### Prerequisites

- Node.js (v22 or later recommended)
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

Run the development server:
```bash
npm run dev
```

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run all linters
- `npm run format` - Format code with Prettier

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary software.

## Deployment

This project is configured for deployment on Netlify. The `netlify.toml` file contains the necessary deployment configurations.