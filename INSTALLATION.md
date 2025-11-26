# Installation Guide

## Prerequisites

This project requires Node.js and npm to be installed on your system.

### Installing Node.js

If you don't have Node.js installed, follow these steps:

#### Windows
1. Download the Node.js installer from [nodejs.org](https://nodejs.org/)
2. Run the installer (LTS version recommended)
3. Follow the installation wizard
4. Verify installation by opening PowerShell and running:
   ```powershell
   node --version
   npm --version
   ```

#### macOS
Using Homebrew:
```bash
brew install node
```

Or download from [nodejs.org](https://nodejs.org/)

#### Linux
Using apt (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install nodejs npm
```

Using yum (CentOS/RHEL):
```bash
sudo yum install nodejs npm
```

## Project Setup

Once Node.js is installed, follow these steps:

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Supabase client libraries
- Vitest and fast-check for testing

### 2. Configure Environment Variables

Copy the example environment file:

```bash
# Windows PowerShell
copy .env.example .env.local

# macOS/Linux
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

### 4. Run Tests

```bash
npm test
```

## Troubleshooting

### "npx is not recognized" or "node is not recognized"
- Node.js is not installed or not in your PATH
- Install Node.js following the instructions above
- Restart your terminal/PowerShell after installation

### Port 3000 is already in use
- Another application is using port 3000
- Stop the other application or use a different port:
  ```bash
  npm run dev -- -p 3001
  ```

### Module not found errors
- Dependencies are not installed
- Run `npm install` again
- Delete `node_modules` folder and `package-lock.json`, then run `npm install`

## Next Steps

After successful installation:
1. Set up your Supabase project (see task 2 in tasks.md)
2. Run database migrations
3. Load seed data
4. Start building features!

For more information, see the main [README.md](README.md) file.
