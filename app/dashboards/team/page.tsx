"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar'; // Import the sidebar component
import AdminHeader from '../AdminHeader';import { useSidebarState } from '@/hooks/useSidebarState';
// --- Types ---
interface Member {
  initials: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'approver' | 'viewer';
  brands: string;
  lastActive: string;
  grad: string;
}

interface Approval {
  id: number;
  emoji: string;
  caption: string;
  plat: string;
  platIcon: string;
  platColor: string;
  submitter: string;
  scheduledFor: string;
  urgent: boolean;
}

interface Activity {
  color: string;
  text: string;
  time: string;
}

// --- Data ---
const initialMembers: Member[] = [
  { initials: "JD", name: "Jordan Davis", email: "jordan@brandco.io", role: "admin", brands: "All", lastActive: "Active now", grad: "linear-gradient(135deg,#5B5BD6,#7C3AED)" },
  { initials: "SM", name: "Sarah Mitchell", email: "sarah@brandco.io", role: "editor", brands: "All", lastActive: "12 min ago", grad: "linear-gradient(135deg,#E1306C,#F58529)" },
  { initials: "CR", name: "Carlos Rivera", email: "carlos@brandco.io", role: "approver", brands: "BrandCo", lastActive: "1 hour ago", grad: "linear-gradient(135deg,#10B981,#059669)" },
  { initials: "NK", name: "Nina Kim", email: "nina@brandco.io", role: "editor", brands: "BrandCo", lastActive: "3 hours ago", grad: "linear-gradient(135deg,#F59E0B,#D97706)" },
  { initials: "AP", name: "Alex Patel", email: "alex@brandco.io", role: "viewer", brands: "BrandCo", lastActive: "Yesterday", grad: "linear-gradient(135deg,#06B6D4,#0891B2)" },
  { initials: "LW", name: "Lisa Wang", email: "lisa@brandco.io", role: "editor", brands: "BrandCo", lastActive: "2 days ago", grad: "linear-gradient(135deg,#8B5CF6,#6D28D9)" },
];

const initialApprovals: Approval[] = [
  { id: 0, emoji: "🚀", caption: "Introducing our Q2 product roadmap — here is everything we are building for you this quarter. Thread 🧵", plat: "LinkedIn", platIcon: "fa-linkedin", platColor: "#0A66C2", submitter: "Sarah Mitchell", scheduledFor: "Today 3:00 PM", urgent: true },
  { id: 1, emoji: "✨", caption: "5 content creation secrets that doubled our engagement rate in 30 days 📈 Save this for later!", plat: "Instagram", platIcon: "fa-instagram", platColor: "#E1306C", submitter: "Nina Kim", scheduledFor: "Today 6:00 PM", urgent: true },
  { id: 2, emoji: "💡", caption: "Controversial take: AI will replace 80% of social media content by 2027. Here is why that is actually good news.", plat: "Twitter/X", platIcon: "fa-x-twitter", platColor: "#111", submitter: "Carlos Rivera", scheduledFor: "Tomorrow 9:00 AM", urgent: false },
  { id: 3, emoji: "🎯", caption: "Client case study: How @techstartup went from 500 to 50,000 followers in 90 days using our framework.", plat: "LinkedIn", platIcon: "fa-linkedin", platColor: "#0A66C2", submitter: "Sarah Mitchell", scheduledFor: "Tomorrow 2:00 PM", urgent: false },
  { id: 4, emoji: "🧵", caption: "Thread: The 7 biggest social media mistakes brands make (and how to fix them). A thread worth saving. 🔖", plat: "Threads", platIcon: "fa-threads", platColor: "#000000", submitter: "Alex Chen", scheduledFor: "Tomorrow 4:00 PM", urgent: false },
  { id: 5, emoji: "🎵", caption: "POV: Your social media is on autopilot while you sleep — TikTok growth hack that actually works 🚀", plat: "TikTok", platIcon: "fa-tiktok", platColor: "#111111", submitter: "Jordan Lee", scheduledFor: "Friday 8:00 PM", urgent: false },
  { id: 6, emoji: "📣", caption: "Exciting news! We're expanding our services — follow our Facebook Page for the full announcement.", plat: "Facebook", platIcon: "fa-facebook", platColor: "#1877F2", submitter: "Mike Torres", scheduledFor: "Saturday 9:00 AM", urgent: false },
  { id: 7, emoji: "▶️", caption: "How we grew from 0 to 100K subscribers in 12 months — Full breakdown with strategies, tools and mistakes.", plat: "YouTube", platIcon: "fa-youtube", platColor: "#FF0000", submitter: "Nina Kim", scheduledFor: "Friday 10:00 AM", urgent: false },
];

