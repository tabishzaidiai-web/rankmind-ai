import { Suspense } from 'react';
import type { Metadata } from 'next';
import SignupForm from './SignupForm';

export const metadata: Metadata = {
  title: 'Sign Up — RankMind AI',
  description: 'Create your RankMind AI account and start your free SEO audit.',
  alternates: {
    canonical: 'https://www.rank-mind.com/signup',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/signup',
    title: 'Sign Up — RankMind AI',
    description: 'Create your RankMind AI account and start your free SEO audit.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 animate-pulse">
            <div className="h-8 bg-white/10 rounded-lg mb-4 w-3/4" />
            <div className="h-4 bg-white/5 rounded mb-6 w-full" />
            <div className="h-12 bg-white/10 rounded-xl mb-4" />
            <div className="h-12 bg-white/5 rounded-xl mb-4" />
            <div className="h-12 bg-white/5 rounded-xl mb-4" />
            <div className="h-12 bg-violet-600/30 rounded-xl" />
          </div>
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  );
}
