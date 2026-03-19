'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MagicLinkError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorType, setErrorType] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const error = searchParams.get('error');
    setErrorType(error || 'unknown');
    setIsLoading(false);
  }, [searchParams]);

  const getErrorMessage = (type: string) => {
    switch (type) {
      case 'invalid_token':
        return {
          title: 'Invalid Magic Link',
          message: 'The magic link you clicked is invalid or has expired.',
          action: 'Please request a new magic link to sign in.'
        };
      case 'user_not_found':
        return {
          title: 'Account Not Found',
          message: 'No account was found for this magic link.',
          action: 'Please check your email or sign up for a new account.'
        };
      case 'internal_error':
        return {
          title: 'Something Went Wrong',
          message: 'We encountered an error while verifying your magic link.',
          action: 'Please try again or contact support if the problem persists.'
        };
      default:
        return {
          title: 'Authentication Error',
          message: 'An error occurred during authentication.',
          action: 'Please try signing in again.'
        };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const errorInfo = getErrorMessage(errorType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-red-100 mb-6">
          <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {errorInfo.title}
        </h1>
        
        <p className="text-lg text-gray-600 mb-4">
          {errorInfo.message}
        </p>
        
        <p className="text-sm text-gray-500 mb-8">
          {errorInfo.action}
        </p>
        
        <div className="space-y-3">
          <button
            onClick={() => router.push('/auth/magic-link')}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Request New Magic Link
          </button>
          
          <button
            onClick={() => router.push('/auth/signin')}
            className="w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
}