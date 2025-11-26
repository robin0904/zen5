# Implementation Plan

- [x] 1. Initialize Next.js project and configure dependencies









  - Create Next.js 14 project with App Router and TypeScript
  - Install dependencies: @supabase/supabase-js, @supabase/auth-helpers-nextjs, tailwindcss, fast-check, vitest
  - Configure Tailwind CSS with custom theme colors
  - Set up environment variables structure
  - Create .env.example file with all required variables
  - _Requirements: 13.3, 15.5_


- [x] 2. Set up Supabase database schema and security


  - [x] 2.1 Create database migration files with all tables


    - Write SQL for users, tasks, daily_user_tasks, completions, badges, leaderboard_snapshots, referrals, revenue_tracking tables
    - Add constraints, indexes, and generated columns
    - _Requirements: 11.1, 2.1_
  
  - [x] 2.2 Implement Row Level Security policies


    - Create RLS policies for user data isolation
    - Create RLS policies for task read access
    - Create RLS policies for admin operations
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 2.3 Write property test for RLS user data isolation
    - **Property 29: RLS enforces user data isolation**
    - **Validates: Requirements 11.2, 11.3, 11.4**
  
  - [ ]* 2.4 Write property test for task read access
    - **Property 30: All authenticated users can read tasks**
    - **Validates: Requirements 11.5**

- [x] 3. Create seed data with 200+ tasks



  - [x] 3.1 Generate seed data JSON file


    - Create 200+ tasks with even distribution across 6 categories
    - Include English and Hinglish descriptions
    - Ensure all tasks meet duration (30-120s) and description (≤120 chars) constraints
    - Add diverse tags for personalization
    - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5_
  
  - [x] 3.2 Create seed data loading script


    - Write SQL script to insert seed data
    - _Requirements: 14.1_
  
  - [ ]* 3.3 Write property test for seed data validation
    - **Property 34: Seed data contains minimum task count**
    - **Property 35: Seed tasks are evenly distributed across categories**
    - **Property 36: All seed tasks meet duration constraints**
    - **Validates: Requirements 14.1, 14.2, 14.4**

- [x] 4. Implement Supabase client utilities



  - Create server-side Supabase client
  - Create client-side Supabase client
  - Create middleware for session management
  - Add helper functions for auth state
  - _Requirements: 1.1, 1.3_

- [x] 5. Build authentication system



  - [x] 5.1 Create authentication UI components


    - Build LoginForm component with email/password
    - Build SignupForm component with profile creation
    - Build GoogleAuthButton component
    - Create AuthGuard HOC for protected routes
    - _Requirements: 1.1_
  
  - [x] 5.2 Implement authentication API routes


    - Create signup API route with user profile initialization
    - Create login API route
    - Create logout API route
    - Create session check API route
    - _Requirements: 1.2, 1.3_
  
  - [ ]* 5.3 Write property test for user initialization
    - **Property 1: User creation initializes with zero state**
    - **Validates: Requirements 1.2**
  
  - [ ]* 5.4 Write property test for profile updates
    - **Property 2: Profile updates round-trip correctly**
    - **Validates: Requirements 1.5**

- [x] 6. Implement task data model and validation



  - [x] 6.1 Create TypeScript interfaces for all data models


    - Define User, Task, DailyUserTask, Completion, Badge, LeaderboardEntry interfaces
    - _Requirements: 2.1_
  
  - [x] 6.2 Create task validation utilities


    - Implement description length validation (≤120 chars)
    - Implement duration validation (30-120 seconds)
    - Implement difficulty validation (1-5)
    - Implement type validation (enum check)
    - _Requirements: 2.2, 2.3, 2.4, 2.5_
  
  - [ ]* 6.3 Write property tests for task validation
    - **Property 3: Task description length is enforced**
    - **Property 4: Task duration bounds are enforced**
    - **Property 5: Task difficulty bounds are enforced**
    - **Property 6: Task type validation is enforced**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

