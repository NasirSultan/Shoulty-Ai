"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminHeader from '../AdminHeader';

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// ============================================================
// ShoutlyAI Analytics API integration
// ============================================================
const API_BASE_URL = 'https://ai-shoutly-backend.onrender.com/api';

// --- API response types (mirrors GET /autopost/analytics schema) ---
interface AnalyticsMetrics {
  totalFollowers: number;
  totalReach: number;
  totalEngagement: number;
  avgEngagementRate: number;
  postsThisMonth: number;
}

interface EngagementPoint {
  date: string;
  engagement: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
}

interface ReachPoint {
  date: string;
  reach: number;
  impressions: number;
}

interface PlatformBreakdownEntry {
  engagementShare: number;
  engagementRate: number;
  reach: number;
}

interface FollowerGrowthPoint {
  date: string;
  total: number;
  [platform: string]: string | number;
}

interface AnalyticsResponse {
  success: boolean;
  timeframe: { from_unix: string; to_unix: string };
  metrics: AnalyticsMetrics;
  charts: {
    engagementOverTime: EngagementPoint[];
    reachAndImpressions: ReachPoint[];
    platformBreakdown: Record<string, PlatformBreakdownEntry>;
    followerGrowth: FollowerGrowthPoint[];
  };
}

// --- Platform display metadata (icon / gradient / accent color), keyed by the
// uppercase platform name returned by the API (e.g. "INSTAGRAM") ---
const PLATFORM_META: Record<string, { icon: string; grad: string; color: string }> = {
  INSTAGRAM: { icon: 'fa-instagram', grad: 'linear-gradient(135deg,#F58529,#E1306C)', color: '#E1306C' },
  TIKTOK: { icon: 'fa-tiktok', grad: 'linear-gradient(135deg,#010101,#69C9D0)', color: '#111111' },
  LINKEDIN: { icon: 'fa-linkedin', grad: 'linear-gradient(135deg,#0A66C2,#004182)', color: '#0A66C2' },
  FACEBOOK: { icon: 'fa-facebook', grad: 'linear-gradient(135deg,#1877F2,#0A4FC4)', color: '#1877F2' },
  TWITTER: { icon: 'fa-x-twitter', grad: 'linear-gradient(135deg,#111111,#333333)', color: '#111111' },
  X: { icon: 'fa-x-twitter', grad: 'linear-gradient(135deg,#111111,#333333)', color: '#111111' },
  THREADS: { icon: 'fa-threads', grad: 'linear-gradient(135deg,#000000,#444444)', color: '#000000' },
  YOUTUBE: { icon: 'fa-youtube', grad: 'linear-gradient(135deg,#FF0000,#CC0000)', color: '#FF0000' },
};

const getPlatformMeta = (name: string) =>
  PLATFORM_META[name.toUpperCase()] || { icon: 'fa-hashtag', grad: 'linear-gradient(135deg,#6B7280,#4B5563)', color: '#6B7280' };

const platformLabel = (name: string) => name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

// --- Formatting helpers ---
const formatNumber = (num: number): string => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  if (Math.abs(num) >= 1_000_000) return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'M';
  if (Math.abs(num) >= 1_000) return (num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1) + 'K';
  return String(num);
};