const initialActivities: Activity[] = [
  { color: "var(--gr)", text: "<strong>Sarah Mitchell</strong> submitted 3 posts for approval", time: "8 min ago" },
  { color: "var(--brand)", text: "<strong>Jordan Davis</strong> approved 2 posts for LinkedIn", time: "22 min ago" },
  { color: "var(--am)", text: "<strong>Carlos Rivera</strong> requested edits on Instagram post", time: "1 hour ago" },
  { color: "var(--rd)", text: "<strong>Nina Kim</strong> rejected scheduled post — brand voice mismatch", time: "2 hours ago" },
  { color: "var(--gr)", text: "<strong>Jordan Davis</strong> approved batch of 5 posts for TikTok", time: "3 hours ago" },
  { color: "var(--bl)", text: "<strong>Lisa Wang</strong> was added to BrandCo workspace as Editor", time: "5 hours ago" },
  { color: "var(--brand)", text: "<strong>Alex Patel</strong> viewed analytics dashboard", time: "8 hours ago" },
];

// --- Utility Functions ---
const showToast = (msg: string, type: 'default' | 'green' | 'red' | 'brand' | 'amber' = 'default') => {
  const event = new CustomEvent('show-toast', { detail: { msg, type } });
  window.dispatchEvent(event);
};

