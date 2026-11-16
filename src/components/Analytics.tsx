'use client';

import { useEffect } from 'react';

type AnalyticsWindow = Window & {
  dataLayer?: IArguments[];
  gtag?: (...args: unknown[]) => void;
};

const CONSENT_KEY = 'rankmind_cookie_consent';
const TAG_ID = 'rankmind-ga4';
const PRODUCTION_HOSTS = new Set(['rank-mind.com', 'www.rank-mind.com']);
const measurementId = process.env.NEXT_PUBLIC_GA_ID ?? '';

export default function Analytics() {
  useEffect(() => {
    if (!/^G-[A-Z0-9]+$/.test(measurementId) || !PRODUCTION_HOSTS.has(window.location.hostname)) {
      return;
    }

    const loadTag = () => {
      if (document.getElementById(TAG_ID)) return;
      try {
        if (window.localStorage.getItem(CONSENT_KEY) !== 'accepted') return;
      } catch {
        return;
      }

      const site = window as AnalyticsWindow;
      const dataLayer = (site.dataLayer ??= []);
      const gtag = (site.gtag ??= function () {
        dataLayer.push(arguments);
      });
      gtag('consent', 'default', {
        analytics_storage: 'granted',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
      });
      gtag('js', new Date());
      gtag('config', measurementId, {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });

      const script = document.createElement('script');
      script.id = TAG_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);
    };

    window.addEventListener('cookieConsentAccepted', loadTag);
    loadTag();
    return () => window.removeEventListener('cookieConsentAccepted', loadTag);
  }, []);

  return null;
}
