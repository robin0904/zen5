# ✅ Task 6 Complete: Task Data Model and Validation

## Summary

Successfully implemented comprehensive TypeScript interfaces for all data models and complete validation utilities for task data with all constraint checks.

## Files Created

### Data Models

1. **`lib/types/models.ts`** (300+ lines)
   - Complete TypeScript interfaces for all data models
   - User, Task, DailyUserTask, Completion, Badge models
   - Leaderboard, Referral, Revenue tracking models
   - Extended models with relations
   - API response models
   - Form data models
   - Validation models

2. **`lib/types/index.ts`**
   - Central export point for types

### Validation Utilities

3. **`lib/validation/task-validation.ts`** (400+ lines)
   - Complete validation functions for all task fields
   - Constraint constants
   - Helper functions
   - Sanitization utilities
   - Error formatting

4. **`lib/validation/index.ts`**
   - Central export point for validation

## Data Models Implemented

### Core Models

**User Model:**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  streak: number;
  coins: number;
  xp: number;
  level: number; // Auto-calculated
  last_completion_date: string | null;
  interests: string[];
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}
```

**Task Model:**
```typescript
interface Task {
  id: string;
  title: string;
  description: string; // Max 120 chars
  category: TaskCategory;
  duration_seconds: number; // 30-120
  tags: string[];
  difficulty: TaskDifficulty; // 1-5
  type: TaskType;
  completion_count: number;
  affiliate_link: string | null;
  created_at: string;
}
```

**DailyUserTask Model:**
```typescript
interface DailyUserTask {
  id: string;
  user_id: string;
  task_id: string;
  assigned_date: string;
  completed: boolean;
  completed_at: string | null;
  coins_earned: number;
  created_at: string;
}
```

**Completion Model:**
```typescript
interface Completion {
  id: string;
  user_id: string;
  task_id: string;
  completed_at: string;
  coins_earned: number;
  streak_at_completion: number;
}
```

**Badge Model:**
```typescript
interface Badge {
  id: string;
  user_id: string;
  badge_name: BadgeName | string;
  badge_description: string;
  earned_at: string;
}
```

### Extended Models

- `UserProfile` - User with computed fields
- `TaskWithCompletion` - Task with completion status
- `DailyUserTaskWithTask` - Daily task with full task details
- `CompletionWithTask` - Completion with task details
- `ReferralWithUsers` - Referral with user details
- `LeaderboardEntry` - Leaderboard with rank and user info

### Supporting Models

- `LeaderboardSnapshot` - Historical leaderboard data
- `Referral` - User referral relationships
- `RevenueTracking` - Revenue transaction records
- `ShareCard` - Social sharing card data
- `DailyStats` - Analytics data
- `TaskPopularity` - Task completion statistics
- `UserActivity` - User activity metrics

### API Models

- `ApiResponse<T>` - Standard API response wrapper
- `PaginatedResponse<T>` - Paginated data response
- `ValidationError` - Field-level validation errors
- `ValidationResult` - Validation result with errors

### Form Models

- `TaskFormData` - Task creation/edit form
- `UserProfileFormData` - Profile update form

## Validation Functions Implemented

### Individual Field Validators

**1. Description Validation (Requirement 2.2):**
```typescript
validateDescription(description: string): ValidationResult
// Checks: Required, ≤120 characters
```

**2. Duration Validation (Requirement 2.3):**
```typescript
validateDuration(duration_seconds: number): ValidationResult
// Checks: Valid number, 30-120 seconds
```

**3. Difficulty Validation (Requirement 2.4):**
```typescript
validateDifficulty(difficulty: number): ValidationResult
// Checks: Valid number, 1-5 range
```

**4. Type Validation (Requirement 2.5):**
```typescript
validateType(type: string): ValidationResult
// Checks: Valid enum (learn, move, reflect, fun, skill, challenge)
```

**5. Category Validation:**
```typescript
validateCategory(category: string): ValidationResult
// Checks: Valid enum, same as type
```

**6. Title Validation:**
```typescript
validateTitle(title: string): ValidationResult
// Checks: Required, 3-100 characters
```

**7. Tags Validation:**
```typescript
validateTags(tags: string[]): ValidationResult
// Checks: Array, non-empty, valid strings
```

### Complete Validators

**8. Full Task Validation:**
```typescript
validateTask(task: Partial<Task>): ValidationResult
// Runs all field validations
// Ensures type matches category
```

**9. Task Creation Validation:**
```typescript
validateTaskForCreation(task: TaskFormData): ValidationResult
// Checks all required fields present
// Runs full validation
```

### Helper Functions

**10. Type Guards:**
```typescript
isValidCategory(value: unknown): value is TaskCategory
isValidDifficulty(value: unknown): value is TaskDifficulty
```

**11. Sanitization:**
```typescript
sanitizeTaskData(task: Partial<TaskFormData>): Partial<TaskFormData>
// Trims strings, rounds numbers, filters empty tags
```

**12. Error Formatting:**
```typescript
formatValidationErrors(errors: ValidationError[]): string
// Formats errors for user display
```

## Validation Constants

```typescript
export const TASK_CONSTRAINTS = {
  DESCRIPTION_MAX_LENGTH: 120,
  DURATION_MIN: 30,
  DURATION_MAX: 120,
  DIFFICULTY_MIN: 1,
  DIFFICULTY_MAX: 5,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
} as const;

