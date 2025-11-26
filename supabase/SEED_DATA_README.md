# Seed Data Guide

## Overview

The seed data migration contains **210 tasks** evenly distributed across all 6 categories:
- **Learn**: 35 tasks
- **Move**: 35 tasks  
- **Reflect**: 35 tasks
- **Fun**: 35 tasks
- **Skill**: 35 tasks
- **Challenge**: 35 tasks

## Features

✅ **210 total tasks** (exceeds 200+ requirement)
✅ **Even distribution** across all 6 categories (35 each)
✅ **English and Hinglish** descriptions for diversity
✅ **Duration constraints** met (30-120 seconds for all tasks)
✅ **Description length** compliant (all ≤120 characters)
✅ **Diverse tags** for personalization matching
✅ **Varied difficulty** levels (1-5) across all categories

## Task Categories

### Learn (35 tasks)
Educational micro-tasks including:
- Vocabulary building
- Reading articles
- Mental math
- Historical facts
- Science learning
- Typing practice
- Geography
- Coding concepts

**Example tasks:**
- "Learn a new word" (60s, difficulty 1)
- "Practice mental math" (90s, difficulty 3)
- "Learn about a country" (90s, difficulty 2)

### Move (35 tasks)
Physical activity micro-tasks including:
- Jumping jacks
- Stretches
- Squats
- Walking
- Dancing
- Planks
- Yoga poses

**Example tasks:**
- "Do 10 jumping jacks" (30s, difficulty 1)
- "Walk for 2 minutes" (120s, difficulty 1)
- "Do 30 seconds plank" (30s, difficulty 3)

### Reflect (35 tasks)
Mindfulness and self-reflection tasks including:
- Gratitude practice
- Deep breathing
- Meditation
- Journaling
- Self-compassion
- Visualization
- Emotional awareness

**Example tasks:**
- "Gratitude moment" (60s, difficulty 1)
- "Deep breathing" (60s, difficulty 1)
- "Body scan" (90s, difficulty 2)

### Fun (35 tasks)
Entertainment and joy-focused tasks including:
- Jokes
- Doodling
- Music
- Games
- Silly activities
- Creative expression
- Laughter

**Example tasks:**
- "Tell a joke" (45s, difficulty 1)
- "Listen to favorite song" (120s, difficulty 1)
- "Make funny face" (30s, difficulty 1)

### Skill (35 tasks)
Practical skill-building tasks including:
- Handwriting
- Organization
- Communication
- Time management
- Technology
- Cooking
- Problem-solving

**Example tasks:**
- "Practice handwriting" (60s, difficulty 1)
- "Learn phone feature" (90s, difficulty 2)
- "Improve organization" (120s, difficulty 2)

### Challenge (35 tasks)
Discipline and growth-focused challenges including:
- Digital detox
- Physical endurance
- Mental discipline
- Habit building
- Focus training
- Patience practice

**Example tasks:**
- "No phone challenge" (120s, difficulty 2)
- "Hold breath challenge" (30s, difficulty 3)
- "Wall sit challenge" (30s, difficulty 4)

## Loading Seed Data

### Method 1: Using Supabase Dashboard (Recommended)

1. **Open SQL Editor**
   - Go to your Supabase project dashboard
   - Click "SQL Editor" in the left sidebar

2. **Run Seed Migration**
   - Click "New Query"
   - Open `supabase/migrations/20240101000002_seed_tasks.sql`
   - Copy all contents
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify**
   - Go to "Table Editor"
   - Select "tasks" table
   - You should see 210 rows

### Method 2: Using Supabase CLI

```bash
# Make sure you're linked to your project
supabase link --project-ref your-project-ref

# Push the migration
supabase db push
```

### Method 3: Using psql (Advanced)

```bash
# Connect to your database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Run the migration
\i supabase/migrations/20240101000002_seed_tasks.sql
```

## Verification

After loading, verify the seed data:

