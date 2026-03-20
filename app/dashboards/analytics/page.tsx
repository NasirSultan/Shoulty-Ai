"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar'; // Import the sidebar component
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

// --- Types ---
interface PlatformData {
  name: string;
  icon: string;
  grad: string;
  pct: number;
  eng: string;
  reach: string;
}

interface PostData {
  emoji: string;
  caption: string;
  plat: string;
  platColor: string;
  platIcon: string;
  date: string;
  likes: string;
  comments: string;
  shares: string;
  eng: string;
}

// --- Data ---
const days = ['Mar 1', 'Mar 2', 'Mar 3', 'Mar 4', 'Mar 5', 'Mar 6', 'Mar 7', 'Mar 8', 'Mar 9'];

const engagementData = {
  labels: days,
  datasets: [
    {
      label: 'Likes',
      data: [3200, 4100, 3800, 5200, 4800, 6100, 5700, 7200, 6800],
      borderColor: 'rgba(91,91,214,1)',
      backgroundColor: 'rgba(91,91,214,.15)',
      tension: 0.4,
      fill: true,
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 6,
    },
    {
      label: 'Comments',
      data: [420, 510, 490, 680, 620, 790, 740, 920, 880],
      borderColor: 'rgba(16,185,129,1)',
      backgroundColor: 'rgba(16,185,129,.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 3,
    },
    {
      label: 'Shares',
      data: [180, 220, 205, 310, 280, 390, 355, 445, 420],
      borderColor: 'rgba(59,130,246,1)',
      backgroundColor: 'rgba(59,130,246,.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 2,
      pointRadius: 3,
    },
  ],
};

const reachData = {
  labels: days,
  datasets: [
    {
      label: 'Reach',
      data: [82000, 94000, 88000, 112000, 106000, 138000, 124000, 162000, 155000],
      backgroundColor: 'rgba(91,91,214,.8)',
      borderRadius: 6,
      borderSkipped: false,
    },
    {
      label: 'Impressions',
      data: [124000, 142000, 134000, 168000, 158000, 205000, 186000, 242000, 228000],
      backgroundColor: 'rgba(124,58,237,.4)',
      borderRadius: 6,
      borderSkipped: false,
    },
  ],
};

const followerGrowthData = {
  labels: ['Instagram', 'LinkedIn', 'TikTok', 'Facebook', 'Twitter/X'],
  datasets: [
    {
      label: 'New Followers',
      data: [1420, 680, 820, 190, 108],
      backgroundColor: [
        'rgba(225,48,108,.8)',
        'rgba(10,102,194,.8)',
        'rgba(17,17,17,.7)',
        'rgba(24,119,242,.8)',
        'rgba(29,161,242,.8)',
      ],
      borderRadius: 8,
      borderSkipped: false,
    },
  ],
};

const platforms: PlatformData[] = [
  { name: 'Instagram', icon: 'fa-instagram', grad: 'linear-gradient(135deg,#F58529,#E1306C)', pct: 48, eng: '4.8%', reach: '1.36M' },
  { name: 'TikTok', icon: 'fa-tiktok', grad: 'linear-gradient(135deg,#010101,#69C9D0)', pct: 26, eng: '7.4%', reach: '738K' },
  { name: 'LinkedIn', icon: 'fa-linkedin', grad: 'linear-gradient(135deg,#0A66C2,#004182)', pct: 14, eng: '3.2%', reach: '398K' },
  { name: 'Facebook', icon: 'fa-facebook', grad: 'linear-gradient(135deg,#1877F2,#0A4FC4)', pct: 8, eng: '1.8%', reach: '227K' },
  { name: 'Twitter/X', icon: 'fa-x-twitter', grad: 'linear-gradient(135deg,#111,#333)', pct: 4, eng: '2.1%', reach: '114K' },
  { name: 'Threads', icon: 'fa-threads', grad: 'linear-gradient(135deg,#000,#444)', pct: 8, eng: '3.9%', reach: '227K' },
  { name: 'YouTube', icon: 'fa-youtube', grad: 'linear-gradient(135deg,#FF0000,#CC0000)', pct: 10, eng: '5.2%', reach: '284K' },
];

