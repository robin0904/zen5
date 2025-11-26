# Supabase Client Utilities

This directory contains all Supabase client utilities for the Daily 5 application.

## Files

### `client.ts`
Client-side Supabase client for use in Client Components and browser code.

```typescript
import { createClient } from '@/lib/supabase/client';

// In a Client Component
'use client';

export function MyComponent() {
  const supabase = createClient();
  // Use supabase client...
}
```

### `server.ts`
Server-side Supabase clients for use in Server Components, Route Handlers, and Server Actions.

```typescript
import { createClient } from '@/lib/supabase/server';

// In a Server Component
export async function MyServerComponent() {
  const supabase = createClient();
  const { data } = await supabase.from('tasks').select('*');
  // ...
}
```

**Admin Client:**
```typescript
import { createAdminClient } from '@/lib/supabase/server';

// For admin operations that bypass RLS
export async function adminOperation() {
  const supabase = createAdminClient();
  // This client has service_role privileges
}
```

### `auth-helpers.ts`
Helper functions for authentication and authorization.

**Server-side helpers:**
```typescript
import { 
  getCurrentUser, 
  isAuthenticated, 
  isAdmin,
  getUserProfile 
} from '@/lib/supabase/auth-helpers';

// Get current user
const user = await getCurrentUser();

// Check if authenticated
const authed = await isAuthenticated();

// Check if admin
const admin = await isAdmin();

// Get full profile
const profile = await getUserProfile();
```

**Client-side helpers:**
```typescript
import { onAuthStateChange } from '@/lib/supabase/auth-helpers';

// Listen for auth changes
useEffect(() => {
  const subscription = onAuthStateChange((user) => {
    console.log('User changed:', user);
  });
  
  return () => subscription.unsubscribe();
}, []);
```

### `types.ts`
TypeScript types for the database schema.

```typescript
import type { Database } from '@/lib/supabase/types';

type User = Database['public']['Tables']['users']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
```

### `middleware.ts` (root level)
Next.js middleware for automatic session refresh.

## Usage Examples

### Server Component
```typescript
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  const supabase = createClient();
  const { data: tasks } = await supabase
    .from('daily_user_tasks')
    .select('*, tasks(*)')
    .eq('user_id', user.id)
    .eq('assigned_date', new Date().toISOString().split('T')[0]);
  
  return <div>{/* Render tasks */}</div>;
}
```

### Client Component
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export function TaskList() {
  const [tasks, setTasks] = useState([]);
  const supabase = createClient();
  
  useEffect(() => {
    async function loadTasks() {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .limit(10);
      setTasks(data || []);
    }
    loadTasks();
  }, []);
  
  return <div>{/* Render tasks */}</div>;
}
```

### API Route Handler
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*');
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ data });
}
```

### Server Action
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function completeTask(taskId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('daily_user_tasks')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', taskId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  revalidatePath('/dashboard');
}
```

### Protected Route
```typescript
import { isAuthenticated } from '@/lib/supabase/auth-helpers';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const authed = await isAuthenticated();
  
  if (!authed) {
    redirect('/login');
  }
  
  return <div>Protected content</div>;
}
```

### Admin-Only Route
```typescript
import { isAdmin } from '@/lib/supabase/auth-helpers';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const admin = await isAdmin();
  
  if (!admin) {
    redirect('/');
  }
  
  return <div>Admin content</div>;
}
```

## Best Practices

### 1. Use the Right Client
- **Server Components**: Use `createClient()` from `server.ts`
- **Client Components**: Use `createClient()` from `client.ts`
- **Route Handlers**: Use `createClient()` from `server.ts`
- **Server Actions**: Use `createClient()` from `server.ts`
- **Admin Operations**: Use `createAdminClient()` from `server.ts`

### 2. Never Expose Service Role Key
```typescript
// ❌ NEVER do this
'use client';
import { createAdminClient } from '@/lib/supabase/server';

// ✅ Always use admin client server-side only
// In a Server Action or API Route
import { createAdminClient } from '@/lib/supabase/server';
```

### 3. Handle Errors Properly
```typescript
const { data, error } = await supabase
  .from('tasks')
  .select('*');

if (error) {
  console.error('Database error:', error.message);
  // Handle error appropriately
}
```

### 4. Use Type Safety
```typescript
import type { Database } from '@/lib/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

const task: Task = {
  // TypeScript will enforce correct structure
};
```

### 5. Leverage RLS Policies
```typescript
// RLS automatically filters data based on authenticated user
const { data } = await supabase
  .from('daily_user_tasks')
  .select('*');
// Only returns current user's tasks due to RLS
```

## Environment Variables

Required environment variables (in `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Middleware

The middleware automatically refreshes user sessions on every request. It's configured to run on all routes except static files.

To exclude additional routes, update the `matcher` in `middleware.ts`:

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/webhook).*)',
  ],
};
```

## Testing

When testing, you can mock the Supabase client:

```typescript
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        data: mockData,
        error: null,
      })),
    })),
  })),
}));
```

## Troubleshooting

### "User not found" errors
- Ensure middleware is running (check `middleware.ts`)
- Verify environment variables are set
- Check that cookies are enabled

### RLS policy errors
- Verify user is authenticated
- Check RLS policies in Supabase dashboard
- Ensure user has correct permissions

### Type errors
- Regenerate types if schema changes
- Ensure `types.ts` matches your database schema

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