// --- Main Component ---
const TeamPage: React.FC = () => {
  const { sidebarSlim, setSidebarSlim } = useSidebarState();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [activities] = useState<Activity[]>(initialActivities);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Handlers
  const updateMemberRole = (email: string, newRole: Member['role']) => {
    setMembers(prev =>
      prev.map(m =>
        m.email === email ? { ...m, role: newRole } : m
      )
    );
    const member = members.find(m => m.email === email);
    showToast(`${member?.name} role updated to ${newRole}`, 'green');
  };

  const removeMember = (email: string) => {
    setMembers(prev => prev.filter(m => m.email !== email));
    const member = members.find(m => m.email === email);
    showToast(`${member?.name} removed from workspace`, 'amber');
  };

  const approveItem = (id: number) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    showToast('Post approved and scheduled!', 'green');
  };

  const rejectItem = (id: number) => {
    setApprovals(prev => prev.filter(a => a.id !== id));
    showToast('Post rejected — author notified', 'amber');
  };

  const approveAll = () => {
    setApprovals([]);
    showToast('All posts approved and scheduled!', 'green');
  };

  const openInviteModal = () => {
    if (modalContentRef.current) {
      modalContentRef.current.innerHTML = `
        <div class="m-hdr"><div class="m-ico" style="background:var(--brand-l)"><i class="fa-solid fa-user-plus" style="color:var(--brand);font-size:17px"></i></div><div><div class="m-title">Invite Team Member</div><div class="m-sub">They will receive an email invitation</div></div></div>
        <div class="m-body">
          <label class="m-label">Email Address</label>
          <input class="m-field" type="email" id="inv-email" placeholder="colleague@company.com">
          <label class="m-label">Role</label>
          <select class="m-field" id="inv-role" style="cursor:pointer">
            <option value="editor">Editor — Create and submit content</option>
            <option value="approver">Approver — Review and approve content</option>
            <option value="viewer">Viewer — View reports and analytics only</option>
          </select>
          <div class="info-box brand"><i class="fa-solid fa-circle-info" style="color:var(--brand)"></i><div class="info-text">They will be added to your BrandCo workspace. You have <strong>2 seats remaining</strong> on your Business plan.</div></div>
        </div>
        <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn confirm" onclick="window.dispatchEvent(new CustomEvent('send-invite'))"><i class="fa-solid fa-paper-plane" style="margin-right:5px"></i>Send Invite</button></div>`;
    }
    openModal();
  };

  const sendInvite = () => {
    const emailInput = document.getElementById('inv-email') as HTMLInputElement;
    const email = emailInput?.value;
    if (!email) {
      showToast('Please enter an email', 'amber');
      return;
    }
    closeModal();
    showToast(`Invitation sent to ${email}`, 'green');
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

  const handleModalClick = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  // Render functions
  const renderMembers = () => {
    return members.map((member, idx) => {
      const isSelf = member.email === 'jordan@brandco.io';
      return (
        <div key={idx} className="mt-row">
          <div className="member-cell">
            <div className="m-ava" style={{ background: member.grad }}>
              {member.initials}
            </div>
            <div>
              <div className="m-name">
                {member.name}
                {isSelf && (
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '1px 6px', borderRadius: '8px', background: 'var(--brand-l)', color: 'var(--brand)', marginLeft: '4px' }}>
                    You
                  </span>
                )}
              </div>
              <div className="m-email">{member.email}</div>
            </div>
          </div>
          <div>
            {isSelf ? (
              <span className="badge brand">Admin</span>
            ) : (
              <select
                className="role-select"
                value={member.role}
                onChange={(e) => updateMemberRole(member.email, e.target.value as Member['role'])}
              >
                <option value="admin">Admin</option>
                <option value="approver">Approver</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            )}
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--t2)' }}>{member.brands}</div>
          <div style={{ fontSize: '12px', color: 'var(--t3)', fontFamily: "'JetBrains Mono', monospace" }}>
            {member.lastActive}
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {!isSelf ? (
              <>
                <button
                  className="btn ghost btn-sm"
                  onClick={() => showToast(`Viewing ${member.name} activity`, 'brand')}
                >
                  <i className="fa-solid fa-eye" style={{ fontSize: '10px' }}></i>
                </button>
                <button
                  className="btn ghost btn-sm"
                  style={{ color: 'var(--rd)', borderColor: 'rgba(239,68,68,.3)' }}
                  onClick={() => removeMember(member.email)}
                >
                  <i className="fa-solid fa-trash" style={{ fontSize: '10px' }}></i>
                </button>
              </>
            ) : (
              <span style={{ fontSize: '11px', color: 'var(--t4)' }}>—</span>
            )}
          </div>
        </div>
      );
    });
  };

  const renderApprovals = () => {
    if (approvals.length === 0) {
      return (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--t3)' }}>
          <i className="fa-solid fa-check-circle" style={{ fontSize: '32px', marginBottom: '12px', color: 'var(--gr)' }}></i>
          <div>All caught up! No pending approvals.</div>
        </div>
      );
    }

    return approvals.map((approval) => (
      <div key={approval.id} className="approval-item">
        <div className="ai-thumb">{approval.emoji}</div>
        <div className="ai-info">
          <div className="ai-caption">{approval.caption}</div>
          <div className="ai-meta">
            <i className={`fa-brands ${approval.platIcon}`} style={{ color: approval.platColor }}></i>
            {approval.plat}
            <span>·</span>By {approval.submitter}
            {approval.urgent && (
              <span className="badge amber" style={{ padding: '1px 6px', fontSize: '10px' }}>
                ⚡ Urgent
              </span>
            )}
          </div>
          <div className="ai-meta">
            <i className="fa-regular fa-clock"></i>{approval.scheduledFor}
          </div>
          <div className="ai-actions">
            <button className="approve-btn" onClick={() => approveItem(approval.id)}>
              <i className="fa-solid fa-check" style={{ fontSize: '10px' }}></i> Approve
            </button>
            <button className="review-btn" onClick={() => showToast('Opening post editor', 'brand')}>
              <i className="fa-solid fa-eye" style={{ fontSize: '10px' }}></i> Review
            </button>
            <button className="reject-btn" onClick={() => rejectItem(approval.id)}>
              Reject
            </button>
          </div>
        </div>
      </div>
    ));
  };

  const renderActivities = () => {
    return activities.map((activity, idx) => (
      <div key={idx} className="activity-item">
        <div className="act-dot" style={{ background: activity.color }}></div>
        <div>
          <div className="act-text" dangerouslySetInnerHTML={{ __html: activity.text }} />
          <div className="act-time">{activity.time}</div>
        </div>
      </div>
    ));
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

    const handleCloseModal = () => closeModal();
    const handleSendInvite = () => sendInvite();

    window.addEventListener('show-toast', handleShowToast as EventListener);
    window.addEventListener('close-modal', handleCloseModal);
    window.addEventListener('send-invite', handleSendInvite);

    return () => {
      window.removeEventListener('show-toast', handleShowToast as EventListener);
      window.removeEventListener('close-modal', handleCloseModal);
      window.removeEventListener('send-invite', handleSendInvite);
    };
  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <style>{`
        :root { --bg:#F5F6FA; --surf:#fff; --surf2:#F8F9FD; --bdr:#E2E4F0; --bdr2:#ECEEF6; --t1:#0B0C1A; --t2:#3D3F60; --t3:#8486AB; --t4:#A0A2BF; --brand:#5B5BD6; --brand2:#7C3AED; --brand-l:#EEEEFF; --brand-l2:#DCDDF7; --gr:#10B981; --gr-l:#ECFDF5; --am:#F59E0B; --am-l:#FFF7E6; --rd:#EF4444; --rd-l:#FEF2F2; --bl:#3B82F6; --bl-l:#EFF6FF; }
        #main { min-width:0; background:var(--bg); color:var(--t1); }
        #topbar { height:56px; display:flex; align-items:center; gap:10px; padding:0 20px; background:#fff; border-bottom:1px solid var(--bdr); box-shadow:0 1px 4px rgba(11,12,26,.06); }
        #content { height:calc(100vh - 56px); overflow:auto; padding:18px 20px 24px; }
        .tb-bc { font-size:12px; color:var(--t3); display:flex; align-items:center; gap:6px; }
        .tb-bc a { color:var(--t3); text-decoration:none; }
        .tb-bc .cur { color:var(--t1); font-weight:700; font-family:'Sora',sans-serif; }
        .tb-flex { flex:1; }
        .tb-btn, .btn { display:inline-flex; align-items:center; gap:6px; border-radius:8px; border:1px solid var(--bdr); background:#fff; color:var(--t2); font-weight:700; cursor:pointer; }
        .tb-btn { padding:8px 12px; font-size:12px; }
        .tb-btn.solid { background:var(--brand); border-color:var(--brand); color:#fff; }
        .tb-icon { width:30px; height:30px; border-radius:7px; border:1px solid var(--bdr2); display:flex; align-items:center; justify-content:center; position:relative; color:var(--t2); }
        .tb-dot { position:absolute; top:5px; right:5px; width:7px; height:7px; border-radius:50%; background:#EF4444; border:1.5px solid #fff; }
        .tb-ava { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--brand),#EC4899); color:#fff; display:flex; align-items:center; justify-content:center; font-size:10.5px; font-weight:800; }
        .page-hdr { margin-bottom:14px; }
        .page-eye { display:inline-flex; align-items:center; gap:7px; font-size:11px; font-weight:700; color:var(--gr); }
        .page-eye-dot { width:8px; height:8px; border-radius:50%; background:var(--gr); }
        .page-title { margin-top:7px; font-size:22px; font-weight:900; font-family:'Sora',sans-serif; }
        .page-sub { margin-top:5px; color:var(--t3); font-size:13px; }
        .kpi { background:#fff; border:1px solid var(--bdr); border-radius:12px; box-shadow:0 1px 4px rgba(11,12,26,.06); padding:12px; }
        .kpi-ico { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; margin-bottom:8px; }
        .kpi-label { font-size:12px; color:var(--t3); }
        .kpi-val { margin-top:4px; font-size:24px; font-weight:900; color:var(--t1); font-family:'Sora',sans-serif; }
        .kpi-delta { margin-top:4px; font-size:11px; font-weight:700; }
        .kpi-delta.up { color:var(--gr); } .kpi-delta.dn { color:var(--am); }
        .team-layout { display:grid; grid-template-columns:minmax(0,1.45fr) minmax(0,1fr); gap:14px; }
        .card { background:#fff; border:1px solid var(--bdr); border-radius:12px; box-shadow:0 1px 4px rgba(11,12,26,.06); overflow:hidden; }
        .card-hdr { padding:12px 14px; border-bottom:1px solid var(--bdr2); display:flex; align-items:flex-start; justify-content:space-between; gap:10px; }
        .card-title { font-size:14px; font-weight:800; color:var(--t1); display:flex; align-items:center; gap:7px; font-family:'Sora',sans-serif; }
        .card-sub { margin-top:4px; color:var(--t3); font-size:12px; }
        .btn { padding:6px 10px; font-size:12px; }
        .btn-sm { padding:5px 9px; font-size:11.5px; }
        .badge { border-radius:999px; padding:3px 8px; font-size:10px; font-weight:700; }
        .badge.brand { background:var(--brand-l); color:var(--brand); }
        .badge.amber { background:var(--am-l); color:#B45309; }
        .mt-hdr, .mt-row { display:grid; grid-template-columns:2.1fr 1fr .8fr .9fr 1.2fr; gap:10px; align-items:center; }
        .mt-hdr { padding:10px 14px; font-size:10px; color:var(--t4); font-weight:800; text-transform:uppercase; letter-spacing:.45px; border-bottom:1px solid var(--bdr2); }
        .mt-row { padding:10px 14px; border-bottom:1px solid var(--bdr2); }
        .member-cell { display:flex; align-items:center; gap:10px; min-width:0; }
        .m-ava { width:34px; height:34px; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:11px; font-weight:800; flex-shrink:0; }
        .m-name { font-size:12.5px; font-weight:700; color:var(--t2); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .m-email { margin-top:2px; font-size:11px; color:var(--t4); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .role-select { width:100%; padding:7px 8px; border-radius:8px; border:1px solid var(--bdr); background:var(--surf2); font-size:12px; color:var(--t2); }
        .perm-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
        .perm-box { border:1px solid var(--bdr2); border-radius:10px; background:var(--surf2); padding:10px; }
        .perm-icon { font-size:18px; margin-bottom:6px; }
        .perm-name { font-size:12px; font-weight:800; color:var(--t2); }
        .perm-can { margin-top:3px; font-size:11px; color:var(--t3); line-height:1.45; }
        .approval-item { display:flex; gap:10px; padding:10px 14px; border-bottom:1px solid var(--bdr2); }
        .ai-thumb { width:36px; height:36px; border-radius:9px; background:#EEF0F8; color:#4B4D6B; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0; }
        .ai-info { flex:1; min-width:0; }
        .ai-caption { font-size:12px; color:var(--t2); line-height:1.45; }
        .ai-meta { margin-top:5px; display:flex; align-items:center; gap:8px; font-size:10.5px; color:var(--t4); flex-wrap:wrap; }
        .ai-actions { margin-top:8px; display:flex; gap:6px; }
        .approve-btn, .review-btn, .reject-btn { border-radius:8px; border:1px solid var(--bdr); padding:5px 8px; font-size:11px; font-weight:700; cursor:pointer; }
        .approve-btn { background:var(--gr-l); color:var(--gr); border-color:rgba(16,185,129,.28); }
        .review-btn { background:var(--brand-l); color:var(--brand); border-color:rgba(91,91,214,.26); }
        .reject-btn { background:var(--rd-l); color:var(--rd); border-color:rgba(239,68,68,.26); }
        .activity-item { display:flex; align-items:flex-start; gap:9px; padding:10px 0; border-bottom:1px solid var(--bdr2); }
        .act-dot { width:8px; height:8px; border-radius:50%; margin-top:6px; flex-shrink:0; }
        .act-text { font-size:12px; color:var(--t2); line-height:1.45; }
        .act-time { margin-top:3px; font-size:10.5px; color:var(--t4); }
        #modal-bg { position:fixed; inset:0; background:rgba(11,12,26,.45); backdrop-filter:blur(2px); display:none; align-items:center; justify-content:center; z-index:70; }
        #modal-bg.open { display:flex; }
        .mbox { width:min(560px,92vw); max-height:90vh; overflow:auto; border-radius:14px; background:#fff; border:1px solid var(--bdr); box-shadow:0 20px 60px rgba(11,12,26,.25); }
        #toast-stack { position:fixed; top:18px; right:18px; z-index:80; display:flex; flex-direction:column; gap:8px; }
        .toast { min-width:260px; max-width:360px; display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; background:#fff; border:1px solid var(--bdr); box-shadow:0 8px 26px rgba(11,12,26,.12); }
        .toast .t-x { cursor:pointer; color:var(--t4); font-weight:700; }
        @media (max-width:1200px){ .mt-hdr, .mt-row { grid-template-columns:1.8fr .9fr .8fr .9fr 1.2fr; } }
        @media (max-width:980px){ .team-layout { grid-template-columns:1fr; } }
        @media (max-width:760px){ #content { padding:14px; } .mt-hdr { display:none; } .mt-row { grid-template-columns:1fr; gap:8px; } }
      `}</style>

      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        {/* Import the Sidebar component */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim((s) => !s)} activePath="/dashboards/team" />

      <div id="main" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <AdminHeader
          pageTitle="Team & Approvals"
          slim={sidebarSlim}
          onToggle={() => setSidebarSlim((s) => !s)}
          searchPlaceholder="Search team, approvals…"
          actionButton={
            <button
              onClick={openInviteModal}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 7, background: '#5B5BD6', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: 'Sora,sans-serif', boxShadow: '0 4px 20px rgba(91,91,214,.28)' }}
            >
              <i className="fa-solid fa-user-plus" style={{ fontSize: '11px' }} /> Invite Member
            </button>
          }
        />

        <div id="content">
          <div className="page-hdr">
            <div className="page-eye">
              <div className="page-eye-dot"></div> Manage
            </div>
            <div className="page-title">Team &amp; Approvals</div>
            <div className="page-sub">Manage team members, set roles and permissions, and review content approval queues.</div>
          </div>

          {/* KPI Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '22px' }}>
            <div className="kpi" style={{ animationDelay: '0.04s' }}>
              <div className="kpi-ico" style={{ background: 'var(--brand-l)' }}>
                <i className="fa-solid fa-users" style={{ color: 'var(--brand)' }}></i>
              </div>
              <div className="kpi-label">Team Members</div>
              <div className="kpi-val">{members.length}</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-plus"></i> 2 active slots remaining
              </div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.08s' }}>
              <div className="kpi-ico" style={{ background: 'var(--am-l)' }}>
                <i className="fa-solid fa-clock" style={{ color: 'var(--am)' }}></i>
              </div>
              <div className="kpi-label">Pending Approval</div>
              <div className="kpi-val">{approvals.length}</div>
              <div className="kpi-delta dn">
                <i className="fa-solid fa-triangle-exclamation"></i> {approvals.length} post{approvals.length !== 1 ? 's' : ''} waiting
              </div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.12s' }}>
              <div className="kpi-ico" style={{ background: 'var(--gr-l)' }}>
                <i className="fa-solid fa-check-double" style={{ color: 'var(--gr)' }}></i>
              </div>
              <div className="kpi-label">Approved This Week</div>
              <div className="kpi-val">24</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-arrow-trend-up"></i> +8 vs last week
              </div>
            </div>
            <div className="kpi" style={{ animationDelay: '0.16s' }}>
              <div className="kpi-ico" style={{ background: 'var(--bl-l)' }}>
                <i className="fa-solid fa-stopwatch" style={{ color: 'var(--bl)' }}></i>
              </div>
              <div className="kpi-label">Avg Approval Time</div>
              <div className="kpi-val">1.4h</div>
              <div className="kpi-delta up">
                <i className="fa-solid fa-arrow-trend-down"></i> 22min faster
              </div>
            </div>
          </div>

          <div className="team-layout">
            {/* Left Column */}
            <div>
              {/* Team Members */}
              <div className="card" style={{ marginBottom: '16px', animation: 'cardIn .35s ease both' }}>
                <div className="card-hdr">
                  <div>
                    <div className="card-title">
                      <i className="fa-solid fa-users"></i>Team Members
                    </div>
                    <div className="card-sub">Manage roles and access permissions for your workspace</div>
                  </div>
                  <button className="btn ghost btn-sm" onClick={openInviteModal}>
                    <i className="fa-solid fa-user-plus" style={{ fontSize: '10px' }}></i> Invite
                  </button>
                </div>
                <div>
                  <div className="mt-hdr">
                    <div>Member</div>
                    <div>Role</div>
                    <div>Brands</div>
                    <div>Last Active</div>
                    <div>Actions</div>
                  </div>
                  {renderMembers()}
                </div>
              </div>

              {/* Role Permissions */}
              <div className="card" style={{ animation: 'cardIn .35s ease both', animationDelay: '0.1s' }}>
                <div className="card-hdr">
                  <div>
                    <div className="card-title">
                      <i className="fa-solid fa-shield-halved"></i>Role Permissions
                    </div>
                    <div className="card-sub">What each role can and cannot do</div>
                  </div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div className="perm-grid">
                    <div className="perm-box" style={{ borderColor: 'var(--brand-l2)' }}>
                      <div className="perm-icon">👑</div>
                      <div className="perm-name">Admin</div>
                      <div className="perm-can">Full access · Billing · Team management</div>
                    </div>
                    <div className="perm-box">
                      <div className="perm-icon">✏️</div>
                      <div className="perm-name">Editor</div>
                      <div className="perm-can">Create · Edit · Submit for approval</div>
                    </div>
                    <div className="perm-box">
                      <div className="perm-icon">✅</div>
                      <div className="perm-name">Approver</div>
                      <div className="perm-can">Review · Approve · Reject content</div>
                    </div>
                    <div className="perm-box">
                      <div className="perm-icon">👁️</div>
                      <div className="perm-name">Viewer</div>
                      <div className="perm-can">View analytics and published posts only</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Approval Queue */}
              <div className="card" style={{ animation: 'cardIn .35s ease both', animationDelay: '0.06s' }}>
                <div className="card-hdr">
                  <div>
                    <div className="card-title">
                      <i className="fa-solid fa-clipboard-check"></i>Approval Queue
                    </div>
                    <div className="card-sub">Posts awaiting your review</div>
                  </div>
                  <span className="badge amber">{approvals.length} pending</span>
                </div>
                <div id="approvalQueue">
                  {renderApprovals()}
                </div>
                {approvals.length > 0 && (
                  <div style={{ padding: '10px 16px', borderTop: '1px solid var(--bdr2)', display: 'flex', gap: '6px' }}>
                    <button
                      className="btn ghost btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={approveAll}
                    >
                      <i className="fa-solid fa-check-double" style={{ fontSize: '10px' }}></i> Approve All
                    </button>
                    <button
                      className="btn ghost btn-sm"
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => showToast('Viewing full queue', 'brand')}
                    >
                      <i className="fa-solid fa-list" style={{ fontSize: '10px' }}></i> View All
                    </button>
                  </div>
                )}
              </div>

              {/* Activity Log */}
              <div className="card" style={{ animation: 'cardIn .35s ease both', animationDelay: '0.12s' }}>
                <div className="card-hdr">
                  <div>
                    <div className="card-title">
                      <i className="fa-solid fa-clock-rotate-left"></i>Recent Activity
                    </div>
                    <div className="card-sub">Team actions in the last 24 hours</div>
                  </div>
                </div>
                <div style={{ padding: '12px 18px' }}>
                  {renderActivities()}
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

export default TeamPage;