- [x] 7. Build task selection engine



  - [x] 7.1 Implement daily task selection algorithm


    - Create function to select 2 interest-based tasks
    - Create function to select 1 random task
    - Create function to select 1 trending task (most completed in 7 days)
    - Create function to select 1 challenge task
    - Combine into main selectDailyTasks function
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 7.2 Create API route for daily tasks


    - Implement GET /api/tasks/daily endpoint
    - Check if tasks already assigned for today
    - Generate new tasks if needed
    - Store assignments in daily_user_tasks table
    - _Requirements: 3.6_
  
  - [ ]* 7.3 Write property tests for task selection
    - **Property 7: Daily task selection generates exactly 5 tasks**
    - **Property 8: Interest-based task selection matches user preferences**
    - **Property 9: Challenge task is always included**
    - **Property 10: Daily task assignments are persisted correctly**
    - **Validates: Requirements 3.1, 3.2, 3.5, 3.6**

- [x] 8. Implement task completion and rewards system



  - [x] 8.1 Create completion logic utilities


    - Implement coin calculation function (difficulty × 3)
    - Implement XP increment function
    - Implement streak increment logic
    - Implement streak reset check (24-hour timeout)
    - _Requirements: 4.2, 4.3, 4.4, 4.6_
  
  - [x] 8.2 Create completion API route


    - Implement POST /api/complete endpoint
    - Validate task belongs to user's daily tasks
    - Award coins and XP
    - Update streak if all 5 tasks completed
    - Record completion in completions table
    - _Requirements: 4.1, 4.5_
  
  - [ ]* 8.3 Write property tests for completion mechanics
    - **Property 11: Coin rewards match difficulty formula**
    - **Property 12: XP increases by coins earned**
    - **Property 13: Completing all 5 tasks increments streak**
    - **Property 14: Streak resets after 24 hours of inactivity**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.6**

- [ ] 9. Build gamification system



  - [x] 9.1 Implement level calculation


    - Create utility function for level from XP (floor(XP/100) + 1)
    - Add computed column or function in database
    - _Requirements: 5.1_
  
  - [x] 9.2 Implement badge award system


    - Create badge checking function
    - Implement 3-day streak badge trigger
    - Implement 7-day streak badge trigger
    - Implement 30 tasks badge trigger
    - Implement 100 coins badge trigger
    - Create function to award badge (insert into badges table)
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_
  
  - [x] 9.3 Create badges API route


    - Implement GET /api/badges endpoint
    - Return user's earned badges
    - _Requirements: 5.6_
  
  - [ ]* 9.4 Write property tests for gamification
    - **Property 15: Level calculation follows XP formula**
    - **Property 16: 3-day streak awards badge**
    - **Property 17: 7-day streak awards badge**
    - **Property 18: 30 completions awards badge**
    - **Property 19: 100 coins awards badge**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

- [ ] 10. Implement leaderboard system
  - [ ] 10.1 Create leaderboard query functions
    - Implement function to get top 100 users by coins
    - Add rank calculation
    - Include username, coins, streak, level in results
    - _Requirements: 6.1, 6.2_
  
  - [ ] 10.2 Create leaderboard API routes
    - Implement GET /api/leaderboard endpoint with filters
    - Implement snapshot creation function for weekly/monthly
    - _Requirements: 6.3, 6.4, 6.5_
  
  - [ ]* 10.3 Write property tests for leaderboard
    - **Property 20: Leaderboard is sorted by coins descending**
    - **Property 21: Leaderboard entries contain required fields**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 11. Build rewards and prize model system
  - [ ] 11.1 Create revenue tracking utilities
    - Implement function to calculate total community revenue
    - Create function to check if redemption threshold met
    - _Requirements: 7.2, 12.5_
  
  - [ ] 11.2 Create revenue API route
    - Implement GET /api/revenue endpoint
    - Return total revenue and threshold status
    - _Requirements: 7.2_
  
  - [ ] 11.3 Implement coin redemption logic
    - Create redemption validation function
    - Block redemption if revenue < ₹10,000
    - Allow redemption if revenue ≥ ₹10,000
    - _Requirements: 7.4, 7.5_
  
  - [ ]* 11.4 Write property tests for prize model
    - **Property 22: Coin redemption is blocked below revenue threshold**
    - **Property 23: Coin redemption is enabled above revenue threshold**
    - **Property 32: Revenue aggregation sums all transactions**
    - **Validates: Requirements 7.4, 7.5, 12.5**