const topPosts: PostData[] = [
  { emoji: '🎨', caption: '5 brand identity principles every marketer must know in 2026…', plat: 'Instagram', platColor: '#E1306C', platIcon: 'fa-instagram', date: 'Mar 7', likes: '12.4K', comments: '892', shares: '3.2K', eng: '6.8%' },
  { emoji: '🚀', caption: 'How we grew from 0 to 100K followers in 90 days — thread 🧵', plat: 'LinkedIn', platColor: '#0A66C2', platIcon: 'fa-linkedin', date: 'Mar 5', likes: '8.1K', comments: '1.2K', shares: '4.8K', eng: '5.9%' },
  { emoji: '✨', caption: 'POV: You discovered the AI tool that writes your captions for you…', plat: 'TikTok', platColor: '#111', platIcon: 'fa-tiktok', date: 'Mar 4', likes: '34.2K', comments: '2.1K', shares: '8.4K', eng: '7.4%' },
  { emoji: '📊', caption: 'Our Q1 results are in — here\'s what the data says about social ROI…', plat: 'Instagram', platColor: '#E1306C', platIcon: 'fa-instagram', date: 'Mar 2', likes: '7.8K', comments: '543', shares: '1.9K', eng: '4.4%' },
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
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

const barChartOptions = {
  ...chartOptions,
  indexAxis: 'y' as const,
  plugins: { ...chartOptions.plugins, legend: { display: false } },
};

// --- Utility Functions ---
const showToast = (msg: string, type: 'default' | 'green' | 'red' | 'brand' | 'amber' = 'default') => {
  const event = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(event);
};

// --- Main Component ---
const AnalyticsPage: React.FC = () => {
  const [sidebarSlim, setSidebarSlim] = useState(false);
  const [activeRange, setActiveRange] = useState<string>('30d');
  const [activePlatform, setActivePlatform] = useState<string>('all');
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Heatmap data
  const heatmapDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heatmapTimes = ['9AM', '12PM', '3PM', '6PM', '9PM', '12AM'];
  const heatmapValues = [
    [3, 4, 5, 8, 7, 4, 2],
    [5, 6, 8, 9, 8, 5, 3],
    [4, 5, 6, 7, 6, 4, 2],
    [3, 4, 5, 6, 5, 3, 2],
    [6, 8, 9, 10, 9, 6, 4],
    [4, 5, 7, 8, 7, 5, 3],
  ];

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

  // Render platform breakdown
  const renderPlatformBreakdown = () => {
    return platforms.map((p, idx) => (
      <div key={idx} className="plat-row">
        <div className="plat-icon" style={{ background: p.grad }}>
          <i className={`fa-brands ${p.icon}`}></i>
        </div>
        <div className="plat-info">
          <div className="plat-name">{p.name}</div>
          <div className="plat-bar-wrap">
            <div className="plat-bar" style={{ width: `${p.pct}%`, background: p.grad }}></div>
          </div>
        </div>
        <div className="plat-stats">
          <div className="plat-stat">
            <div className="plat-stat-val">{p.eng}</div>
            <div className="plat-stat-lbl">Eng Rate</div>
          </div>
          <div className="plat-stat">
            <div className="plat-stat-val">{p.reach}</div>
            <div className="plat-stat-lbl">Reach</div>
          </div>
        </div>
      </div>
    ));
  };

  // Render top posts
  const renderTopPosts = () => {
    return topPosts.map((post, idx) => (
      <div key={idx} className="post-row" style={{ animationDelay: `${idx * 0.06}s` }}>
        <div className="post-thumb">{post.emoji}</div>
        <div className="post-info">
          <div className="post-caption">{post.caption}</div>
          <div className="post-meta">
            <i className={`fa-brands ${post.platIcon}`} style={{ color: post.platColor }}></i>
            {post.plat} · {post.date}
            <span className="badge green" style={{ padding: '1px 6px', fontSize: '10px' }}>
              {post.eng} eng
            </span>
          </div>
        </div>
        <div className="post-stats">
          <div className="ps">
            <div className="ps-val">{post.likes}</div>
            <div className="ps-lbl">Likes</div>
          </div>
          <div className="ps">
            <div className="ps-val">{post.comments}</div>
            <div className="ps-lbl">Comments</div>
          </div>
          <div className="ps">
            <div className="ps-val">{post.shares}</div>
            <div className="ps-lbl">Shares</div>
          </div>
        </div>
      </div>
    ));
  };

  // Render heatmap
  const renderHeatmap = () => {
    return (
      <>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto repeat(7, 1fr)', gap: '4px' }}>
          <div></div>
          {heatmapDays.map((day, idx) => (
            <div
              key={`header-${idx}`}
              style={{
                fontSize: '9px',
                color: 'var(--t4)',
                textAlign: 'center',
                fontWeight: '700',
                fontFamily: "'Sora', sans-serif",
                paddingBottom: '4px',
              }}
            >
              {day}
            </div>
          ))}
          {heatmapTimes.map((time, ti) => (
            <React.Fragment key={`row-${ti}`}>
              <div
                style={{
                  fontSize: '9px',
                  color: 'var(--t4)',
                  fontFamily: "'JetBrains Mono', monospace",
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {time}
              </div>
              {heatmapDays.map((_, di) => {
                const v = heatmapValues[ti][di];
                const opacity = 0.1 + v * 0.09;
                return (
                  <div
                    key={`cell-${ti}-${di}`}
                    style={{
                      height: '22px',
                      borderRadius: '4px',
                      background: `rgba(91,91,214, ${opacity})`,
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                    title={`${time} ${heatmapDays[di]}: ${v * 10}% engagement`}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.15)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </>
    );
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
        :root { --bg:#F5F6FA; --surf:#fff; --surf2:#F8F9FD; --bdr:#E2E4F0; --bdr2:#ECEEF6; --t1:#0B0C1A; --t2:#3D3F60; --t3:#8486AB; --t4:#A0A2BF; --brand:#5B5BD6; --brand2:#7C3AED; --brand-l:#EEEEFF; --brand-l2:#DCDDF7; --gr:#10B981; --gr-l:#ECFDF5; --bl:#3B82F6; --or:#F97316; --or-l:#FFF7ED; --am:#F59E0B; --am-l:#FFF7E6; }
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
        .tb-ava { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--brand),#EC4899); color:#fff; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:800; }
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
        @media (max-width:1200px) { .analytics-grid-4 { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media (max-width:900px) { .analytics-grid { grid-template-columns:1fr; } }
        @media (max-width:640px) { .analytics-grid-4 { grid-template-columns:1fr; } #content { padding:14px; } }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Import the Sidebar component */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim((s) => !s)} activePath="/dashboards/analytics" />

      <div id="main" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <AdminHeader
          pageTitle="Analytics"
          onToggle={() => setSidebarSlim((s) => !s)}
          searchPlaceholder="Search analytics…"
          actionButton={
            <button
              onClick={exportReport}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, background: '#5B5BD6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Sora,sans-serif', boxShadow: '0 4px 20px rgba(91,91,214,.28)' }}
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

          {/* Range Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div className="range-tabs">
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
            <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
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

          {/* KPI Cards */}
          <div className="analytics-grid-4">
            <div className="kpi" style={{ animationDelay: '0.04s' }}>
              <div className="kpi-ico" style={{ background: 'var(--brand-l)' }}>
                <i className="fa-solid fa-eye" style={{ color: 'var(--brand)' }}></i>
              </div>
              <div className="kpi-label">Total Reach</div>
              <div className="kpi-val">2.84M</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-arrow-trend-up"></i> +18.4% vs last period
              </div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.08s' }}>
              <div className="kpi-ico" style={{ background: 'var(--gr-l)' }}>
                <i className="fa-solid fa-heart" style={{ color: 'var(--gr)' }}></i>
              </div>
              <div className="kpi-label">Engagements</div>
              <div className="kpi-val">142K</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-arrow-trend-up"></i> +24.1% vs last period
              </div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.12s' }}>
              <div className="kpi-ico" style={{ background: 'var(--or-l)' }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--or)' }}></i>
              </div>
              <div className="kpi-label">New Followers</div>
              <div className="kpi-val">+3,218</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-arrow-trend-up"></i> +31.6% vs last period
              </div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.16s' }}>
              <div className="kpi-ico" style={{ background: 'var(--am-l)' }}>
                <i className="fa-solid fa-percent" style={{ color: 'var(--am)' }}></i>
              </div>
              <div className="kpi-label">Avg Engagement Rate</div>
              <div className="kpi-val">4.7%</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-arrow-trend-up"></i> +0.8pp vs last period
              </div>
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
                <Line data={engagementData} options={chartOptions} height={180} />
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
                <Bar data={reachData} options={chartOptions} height={180} />
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
                  <div className="cc-sub">Net new followers per platform</div>
                </div>
              </div>
              <div className="cc-body">
                <Bar data={followerGrowthData} options={barChartOptions} height={200} />
              </div>
            </div>
          </div>

          {/* Top Posts + Audience */}
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

      </div>
    </>
  );
};

export default AnalyticsPage;