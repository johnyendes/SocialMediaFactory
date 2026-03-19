'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function MagicLinkSuccess() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailParam = urlParams.get('email');
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
      setIsLoading(false);
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
    } else {
      router.push('/auth/signin');
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-green-100 mb-6">
          <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Sign In Successful!
        </h1>
        
        <p className="text-lg text-gray-600 mb-6">
          Welcome back! You're now signed in as:
        </p>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <p className="font-medium text-gray-900">{email}</p>
        </div>
        
        <p className="text-sm text-gray-500 mb-8">
          Redirecting you to the dashboard in a few seconds...
        </p>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Go to Dashboard Now
        </button>
      </div>
    </div>
  );
}