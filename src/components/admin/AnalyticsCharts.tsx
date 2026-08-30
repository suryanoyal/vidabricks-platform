'use client';

import React, { useState } from 'react';
import { AnalyticsEvent } from '@/lib/types';
import { generateHistoricalAnalytics } from '@/lib/analytics';
import { Eye, MessageCircle, Phone, Mail, UserPlus, TrendingUp } from 'lucide-react';

interface AnalyticsChartsProps {
  events: AnalyticsEvent[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ events }) => {
  const [dateRange, setDateRange] = useState<number>(30);
  const [metricFocus, setMetricFocus] = useState<'views' | 'whatsapp' | 'calls' | 'emails'>('views');

  const history = generateHistoricalAnalytics(events, dateRange);

  const totalViews = history.reduce((acc, cur) => acc + cur.views, 0);
  const totalWhatsapp = history.reduce((acc, cur) => acc + cur.whatsapp, 0);
  const totalCalls = history.reduce((acc, cur) => acc + cur.calls, 0);
  const totalEmails = history.reduce((acc, cur) => acc + cur.emails, 0);

  // Compute maximum for scale
  const maxVal = Math.max(
    ...history.map((h) => {
      if (metricFocus === 'views') return h.views;
      if (metricFocus === 'whatsapp') return h.whatsapp;
      if (metricFocus === 'calls') return h.calls;
      return h.emails;
    }),
    10
  );

  return (
    <div className="w-full p-6 rounded-3xl bg-vb-card border border-vb-border shadow-xl space-y-6">
      {/* Top Header & Range Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-vb-gold-light" />
            <h3 className="text-base font-bold text-white font-display">
              Audience Engagement & Conversion Trends
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time digital card views, WhatsApp taps, and lead conversion analytics
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-vb-dark border border-vb-border shrink-0">
          {[
            { label: '7 Days', days: 7 },
            { label: '30 Days', days: 30 },
            { label: '90 Days', days: 90 },
          ].map((range) => (
            <button
              key={range.days}
              onClick={() => setDateRange(range.days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateRange === range.days
                  ? 'bg-vb-gold text-vb-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            key: 'views',
            label: 'Profile Views',
            count: totalViews,
            icon: Eye,
            color: 'text-sky-400',
            barColor: 'from-sky-500 to-blue-600',
          },
          {
            key: 'whatsapp',
            label: 'WhatsApp Clicks',
            count: totalWhatsapp,
            icon: MessageCircle,
            color: 'text-emerald-400',
            barColor: 'from-emerald-500 to-green-600',
          },
          {
            key: 'calls',
            label: 'Phone Calls',
            count: totalCalls,
            icon: Phone,
            color: 'text-amber-400',
            barColor: 'from-amber-500 to-yellow-600',
          },
          {
            key: 'emails',
            label: 'Emails Sent',
            count: totalEmails,
            icon: Mail,
            color: 'text-purple-400',
            barColor: 'from-purple-500 to-indigo-600',
          },
        ].map((m) => {
          const Icon = m.icon;
          const isSelected = metricFocus === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMetricFocus(m.key as any)}
              className={`p-3.5 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-vb-navy border-vb-gold shadow-gold-subtle'
                  : 'bg-vb-dark/60 border-vb-border hover:bg-vb-navy'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{m.label}</span>
                <Icon className={`w-4 h-4 ${m.color}`} />
              </div>
              <span className="text-xl font-bold text-white font-display block mt-1">
                {m.count.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Interactive Bar Chart */}
      <div className="pt-4 border-t border-vb-border space-y-3">
        <div className="h-56 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1">
          {history.map((day, idx) => {
            const val =
              metricFocus === 'views'
                ? day.views
                : metricFocus === 'whatsapp'
                ? day.whatsapp
                : metricFocus === 'calls'
                ? day.calls
                : day.emails;

            const heightPct = Math.max(8, Math.round((val / maxVal) * 100));

            return (
              <div
                key={day.date}
                className="flex-1 flex flex-col items-center h-full justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-vb-black border border-vb-border px-2 py-1 rounded-md text-[10px] text-white whitespace-nowrap shadow-xl pointer-events-none z-20">
                  <span className="font-bold text-vb-gold-light">{val}</span> {metricFocus} on {day.date}
                </div>

                {/* Animated Chart Bar */}
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    metricFocus === 'whatsapp'
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 group-hover:brightness-125'
                      : metricFocus === 'calls'
                      ? 'bg-gradient-to-t from-amber-600 to-amber-400 group-hover:brightness-125'
                      : metricFocus === 'emails'
                      ? 'bg-gradient-to-t from-purple-600 to-purple-400 group-hover:brightness-125'
                      : 'bg-gradient-to-t from-vb-gold-dim via-vb-gold to-vb-gold-light group-hover:brightness-125'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* X-axis Date Markers */}
        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>{history[0]?.date}</span>
          <span>Middle ({history[Math.floor(history.length / 2)]?.date})</span>
          <span>Today ({history[history.length - 1]?.date})</span>
        </div>
      </div>
    </div>
  );
};
