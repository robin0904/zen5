# Daily 5 (Zen5)

A zero-investment, habit-forming web application that delivers 5 personalized micro-tasks daily to users.

## Features

- 🎯 5 personalized micro-tasks daily
- 🔥 Streak tracking and gamification
- 🏆 Badges and leaderboards
- 💰 Coin rewards system
- 📱 Mobile-first responsive design
- 🔐 Secure authentication with Supabase
- 🎨 Beautiful UI with Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Testing**: Vitest, fast-check (Property-Based Testing)
- **Hosting**: Vercel (Frontend), Supabase (Backend)

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18.x or higher
- npm or yarn package manager

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the `.env.example` file to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your environment variables:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional
OPENAI_API_KEY=your_openai_api_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### 3. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 4. Run Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
daily-5-app/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility functions and helpers
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── vitest.config.ts      # Vitest configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Supabase Setup

1. Create a new Supabase project
2. Run database migrations (coming in next tasks)
3. Copy your project URL and keys to `.env.local`

## Zero-Cost Hosting

This application is designed to run on free tiers:
- **Vercel**: Free tier (100GB bandwidth, 100 hours serverless)
- **Supabase**: Free tier (500MB storage, 2GB bandwidth)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