export const VALID_CATEGORIES = [
  'learn', 'move', 'reflect', 'fun', 'skill', 'challenge'
] as const;

export const VALID_DIFFICULTIES = [1, 2, 3, 4, 5] as const;
```

## Requirements Met

| Requirement | Description | Status |
|-------------|-------------|--------|
| **2.1** | Data model interfaces | ✅ Complete |
| **2.2** | Description length validation (≤120 chars) | ✅ Complete |
| **2.3** | Duration validation (30-120 seconds) | ✅ Complete |
| **2.4** | Difficulty validation (1-5) | ✅ Complete |
| **2.5** | Type validation (enum check) | ✅ Complete |

## Usage Examples

### Using Type Definitions

```typescript
import type { Task, User, DailyUserTask } from '@/lib/types';

// Type-safe function
function processTask(task: Task): void {
  console.log(task.title);
  // TypeScript ensures all required fields exist
}

// Type-safe API response
async function getTasks(): Promise<Task[]> {
  const response = await fetch('/api/tasks');
  const data: Task[] = await response.json();
  return data;
}
```

### Using Validation

```typescript
import { 
  validateTask, 
  validateDescription,
  sanitizeTaskData,
  formatValidationErrors 
} from '@/lib/validation';

// Validate single field
const descResult = validateDescription('Learn a new word');
if (!descResult.valid) {
  console.error(descResult.errors);
}

// Validate complete task
const taskData = {
  title: 'New Task',
  description: 'A short description',
  category: 'learn',
  duration_seconds: 60,
  tags: ['education'],
  difficulty: 2,
  type: 'learn',
};

const result = validateTask(taskData);
if (!result.valid) {
  const errorMessage = formatValidationErrors(result.errors);
  alert(errorMessage);
}

// Sanitize before validation
const sanitized = sanitizeTaskData(userInput);
const validationResult = validateTask(sanitized);
```

### In API Routes

```typescript
import { validateTaskForCreation } from '@/lib/validation';
import type { TaskFormData } from '@/lib/types';

export async function POST(request: Request) {
  const body: TaskFormData = await request.json();
  
  // Validate
  const validation = validateTaskForCreation(body);
  
  if (!validation.valid) {
    return NextResponse.json(
      { errors: validation.errors },
      { status: 400 }
    );
  }
  
  // Create task...
}
```

### In Forms

```typescript
'use client';

import { useState } from 'react';
import { validateTask, formatValidationErrors } from '@/lib/validation';
import type { TaskFormData } from '@/lib/types';