- [ ] 12. Create dashboard UI
  - [ ] 12.1 Build dashboard layout and components
    - Create DashboardLayout with navigation
    - Create StatsHeader showing streak, coins, level
    - Create DailyTasksGrid component
    - Create TaskCard component with complete button
    - Add completion animation
    - _Requirements: 15.2, 15.3_
  
  - [ ] 12.2 Implement dashboard page
    - Fetch daily tasks on page load
    - Display 5 tasks with all required fields
    - Handle task completion interaction
    - Update UI on completion
    - _Requirements: 15.2_
  
  - [ ]* 12.3 Write property test for dashboard rendering
    - **Property 37: Dashboard displays all daily tasks with required fields**
    - **Property 38: Dashboard header displays user stats**
    - **Validates: Requirements 15.2, 15.3**

- [ ] 13. Build profile page
  - [ ] 13.1 Create profile UI components
    - Create ProfilePage component
    - Create BadgeGrid component
    - Create StreakCalendar component
    - Create LevelProgress component
    - _Requirements: 1.4_
  
  - [ ] 13.2 Implement profile API route
    - Create GET /api/profile endpoint
    - Create PUT /api/profile endpoint for updates
    - _Requirements: 1.4, 1.5_

- [ ] 14. Implement leaderboard UI
  - [ ] 14.1 Create leaderboard components
    - Create LeaderboardTable component
    - Create LeaderboardTabs for weekly/monthly/all-time
    - Create UserRankCard component
    - _Requirements: 6.1, 6.2, 6.5_
  
  - [ ] 14.2 Implement leaderboard page
    - Fetch and display leaderboard data
    - Add pagination
    - Highlight current user's rank
    - _Requirements: 6.1_

- [ ] 15. Build rewards page UI
  - Create RewardsPage component
  - Display prize model explanation message
  - Create RevenueProgress component showing progress to ₹10,000
  - Display user coin balance and potential cash value
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 16. Implement social sharing system
  - [ ] 16.1 Create share card generation API
    - Install canvas library (@vercel/og or node-canvas)
    - Implement POST /api/share/generate endpoint
    - Generate PNG with username, streak, completions, badge
    - Generate QR code with user profile URL
    - Return downloadable PNG
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_
  
  - [ ] 16.2 Create share UI components
    - Create ShareCardGenerator component
    - Create ShareCardPreview component
    - Create ShareButtons component
    - _Requirements: 10.1_
  
  - [ ]* 16.3 Write property tests for share card
    - **Property 27: Share card contains all required elements**
    - **Property 28: QR code encodes correct profile URL**
    - **Validates: Requirements 10.1, 10.3**

- [ ] 17. Build admin panel
  - [ ] 17.1 Create admin layout and navigation
    - Create AdminLayout component with sidebar
    - Add admin route protection
    - _Requirements: 9.1_
  
  - [ ] 17.2 Implement task management interface
    - Create TaskManager component with CRUD operations
    - Create task add/edit form
    - Implement task deletion
    - Add search and filter functionality
    - _Requirements: 9.2_
  
  - [ ] 17.3 Create task import functionality
    - Create TaskImporter component
    - Implement CSV parsing
    - Create POST /api/tasks/import endpoint
    - _Requirements: 9.3_
  
  - [ ] 17.4 Build user activity dashboard
    - Create UserActivityTable component
    - Display users with stats (streak, coins, last active, completions)
    - _Requirements: 9.4_
  
  - [ ] 17.5 Create analytics dashboard
    - Create AnalyticsDashboard component
    - Calculate and display DAU
    - Calculate and display 7-day retention rate
    - Display top 10 most completed tasks
    - _Requirements: 9.5_
  
  - [ ] 17.6 Implement admin API routes
    - Create GET /api/admin/users endpoint
    - Create GET /api/admin/analytics endpoint
    - Create POST /api/admin/leaderboard/snapshot endpoint
    - Create GET /api/tasks endpoint (admin only)
    - Create POST /api/tasks endpoint (admin only)
    - Create PUT /api/tasks/[id] endpoint (admin only)
    - Create DELETE /api/tasks/[id] endpoint (admin only)
    - _Requirements: 9.1, 9.2, 9.4, 9.5, 9.6_
  
  - [ ]* 17.7 Write property tests for admin functionality
    - **Property 25: Admin access requires admin role**
    - **Property 26: CSV import creates valid tasks**
    - **Validates: Requirements 9.1, 9.3**

