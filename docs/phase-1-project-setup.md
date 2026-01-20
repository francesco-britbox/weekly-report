# Phase 1: Project Setup & Docker Configuration

## Overview

This phase establishes the project foundation: Next.js scaffolding, Tailwind CSS with POC design tokens, Docker configuration, and basic project structure.

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- Access to the existing vendor-manager database

## Tasks

### 1.1 Initialize Next.js Project

Create a new Next.js 15 project with TypeScript and Tailwind CSS.

```bash
cd /Users/francesco/Documents/Projects/vendors-management/weekly-report/app
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

**Configuration choices:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: Yes
- App Router: Yes
- Import alias: No (use relative paths)

### 1.2 Update package.json

Modify `package.json` to set the correct port and add required dependencies:

```json
{
  "name": "weekly-report-viewer",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@prisma/client": "^5.22.0",
    "swr": "^2.2.0",
    "clsx": "^2.1.0",
    "date-fns": "^4.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.0.0",
    "prisma": "^5.22.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.0.0"
  }
}
```

### 1.3 Configure Tailwind with Design Tokens

Update `tailwind.config.ts` to include the POC design tokens:

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background colors
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-card-hover': 'var(--bg-card-hover)',

        // Text colors
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',

        // Accent colors
        'accent-cyan': 'var(--accent-cyan)',
        'accent-cyan-dim': 'var(--accent-cyan-dim)',

        // RAG status colors
        'rag-green': 'var(--rag-green)',
        'rag-green-dim': 'var(--rag-green-dim)',
        'rag-amber': 'var(--rag-amber)',
        'rag-amber-dim': 'var(--rag-amber-dim)',
        'rag-red': 'var(--rag-red)',
        'rag-red-dim': 'var(--rag-red-dim)',

        // UI elements
        'border-color': 'var(--border-color)',
        'timeline-line': 'var(--timeline-line)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
      },
      transitionDuration: {
        'fast': '200ms',
        'med': '300ms',
        'slow': '500ms',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

export default config
```

### 1.4 Create Global CSS with Design Tokens

Replace `src/app/globals.css` with the POC's CSS variables and base styles:

```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Background Colors */
  --bg-primary: #00182b;
  --bg-secondary: #001f38;
  --bg-card: #002847;
  --bg-card-hover: #003356;

  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #8ba3b8;
  --text-muted: #5a7a94;

  /* Accent Colors */
  --accent-cyan: #a8dce8;
  --accent-cyan-dim: rgba(168, 220, 232, 0.3);

  /* RAG Status Colors */
  --rag-green: #34c759;
  --rag-green-dim: rgba(52, 199, 89, 0.2);
  --rag-amber: #ff9f0a;
  --rag-amber-dim: rgba(255, 159, 10, 0.2);
  --rag-red: #ff453a;
  --rag-red-dim: rgba(255, 69, 58, 0.2);

  /* UI Elements */
  --border-color: #1a3a52;
  --timeline-line: #3a5a72;

  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 20px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.5);

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  /* Transitions */
  --transition-fast: 0.2s ease;
  --transition-med: 0.3s ease;
  --transition-slow: 0.5s ease;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

/* Utility classes for animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes nodeAppear {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes trackFill {
  to {
    width: var(--progress, 20%);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease forwards;
}

.animate-fadeIn {
  animation: fadeIn 0.4s ease forwards;
}

.animate-nodeAppear {
  animation: nodeAppear 0.5s ease forwards;
}
```

### 1.5 Create next.config.ts

Configure Next.js for standalone builds (Docker):

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    remotePatterns: [],
  },
}

export default nextConfig
```

### 1.6 Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 1.7 Create docker-compose.yml

```yaml
# docker-compose.yml
version: '3.8'

services:
  weekly-report-viewer:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: weekly-report-viewer
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@host.docker.internal:5432/vendor_manager}
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - vendor-network

networks:
  vendor-network:
    external: true
    name: vendor-manager_default
```

### 1.8 Create docker-compose.dev.yml

For development with hot reload:

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  weekly-report-viewer:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: weekly-report-viewer-dev
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=${DATABASE_URL:-postgresql://postgres:postgres@host.docker.internal:5432/vendor_manager}
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    networks:
      - vendor-network

networks:
  vendor-network:
    external: true
    name: vendor-manager_default
```

### 1.9 Create Dockerfile.dev

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3001

CMD ["npm", "run", "dev"]
```

### 1.10 Create Basic Layout

Create the root layout file:

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Delivery Weekly Report',
  description: 'Weekly delivery status report viewer',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

### 1.11 Create Placeholder Page

Create a basic page to verify the setup:

```typescript
// src/app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-bg-primary text-text-primary p-8">
      <h1 className="text-2xl font-semibold text-accent-cyan mb-4">
        Weekly Report Viewer
      </h1>
      <p className="text-text-secondary">
        Setup complete. Phase 1 verified.
      </p>

      {/* Color test grid */}
      <div className="grid grid-cols-3 gap-4 mt-8 max-w-md">
        <div className="p-4 bg-rag-green rounded-md text-center">Green</div>
        <div className="p-4 bg-rag-amber rounded-md text-center">Amber</div>
        <div className="p-4 bg-rag-red rounded-md text-center">Red</div>
        <div className="p-4 bg-bg-card border border-border-color rounded-md text-center">Card</div>
        <div className="p-4 bg-bg-secondary rounded-md text-center">Secondary</div>
        <div className="p-4 bg-accent-cyan text-bg-primary rounded-md text-center">Accent</div>
      </div>
    </main>
  )
}
```

### 1.12 Copy Logo Asset

Copy the logo from the POC:

```bash
mkdir -p src/app/public/images
cp /Users/francesco/Documents/Projects/vendors-management/weekly-report/poc/images/logo.png public/images/
```

### 1.13 Create .env.example

```bash
# .env.example
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vendor_manager
```

### 1.14 Create .gitignore

```gitignore
# .gitignore
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Next.js
.next/
out/
build

# Production
dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts
```

## Verification Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Verify in browser:**
   - Open http://localhost:3001
   - Confirm the placeholder page loads
   - Verify colors display correctly (RAG status colors, backgrounds)

4. **Build Docker image:**
   ```bash
   docker build -t weekly-report-viewer .
   ```

5. **Run Docker container:**
   ```bash
   docker run -p 3001:3001 -e DATABASE_URL="your-db-url" weekly-report-viewer
   ```

## Files Created

After completing this phase, you should have:

```
weekly-report/app/
├── src/
│   └── app/
│       ├── globals.css
│       ├── layout.tsx
│       └── page.tsx
├── public/
│   └── images/
│       └── logo.png
├── prisma/
│   └── (empty - created in Phase 2)
├── .env.example
├── .gitignore
├── Dockerfile
├── Dockerfile.dev
├── docker-compose.yml
├── docker-compose.dev.yml
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## Success Criteria

- [ ] Next.js dev server starts on port 3001
- [ ] Design tokens render correctly (test the color grid)
- [ ] Docker build completes successfully
- [ ] Container runs and serves the placeholder page

## Next Phase

Proceed to [Phase 2: Database Integration & API Layer](./phase-2-database-and-api.md)
