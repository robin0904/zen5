/**
 * Signup Page
 * User registration page with email/password and Google OAuth
 * Requirements: 1.1, 1.2
 */

import Link from 'next/link';
import { SignupForm, GoogleAuthButton } from '@/components/auth';
import { getCurrentUser } from '@/lib/supabase/auth-helpers';
import { redirect } from 'next/navigation';

export default async function SignupPage() {
  // Redirect if already logged in
  const user = await getCurrentUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started
          </h1>
          <p className="text-gray-600">
            Create your account and start your Daily 5 journey
          </p>
        </div>

        <div className="space-y-4">
          <GoogleAuthButton />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or sign up with email
              </span>
            </div>
          </div>

          <SignupForm />
        </div>

        <div className="mt-6 text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link
            href="/login"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