- [ ] 18. Implement AI content generation system
  - [ ] 18.1 Create Supabase Edge Function for task generation
    - Create supabase/functions/generate-tasks/index.ts
    - Implement OpenAI API call with task generation prompt
    - Validate returned tasks against schema
    - Insert valid tasks into database
    - Implement error handling and retry logic
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 18.2 Set up weekly cron job
    - Configure pg_cron or Supabase cron trigger
    - Schedule weekly execution
    - _Requirements: 8.1_
  
  - [ ]* 18.3 Write property test for AI task validation
    - **Property 24: AI-generated tasks are validated**
    - **Validates: Requirements 8.3**

- [ ] 19. Implement Stripe payment integration (optional)
  - [ ] 19.1 Create Stripe checkout flow
    - Install @stripe/stripe-js
    - Create coin package products in Stripe
    - Implement POST /api/stripe/create-checkout endpoint
    - Create checkout page
    - _Requirements: 12.1_
  
  - [ ] 19.2 Implement webhook handler
    - Create POST /api/stripe/webhook endpoint
    - Verify webhook signature
    - Handle checkout.session.completed event
    - Add coins to user balance
    - Record transaction in revenue_tracking table
    - _Requirements: 12.2, 12.5_
  
  - [ ]* 19.3 Write property test for payment processing
    - **Property 31: Stripe payment adds coins to balance**
    - **Validates: Requirements 12.2**

- [ ] 20. Add monetization features
  - Implement affiliate link support in task descriptions
  - Create AdSense-ready container components
  - Add affiliate link rendering in TaskCard
  - _Requirements: 12.3, 12.4_

- [ ] 21. Implement responsive design and mobile optimization
  - Apply Tailwind responsive classes to all components
  - Test layout at 320px, 768px, 1024px breakpoints
  - Optimize touch targets for mobile (min 44px)
  - Add mobile-specific navigation
  - _Requirements: 15.1, 15.5_

- [ ] 22. Add error handling and loading states
  - Implement error boundaries for React components
  - Add loading skeletons for async data
  - Create error toast notification system
  - Add retry mechanisms for failed API calls
  - Implement offline detection and queuing
  - _Requirements: 4.1_

- [ ] 23. Implement environment variable validation
  - [ ] 23.1 Create env validation utility
    - Check for required variables on app startup
    - Throw clear error if missing
    - _Requirements: 13.3_
  
  - [ ]* 23.2 Write property test for env validation
    - **Property 33: Required environment variables are validated**
    - **Validates: Requirements 13.3**

- [ ] 24. Create deployment documentation
  - Write comprehensive README.md
  - Create DEPLOYMENT.md with step-by-step instructions
  - Document Supabase setup process
  - Document Vercel deployment process
  - Document optional Stripe setup
  - Create .env.example with all variables
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 25. Final testing and quality assurance
  - Run all property-based tests
  - Test complete user journey end-to-end
  - Verify RLS policies work correctly
  - Test admin panel functionality
  - Verify streak reset logic
  - Test share card generation
  - Verify leaderboard snapshots
  - Test on mobile devices
  - _Requirements: All_

- [ ] 26. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