const formatChartDate = (dateStr: string): string => {
  const d = new Date(`${dateStr}T00:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// --- Auth token retrieval ---
// TODO: Wire this up to however your app actually stores the session token
// (e.g. an auth context/provider, a cookie, or NextAuth's useSession()).
// Falling back to localStorage here as a placeholder so the integration is
// runnable out of the box.
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('shoutly_token') || localStorage.getItem('token');
};

// --- Maps the UI's range tabs to the query params the API expects ---
const getRangeQueryString = (range: string): string => {
  switch (range) {
    case '7d':
      return 'from=7d';
    case '30d':
      return 'from=30d';
    case '90d':
      return 'from=90d';
    case 'ytd': {
      // The API doesn't have a "ytd" shorthand, so we build an explicit
      // YYYY-MM-DD range from Jan 1 of the current year through today.
      const now = new Date();
      const jan1 = `${now.getFullYear()}-01-01`;
      const today = now.toISOString().split('T')[0];
      return `from=${jan1}&to=${today}`;
    }
    default:
      return '';
  }
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index' as const, intersect: false },
  },
  scales: {
    x: {
      grid: { color: 'rgba(0,0,0,.04)' },
      ticks: { color: '#8486AB', font: { size: 11, family: "'JetBrains Mono'" } },
    },
    y: {
      grid: { color: 'rgba(0,0,0,.04)' },
      ticks: { color: '#8486AB', font: { size: 11 } },
    },
  },
};

const stackedBarOptions = {
  ...chartOptions,
  scales: {
    x: { ...chartOptions.scales.x, stacked: true },
    y: { ...chartOptions.scales.y, stacked: true },
  },
};

// --- Utility Functions ---
const showToast = (msg: string, type: 'default' | 'green' | 'red' | 'brand' | 'amber' = 'default') => {
  const event = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(event);
};

// --- Main Component ---
const AnalyticsPage: React.FC = () => {
  const [activeRange, setActiveRange] = useState<string>('30d');
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // --- Analytics API state ---
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (range: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('NO_TOKEN');
      }

      const query = getRangeQueryString(range);
      const res = await fetch(`${API_BASE_URL}/autopost/analytics${query ? `?${query}` : ''}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Per the API docs: an invalid/expired token returns 401 — send the
      // user back to login.
      if (res.status === 401) {
        showToast('Session expired — please log in again', 'red');
        setError('NO_TOKEN');
        // setLoading(false);
        // window.location.href = '/login'; // adjust to your app's actual login route
        // return;
      }

      if (!res.ok) {
        throw new Error(`HTTP_${res.status}`);
      }

      const json: AnalyticsResponse = await res.json();
      if (!json.success) {
        throw new Error('API_ERROR');
      }

      setData(json);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError(err instanceof Error ? err.message : 'UNKNOWN_ERROR');
      showToast('Could not load analytics data', 'red');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(activeRange);
  }, [activeRange, fetchAnalytics]);

  // --- Derived values from the API response ---
  const metrics = data?.metrics;

  // The API doesn't return a single "new followers this period" figure —
  // we derive it by summing the daily "total" field from followerGrowth.
  const newFollowers =
    data?.charts.followerGrowth?.reduce((sum, point) => sum + (typeof point.total === 'number' ? point.total : 0), 0) ??
    metrics?.totalFollowers ??
    0;

  const engagementPoints = data?.charts.engagementOverTime ?? [];
  const engagementChartData = {
    labels: engagementPoints.map((p) => formatChartDate(p.date)),
    datasets: [
      {
        label: 'Likes',
        data: engagementPoints.map((p) => p.likes),
        borderColor: 'rgba(249,115,22,1)',
        backgroundColor: 'rgba(249,115,22,.15)',
        tension: 0.4,
        fill: true,
        borderWidth: 2.5,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Comments',
        data: engagementPoints.map((p) => p.comments),
        borderColor: 'rgba(16,185,129,1)',
        backgroundColor: 'rgba(16,185,129,.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
      },
      {
        label: 'Shares',
        data: engagementPoints.map((p) => p.shares),
        borderColor: 'rgba(59,130,246,1)',
        backgroundColor: 'rgba(59,130,246,.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const reachPoints = data?.charts.reachAndImpressions ?? [];
  const reachChartData = {
    labels: reachPoints.map((p) => formatChartDate(p.date)),
    datasets: [
      {
        label: 'Reach',
        data: reachPoints.map((p) => p.reach),
        backgroundColor: 'rgba(249,115,22,.8)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Impressions',
        data: reachPoints.map((p) => p.impressions),
        backgroundColor: 'rgba(124,58,237,.4)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const followerGrowthPoints = data?.charts.followerGrowth ?? [];
  const followerPlatformKeys = Array.from(
    new Set(followerGrowthPoints.flatMap((p) => Object.keys(p).filter((k) => k !== 'date' && k !== 'total')))
  );
  const followerGrowthChartData = {
    labels: followerGrowthPoints.map((p) => formatChartDate(p.date)),
    datasets: followerPlatformKeys.map((key) => {
      const meta = getPlatformMeta(key);
      return {
        label: platformLabel(key),
        data: followerGrowthPoints.map((p) => (typeof p[key] === 'number' ? (p[key] as number) : 0)),
        backgroundColor: meta.color,
        borderRadius: 4,
        borderSkipped: false,
        stack: 'followers',
      };
    }),
  };

  // Handlers
  const setRange = (range: string, el: HTMLElement) => {
    setActiveRange(range);
    showToast(`Showing ${range} data`, 'brand');
  };

  const setPlatform = (platform: string, el: HTMLElement) => {
    setActivePlatform(platform);
    showToast(`Filtered to ${platform}`, 'brand');
  };

  const exportReport = () => {
    showToast('Generating PDF report…', 'brand');
    setTimeout(() => showToast('Report ready — check your email!', 'green'), 2000);
  };

  const openModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.add('open');
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('open');
      setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.innerHTML = '';
          modalContentRef.current.style.overflow = '';
        }
      }, 200);
    }
  };

  // Handle modal click outside
  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  // Render platform breakdown (live data from charts.platformBreakdown)
  const renderPlatformBreakdown = () => {
    if (loading) {
      return <div style={{ fontSize: 12, color: 'var(--t4)', textAlign: 'center', padding: '20px 0' }}>Loading…</div>;
    }
    const entries = data ? Object.entries(data.charts.platformBreakdown) : [];
    if (entries.length === 0) {
      return <div style={{ fontSize: 12, color: 'var(--t4)', textAlign: 'center', padding: '20px 0' }}>No platform data for this period</div>;
    }
    return entries.map(([name, stats]) => {
      const meta = getPlatformMeta(name);
      return (
        <div key={name} className="plat-row">
          <div className="plat-icon" style={{ background: meta.grad }}>
            <i className={`fa-brands ${meta.icon}`}></i>
          </div>
          <div className="plat-info">
            <div className="plat-name">{platformLabel(name)}</div>
            <div className="plat-bar-wrap">
              <div className="plat-bar" style={{ width: `${stats.engagementShare}%`, background: meta.grad }}></div>
            </div>
          </div>
          <div className="plat-stats">
            <div className="plat-stat">
              <div className="plat-stat-val">{stats.engagementRate}%</div>
              <div className="plat-stat-lbl">Eng Rate</div>
            </div>
            <div className="plat-stat">
              <div className="plat-stat-val">{formatNumber(stats.reach)}</div>
              <div className="plat-stat-lbl">Reach</div>
            </div>
          </div>
        </div>
      );
    });
  };

  // Toast listener effect
  useEffect(() => {
    const handleShowToast = (e: CustomEvent) => {
      const { msg, type } = e.detail;
      const icons: Record<string, string> = { default: '🔔', green: '✅', red: '❌', brand: '✦', amber: '⚠️' };
      const stack = document.getElementById('toast-stack');
      if (!stack) return;
      const el = document.createElement('div');
      el.className = `toast ${type}`;
      el.innerHTML = `
        <span style="font-size:15px;flex-shrink:0">${icons[type] || '🔔'}</span>
        <span style="flex:1">${msg}</span>
        <span class="t-x" onclick="this.parentElement.remove()">✕</span>
      `;
      stack.appendChild(el);
      setTimeout(() => {
        el.style.transition = 'all .3s';
        el.style.opacity = '0';
        el.style.transform = 'translateX(110%)';
        setTimeout(() => el.remove(), 300);
      }, 4000);
    };

    window.addEventListener('show-toast', handleShowToast as EventListener);
    return () => window.removeEventListener('show-toast', handleShowToast as EventListener);
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <style>{`
        :root { --bg:#F5F6FA; --surf:#fff; --surf2:#F8F9FD; --bdr:#E2E4F0; --bdr2:#ECEEF6; --t1:#0B0C1A; --t2:#3D3F60; --t3:#8486AB; --t4:#A0A2BF; --brand:#F97316; --brand2:#EA580C; --brand-l:#EEEEFF; --brand-l2:#DCDDF7; --gr:#10B981; --gr-l:#ECFDF5; --bl:#3B82F6; --or:#F97316; --or-l:#FFF7ED; --am:#F59E0B; --am-l:#FFF7E6; }
        #main { min-width:0; background:var(--bg); color:var(--t1); }
        #topbar { height:56px; display:flex; align-items:center; gap:10px; padding:0 20px; background:#fff; border-bottom:1px solid var(--bdr); box-shadow:0 1px 4px rgba(11,12,26,.06); }
        #content { height:calc(100vh - 56px); overflow:auto; padding:18px 20px 24px; }
        .tb-bc { font-size:12px; color:var(--t3); display:flex; align-items:center; gap:6px; }
        .tb-bc a { color:var(--t3); text-decoration:none; }
        .tb-bc .cur { color:var(--t1); font-weight:700; font-family:'Sora',sans-serif; }
        .tb-flex { flex:1; }
        .tb-btn, .date-btn, .btn { display:inline-flex; align-items:center; gap:6px; border-radius:8px; border:1px solid var(--bdr); background:#fff; color:var(--t2); font-weight:700; cursor:pointer; }
        .tb-btn { padding:8px 12px; font-size:12px; }
        .tb-btn.solid { background:var(--brand); border-color:var(--brand); color:#fff; }
        .date-btn { padding:8px 10px; font-size:12px; }
        .btn { padding:6px 10px; font-size:12px; }
        .btn-sm { padding:5px 9px; font-size:11.5px; }
        .tb-icon { width:30px; height:30px; border-radius:7px; border:1px solid var(--bdr2); display:flex; align-items:center; justify-content:center; position:relative; color:var(--t2); }
        .tb-dot { position:absolute; top:5px; right:5px; width:7px; height:7px; border-radius:50%; background:#EF4444; border:1.5px solid #fff; }
        .tb-ava { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#F97316,#EA580C); color:#fff; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:800; }
        .page-hdr { margin-bottom:14px; }
        .page-eye { display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:700; color:var(--gr); }
        .page-eye-dot { width:8px; height:8px; border-radius:50%; background:var(--gr); }
        .page-title { margin-top:7px; font-size:22px; font-weight:900; font-family:'Sora',sans-serif; }
        .page-sub { margin-top:5px; color:var(--t3); font-size:13px; }
        .range-tabs { display:flex; gap:6px; background:#fff; border:1px solid var(--bdr); border-radius:10px; padding:4px; }
        .rt { border:none; background:transparent; color:var(--t3); font-size:12px; font-weight:700; padding:6px 10px; border-radius:7px; cursor:pointer; }
        .rt.active { background:var(--brand-l); color:var(--brand); }
        .analytics-grid-4 { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; margin-bottom:12px; }
        .analytics-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin-bottom:12px; }
        .kpi, .chart-card { background:#fff; border:1px solid var(--bdr); border-radius:12px; box-shadow:0 1px 4px rgba(11,12,26,.06); }
        .kpi { padding:12px; }
        .kpi-ico { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
        .kpi-label { font-size:12px; color:var(--t3); }
        .kpi-val { margin-top:4px; font-size:24px; font-weight:900; color:var(--t1); font-family:'Sora',sans-serif; }
        .kpi-delta { margin-top:4px; font-size:11px; font-weight:700; }
        .kpi-delta.up { color:var(--gr); }
        .cc-hdr { padding:12px 14px; border-bottom:1px solid var(--bdr2); display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
        .cc-title { font-size:14px; font-weight:800; color:var(--t1); display:flex; align-items:center; gap:7px; font-family:'Sora',sans-serif; }
        .cc-sub { margin-top:4px; color:var(--t3); font-size:12px; }
        .cc-body { padding:12px 14px; }
        .badge { border-radius:999px; padding:3px 8px; font-size:10px; font-weight:700; }
        .badge.brand { background:var(--brand-l); color:var(--brand); }
        .badge.green { background:var(--gr-l); color:var(--gr); }
        .badge.blue { background:#EFF6FF; color:var(--bl); }
        .plat-row, .post-row, .aud-bar-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
        .plat-icon, .post-thumb { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .post-thumb { background:#EEF0F8; color:#4B4D6B; font-size:18px; }
        .plat-info, .post-info { flex:1; min-width:0; }
        .plat-name { font-size:12.5px; font-weight:700; color:var(--t2); }
        .plat-bar-wrap, .aud-bar-wrap { margin-top:6px; height:7px; border-radius:999px; background:#ECEEF7; overflow:hidden; }
        .plat-bar, .aud-bar { height:100%; border-radius:999px; background:linear-gradient(90deg,var(--brand),var(--brand2)); }
        .plat-stats, .post-stats { display:flex; gap:10px; }
        .plat-stat, .ps { text-align:right; }
        .plat-stat-val, .ps-val { font-size:12px; font-weight:800; color:var(--t1); font-family:'JetBrains Mono',monospace; }
        .plat-stat-lbl, .ps-lbl, .aud-bar-lbl, .aud-bar-val { font-size:10px; color:var(--t4); }
        .post-caption { font-size:12px; color:var(--t2); line-height:1.45; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .post-meta { margin-top:4px; display:flex; align-items:center; gap:7px; font-size:10.5px; color:var(--t4); }
        #modal-bg { position:fixed; inset:0; background:rgba(11,12,26,.45); backdrop-filter:blur(2px); display:none; align-items:center; justify-content:center; z-index:70; }
        #modal-bg.open { display:flex; }
        .mbox { width:min(560px,92vw); max-height:90vh; overflow:auto; border-radius:14px; background:#fff; border:1px solid var(--bdr); box-shadow:0 20px 60px rgba(11,12,26,.25); }
        #toast-stack { position:fixed; top:18px; right:18px; z-index:80; display:flex; flex-direction:column; gap:8px; }
        .toast { min-width:260px; max-width:360px; display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; background:#fff; border:1px solid var(--bdr); box-shadow:0 8px 26px rgba(11,12,26,.12); }
        .toast .t-x { cursor:pointer; color:var(--t4); font-weight:700; }
        .error-banner { display:flex; align-items:center; justify-content:space-between; gap:10px; background:#FEF2F2; border:1px solid #FCA5A5; color:#B91C1C; padding:10px 14px; border-radius:10px; margin-bottom:14px; font-size:13px; }
        .an-chart-box { position:relative; width:100%; }
        @media (max-width:1200px) { .analytics-grid-4 { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:900px) { .analytics-grid { grid-template-columns:1fr; } }
        @media (max-width:640px) { .analytics-grid-4 { grid-template-columns:1fr; } #content { padding:14px; } }

        @media (min-width:768px) {
          .an-admin-header {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            z-index: 50 !important;
            background: #fff !important;
            border-bottom: 1px solid var(--bdr) !important;
          }
          #content {
            margin-top: 56px !important;
          }
        }
        @media (max-width:767px) {
          .an-admin-header {
            display: none !important;
          }
          #content {
            height: auto !important;
            min-height: calc(100vh - 60px);
            padding: 12px !important;
          }
          .page-title { font-size: 19px !important; }
          .page-sub { font-size: 12px !important; }
          .an-filter-row {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 8px !important;
            margin-bottom: 14px !important;
          }
          .an-range-tabs {
            width: 100% !important;
            overflow-x: auto !important;
          }
          .an-range-tabs .rt {
            flex: 1 1 0 !important;
            white-space: nowrap !important;
          }
          .an-plat-row {
            margin-left: 0 !important;
            width: 100% !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 2px !important;
          }
          .an-plat-row .btn {
            flex-shrink: 0 !important;
          }
          .analytics-grid-4 { gap: 8px !important; margin-bottom: 8px !important; }
          .kpi { padding: 10px !important; }
          .kpi-val { font-size: 19px !important; }
          .kpi-label { font-size: 11px !important; }
          .analytics-grid { gap: 8px !important; margin-bottom: 8px !important; }
          .cc-hdr {
            flex-wrap: wrap !important;
            padding: 10px 12px !important;
            gap: 8px !important;
          }
          .cc-body { padding: 10px 12px !important; }
          .cc-title { font-size: 13px !important; }
          .cc-sub { font-size: 11px !important; }
          .an-chart-box { height: 160px !important; }
        }
      `}</style>

      <div id="main" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <AdminHeader
          className="an-admin-header"
          pageTitle="Analytics"
          searchPlaceholder="Search analytics…"
          actionButton={
            <button
              onClick={exportReport}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, background: 'linear-gradient(115deg,#F97316,#EA580C)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Sora,sans-serif', boxShadow: '0 4px 14px rgba(249,115,22,.4)' }}
            >
              <i className="fa-solid fa-file-arrow-down" style={{ fontSize: 11 }} /> Export PDF
            </button>
          }
        />

        <div id="content">
          <div className="page-hdr">
            <div className="page-eye">
              <div className="page-eye-dot"></div> Analytics
            </div>
            <div className="page-title">Performance Overview</div>
            <div className="page-sub">
              Track reach, engagement, and growth across all your connected social platforms.
            </div>
          </div>

          {/* Error banner */}
          {error && (
            <div className="error-banner">
              <span>
                <i className="fa-solid fa-triangle-exclamation" style={{ marginRight: 8 }}></i>
                {error === 'NO_TOKEN'
                  ? "Couldn't authenticate — please log in again."
                  : "Couldn't load analytics data. Please try again."}
              </span>
              <button className="btn ghost btn-sm" onClick={() => fetchAnalytics(activeRange)}>
                Retry
              </button>
            </div>
          )}

          {/* Range Tabs */}
          <div className="an-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="range-tabs an-range-tabs">
              {['7d', '30d', '90d', 'ytd'].map((range) => (
                <button
                  key={range}
                  className={`rt ${activeRange === range ? 'active' : ''}`}
                  onClick={(e) => setRange(range, e.currentTarget)}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : 'YTD'}
                </button>
              ))}
            </div>
            <div className="an-plat-row" style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
              {['all', 'ig', 'li', 'tk', 'th', 'yt'].map((platform) => (
                <button
                  key={platform}
                  className={`btn ghost btn-sm ${activePlatform === platform ? 'active-platform' : ''}`}
                  onClick={(e) => setPlatform(platform, e.currentTarget)}
                  style={
                    activePlatform === platform
                      ? { background: 'var(--brand-l)', borderColor: 'var(--brand-l2)', color: 'var(--brand)' }
                      : {}
                  }
                >
                  {platform === 'all' && 'All Platforms'}
                  {platform === 'ig' && <><i className="fa-brands fa-instagram" style={{ color: '#E1306C' }}></i> Instagram</>}
                  {platform === 'li' && <><i className="fa-brands fa-linkedin" style={{ color: '#0A66C2' }}></i> LinkedIn</>}
                  {platform === 'tk' && <><i className="fa-brands fa-tiktok"></i> TikTok</>}
                  {platform === 'th' && <><i className="fa-brands fa-threads" style={{ color: '#000' }}></i> Threads</>}
                  {platform === 'yt' && <><i className="fa-brands fa-youtube" style={{ color: '#FF0000' }}></i> YouTube</>}
                </button>
              ))}
            </div>
          </div>

          {/* KPI Cards — bound to data.metrics from the API */}
          <div className="analytics-grid-4">
            <div className="kpi" style={{ animationDelay: '0.04s' }}>
              <div className="kpi-ico" style={{ background: 'var(--brand-l)' }}>
                <i className="fa-solid fa-eye" style={{ color: 'var(--brand)' }}></i>
              </div>
              <div className="kpi-label">Total Reach</div>
              <div className="kpi-val">{loading ? '—' : formatNumber(metrics?.totalReach ?? 0)}</div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.08s' }}>
              <div className="kpi-ico" style={{ background: 'var(--gr-l)' }}>
                <i className="fa-solid fa-heart" style={{ color: 'var(--gr)' }}></i>
              </div>
              <div className="kpi-label">Engagements</div>
              <div className="kpi-val">{loading ? '—' : formatNumber(metrics?.totalEngagement ?? 0)}</div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.12s' }}>
              <div className="kpi-ico" style={{ background: 'var(--or-l)' }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--or)' }}></i>
              </div>
              <div className="kpi-label">New Followers</div>
              <div className="kpi-val">{loading ? '—' : `+${formatNumber(newFollowers)}`}</div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.16s' }}>
              <div className="kpi-ico" style={{ background: 'var(--am-l)' }}>
                <i className="fa-solid fa-percent" style={{ color: 'var(--am)' }}></i>
              </div>
              <div className="kpi-label">Avg Engagement Rate</div>
              <div className="kpi-val">{loading ? '—' : `${metrics?.avgEngagementRate ?? 0}%`}</div>
            </div>
          </div>

          {/* Engagement + Reach Charts */}
          <div className="analytics-grid" style={{ animationDelay: '0.18s' }}>
            <div className="chart-card" style={{ animationDelay: '0.18s' }}>
              <div className="cc-hdr">
                <div>
                  <div className="cc-title">
                    <i className="fa-solid fa-chart-line"></i>Engagement Over Time
                  </div>
                  <div className="cc-sub">Likes, comments, shares and saves combined</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className="badge brand">Likes</span>
                  <span className="badge green">Comments</span>
                  <span className="badge blue">Shares</span>
                </div>
              </div>
              <div className="cc-body">
                <div className="an-chart-box" style={{ height: 180 }}>
                  <Line data={engagementChartData} options={chartOptions} />
                </div>
              </div>
            </div>
            <div className="chart-card" style={{ animationDelay: '0.22s' }}>
              <div className="cc-hdr">
                <div>
                  <div className="cc-title">
                    <i className="fa-solid fa-chart-bar"></i>Reach &amp; Impressions
                  </div>
                  <div className="cc-sub">Unique accounts reached per day</div>
                </div>
              </div>
              <div className="cc-body">
                <div className="an-chart-box" style={{ height: 180 }}>
                  <Bar data={reachChartData} options={chartOptions} />
                </div>
              </div>
            </div>
          </div>

          {/* Platform Breakdown + Follower Growth */}
          <div className="analytics-grid" style={{ animationDelay: '0.24s' }}>
            <div className="chart-card" style={{ animationDelay: '0.24s' }}>
              <div className="cc-hdr">
                <div>
                  <div className="cc-title">
                    <i className="fa-solid fa-share-nodes"></i>Platform Breakdown
                  </div>
                  <div className="cc-sub">Engagement share by platform</div>
                </div>
              </div>
              <div className="cc-body" style={{ padding: '12px 20px 16px' }}>
                {renderPlatformBreakdown()}
              </div>
            </div>
            <div className="chart-card" style={{ animationDelay: '0.28s' }}>
              <div className="cc-hdr">
                <div>
                  <div className="cc-title">
                    <i className="fa-solid fa-user-plus"></i>Follower Growth
                  </div>
                  <div className="cc-sub">Net new followers per platform, per day</div>
                </div>
              </div>
              <div className="cc-body">
                <div className="an-chart-box" style={{ height: 200 }}>
                  <Bar data={followerGrowthChartData} options={stackedBarOptions} />
                </div>
              </div>
            </div>
          </div>

          {/*
            ------------------------------------------------------------------
            Top Performing Posts + Audience Demographics — temporarily disabled.
            The ShoutlyAI analytics endpoint (GET /autopost/analytics) does not
            currently return per-post rankings or audience demographic data,
            so this section is commented out until that data is available.
            ------------------------------------------------------------------

          <div className="analytics-grid" style={{ animationDelay: '0.3s' }}>
            <div className="chart-card" style={{ animationDelay: '0.3s' }}>
              <div className="cc-hdr">
                <div>
                  <div className="cc-title">
                    <i className="fa-solid fa-trophy"></i>Top Performing Posts
                  </div>
                  <div className="cc-sub">Ranked by total engagement this period</div>
                </div>
                <button className="btn ghost btn-sm" onClick={() => showToast('View all posts', 'brand')}>
                  View All
                </button>
              </div>
              <div className="cc-body" style={{ padding: '4px 20px 12px' }}>
                {renderTopPosts()}
              </div>
            </div>
            <div className="chart-card" style={{ animationDelay: '0.34s' }}>
              <div className="cc-hdr">
                <div>
                  <div className="cc-title">
                    <i className="fa-solid fa-users-viewfinder"></i>Audience Demographics
                  </div>
                  <div className="cc-sub">Based on your combined audience across all platforms</div>
                </div>
              </div>
              <div className="cc-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        color: 'var(--t3)',
                        marginBottom: '10px',
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Age Groups
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">18–24</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '42%' }}></div>
                      </div>
                      <div className="aud-bar-val">42%</div>
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">25–34</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '31%' }}></div>
                      </div>
                      <div className="aud-bar-val">31%</div>
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">35–44</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '18%' }}></div>
                      </div>
                      <div className="aud-bar-val">18%</div>
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">45–54</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '9%' }}></div>
                      </div>
                      <div className="aud-bar-val">9%</div>
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        textTransform: 'uppercase',
                        letterSpacing: '.5px',
                        color: 'var(--t3)',
                        marginBottom: '10px',
                        fontFamily: "'Sora', sans-serif",
                      }}
                    >
                      Top Locations
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">United States</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '54%' }}></div>
                      </div>
                      <div className="aud-bar-val">54%</div>
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">United Kingdom</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '14%' }}></div>
                      </div>
                      <div className="aud-bar-val">14%</div>
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">Canada</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '10%' }}></div>
                      </div>
                      <div className="aud-bar-val">10%</div>
                    </div>
                    <div className="aud-bar-row">
                      <div className="aud-bar-lbl">Australia</div>
                      <div className="aud-bar-wrap">
                        <div className="aud-bar" style={{ width: '8%' }}></div>
                      </div>
                      <div className="aud-bar-val">8%</div>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '.5px',
                      color: 'var(--t3)',
                      marginBottom: '10px',
                      fontFamily: "'Sora', sans-serif",
                    }}
                  >
                    Peak Posting Times (EST)
                  </div>
                  {renderHeatmap()}
                </div>
              </div>
            </div>
          </div>

          ------------------------------------------------------------------
          End of disabled section
          ------------------------------------------------------------------
          */}
        </div>
      </div>

      {/* Modal */}
      <div
        id="modal-bg"
        ref={modalRef}
        onClick={handleModalClick}
      >
        <div className="mbox" id="mbox" ref={modalContentRef}></div>
      </div>

      {/* Toast Container */}
      <div id="toast-stack"></div>

    </>
  );
};

export default AnalyticsPage;