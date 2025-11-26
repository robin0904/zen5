# ✅ Task 7 Complete: Task Selection Engine

## Summary

Successfully implemented the intelligent task selection engine that generates 5 personalized daily tasks per user based on interests, trending data, random selection, and challenge requirements.

## Files Created

### Task Selection Engine

1. **`lib/tasks/task-selection.ts`** (300+ lines)
   - Main selection algorithm
   - Interest-based task selection
   - Random task selection
   - Trending task selection (most completed in 7 days)
   - Challenge task selection
   - Helper functions

2. **`lib/tasks/index.ts`**
   - Central export point

### API Route

3. **`app/api/tasks/daily/route.ts`**
   - GET endpoint for daily tasks
   - Checks for existing assignments
   - Generates new tasks if needed
   - Stores assignments in database
   - Returns task breakdown

## Requirements Met

| Requirement | Description | Status |
|-------------|-------------|--------|
| **3.1** | Generate exactly 5 tasks | ✅ Complete |
| **3.2** | 2 interest-based tasks | ✅ Complete |
| **3.3** | 1 random task | ✅ Complete |
| **3.4** | 1 trending task (7-day window) | ✅ Complete |
| **3.5** | 1 challenge task | ✅ Complete |
| **3.6** | Store assignments in daily_user_tasks | ✅ Complete |

## Algorithm Implementation

### Main Selection Function

```typescript
selectDailyTasks(userId: string, date?: string): Promise<TaskSelectionResult>
```

**Process:**
1. Get user interests from profile
2. Select 2 interest-based tasks
3. Select 1 random task
4. Select 1 trending task
5. Select 1 challenge task
6. Ensure exactly 5 tasks total
7. Return tasks with breakdown

### Selection Functions

**1. Interest-Based Selection (Requirement 3.2)**
```typescript
selectInterestBasedTasks(interests: string[], count: number, excludeIds: Set<string>)
```
- Queries tasks with tags overlapping user interests
- Uses PostgreSQL `overlaps` operator
- Shuffles results for variety
- Fallback to random if no matches

**2. Random Selection (Requirement 3.3)**
```typescript
selectRandomTasks(count: number, excludeIds: Set<string>)
```
- Selects from all available tasks
- Excludes already selected tasks
- Uses Fisher-Yates shuffle algorithm
- Ensures variety

**3. Trending Selection (Requirement 3.4)**
```typescript
selectTrendingTasks(count: number, excludeIds: Set<string>)
```
- Queries tasks with most completions in last 7 days
- Joins with completions table
- Orders by completion_count
- Fallback to highest overall completion count

**4. Challenge Selection (Requirement 3.5)**
```typescript
selectChallengeTasks(count: number, excludeIds: Set<string>)
```
- Filters tasks where type='challenge'
- Shuffles for variety
- Ensures user gets different challenges

### Helper Functions

**Check Existing Tasks:**
```typescript
hasTasksForToday(userId: string, date?: string): Promise<boolean>
```
- Checks if tasks already assigned for date
- Prevents duplicate generation

**Get Daily Tasks:**
```typescript
getDailyTasks(userId: string, date?: string): Promise<Task[]>
```
- Retrieves user's tasks for specific date
- Joins with tasks table for full details

**Shuffle Algorithm:**
```typescript
shuffleArray<T>(array: T[]): T[]
```
- Fisher-Yates shuffle for randomization
- Ensures fair distribution

## API Route

### GET /api/tasks/daily

**Query Parameters:**
- `date` (optional) - ISO date string (YYYY-MM-DD), defaults to today

**Response (Existing Tasks):**
```json
{
  "tasks": [...],
  "date": "2024-01-15",
  "generated": false
}
```

**Response (New Tasks):**
```json
{
  "tasks": [...],
  "date": "2024-01-15",
  "generated": true,
  "breakdown": {
    "interest_based": [...],
    "random": [...],
    "trending": [...],
    "challenge": [...]
  }
}
```

**Error Responses:**
- `401` - Unauthorized (not logged in)
- `500` - Internal server error

## Task Selection Logic

### Priority Order

1. **Interest-Based (2 tasks)**
   - Highest priority for personalization
   - Matches user's interest tags
   - Encourages engagement

2. **Random (1 task)**
   - Introduces variety
   - Exposes users to new categories
   - Prevents monotony

3. **Trending (1 task)**
   - Social proof element
   - Popular tasks likely to be engaging
   - Community-driven selection

4. **Challenge (1 task)**
   - Pushes user growth
   - Higher difficulty tasks
   - Builds discipline

### Exclusion Logic

- Each selection function receives `excludeIds` set
- Prevents duplicate task selection
- Ensures 5 unique tasks

### Fallback Strategy

If any selection fails:
- Interest-based → Falls back to random
- Trending → Falls back to highest overall completion count
- Challenge → Skipped if none available
- Final check ensures exactly 5 tasks

## Database Integration

### Task Assignment Storage (Requirement 3.6)

When new tasks are generated:
```typescript
{
  user_id: string,
  task_id: string,
  assigned_date: string,
  completed: false,
  coins_earned: 0
}
```

