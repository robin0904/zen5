# Requirements Document

## Introduction

Daily 5 (Zen5) is a zero-investment, habit-forming web application that delivers 5 personalized micro-tasks daily to users. The system gamifies personal development through streaks, coins, badges, and leaderboards while maintaining zero hosting costs through Vercel and Supabase free tiers. The application includes user authentication, task management, gamification mechanics, an admin panel, AI-powered content generation, and a deferred prize model that activates when community revenue goals are met.

## Glossary

- **Daily5System**: The complete web application including frontend, backend, and database
- **User**: An authenticated individual using the application
- **MicroTask**: A 30-120 second activity from categories: Learn, Move, Reflect, Fun, Skill, or Challenge
- **Streak**: Consecutive days a user completes their daily tasks
- **Coins**: Virtual currency earned by completing tasks (difficulty × 3)
- **XP**: Experience points that determine user level
- **Badge**: Achievement award for reaching specific milestones
- **Leaderboard**: Ranking system showing top users by coins or streaks
- **AdminPanel**: Administrative interface for managing tasks and viewing analytics
- **SupabaseDB**: PostgreSQL database hosted on Supabase
- **TaskEngine**: Algorithm that selects 5 daily tasks per user
- **ContentUpdater**: Automated system that generates new tasks via AI
- **ShareCard**: PNG image showing user achievements for social sharing
- **PrizeModel**: Deferred reward system that unlocks when revenue threshold is reached
- **RLS**: Row Level Security policies in Supabase for data access control

## Requirements

### Requirement 1: User Authentication and Profile Management

**User Story:** As a new visitor, I want to sign up using email or Google authentication, so that I can access the Daily 5 application and track my progress.

#### Acceptance Criteria

1. WHEN a visitor accesses the signup page THEN the Daily5System SHALL display email and Google OAuth authentication options
2. WHEN a user completes signup THEN the Daily5System SHALL create a user profile with name, email, streak (0), coins (0), XP (0), joined date, and empty badges array
3. WHEN a user logs in THEN the Daily5System SHALL authenticate via Supabase Auth and redirect to the dashboard
4. WHEN a user views their profile THEN the Daily5System SHALL display name, streak count, total coins, current level, badges earned, and join date
5. WHEN a user updates profile information THEN the Daily5System SHALL validate and persist changes to SupabaseDB

### Requirement 2: Task Data Model and Storage

**User Story:** As the system, I want to store comprehensive task information, so that tasks can be selected, displayed, and tracked effectively.

#### Acceptance Criteria

1. WHEN a task is created THEN the Daily5System SHALL store id, title, description (max 120 characters), category, duration_seconds (30-120), tags (JSON array), difficulty (1-5), type, and created_at timestamp
2. WHEN storing task data THEN the Daily5System SHALL enforce description length constraint of 120 characters maximum
3. WHEN storing task duration THEN the Daily5System SHALL enforce duration_seconds between 30 and 120 seconds
4. WHEN storing task difficulty THEN the Daily5System SHALL enforce difficulty value between 1 and 5
5. WHEN storing task type THEN the Daily5System SHALL validate type is one of: learn, move, reflect, fun, skill, or challenge

### Requirement 3: Daily Task Selection Engine

**User Story:** As a user, I want to receive 5 personalized micro-tasks each day, so that I have variety and relevance in my daily activities.

#### Acceptance Criteria

1. WHEN a user accesses the dashboard on a new day THEN the TaskEngine SHALL generate exactly 5 tasks for that user
2. WHEN selecting daily tasks THEN the TaskEngine SHALL choose 2 tasks matching user interest tags from their profile
3. WHEN selecting daily tasks THEN the TaskEngine SHALL choose 1 random task from any category
4. WHEN selecting daily tasks THEN the TaskEngine SHALL choose 1 trending task based on highest completion count in past 7 days
5. WHEN selecting daily tasks THEN the TaskEngine SHALL choose 1 challenge-type task
6. WHEN daily tasks are generated THEN the Daily5System SHALL store the assignment in daily_user_tasks table with user_id, task_id, assigned_date, and completed status (false)

### Requirement 4: Task Completion and Reward Logic

**User Story:** As a user, I want to complete tasks and earn rewards, so that I feel motivated to maintain my habit streak.

#### Acceptance Criteria

