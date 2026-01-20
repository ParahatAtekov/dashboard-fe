# HyperLiquid Analytics Dashboard - Frontend

A modern, cyberpunk-inspired analytics dashboard built with Next.js 14 for tracking wallet activity and trading metrics on HyperLiquid.

## ✨ Features

- **Dashboard Overview**: Real-time metrics including DAU, WAU, MAU, retention rates, and volume data
- **Analytics Charts**: Interactive time-series visualizations for historical trends
- **Wallet Management**: Add, import, and manage tracked wallets
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Cyberpunk-inspired glassmorphism UI with neon accents

## 🎨 Design Philosophy

The UI follows a bold cyberpunk aesthetic with:
- **Glassmorphism**: Frosted glass effects with backdrop blur
- **Neon Accents**: Cyan, mint, and pink color palette
- **Typography**: Syne for display, Outfit for body text, JetBrains Mono for code
- **Animations**: Smooth transitions and micro-interactions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Supabase (optional, for direct auth)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Login page
│   ├── dashboard/         # Main dashboard
│   ├── analytics/         # Analytics charts
│   └── wallets/           # Wallet management
├── components/
│   ├── layout/            # Layout components (Navbar, DashboardLayout)
│   ├── ui/                # Reusable UI components
│   └── charts/            # Chart components using Recharts
├── lib/
│   ├── api.ts             # API client for backend
│   └── utils.ts           # Utility functions
├── store/
│   └── auth.ts            # Zustand auth store
└── types/
    └── index.ts           # TypeScript type definitions
```

## 🎯 Pages

### Login (`/`)
- Demo authentication (any email/password works)
- Animated cyberpunk background effects

### Dashboard (`/dashboard`)
- **User Activity**: DAU, WAU, MAU metrics
- **Retention**: Weekly/Monthly retention rates, churn rates
- **Volume**: Average spot/perp volume per user
- **SJ Token**: Dedicated section for SJ token metrics
- **Distributions**: Coin and user volume pie/bar charts
- **Top Traders**: Leaderboard table

### Analytics (`/analytics`)
- **DAU Trend**: Line/area chart over time
- **Perp Volume**: Daily perpetual trading volume
- **Spot Volume**: Daily spot trading volume
- **Comparison**: Multi-line chart for volume comparison
- **Breakdown**: Stacked bar chart for daily activity

### Wallets (`/wallets`)
- **Add Wallet**: Single wallet with optional label
- **Bulk Import**: Paste multiple addresses
- **Status Tracking**: Sync status, error counts
- **Search**: Filter by address or label

## 🧩 Components

### UI Components
- `Button` - Primary, secondary, ghost, danger variants
- `Input` - Text input with icon support
- `Select` - Dropdown select
- `Badge` - Status badges
- `MetricCard` - Dashboard metric display
- `SectionCard` - Content section wrapper
- `DataTable` - Generic data table

### Chart Components
- `MetricLineChart` - Multi-line time series
- `MetricAreaChart` - Gradient area charts
- `MetricBarChart` - Vertical bar charts
- `MetricPieChart` - Donut charts with legend

## 🔌 API Integration

The frontend connects to the Express backend at `/api/v1`:

```typescript
// Dashboard
GET /api/v1/dashboard/summary

// Metrics
GET /api/v1/metrics/global?range=30d

// Wallets
GET /api/v1/wallets
POST /api/v1/wallets
POST /api/v1/wallets/bulk
DELETE /api/v1/wallets/:walletId
```

## 🎨 Styling

### Tailwind Classes
Custom colors defined in `tailwind.config.js`:

```js
colors: {
  void: '#050508',      // Darkest background
  abyss: '#0a0a0f',     // Dark background
  obsidian: '#12121a',  // Card background
  neon: {
    cyan: '#00f5ff',
    mint: '#00ff9d',
    pink: '#ff00ff',
    orange: '#ff6b00',
    yellow: '#f0ff00',
  }
}
```

### CSS Utilities
- `.glass` - Glassmorphism effect
- `.glass-card` - Card with glass effect
- `.text-gradient` - Rainbow gradient text
- `.text-gradient-cyan` - Cyan-mint gradient text
- `.glow-border` - Animated glow border on hover

## 🛠️ Development

```bash
# Type checking
pnpm typecheck

# Build for production
pnpm build

# Start production server
pnpm start
```

## 📄 License

Internal use only - HyperLiquid Analytics Dashboard
