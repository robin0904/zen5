# Design Document

## Overview

Daily 5 (Zen5) is a full-stack web application built with Next.js 14 App Router, Tailwind CSS, and Supabase. The architecture follows a serverless model with zero hosting costs, leveraging Vercel's free tier for hosting and Supabase's free tier for authentication, database, and edge functions. The application implements a gamified micro-task system with intelligent task selection, real-time progress tracking, and social sharing capabilities.

The system is designed for scalability within free tier limits (500MB Supabase storage, 100GB Vercel bandwidth) and can handle approximately 10,000 monthly active users before requiring paid upgrades.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  Next.js 14 App Router + React Server Components + Tailwind │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                     │
│  /api/tasks, /api/complete, /api/share, /api/admin/*       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Postgres │  │   Edge   │  │ Storage  │   │
│  │          │  │    DB    │  │ Functions│  │          │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│     OpenAI API (optional)  │  Stripe API (optional)         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS 3, TypeScript
- **Backend**: Next.js API Routes, Supabase Edge Functions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth (Email + Google OAuth)
- **Hosting**: Vercel (Frontend), Supabase (Backend)
- **AI**: OpenAI GPT-4 (optional, for content generation)
- **Payments**: Stripe (optional)
- **Image Generation**: Canvas API (node-canvas or @vercel/og)

### Deployment Architecture

- **Vercel**: Hosts Next.js application with automatic deployments from Git
- **Supabase**: Provides managed PostgreSQL, authentication, and edge functions
- **Edge Functions**: Weekly cron job for AI task generation
- **CDN**: Vercel Edge Network for global content delivery

## Components and Interfaces

### Frontend Components

#### 1. Authentication Components
- `LoginForm`: Email/password login with Supabase Auth
- `SignupForm`: Email/password registration with profile creation
- `GoogleAuthButton`: OAuth login via Supabase Google provider
- `AuthGuard`: HOC for protecting authenticated routes

#### 2. Dashboard Components
- `DashboardLayout`: Main layout with navigation and user stats header
- `DailyTasksGrid`: Displays 5 daily tasks in card format
- `TaskCard`: Individual task with title, description, duration, complete button
- `StatsHeader`: Shows streak, coins, level, progress bar
- `CompletionAnimation`: Celebratory animation on task completion

#### 3. Profile Components
- `ProfilePage`: User profile with stats, badges, and edit functionality
- `BadgeGrid`: Displays earned badges with tooltips
- `StreakCalendar`: Visual calendar showing completion history
- `LevelProgress`: Progress bar showing XP toward next level

#### 4. Leaderboard Components
- `LeaderboardTable`: Ranked list of users with pagination
- `LeaderboardTabs`: Switch between weekly, monthly, all-time
- `UserRankCard`: Highlighted card showing current user's rank

#### 5. Rewards Components
- `RewardsPage`: Prize model explanation and coin balance
- `RevenueProgress`: Progress bar toward ₹10,000 community goal
- `CoinPurchaseOptions`: Stripe payment integration for coin packages

#### 6. Admin Components
- `AdminLayout`: Admin panel layout with sidebar navigation
- `TaskManager`: CRUD interface for tasks with search/filter
- `TaskImporter`: CSV upload and parsing for bulk task import
- `UserActivityTable`: List of users with stats and actions
- `AnalyticsDashboard`: Charts for DAU, retention, popular tasks
- `LeaderboardManager`: Manual leaderboard adjustments

#### 7. Social Components
- `ShareCardGenerator`: Form to generate achievement card
- `ShareCardPreview`: Preview of generated PNG card
- `ShareButtons`: Social media sharing buttons

### Backend API Routes

#### Authentication APIs
- `POST /api/auth/signup`: Create new user account
- `POST /api/auth/login`: Authenticate user
- `POST /api/auth/logout`: End user session
- `GET /api/auth/session`: Get current session

#### Task APIs
- `GET /api/tasks/daily`: Get user's 5 daily tasks
- `GET /api/tasks`: Get all tasks (admin)
- `POST /api/tasks`: Create new task (admin)
- `PUT /api/tasks/[id]`: Update task (admin)
- `DELETE /api/tasks/[id]`: Delete task (admin)
- `POST /api/tasks/import`: Bulk import tasks from CSV (admin)

#### Completion APIs
- `POST /api/complete`: Mark task as complete
- `GET /api/completions`: Get user completion history
- `GET /api/streak`: Get current streak and check for reset

#### Gamification APIs
- `GET /api/profile`: Get user profile with stats
- `PUT /api/profile`: Update user profile
- `GET /api/badges`: Get user badges
- `GET /api/leaderboard`: Get leaderboard with filters

#### Social APIs
- `POST /api/share/generate`: Generate share card PNG
- `GET /api/share/[userId]`: Get public profile for sharing

#### Admin APIs
- `GET /api/admin/users`: List all users with stats
- `GET /api/admin/analytics`: Get platform analytics
- `POST /api/admin/leaderboard/snapshot`: Manually trigger snapshot

#### Monetization APIs
- `POST /api/stripe/create-checkout`: Create Stripe checkout session
- `POST /api/stripe/webhook`: Handle Stripe webhooks
- `GET /api/revenue`: Get community revenue total

### Supabase Edge Functions

#### Weekly Task Generator
```typescript
// supabase/functions/generate-tasks/index.ts
// Runs weekly via pg_cron
// Calls OpenAI API to generate 50 new tasks
// Validates and inserts into tasks table
```

### Database Schema

#### users table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  streak INTEGER DEFAULT 0,
  coins INTEGER DEFAULT 0,
  xp INTEGER DEFAULT 0,
  level INTEGER GENERATED ALWAYS AS (FLOOR(xp / 100) + 1) STORED,
  last_completion_date DATE,
  interests TEXT[] DEFAULT '{}',
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### tasks table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (LENGTH(description) <= 120),
  category TEXT NOT NULL CHECK (category IN ('learn', 'move', 'reflect', 'fun', 'skill', 'challenge')),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 30 AND 120),
  tags TEXT[] DEFAULT '{}',
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  type TEXT NOT NULL CHECK (type IN ('learn', 'move', 'reflect', 'fun', 'skill', 'challenge')),
  completion_count INTEGER DEFAULT 0,
  affiliate_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### daily_user_tasks table
```sql
CREATE TABLE daily_user_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  assigned_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  coins_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, task_id, assigned_date)
);
```

#### completions table
```sql
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  coins_earned INTEGER NOT NULL,
  streak_at_completion INTEGER NOT NULL
);
```

#### badges table
```sql
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_name)
);
```

#### leaderboard_snapshots table
```sql
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  coins INTEGER NOT NULL,
  streak INTEGER NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('weekly', 'monthly')),
  period_end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### referrals table
```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_id)
);
```

#### revenue_tracking table
```sql
CREATE TABLE revenue_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount DECIMAL(10, 2) NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('stripe', 'affiliate', 'adsense')),
  transaction_id TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Data Models

### TypeScript Interfaces

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  streak: number;
  coins: number;
  xp: number;
  level: number;
  last_completion_date?: string;
  interests: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge';
  duration_seconds: number;
  tags: string[];
  difficulty: 1 | 2 | 3 | 4 | 5;
  type: 'learn' | 'move' | 'reflect' | 'fun' | 'skill' | 'challenge';
  completion_count: number;
  affiliate_link?: string;
  created_at: string;
}

interface DailyUserTask {
  id: string;
  user_id: string;
  task_id: string;
  assigned_date: string;
  completed: boolean;
  completed_at?: string;
  coins_earned: number;
  task?: Task;
}

interface Completion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  coins_earned: number;
  streak_at_completion: number;
}

interface Badge {
  id: string;
  user_id: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  name: string;
  avatar_url?: string;
  coins: number;
  streak: number;
  level: number;
}

interface ShareCard {
  username: string;
  streak: number;
  completions_today: number;
  top_badge?: string;
  qr_code_url: string;
}
```

### Task Selection Algorithm

```typescript
async function selectDailyTasks(userId: string, date: string): Promise<Task[]> {
  const user = await getUser(userId);
  const selectedTasks: Task[] = [];
  
  // 1. Select 2 tasks based on user interests
  const interestTasks = await supabase
    .from('tasks')
    .select('*')
    .overlaps('tags', user.interests)
    .order('random()')
    .limit(2);
  selectedTasks.push(...interestTasks.data);
  
  // 2. Select 1 random task
  const randomTask = await supabase
    .from('tasks')
    .select('*')
    .not('id', 'in', selectedTasks.map(t => t.id))
    .order('random()')
    .limit(1);
  selectedTasks.push(...randomTask.data);
  
  // 3. Select 1 trending task (most completed in last 7 days)
  const trendingTask = await supabase
    .from('tasks')
    .select('*, completions!inner(created_at)')
    .gte('completions.created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .not('id', 'in', selectedTasks.map(t => t.id))
    .order('completion_count', { ascending: false })
    .limit(1);
  selectedTasks.push(...trendingTask.data);
  
  // 4. Select 1 challenge task
  const challengeTask = await supabase
    .from('tasks')
    .select('*')
    .eq('type', 'challenge')
    .not('id', 'in', selectedTasks.map(t => t.id))
    .order('random()')
    .limit(1);
  selectedTasks.push(...challengeTask.data);
  
  return selectedTasks;
}
```

### Streak Reset Logic

```typescript
async function checkAndResetStreak(userId: string): Promise<void> {
  const user = await getUser(userId);
  
  if (!user.last_completion_date) return;
  
  const lastCompletion = new Date(user.last_completion_date);
  const now = new Date();
  const hoursSinceCompletion = (now.getTime() - lastCompletion.getTime()) / (1000 * 60 * 60);
  
  // Reset streak if more than 24 hours have passed
  if (hoursSinceCompletion > 24) {
    await supabase
      .from('users')
      .update({ streak: 0 })
      .eq('id', userId);
  }
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: User creation initializes with zero state
*For any* valid signup data (email, name), the created user record should have streak=0, coins=0, XP=0, and an empty badges array.
**Validates: Requirements 1.2**

### Property 2: Profile updates round-trip correctly
*For any* valid profile update data, saving and then retrieving the profile should return the updated values.
**Validates: Requirements 1.5**

### Property 3: Task description length is enforced
*For any* task creation attempt with description length >120 characters, the operation should fail. For any description ≤120 characters, it should succeed.
**Validates: Requirements 2.2**

### Property 4: Task duration bounds are enforced
*For any* task creation attempt with duration_seconds outside [30, 120], the operation should fail. For any duration in [30, 120], it should succeed.
**Validates: Requirements 2.3**

### Property 5: Task difficulty bounds are enforced
*For any* task creation attempt with difficulty outside [1, 5], the operation should fail. For any difficulty in [1, 5], it should succeed.
**Validates: Requirements 2.4**

### Property 6: Task type validation is enforced
*For any* task creation attempt with type not in {learn, move, reflect, fun, skill, challenge}, the operation should fail. For any type in the set, it should succeed.
**Validates: Requirements 2.5**

### Property 7: Daily task selection generates exactly 5 tasks
*For any* user on any new day, the task selection algorithm should generate exactly 5 tasks.
**Validates: Requirements 3.1**

### Property 8: Interest-based task selection matches user preferences
*For any* user with defined interests, at least 2 of the 5 selected daily tasks should have tags that overlap with the user's interest tags.
**Validates: Requirements 3.2**

### Property 9: Challenge task is always included
*For any* daily task selection, exactly 1 task should have type='challenge'.
**Validates: Requirements 3.5**

### Property 10: Daily task assignments are persisted correctly
*For any* task generation event, records should be created in daily_user_tasks with user_id, task_id, assigned_date, and completed=false.
**Validates: Requirements 3.6**

### Property 11: Coin rewards match difficulty formula
*For any* task with difficulty D, completing it should award exactly D × 3 coins to the user.
**Validates: Requirements 4.2**

### Property 12: XP increases by coins earned
*For any* task completion that awards C coins, the user's XP should increase by exactly C.
**Validates: Requirements 4.3**

### Property 13: Completing all 5 tasks increments streak
*For any* user who completes all 5 daily tasks, their streak should increase by exactly 1.
**Validates: Requirements 4.4**

### Property 14: Streak resets after 24 hours of inactivity
*For any* user whose last_completion_date is more than 24 hours ago, their streak should be reset to 0.
**Validates: Requirements 4.6**

### Property 15: Level calculation follows XP formula
*For any* user with XP value X, their level should equal floor(X / 100) + 1.
**Validates: Requirements 5.1**

### Property 16: 3-day streak awards badge
*For any* user who reaches streak=3, the "3-Day Warrior" badge should be awarded.
**Validates: Requirements 5.2**

### Property 17: 7-day streak awards badge
*For any* user who reaches streak=7, the "Week Champion" badge should be awarded.
**Validates: Requirements 5.3**

### Property 18: 30 completions awards badge
*For any* user who completes 30 total tasks, the "Task Master" badge should be awarded.
**Validates: Requirements 5.4**

### Property 19: 100 coins awards badge
*For any* user who earns 100 total coins, the "Coin Collector" badge should be awarded.
**Validates: Requirements 5.5**

### Property 20: Leaderboard is sorted by coins descending
*For any* leaderboard query, the results should be ordered by coins in descending order and limited to 100 entries.
**Validates: Requirements 6.1**

### Property 21: Leaderboard entries contain required fields
*For any* leaderboard entry, it should contain rank, username, coins, streak, and level.
**Validates: Requirements 6.2**

### Property 22: Coin redemption is blocked below revenue threshold
*For any* redemption attempt when community revenue < ₹10,000, the operation should be rejected.
**Validates: Requirements 7.4**

### Property 23: Coin redemption is enabled above revenue threshold
*For any* redemption attempt when community revenue ≥ ₹10,000, the operation should be allowed.
**Validates: Requirements 7.5**

### Property 24: AI-generated tasks are validated
*For any* task returned by the AI content generator, it should be validated to have all required fields (title, description ≤120 chars, duration_seconds in [30,120], category, tags, difficulty in [1,5], type) before insertion.
**Validates: Requirements 8.3**

### Property 25: Admin access requires admin role
*For any* admin panel access attempt, the user must have is_admin=true, otherwise access should be denied.
**Validates: Requirements 9.1**

### Property 26: CSV import creates valid tasks
*For any* valid CSV file with task data, all rows should be parsed and created as task records in the database.
**Validates: Requirements 9.3**

### Property 27: Share card contains all required elements
*For any* share card generation request, the resulting PNG should contain username, streak, completion count, badge, and QR code.
**Validates: Requirements 10.1**

### Property 28: QR code encodes correct profile URL
*For any* QR code generated for user U, decoding it should yield the URL to user U's profile page.
**Validates: Requirements 10.3**

### Property 29: RLS enforces user data isolation
*For any* user U, they should be able to read/write only their own records in users, daily_user_tasks, and completions tables, not other users' records.
**Validates: Requirements 11.2, 11.3, 11.4**

### Property 30: All authenticated users can read tasks
*For any* authenticated user, they should be able to read all records from the tasks table.
**Validates: Requirements 11.5**

### Property 31: Stripe payment adds coins to balance
*For any* successful Stripe payment of amount A for coin package P, the user's coin balance should increase by the coins in package P.
**Validates: Requirements 12.2**

### Property 32: Revenue aggregation sums all transactions
*For any* set of revenue transactions, the community revenue total should equal the sum of all transaction amounts.
**Validates: Requirements 12.5**

### Property 33: Required environment variables are validated
*For any* application startup, if required environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY) are missing, the application should fail to start with a clear error message.
**Validates: Requirements 13.3**

### Property 34: Seed data contains minimum task count
*For any* database initialization with seed data, the tasks table should contain at least 200 records.
**Validates: Requirements 14.1**

### Property 35: Seed tasks are evenly distributed across categories
*For any* seed data load, each of the 6 categories (learn, move, reflect, fun, skill, challenge) should have approximately equal task counts (within 20% variance).
**Validates: Requirements 14.2**

### Property 36: All seed tasks meet duration constraints
*For any* task in the seed data, duration_seconds should be in the range [30, 120].
**Validates: Requirements 14.4**

### Property 37: Dashboard displays all daily tasks with required fields
*For any* user viewing the dashboard, all 5 daily tasks should be rendered with title, description, duration, and complete button visible.
**Validates: Requirements 15.2**

### Property 38: Dashboard header displays user stats
*For any* user viewing the dashboard, the header should display their current streak, coins, and level.
**Validates: Requirements 15.3**

## Error Handling

### Client-Side Error Handling

1. **Authentication Errors**
   - Invalid credentials: Display user-friendly error message
   - Session expiry: Redirect to login with message
   - OAuth failures: Show retry option with alternative auth method

2. **Task Completion Errors**
   - Network failure: Queue completion locally, retry on reconnect
   - Already completed: Show success message without duplicate reward
   - Invalid task: Log error and refresh task list

3. **Form Validation Errors**
   - Display inline validation messages
   - Prevent submission until all fields are valid
   - Highlight invalid fields with red border

4. **API Errors**
   - 400 Bad Request: Show validation errors to user
   - 401 Unauthorized: Redirect to login
   - 403 Forbidden: Show "Access Denied" message
   - 404 Not Found: Show "Resource not found" message
   - 500 Server Error: Show generic error with retry option

### Server-Side Error Handling

1. **Database Errors**
   - Connection failures: Retry with exponential backoff (3 attempts)
   - Constraint violations: Return 400 with specific error message
   - Transaction failures: Rollback and return error

2. **External API Errors**
   - OpenAI API failures: Log error, retry once, alert admin if both fail
   - Stripe API failures: Return error to user, log for manual review
   - Timeout errors: Return 504 Gateway Timeout

3. **Validation Errors**
   - Schema validation: Return 400 with field-specific errors
   - Business logic violations: Return 422 Unprocessable Entity
   - Authorization failures: Return 403 Forbidden

4. **Edge Function Errors**
   - Cron job failures: Log error, send alert to admin email
   - Task generation failures: Retry once, use fallback task pool if both fail

### Error Logging Strategy

- Use structured logging with Winston or Pino
- Log levels: ERROR (user-facing issues), WARN (recoverable issues), INFO (important events)
- Include context: user_id, request_id, timestamp, stack trace
- Send critical errors to monitoring service (optional: Sentry)

## Testing Strategy

### Unit Testing

The application will use **Vitest** as the testing framework for unit tests. Unit tests will focus on:

1. **Utility Functions**
   - Level calculation from XP
   - Coin reward calculation
   - Date/time utilities for streak checking
   - Validation functions

2. **API Route Handlers**
   - Request parsing and validation
   - Response formatting
   - Error handling paths

3. **Component Logic**
   - State management
   - Event handlers
   - Conditional rendering logic

4. **Database Queries**
   - Task selection algorithm
   - Leaderboard ranking
   - Badge award triggers

### Property-Based Testing

The application will use **fast-check** for property-based testing in TypeScript. Property-based tests will verify the correctness properties defined above.

**Configuration:**
- Each property test should run a minimum of 100 iterations
- Use custom generators for domain-specific types (User, Task, etc.)
- Tag each test with the property number and requirement reference

**Example Property Test Structure:**
```typescript
import fc from 'fast-check';

// **Feature: daily-5-app, Property 11: Coin rewards match difficulty formula**
// **Validates: Requirements 4.2**
test('completing task awards difficulty × 3 coins', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 1, max: 5 }), // difficulty
      (difficulty) => {
        const coinsAwarded = calculateCoins(difficulty);
        expect(coinsAwarded).toBe(difficulty * 3);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Integration Testing

Integration tests will verify:
- API routes with database interactions
- Authentication flows with Supabase
- Task completion flow end-to-end
- Admin operations with RLS policies

### End-to-End Testing

E2E tests using **Playwright** will cover:
- User signup and login flows
- Daily task completion journey
- Leaderboard viewing
- Share card generation
- Admin panel operations

### Test Coverage Goals

- Unit tests: 80% code coverage
- Property tests: 100% coverage of correctness properties
- Integration tests: All API routes
- E2E tests: Critical user journeys

### Testing Best Practices

1. Write tests alongside implementation (TDD approach)
2. Use descriptive test names that explain the scenario
3. Keep tests isolated and independent
4. Mock external services (OpenAI, Stripe) in unit tests
5. Use test databases for integration tests
6. Run property tests in CI/CD pipeline
7. Generate test data with factories for consistency

## Performance Considerations

### Frontend Performance

1. **Code Splitting**
   - Use Next.js dynamic imports for admin panel
   - Lazy load share card generator
   - Split vendor bundles

2. **Image Optimization**
   - Use Next.js Image component for avatars and badges
   - Serve images in WebP format with fallbacks
   - Implement lazy loading for leaderboard avatars

3. **Caching Strategy**
   - Cache task data in localStorage (24-hour TTL)
   - Use SWR for data fetching with stale-while-revalidate
   - Cache leaderboard data (5-minute TTL)

4. **Bundle Size**
   - Target < 200KB initial bundle
   - Tree-shake unused Tailwind classes
   - Minimize third-party dependencies

### Backend Performance

1. **Database Optimization**
   - Index on: users.email, tasks.type, daily_user_tasks(user_id, assigned_date)
   - Use database connection pooling
   - Implement query result caching for leaderboard

2. **API Response Times**
   - Target < 200ms for task retrieval
   - Target < 500ms for completion processing
   - Use database transactions for atomic operations

3. **Rate Limiting**
   - 100 requests per minute per user for API routes
   - 10 requests per minute for share card generation
   - 1000 requests per hour for task retrieval

### Scalability Considerations

1. **Free Tier Limits**
   - Supabase: 500MB storage, 2GB bandwidth, 50,000 monthly active users
   - Vercel: 100GB bandwidth, 100 hours serverless execution
   - Monitor usage and optimize before hitting limits

2. **Database Growth**
   - Implement data retention policy (archive completions older than 1 year)
   - Partition large tables if needed
   - Monitor table sizes and index performance

3. **Caching Strategy**
   - Use Vercel Edge Caching for static assets
   - Implement Redis caching if scaling beyond free tier
   - Cache expensive queries (leaderboard, analytics)

## Security Considerations

### Authentication Security

1. **Supabase Auth**
   - Use secure session management
   - Implement CSRF protection
   - Enable email verification for signups
   - Use secure password hashing (handled by Supabase)

2. **OAuth Security**
   - Validate OAuth state parameter
   - Use HTTPS for redirect URIs
   - Store tokens securely in httpOnly cookies

### Authorization

1. **Row Level Security (RLS)**
   - Enforce RLS on all tables
   - Test RLS policies thoroughly
   - Use service role key only in server-side code

2. **Admin Access**
   - Verify admin role on every admin API call
   - Log all admin actions
   - Implement admin action audit trail

### Data Protection

1. **Input Validation**
   - Validate all user inputs on server-side
   - Sanitize HTML in task descriptions
   - Use parameterized queries (Supabase handles this)

2. **API Security**
   - Use HTTPS only
   - Implement rate limiting
   - Validate API keys and tokens
   - Use CORS restrictions

3. **Sensitive Data**
   - Never expose service role key to client
   - Store API keys in environment variables
   - Don't log sensitive information

### Stripe Security

1. **Payment Processing**
   - Use Stripe Checkout (PCI compliant)
   - Verify webhook signatures
   - Never store card details
   - Implement idempotency for payment processing

## Deployment Guide

### Prerequisites

1. **Accounts Required**
   - GitHub account (for code repository)
   - Vercel account (free tier)
   - Supabase account (free tier)
   - OpenAI account (optional, for AI content generation)
   - Stripe account (optional, for payments)

### Supabase Setup

1. **Create Project**
   - Go to supabase.com and create new project
   - Note down project URL and anon key
   - Save service role key securely

2. **Run Database Migrations**
   - Execute SQL schema from `supabase/migrations/001_initial_schema.sql`
   - Execute RLS policies from `supabase/migrations/002_rls_policies.sql`
   - Load seed data from `supabase/seed.sql`

3. **Configure Authentication**
   - Enable Email provider in Supabase Auth settings
   - Enable Google OAuth provider
   - Add authorized redirect URLs for your domain

4. **Set Up Edge Functions**
   - Deploy edge function: `supabase functions deploy generate-tasks`
   - Configure cron job in Supabase dashboard or via pg_cron

### Vercel Deployment

1. **Connect Repository**
   - Push code to GitHub
   - Import project in Vercel dashboard
   - Select Next.js framework preset

2. **Configure Environment Variables**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   OPENAI_API_KEY=your_openai_key (optional)
   STRIPE_SECRET_KEY=your_stripe_key (optional)
   STRIPE_WEBHOOK_SECRET=your_webhook_secret (optional)
   NEXT_PUBLIC_APP_URL=your_vercel_url
   ```

3. **Deploy**
   - Click "Deploy" in Vercel
   - Wait for build to complete
   - Visit deployed URL

### Post-Deployment

1. **Create Admin User**
   - Sign up through the app
   - Manually set `is_admin=true` in Supabase users table

2. **Verify Functionality**
   - Test signup/login
   - Complete a task
   - Check leaderboard
   - Generate share card
   - Access admin panel

3. **Monitor Usage**
   - Check Vercel analytics for bandwidth usage
   - Monitor Supabase dashboard for database size
   - Set up alerts for approaching free tier limits

### Optional: Stripe Setup

1. **Create Stripe Account**
   - Sign up at stripe.com
   - Get API keys from dashboard

2. **Create Products**
   - Create 3 products: ₹29, ₹49, ₹99 coin packages
   - Note down price IDs

3. **Configure Webhooks**
   - Add webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
   - Select events: `checkout.session.completed`
   - Copy webhook signing secret

4. **Test Payments**
   - Use Stripe test mode
   - Test card: 4242 4242 4242 4242
   - Verify coins are added after payment

## Maintenance and Monitoring

### Regular Maintenance Tasks

1. **Weekly**
   - Review error logs
   - Check AI task generation success rate
   - Monitor free tier usage

2. **Monthly**
   - Review user growth and retention metrics
   - Analyze most/least popular tasks
   - Update task pool based on completion rates
   - Review and respond to user feedback

3. **Quarterly**
   - Audit security policies
   - Review and optimize database queries
   - Update dependencies
   - Backup database

### Monitoring Metrics

1. **User Metrics**
   - Daily Active Users (DAU)
   - 7-day retention rate
   - Average tasks completed per user
   - Streak distribution

2. **System Metrics**
   - API response times
   - Error rates
   - Database query performance
   - Bandwidth usage

3. **Business Metrics**
   - Total revenue (if monetization enabled)
   - Conversion rate for coin purchases
   - Social share rate
   - Referral rate

### Scaling Beyond Free Tier

When approaching free tier limits:

1. **Optimize First**
   - Implement aggressive caching
   - Optimize database queries
   - Compress images and assets
   - Remove unused features

2. **Upgrade Strategy**
   - Supabase Pro: $25/month (8GB storage, 50GB bandwidth)
   - Vercel Pro: $20/month (1TB bandwidth)
   - Consider Redis for caching
   - Implement CDN for static assets

3. **Revenue Generation**
   - Enable Stripe payments
   - Add affiliate links to tasks
   - Implement AdSense
   - Offer premium features
