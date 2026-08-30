import { AnalyticsEvent, AnalyticsEventType } from './types';

export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(
      ua
    )
  ) {
    return 'mobile';
  }
  return 'desktop';
}

export function createAnalyticsEvent(
  agentId: string,
  agentName: string,
  eventType: AnalyticsEventType,
  details?: Record<string, any>
): AnalyticsEvent {
  return {
    id: 'evt_' + Math.random().toString(36).substring(2, 9) + Date.now(),
    agentId,
    agentName,
    eventType,
    timestamp: new Date().toISOString(),
    referrer: typeof document !== 'undefined' ? document.referrer || 'direct' : 'direct',
    deviceType: getDeviceType(),
    platform: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
    details,
  };
}

export function generateHistoricalAnalytics(events: AnalyticsEvent[], days: number = 30) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const filtered = events.filter((e) => new Date(e.timestamp) >= cutoff);

  // Group by date YYYY-MM-DD
  const dateMap: Record<
    string,
    { date: string; views: number; whatsapp: number; calls: number; emails: number; vcards: number }
  > = {};

  // Initialize all days in the range
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    dateMap[key] = { date: key, views: 0, whatsapp: 0, calls: 0, emails: 0, vcards: 0 };
  }

  filtered.forEach((e) => {
    const key = e.timestamp.split('T')[0];
    if (dateMap[key]) {
      if (e.eventType === 'profile_view') dateMap[key].views++;
      if (e.eventType === 'whatsapp_click') dateMap[key].whatsapp++;
      if (e.eventType === 'call_click') dateMap[key].calls++;
      if (e.eventType === 'email_click') dateMap[key].emails++;
      if (e.eventType === 'contact_download') dateMap[key].vcards++;
    }
  });

  return Object.values(dateMap);
}