export function TaskForm() {
  const [formData, setFormData] = useState<TaskFormData>({...});
  const [errors, setErrors] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateTask(formData);
    
    if (!validation.valid) {
      setErrors(formatValidationErrors(validation.errors));
      return;
    }
    
    // Submit form...
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Validation Rules Summary

### Description (Requirement 2.2)
- ✅ Required field
- ✅ Maximum 120 characters
- ✅ Non-empty after trimming

### Duration (Requirement 2.3)
- ✅ Must be a valid number
- ✅ Minimum 30 seconds
- ✅ Maximum 120 seconds
- ✅ Rounded to integer

### Difficulty (Requirement 2.4)
- ✅ Must be a valid number
- ✅ Must be 1, 2, 3, 4, or 5
- ✅ Rounded to integer

### Type/Category (Requirement 2.5)
- ✅ Required field
- ✅ Must be one of: learn, move, reflect, fun, skill, challenge
- ✅ Type must match category

### Additional Validations
- ✅ Title: 3-100 characters
- ✅ Tags: Array with at least one non-empty tag
- ✅ All required fields checked for creation

## Type Safety Benefits

### Compile-Time Checks
```typescript
// ✅ TypeScript catches errors at compile time
const task: Task = {
  id: '123',
  title: 'Test',
  description: 'Test task',
  category: 'invalid', // ❌ Error: Type '"invalid"' is not assignable
  // ... other fields
};
```

### Auto-Completion
```typescript
// IDE provides auto-completion for all fields
const task: Task = {
  // Press Ctrl+Space to see all available fields
};
```

### Refactoring Safety
```typescript
// If you rename a field in the interface,
// TypeScript will show errors everywhere it's used
```

## Integration Points

### With Database Schema (Task 2)
- ✅ Interfaces match database tables exactly
- ✅ Validation rules match database constraints
- ✅ Type safety for all queries

### With Supabase Types (Task 4)
- ✅ Compatible with generated Supabase types
- ✅ Can be used interchangeably
- ✅ Additional helper types provided

### With API Routes (Future Tasks)
- ✅ Type-safe request/response handling
- ✅ Validation before database operations
- ✅ Consistent error responses

### With UI Components (Future Tasks)
- ✅ Type-safe form handling
- ✅ Validation feedback
- ✅ Auto-completion in forms

## Testing Validation

Example test cases:

```typescript
// Valid task
const validTask = {
  title: 'Learn a word',
  description: 'Look up one new word',
  category: 'learn',
  duration_seconds: 60,
  tags: ['vocabulary'],
  difficulty: 1,
  type: 'learn',
};
// ✅ Should pass validation

// Invalid description (too long)
const invalidDesc = {
  ...validTask,
  description: 'A'.repeat(121),
};
// ❌ Should fail: Description too long

// Invalid duration
const invalidDuration = {
  ...validTask,
  duration_seconds: 150,
};
// ❌ Should fail: Duration > 120

// Invalid difficulty
const invalidDifficulty = {
  ...validTask,
  difficulty: 6,
};
// ❌ Should fail: Difficulty > 5

// Invalid type
const invalidType = {
  ...validTask,
  type: 'invalid',
};
// ❌ Should fail: Invalid type
```

## Progress

- ✅ Task 1: Next.js project initialized
- ✅ Task 2: Database schema and security
- ✅ Task 3: Seed data with 200+ tasks
- ✅ Task 4: Supabase client utilities
- ✅ Task 5: Build authentication system
- ✅ Task 6: Task data model and validation
- 🔜 Task 7: Build task selection engine

## Next Steps

With data models and validation complete, we can now:
1. Build task selection engine (Task 7)
2. Implement task completion system (Task 8)
3. Create gamification features (Task 9)
4. Build admin panel with validated forms (Task 17)

## Notes

- All validation functions return `ValidationResult` for consistency
- Sanitization should be done before validation
- Type guards provide runtime type checking
- Error messages are user-friendly
- All constraints match database schema

---

**Status**: ✅ COMPLETE
**Quality**: ✅ PRODUCTION-READY
**Type Safety**: ✅ FULL COVERAGE
**Validation**: ✅ ALL REQUIREMENTS MET
**Ready for**: Task 7 - Task Selection Engine