1. WHEN a user marks a task as complete THEN the Daily5System SHALL record completion with user_id, task_id, completed_at timestamp, and coins_earned
2. WHEN a task is completed THEN the Daily5System SHALL award coins equal to task difficulty multiplied by 3
3. WHEN a task is completed THEN the Daily5System SHALL increment user XP by coins earned
4. WHEN a user completes all 5 daily tasks THEN the Daily5System SHALL increment the user streak by 1
5. WHEN a user completes all 5 daily tasks THEN the Daily5System SHALL update last_completion_date to current date
6. WHEN 24 hours pass without completing all 5 tasks THEN the Daily5System SHALL reset user streak to 0

### Requirement 5: Gamification System - Levels and Badges

**User Story:** As a user, I want to earn levels and badges for my achievements, so that I feel recognized and motivated to continue.

#### Acceptance Criteria

1. WHEN calculating user level THEN the Daily5System SHALL compute level as floor(XP / 100) + 1
2. WHEN a user reaches 3-day streak THEN the Daily5System SHALL award "3-Day Warrior" badge
3. WHEN a user reaches 7-day streak THEN the Daily5System SHALL award "Week Champion" badge
4. WHEN a user completes 30 total tasks THEN the Daily5System SHALL award "Task Master" badge
5. WHEN a user earns 100 total coins THEN the Daily5System SHALL award "Coin Collector" badge
6. WHEN a badge is earned THEN the Daily5System SHALL add badge to user badges array and record in badges table with user_id, badge_name, earned_at timestamp

### Requirement 6: Leaderboard System

**User Story:** As a user, I want to see how I rank against other users, so that I feel competitive motivation to improve.

#### Acceptance Criteria

1. WHEN a user views the leaderboard THEN the Daily5System SHALL display top 100 users ranked by total coins
2. WHEN displaying leaderboard entries THEN the Daily5System SHALL show rank, username, coins, streak, and level
3. WHEN the weekly period ends THEN the Daily5System SHALL snapshot current leaderboard to leaderboard_snapshots table with period_type "weekly" and period_end_date
4. WHEN the monthly period ends THEN the Daily5System SHALL snapshot current leaderboard to leaderboard_snapshots table with period_type "monthly" and period_end_date
5. WHEN a user views historical leaderboards THEN the Daily5System SHALL retrieve and display snapshots for selected time period

### Requirement 7: Deferred Prize Model

**User Story:** As a user, I want to understand the prize redemption system, so that I know my coins have future value when the platform reaches revenue goals.

#### Acceptance Criteria

1. WHEN a user views the rewards page THEN the Daily5System SHALL display message "Coins redeemable only when community revenue crosses ₹10,000"
2. WHEN displaying prize information THEN the Daily5System SHALL show current community revenue progress toward ₹10,000 goal
3. WHEN displaying prize information THEN the Daily5System SHALL show user coin balance and potential cash value
4. WHEN community revenue is below threshold THEN the Daily5System SHALL prevent coin redemption
5. WHEN community revenue reaches ₹10,000 THEN the Daily5System SHALL enable coin redemption functionality

### Requirement 8: AI-Powered Content Generation

**User Story:** As a system administrator, I want tasks to be automatically generated weekly, so that content stays fresh without manual intervention.

#### Acceptance Criteria

1. WHEN the weekly cron job executes THEN the ContentUpdater SHALL call OpenAI API with task generation prompt
2. WHEN generating tasks THEN the ContentUpdater SHALL request 50 unique micro-tasks in JSON format
3. WHEN AI returns task data THEN the ContentUpdater SHALL validate each task has required fields: title, description (≤120 chars), duration_seconds (30-120), category, tags, difficulty (1-5), and type
4. WHEN task validation passes THEN the ContentUpdater SHALL insert new tasks into SupabaseDB tasks table
5. WHEN task generation fails THEN the ContentUpdater SHALL log error and retry once before alerting administrator

### Requirement 9: Administrative Panel

**User Story:** As an administrator, I want a comprehensive admin panel, so that I can manage tasks, monitor users, and analyze platform metrics.

#### Acceptance Criteria

1. WHEN an admin accesses the admin panel THEN the Daily5System SHALL verify admin role from user metadata
2. WHEN viewing task management THEN the AdminPanel SHALL display all tasks with options to add, edit, or delete
3. WHEN importing tasks THEN the AdminPanel SHALL accept CSV file upload and parse into task records
4. WHEN viewing user activity THEN the AdminPanel SHALL display list of users with streak, coins, last active date, and total completions
5. WHEN viewing analytics THEN the AdminPanel SHALL display daily active users (DAU), 7-day retention rate, and top 10 most completed tasks
6. WHEN managing leaderboard THEN the AdminPanel SHALL allow viewing and manual adjustment of user rankings

### Requirement 10: Social Sharing Card Generation