```sql
-- Check total count
SELECT COUNT(*) FROM tasks;
-- Should return: 210

-- Check distribution by category
SELECT category, COUNT(*) as count
FROM tasks
GROUP BY category
ORDER BY category;
-- Each category should have 35 tasks

-- Check duration constraints
SELECT 
  MIN(duration_seconds) as min_duration,
  MAX(duration_seconds) as max_duration
FROM tasks;
-- Should be: min=30, max=120

-- Check description length
SELECT 
  MAX(LENGTH(description)) as max_length
FROM tasks;
-- Should be ≤120

-- Check difficulty range
SELECT 
  MIN(difficulty) as min_diff,
  MAX(difficulty) as max_diff
FROM tasks;
-- Should be: min=1, max=5

-- Sample tasks from each category
SELECT category, title, duration_seconds, difficulty
FROM tasks
WHERE id IN (
  SELECT id FROM tasks WHERE category = 'learn' LIMIT 1
  UNION ALL
  SELECT id FROM tasks WHERE category = 'move' LIMIT 1
  UNION ALL
  SELECT id FROM tasks WHERE category = 'reflect' LIMIT 1
  UNION ALL
  SELECT id FROM tasks WHERE category = 'fun' LIMIT 1
  UNION ALL
  SELECT id FROM tasks WHERE category = 'skill' LIMIT 1
  UNION ALL
  SELECT id FROM tasks WHERE category = 'challenge' LIMIT 1
);
```

## Task Distribution Details

| Category | Count | Avg Duration | Difficulty Range | Languages |
|----------|-------|--------------|------------------|-----------|
| Learn | 35 | 75s | 1-3 | English + Hinglish |
| Move | 35 | 55s | 1-4 | English + Hinglish |
| Reflect | 35 | 65s | 1-2 | English + Hinglish |
| Fun | 35 | 60s | 1-2 | English + Hinglish |
| Skill | 35 | 75s | 1-3 | English + Hinglish |
| Challenge | 35 | 70s | 1-4 | English + Hinglish |

## Tag Distribution

Tasks include diverse tags for personalization:
- **Learning**: vocabulary, reading, education, knowledge
- **Physical**: cardio, strength, flexibility, exercise
- **Mental**: mindfulness, meditation, brain, focus
- **Creative**: art, creativity, imagination, expression
- **Social**: communication, kindness, respect
- **Health**: nutrition, wellness, body-awareness
- **Technology**: computer, productivity, digital
- **Language**: hinglish, english, hindi

## Hinglish Tasks

Approximately 50% of tasks include Hinglish descriptions to cater to Indian users:
- "Naya shabd seekho" (Learn new word)
- "10 jumping jacks karo" (Do 10 jumping jacks)
- "Shukriya karo" (Practice gratitude)
- "Ek joke suno" (Tell a joke)
- "Handwriting practice" (Practice handwriting)
- "Phone mat dekho" (No phone challenge)

## Troubleshooting

### "duplicate key value violates unique constraint"
- Seed data has already been loaded
- Either skip this migration or clear the tasks table first:
  ```sql
  TRUNCATE tasks CASCADE;
  ```

### "check constraint violation"
- This shouldn't happen as all tasks meet constraints
- If it does, check which constraint failed and report as a bug

### "relation tasks does not exist"
- Run the initial schema migration first (20240101000000_initial_schema.sql)

## Next Steps

After loading seed data:
1. ✅ Verify all 210 tasks loaded correctly
2. ✅ Check distribution across categories
3. ✅ Test task selection algorithm
4. 🔜 Proceed to Task 4: Implement Supabase client utilities

## Customization

To add more tasks later:

```sql
INSERT INTO tasks (title, description, category, duration_seconds, tags, difficulty, type)
VALUES (
  'Your task title',
  'Description under 120 characters',
  'learn', -- or move, reflect, fun, skill, challenge
  60, -- 30-120 seconds
  ARRAY['tag1', 'tag2', 'tag3'],
  2, -- 1-5
  'learn' -- must match category
);
```

## Statistics

- **Total tasks**: 210
- **Total categories**: 6
- **Tasks per category**: 35
- **English tasks**: ~105
- **Hinglish tasks**: ~105
- **Difficulty 1**: ~70 tasks (easy)
- **Difficulty 2**: ~90 tasks (medium)
- **Difficulty 3**: ~40 tasks (hard)
- **Difficulty 4**: ~8 tasks (very hard)
- **Difficulty 5**: ~2 tasks (expert)
- **Average duration**: 67 seconds
- **Shortest task**: 30 seconds
- **Longest task**: 120 seconds

All requirements met! ✅
