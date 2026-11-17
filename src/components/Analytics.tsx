'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Google Analytics 4 for www.rank-mind.com (ID from NEXT_PUBLIC_GA_ID).
 *
 * - Loads ONLY after the visitor accepts the cookie banner
 *   (localStorage "rankmind_cookie_consent" === "accepted"), and only on the
 *   production hosts — never on previews or localhost.
 * - Sends its own page_view on every route change (the App Router changes
 *   pages without reloading). In GA4 turn OFF Enhanced measurement →
 *   "Page changes based on browser history events" to avoid double counting.
 * - Page addresses are sent without query strings or hashes (login/signup/
 *   audit URLs carry ?message=, ?redirect=, ?url=); only utm_* is kept.
 * - Declining after accepting switches analytics storage off for the visit.
 */

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

const CONSENT_KEY = 'rankmind_cookie_consent';
const TAG_ID = 'rankmind-ga4';
const PRODUCTION_HOSTS = new Set(['rank-mind.com', 'www.rank-mind.com']);
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const measurementId = process.env.NEXT_PUBLIC_GA_ID ?? '';

function enabledHere(): boolean {
  return /^G-[A-Z0-9]+$/.test(measurementId) && PRODUCTION_HOSTS.has(window.location.hostname);
}

function consentAccepted(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_KEY) === 'accepted';
  } catch {
    return false;
  }
}

function safePageLocation(): string {
  const { origin, pathname, search } = window.location;
  const all = new URLSearchParams(search);
  const kept = new URLSearchParams();
  for (const k of UTM_KEYS) {
    const v = all.get(k);
    if (v) kept.set(k, v);
  }
  const qs = kept.toString();
  return origin + pathname + (qs ? `?${qs}` : '');
}

let lastSentPath: string | null = null;

function sendPageView(): void {
  const site = window as AnalyticsWindow;
  if (!site.gtag || !document.getElementById(TAG_ID)) return;
  // Exactly one page_view per page: skip if this path was just sent.
  if (window.location.pathname === lastSentPath) return;
  lastSentPath = window.location.pathname;
  const page_location = safePageLocation();
  site.gtag('event', 'page_view', { page_location, page_title: document.title });
}

function loadTag(): void {
  if (!enabledHere() || !consentAccepted() || document.getElementById(TAG_ID)) return;
  const site = window as AnalyticsWindow;
  const dataLayer = (site.dataLayer ??= []);
  const gtag = (site.gtag ??= function () {
    // eslint-disable-next-line prefer-rest-params
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
    send_page_view: false,
    page_location: safePageLocation(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const script = document.createElement('script');
  script.id = TAG_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  sendPageView();
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabledHere()) return;
    const onAccept = () => loadTag();
    const onDecline = () => {
      (window as AnalyticsWindow).gtag?.('consent', 'update', { analytics_storage: 'denied' });
    };
    window.addEventListener('cookieConsentAccepted', onAccept);
    window.addEventListener('cookieConsentDeclined', onDecline);
    loadTag();
    return () => {
      window.removeEventListener('cookieConsentAccepted', onAccept);
      window.removeEventListener('cookieConsentDeclined', onDecline);
    };
  }, []);

  // One page_view per client-side navigation (the first is sent by loadTag).
  useEffect(() => {
    const t = window.setTimeout(sendPageView, 50);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return null;
}