**User Story:** As a user, I want to generate and share achievement cards, so that I can showcase my progress on social media.

#### Acceptance Criteria

1. WHEN a user requests a share card THEN the Daily5System SHALL generate PNG image with username, current streak, today's completion count, highest badge, and QR code
2. WHEN generating share card THEN the Daily5System SHALL use canvas API to render card with branded design
3. WHEN generating QR code THEN the Daily5System SHALL encode URL to user profile page
4. WHEN share card is generated THEN the Daily5System SHALL return image as downloadable PNG file
5. WHEN share card generation fails THEN the Daily5System SHALL return error message and log failure details

### Requirement 11: Database Schema and Security

**User Story:** As a system architect, I want a well-structured database with security policies, so that data is organized and protected per user.

#### Acceptance Criteria

1. WHEN creating database schema THEN the Daily5System SHALL define tables: users, tasks, daily_user_tasks, completions, referrals, badges, and leaderboard_snapshots
2. WHEN implementing RLS policies THEN the SupabaseDB SHALL enforce users can only read their own user record
3. WHEN implementing RLS policies THEN the SupabaseDB SHALL enforce users can only read/write their own daily_user_tasks records
4. WHEN implementing RLS policies THEN the SupabaseDB SHALL enforce users can only insert their own completion records
5. WHEN implementing RLS policies THEN the SupabaseDB SHALL allow all authenticated users to read tasks table
6. WHEN implementing RLS policies THEN the SupabaseDB SHALL restrict admin operations to users with admin role

### Requirement 12: Monetization Integration

**User Story:** As a platform owner, I want optional monetization features, so that I can generate revenue without upfront investment.

#### Acceptance Criteria

1. WHEN Stripe is configured THEN the Daily5System SHALL display coin purchase options: ₹29, ₹49, and ₹99 packages
2. WHEN a user purchases coins THEN the Daily5System SHALL process payment via Stripe API and add coins to user balance
3. WHEN displaying tasks THEN the Daily5System SHALL support optional affiliate link embedding in task descriptions
4. WHEN rendering pages THEN the Daily5System SHALL include AdSense-ready container components for ad placement
5. WHEN tracking revenue THEN the Daily5System SHALL aggregate all Stripe transactions for community revenue goal calculation

### Requirement 13: Zero-Cost Deployment Architecture

**User Story:** As a developer, I want clear deployment instructions for free hosting, so that I can launch the application without infrastructure costs.

#### Acceptance Criteria

1. WHEN deploying to Vercel THEN the Daily5System SHALL run on Vercel free tier with Next.js App Router
2. WHEN connecting Supabase THEN the Daily5System SHALL use Supabase free tier for authentication, PostgreSQL database, and edge functions
3. WHEN configuring environment variables THEN the Daily5System SHALL require NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, and optional OPENAI_API_KEY and STRIPE_SECRET_KEY
4. WHEN setting up cron jobs THEN the Daily5System SHALL use Supabase Edge Functions with pg_cron for weekly task generation
5. WHEN deployment is complete THEN the Daily5System SHALL be fully functional with zero hosting costs

### Requirement 14: Seed Data and Initial Content

**User Story:** As a developer, I want comprehensive seed data, so that the application launches with rich content immediately.

#### Acceptance Criteria

1. WHEN initializing the database THEN the Daily5System SHALL load at least 200 pre-defined tasks
2. WHEN distributing seed tasks THEN the Daily5System SHALL ensure even distribution across all 6 categories: learn, move, reflect, fun, skill, challenge
3. WHEN creating seed tasks THEN the Daily5System SHALL include mix of English and Hinglish descriptions
4. WHEN creating seed tasks THEN the Daily5System SHALL ensure all tasks meet duration constraint of 30-120 seconds
5. WHEN creating seed tasks THEN the Daily5System SHALL include diverse tags for effective personalization matching

### Requirement 15: User Interface and Experience

**User Story:** As a user, I want a clean, mobile-first interface, so that I can easily use the application on any device.

#### Acceptance Criteria

1. WHEN accessing the application on mobile THEN the Daily5System SHALL display responsive layout optimized for screen widths 320px and above
2. WHEN viewing the dashboard THEN the Daily5System SHALL display 5 daily tasks as cards with title, description, duration, and complete button
3. WHEN viewing the dashboard THEN the Daily5System SHALL display user stats: streak, coins, level in prominent header
4. WHEN interacting with UI elements THEN the Daily5System SHALL provide visual feedback within 100 milliseconds
5. WHEN using Tailwind CSS THEN the Daily5System SHALL maintain consistent design system with defined color palette and spacing scale
