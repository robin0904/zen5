/**
 * Task Validation Utilities
 * Validates task data against requirements
 * Requirements: 2.2, 2.3, 2.4, 2.5
 */

import type { 
  Task, 
  TaskFormData, 
  TaskCategory, 
  TaskDifficulty,
  ValidationError,
  ValidationResult 
} from '@/lib/types/models';

// ============================================================================
// CONSTANTS
// ============================================================================

export const TASK_CONSTRAINTS = {
  DESCRIPTION_MAX_LENGTH: 120,
  DURATION_MIN: 30,
  DURATION_MAX: 120,
  DIFFICULTY_MIN: 1,
  DIFFICULTY_MAX: 5,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 100,
} as const;

export const VALID_CATEGORIES: readonly TaskCategory[] = [
  'learn',
  'move',
  'reflect',
  'fun',
  'skill',
  'challenge',
] as const;

export const VALID_DIFFICULTIES: readonly TaskDifficulty[] = [1, 2, 3, 4, 5] as const;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate task description length
 * Requirement 2.2: Description must be ≤120 characters
 */
export function validateDescription(description: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!description || description.trim().length === 0) {
    errors.push({
      field: 'description',
      message: 'Description is required',
    });
  } else if (description.length > TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH) {
    errors.push({
      field: 'description',
      message: `Description must be ${TASK_CONSTRAINTS.DESCRIPTION_MAX_LENGTH} characters or less (currently ${description.length})`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate task duration
 * Requirement 2.3: Duration must be between 30-120 seconds
 */
export function validateDuration(duration_seconds: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof duration_seconds !== 'number' || isNaN(duration_seconds)) {
    errors.push({
      field: 'duration_seconds',
      message: 'Duration must be a valid number',
    });
  } else if (duration_seconds < TASK_CONSTRAINTS.DURATION_MIN) {
    errors.push({
      field: 'duration_seconds',
      message: `Duration must be at least ${TASK_CONSTRAINTS.DURATION_MIN} seconds`,
    });
  } else if (duration_seconds > TASK_CONSTRAINTS.DURATION_MAX) {
    errors.push({
      field: 'duration_seconds',
      message: `Duration must be at most ${TASK_CONSTRAINTS.DURATION_MAX} seconds`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate task difficulty
 * Requirement 2.4: Difficulty must be between 1-5
 */
export function validateDifficulty(difficulty: number): ValidationResult {
  const errors: ValidationError[] = [];

  if (typeof difficulty !== 'number' || isNaN(difficulty)) {
    errors.push({
      field: 'difficulty',
      message: 'Difficulty must be a valid number',
    });
  } else if (!VALID_DIFFICULTIES.includes(difficulty as TaskDifficulty)) {
    errors.push({
      field: 'difficulty',
      message: `Difficulty must be between ${TASK_CONSTRAINTS.DIFFICULTY_MIN} and ${TASK_CONSTRAINTS.DIFFICULTY_MAX}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate task type/category
 * Requirement 2.5: Type must be valid enum value
 */
export function validateType(type: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!type || type.trim().length === 0) {
    errors.push({
      field: 'type',
      message: 'Type is required',
    });
  } else if (!VALID_CATEGORIES.includes(type as TaskCategory)) {
    errors.push({
      field: 'type',
      message: `Type must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate task category
 * Same as type validation
 */
export function validateCategory(category: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!category || category.trim().length === 0) {
    errors.push({
      field: 'category',
      message: 'Category is required',
    });
  } else if (!VALID_CATEGORIES.includes(category as TaskCategory)) {
    errors.push({
      field: 'category',
      message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate task title
 */
export function validateTitle(title: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!title || title.trim().length === 0) {
    errors.push({
      field: 'title',
      message: 'Title is required',
    });
  } else if (title.length < TASK_CONSTRAINTS.TITLE_MIN_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be at least ${TASK_CONSTRAINTS.TITLE_MIN_LENGTH} characters`,
    });
  } else if (title.length > TASK_CONSTRAINTS.TITLE_MAX_LENGTH) {
    errors.push({
      field: 'title',
      message: `Title must be at most ${TASK_CONSTRAINTS.TITLE_MAX_LENGTH} characters`,
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate task tags
 */
export function validateTags(tags: string[]): ValidationResult {
  const errors: ValidationError[] = [];

  if (!Array.isArray(tags)) {
    errors.push({
      field: 'tags',
      message: 'Tags must be an array',
    });
  } else if (tags.length === 0) {
    errors.push({
      field: 'tags',
      message: 'At least one tag is required',
    });
  } else if (tags.some(tag => !tag || tag.trim().length === 0)) {
    errors.push({
      field: 'tags',
      message: 'All tags must be non-empty strings',
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// COMPLETE TASK VALIDATION
// ============================================================================

/**
 * Validate complete task object
 * Runs all validation checks
 */
export function validateTask(task: Partial<Task> | TaskFormData): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Validate title
  if ('title' in task && task.title !== undefined) {
    const titleResult = validateTitle(task.title);
    allErrors.push(...titleResult.errors);
  }

  // Validate description (Requirement 2.2)
  if ('description' in task && task.description !== undefined) {
    const descResult = validateDescription(task.description);
    allErrors.push(...descResult.errors);
  }

  // Validate duration (Requirement 2.3)
  if ('duration_seconds' in task && task.duration_seconds !== undefined) {
    const durationResult = validateDuration(task.duration_seconds);
    allErrors.push(...durationResult.errors);
  }

  // Validate difficulty (Requirement 2.4)
  if ('difficulty' in task && task.difficulty !== undefined) {
    const difficultyResult = validateDifficulty(task.difficulty);
    allErrors.push(...difficultyResult.errors);
  }

  // Validate type (Requirement 2.5)
  if ('type' in task && task.type !== undefined) {
    const typeResult = validateType(task.type);
    allErrors.push(...typeResult.errors);
  }

  // Validate category
  if ('category' in task && task.category !== undefined) {
    const categoryResult = validateCategory(task.category);
    allErrors.push(...categoryResult.errors);
  }

  // Validate tags
  if ('tags' in task && task.tags !== undefined) {
    const tagsResult = validateTags(task.tags);
    allErrors.push(...tagsResult.errors);
  }

  // Ensure type matches category
  if ('type' in task && 'category' in task && task.type && task.category) {
    if (task.type !== task.category) {
      allErrors.push({
        field: 'type',
        message: 'Type must match category',
      });
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Validate task for creation
 * Ensures all required fields are present
 */
export function validateTaskForCreation(task: TaskFormData): ValidationResult {
  const allErrors: ValidationError[] = [];

  // Check required fields
  const requiredFields: (keyof TaskFormData)[] = [
    'title',
    'description',
    'category',
    'duration_seconds',
    'tags',
    'difficulty',
    'type',
  ];

  for (const field of requiredFields) {
    if (!(field in task) || task[field] === undefined || task[field] === null) {
      allErrors.push({
        field,
        message: `${field} is required`,
      });
    }
  }

  // Run full validation
  const validationResult = validateTask(task);
  allErrors.push(...validationResult.errors);

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if a value is a valid task category
 */
export function isValidCategory(value: unknown): value is TaskCategory {
  return typeof value === 'string' && VALID_CATEGORIES.includes(value as TaskCategory);
}

/**
 * Check if a value is a valid task difficulty
 */
export function isValidDifficulty(value: unknown): value is TaskDifficulty {
  return typeof value === 'number' && VALID_DIFFICULTIES.includes(value as TaskDifficulty);
}

/**
 * Sanitize task data
 * Trims strings and ensures proper types
 */
export function sanitizeTaskData(task: Partial<TaskFormData>): Partial<TaskFormData> {
  const sanitized: Partial<TaskFormData> = {};

  if (task.title) {
    sanitized.title = task.title.trim();
  }

  if (task.description) {
    sanitized.description = task.description.trim();
  }

  if (task.category) {
    sanitized.category = task.category;
  }

  if (task.duration_seconds !== undefined) {
    sanitized.duration_seconds = Math.round(task.duration_seconds);
  }

  if (task.tags) {
    sanitized.tags = task.tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  if (task.difficulty !== undefined) {
    sanitized.difficulty = Math.round(task.difficulty) as TaskDifficulty;
  }

  if (task.type) {
    sanitized.type = task.type;
  }

  if (task.affiliate_link) {
    sanitized.affiliate_link = task.affiliate_link.trim();
  }

  return sanitized;
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }

  if (errors.length === 1) {
    return errors[0].message;
  }

  return errors.map(err => `• ${err.message}`).join('\n');
}