Stored in `daily_user_tasks` table with:
- Unique constraint on (user_id, task_id, assigned_date)
- Prevents duplicate assignments
- Tracks completion status

### Query Optimization

**Interest-Based:**
- Uses GIN index on `tasks.tags`
- Fast array overlap operations

**Trending:**
- Uses index on `completions.created_at`
- Efficient 7-day window queries

**Challenge:**
- Uses index on `tasks.type`
- Fast category filtering

## Usage Examples

### In API Route (Already Implemented)
```typescript
import { selectDailyTasks } from '@/lib/tasks';

const result = await selectDailyTasks(userId);
// Returns 5 tasks with breakdown
```

### In Server Component
```typescript
import { getDailyTasks } from '@/lib/tasks';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const tasks = await getDailyTasks(user.id);
  
  return <TaskList tasks={tasks} />;
}
```

### Check for Existing Tasks
```typescript
import { hasTasksForToday } from '@/lib/tasks';

const hasToday = await hasTasksForToday(userId);
if (!hasToday) {
  // Generate new tasks
}
```

### Custom Date
```typescript
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dateStr = yesterday.toISOString().split('T')[0];

const tasks = await getDailyTasks(userId, dateStr);
```

## Algorithm Characteristics

### Personalization
- ✅ Uses user interests for 40% of tasks (2/5)
- ✅ Adapts to user preferences over time
- ✅ Balances familiarity with discovery

### Variety
- ✅ Random selection prevents repetition
- ✅ Shuffle algorithm ensures fairness
- ✅ Different task types each day

### Social Proof
- ✅ Trending tasks show community engagement
- ✅ 7-day window keeps data fresh
- ✅ Encourages trying popular tasks

### Challenge
- ✅ Always includes one challenge task
- ✅ Promotes growth and discipline
- ✅ Varies difficulty levels

### Reliability
- ✅ Fallback strategies for all selections
- ✅ Ensures exactly 5 tasks always
- ✅ Handles edge cases gracefully

## Edge Cases Handled

### No User Interests
- Falls back to random selection
- Still provides 5 tasks
- Encourages setting interests

### No Trending Tasks
- Uses highest overall completion count
- Ensures trending slot is filled
- Graceful degradation

### No Challenge Tasks
- Fills with random tasks
- Maintains 5-task requirement
- Logs for admin attention

### Insufficient Tasks
- Fills remaining slots with random
- Prevents errors
- Ensures user experience

### Already Assigned
- Returns existing tasks
- Prevents duplicate generation
- Maintains consistency

## Performance Considerations

### Query Efficiency
- Limits results to needed count × multiplier
- Uses indexes for fast lookups
- Minimizes database round trips

### Randomization
- In-memory shuffling (fast)
- Fisher-Yates O(n) complexity
- No database overhead

### Caching Potential
- Tasks can be cached per user/date
- Reduces database load
- Improves response time

## Testing Scenarios

### Happy Path
```typescript
// User with interests
const user = { interests: ['fitness', 'learning'] };
const result = await selectDailyTasks(user.id);
// Should return 5 tasks, 2 matching interests
```

### Edge Cases
```typescript
// User with no interests
const newUser = { interests: [] };
const result = await selectDailyTasks(newUser.id);
// Should return 5 random tasks

// Second call same day
const result2 = await selectDailyTasks(user.id);
// Should return same tasks (from database)
```

### Error Handling
```typescript
// Invalid user ID
const result = await selectDailyTasks('invalid');
// Should handle gracefully

// Database error
// Should return error response, not crash
```

## Integration Points

### With User Profile (Task 5)
- ✅ Reads user interests
- ✅ Personalizes selection
- ✅ Adapts to preferences

### With Database Schema (Task 2)
- ✅ Uses tasks table
- ✅ Stores in daily_user_tasks
- ✅ Queries completions for trending

### With Validation (Task 6)
- ✅ Returns validated Task types
- ✅ Type-safe operations
- ✅ Consistent data structure

### With Future Features
- 🔜 Task completion (Task 8)
- 🔜 Dashboard display (Task 12)
- 🔜 Analytics (Task 17)

## Progress

- ✅ Task 1: Next.js project initialized
- ✅ Task 2: Database schema and security
- ✅ Task 3: Seed data with 200+ tasks
- ✅ Task 4: Supabase client utilities
- ✅ Task 5: Build authentication system
- ✅ Task 6: Task data model and validation
- ✅ Task 7: Build task selection engine
- 🔜 Task 8: Implement task completion and rewards

## Next Steps

With task selection complete, we can now:
1. Implement task completion system (Task 8)
2. Add coin rewards and XP
3. Update streak logic
4. Build dashboard UI to display tasks
5. Add completion animations

## Notes

- Algorithm is deterministic for same day (returns cached)
- New tasks generated at midnight (new date)
- Trending window is rolling 7 days
- Challenge tasks promote growth
- Interest matching uses PostgreSQL array operations

---

**Status**: ✅ COMPLETE
**Quality**: ✅ PRODUCTION-READY
**Algorithm**: ✅ INTELLIGENT & PERSONALIZED
**Performance**: ✅ OPTIMIZED
**Ready for**: Task 8 - Task Completion and Rewards System
