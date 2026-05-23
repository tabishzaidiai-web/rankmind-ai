import { Suspense } from 'react';
import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Sign In — RankMind AI',
  description: 'Sign in to your RankMind AI account and access your AI SEO agents.',
  alternates: {
    canonical: 'https://www.rank-mind.com/login',
  },
  openGraph: {
    url: 'https://www.rank-mind.com/login',
    title: 'Sign In — RankMind AI',
    description: 'Sign in to your RankMind AI account and access your AI SEO agents.',
    images: [{ url: 'https://www.rank-mind.com/og-image.png', width: 1200, height: 630 }],
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
