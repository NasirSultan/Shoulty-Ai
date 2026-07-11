"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminHeader from '../AdminHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { fetchProfile, setAccountPassword, setUserProfile } from '@/api/authApi';
import { API_BASE_URL } from '@/api/configApi';

// --- Types ---
interface NotificationItem {
  name: string;
  sub: string;
}

interface NotifState {
  [key: number]: boolean;
}

interface SubIndustry {
  id: string;
  name: string;
}

interface Industry {
  id: string;
  name: string;
  subIndustries: SubIndustry[];
}

// --- Data ---
const NAV_GROUPS: Array<{ label: string; items: Array<{ id: string; label: string; icon: string; danger?: boolean }> }> = [
  {
    label: 'Workspace',
    items: [
      { id: 'profile', label: 'Profile', icon: 'fa-user' },
      { id: 'notif', label: 'Notifications', icon: 'fa-bell' },
      { id: 'appearance', label: 'Appearance', icon: 'fa-palette' },
    ],
  },
  {
    label: 'Organization',
    items: [
      { id: 'industry', label: 'Industry', icon: 'fa-industry' },
      { id: 'security', label: 'Security', icon: 'fa-shield-halved' },
      { id: 'danger', label: 'Danger Zone', icon: 'fa-triangle-exclamation', danger: true },
    ],
  },
];

const NOTIFS: NotificationItem[] = [
  { name: 'Post Published', sub: 'When a scheduled post goes live successfully' },
  { name: 'Post Failed', sub: 'When a post fails to publish on a platform' },
  { name: 'Weekly Performance Report', sub: 'Your weekly analytics summary every Monday' },
  { name: 'Billing & Invoices', sub: 'Subscription renewals and payment receipts' },
];

// --- Utility Functions ---
const showToast = (msg: string, type: 'default' | 'green' | 'red' | 'brand' | 'amber' = 'default') => {
  const icons: Record<string, string> = { default: '🔔', green: '✅', red: '🗑️', brand: '✦', amber: '⚠️' };
  let stack = document.getElementById('toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.id = 'toast-stack';
    document.body.appendChild(stack);
  }

  // Keep toast stack above all page layers and below the top header area.
  stack.style.position = 'fixed';
  stack.style.top = '84px';
  stack.style.right = '18px';
  stack.style.zIndex = '99999';
  stack.style.display = 'flex';
  stack.style.flexDirection = 'column';
  stack.style.gap = '8px';

  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span style="font-size:15px;flex-shrink:0">${icons[type] || '🔔'}</span><span style="flex:1;font-weight:800;letter-spacing:.1px">${msg}</span><span class="t-x" onclick="this.parentElement.remove()">✕</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'all .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateX(110%)';
    setTimeout(() => el.remove(), 300);
  }, 4000);
};

const ALLOWED_CONNECTED_SOCIALS = new Set([
  'INSTAGRAM',
  'FACEBOOK',
  'LINKEDIN',
  'TWITTER',
  'YOUTUBE',
]);

const pickStringField = (
  obj: Record<string, unknown> | null | undefined,
  keys: string[]
): string => {
  if (!obj) return '';
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return '';
};

// --- Main Component ---
const SettingsPage: React.FC = () => {
  // State
  const [notifState, setNotifState] = useState<NotifState>(() => {
    const init: NotifState = {};
    NOTIFS.forEach((_, i) => {
      init[i] = i !== 0;
    });
    return init;
  });
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    displayName: '',
    email: '',
    jobTitle: '',
    timezone: 'America/New_York (EST, UTC-5)',
    language: 'English (US)',
  });
  const [passwordFields, setPasswordFields] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const [passwordMatch, setPasswordMatch] = useState({ match: true, hint: '' });
  const [toggles, setToggles] = useState({
    twoFA: true,
    loginAlerts: true,
    reauth: false,
    animations: true,
    compact: false,
    scores: true,
  });
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [industries, setIndustries] = useState<Industry[]>([]);
  const [industriesLoading, setIndustriesLoading] = useState(false);
  const [industrySearch, setIndustrySearch] = useState('');
  const [expandedIndustryId, setExpandedIndustryId] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<{ id: string; name: string } | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<{ id: string; name: string } | null>(null);
  const [industryViewMode, setIndustryViewMode] = useState(false);

  // Load real user profile
  const { user, initials } = useUserProfile();
  const profileUserId = pickStringField(
    (user ?? null) as Record<string, unknown> | null,
    ['id', '_id', 'userId']
  );
  const profileRole =
    (typeof (user as Record<string, unknown> | null)?.role === 'string'
      ? ((user as Record<string, unknown>).role as string)
      : 'Member') || 'Member';
  const profilePlan =
    (typeof (user as Record<string, unknown> | null)?.plan === 'string'
      ? ((user as Record<string, unknown>).plan as string)
      : 'Business Plan') || 'Business Plan';
  const profileName = profileData.fullName || user?.name || 'User';
  const profileInitials = (profileName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('')) || initials || 'U';

  useEffect(() => {
    if (!user) return;
    setProfileData((prev) => ({
      ...prev,
      fullName: user.name || prev.fullName,
      displayName: user.name ? user.name.toLowerCase().replace(/\s+/g, '') : prev.displayName,
      email: user.email || prev.email,
    }));

    const backendAvatar =
      typeof (user as Record<string, unknown>).profilePicture === 'string'
        ? ((user as Record<string, unknown>).profilePicture as string)
        : '';
    setAvatarUrl(backendAvatar || '');
  }, [user]);

  const authToken = () => (typeof window !== 'undefined' ? localStorage.getItem('shoutly_token') ?? '' : '');

  // Fetch industry list + user's current selection when section opens
  useEffect(() => {
    if (activeSection !== 'industry') return;

    // Fetch all industries (only once)
    if (industries.length === 0) {
      setIndustriesLoading(true);
      fetch(`${API_BASE_URL}/api/industries/with-subindustries`)
        .then(r => r.json())
        .then(data => setIndustries(Array.isArray(data) ? data : (data?.data ?? [])))
        .catch(() => {})
        .finally(() => setIndustriesLoading(false));
    }

    // Fetch user's saved selection from API
    const token = authToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/api/users/me/industry-selection`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) { window.location.href = '/sign-in'; return null; }
        return r.ok ? r.json() : null;
      })
      .then(data => {
        if (!data) return;
        if (data.industry) setSelectedIndustry({ id: data.industry.id, name: data.industry.name });
        if (data.subIndustry) {
          setSelectedSubIndustry({ id: data.subIndustry.id, name: data.subIndustry.name });
          setIndustryViewMode(true);
        }
      })
      .catch(() => {});
  }, [activeSection]);

  // Refs for modal
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  const handleProfileChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof typeof passwordFields, value: string) => {
    setPasswordFields(prev => ({ ...prev, [field]: value }));
    if (field === 'new') {
      checkStrength(value);
      if (passwordFields.confirm) checkMatch(value, passwordFields.confirm);
    }
    if (field === 'confirm') {
      checkMatch(passwordFields.new, value);
    }
  };

  const checkStrength = (pwd: string) => {
    if (!pwd) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }
    let sc = 0;
    if (pwd.length >= 8) sc++;
    if (pwd.length >= 12) sc++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) sc++;
    if (/\d/.test(pwd)) sc++;
    if (/[^A-Za-z0-9]/.test(pwd)) sc++;
    const s = Math.min(4, Math.max(1, Math.ceil(sc * 4 / 5)));
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong 💪'];
    const colors = ['', 'var(--rd)', 'var(--am)', 'var(--bl)', 'var(--gr)'];
    setPasswordStrength({ score: s, label: labels[s], color: colors[s] });
  };

  const checkMatch = (newPwd: string, confirmPwd: string) => {
    if (!confirmPwd) {
      setPasswordMatch({ match: true, hint: '' });
      return;
    }
    if (newPwd === confirmPwd) {
      setPasswordMatch({ match: true, hint: '✓ Passwords match' });
    } else {
      setPasswordMatch({ match: false, hint: '✗ Passwords do not match' });
    }
  };

  const toggleSwitch = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Preference saved', 'brand');
  };

  const flipNotif = (index: number) => {
    setNotifState(prev => ({ ...prev, [index]: !prev[index] }));
    showToast('Notification preference updated', 'brand');
  };

  const togglePwVisibility = (id: string, event: React.MouseEvent) => {
    const input = document.getElementById(id) as HTMLInputElement;
    if (!input) return;
    const iconSpan = event.currentTarget as HTMLElement;
    const vis = input.type === 'text';
    input.type = vis ? 'password' : 'text';
    iconSpan.innerHTML = vis ? '<i class="fa-solid fa-eye"></i>' : '<i class="fa-solid fa-eye-slash"></i>';
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const raw = localStorage.getItem('shoutly_user');
      const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const connectedSocialsFromStore = Array.isArray(existing.connectedSocials)
        ? (existing.connectedSocials as unknown[])
            .map((s) => (typeof s === 'string' ? s.toUpperCase() : ''))
            .filter((s) => Boolean(s) && ALLOWED_CONNECTED_SOCIALS.has(s))
        : [];
      const connectedSocials = Array.from(new Set(connectedSocialsFromStore));

      const emailToSave =
        profileData.email ||
        (typeof existing.email === 'string' ? existing.email : '');
      if (!emailToSave) {
        showToast('Email is missing for avatar update', 'red');
        return;
      }

      const brandName =
        (typeof existing.brandName === 'string' && existing.brandName.trim())
          ? existing.brandName.trim()
          : 'Shoutly User';
      const website =
        (typeof existing.website === 'string' && existing.website.trim())
          ? existing.website.trim()
          : 'https://shoutlyai.com';
      const phone = typeof existing.phone === 'string' ? existing.phone : '';

      const backendResponse = await setUserProfile({
        email: emailToSave,
        brandName,
        website,
        phone,
        connectedSocials,
        brandLogo: file,
      });

      const backendUser =
        (backendResponse && typeof backendResponse === 'object' && 'user' in (backendResponse as Record<string, unknown>))
          ? ((backendResponse as { user?: Record<string, unknown> }).user || {})
          : ((backendResponse as Record<string, unknown>) || {});

      const merged = {
        ...existing,
        ...backendUser,
        profilePicture:
          (typeof backendUser.profilePicture === 'string' && backendUser.profilePicture) ||
          URL.createObjectURL(file),
      };

      localStorage.setItem('shoutly_user', JSON.stringify(merged));
      window.dispatchEvent(new Event('auth-changed'));
      setAvatarUrl(String(merged.profilePicture || ''));
      showToast('Profile photo updated!', 'green');
    } catch (error: unknown) {
      const errObj = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      showToast(errObj?.response?.data?.message || errObj?.message || 'Failed to update profile photo', 'red');
    }
  };

  const handleRemoveAvatar = () => {
    try {
      const raw = localStorage.getItem('shoutly_user');
      const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const merged = {
        ...existing,
        profilePicture: '',
      };
      localStorage.setItem('shoutly_user', JSON.stringify(merged));
      window.dispatchEvent(new Event('auth-changed'));
      setAvatarUrl('');
      showToast('Profile photo removed', 'brand');
    } catch {
      showToast('Failed to remove profile photo', 'red');
    }
  };

  const refreshProfileFromBackend = async () => {
    try {
      const fresh = await fetchProfile();
      const backendUser =
        (fresh && typeof fresh === 'object' && 'user' in (fresh as Record<string, unknown>))
          ? ((fresh as { user?: Record<string, unknown> }).user || {})
          : ((fresh as Record<string, unknown>) || {});

      const raw = localStorage.getItem('shoutly_user');
      const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const merged = { ...existing, ...backendUser };
      localStorage.setItem('shoutly_user', JSON.stringify(merged));
      window.dispatchEvent(new Event('auth-changed'));

      setProfileData((prev) => ({
        ...prev,
        fullName:
          pickStringField(merged, ['name']) ||
          pickStringField(existing, ['name']) ||
          prev.fullName,
        displayName:
          pickStringField(merged, ['name'])
            ? pickStringField(merged, ['name']).toLowerCase().replace(/\s+/g, '')
            : prev.displayName,
        email:
          pickStringField(merged, ['email']) ||
          pickStringField(existing, ['email']) ||
          prev.email,
      }));
    } catch {
      // Keep current UI state if backend refresh fails.
    }
  };

  const saveSection = async (name: string, options?: { silentSuccess?: boolean }) => {
    if (name === 'Profile') {
      try {
        const raw = localStorage.getItem('shoutly_user');
        const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};

        const connectedSocialsFromStore = Array.isArray(existing.connectedSocials)
          ? (existing.connectedSocials as unknown[])
              .map((s) => (typeof s === 'string' ? s.toUpperCase() : ''))
              .filter((s) => Boolean(s) && ALLOWED_CONNECTED_SOCIALS.has(s))
          : [];
        const connectedSocials = Array.from(new Set(connectedSocialsFromStore));

        const emailToSave =
          profileData.email ||
          (typeof existing.email === 'string' ? existing.email : '');

        if (!emailToSave) {
          showToast('Email is missing for profile update', 'red');
          return;
        }

        const brandName =
          (typeof existing.brandName === 'string' && existing.brandName.trim())
            ? existing.brandName.trim()
            : 'Shoutly User';
        const website =
          (typeof existing.website === 'string' && existing.website.trim())
            ? existing.website.trim()
            : 'https://shoutlyai.com';
        const phone =
          typeof existing.phone === 'string'
            ? existing.phone
            : '';

        const backendResponse = await setUserProfile({
          email: emailToSave,
          brandName,
          website,
          phone,
          connectedSocials,
        });

        const backendUser =
          (backendResponse && typeof backendResponse === 'object' && 'user' in (backendResponse as Record<string, unknown>))
            ? ((backendResponse as { user?: Record<string, unknown> }).user || {})
            : ((backendResponse as Record<string, unknown>) || {});

        const merged = {
          ...existing,
          ...backendUser,
          id: pickStringField(existing, ['id', '_id', 'userId']) || profileUserId,
          name: profileData.fullName,
          email: profileData.email,
          displayName: profileData.displayName,
          jobTitle: profileData.jobTitle,
          timezone: profileData.timezone,
          language: profileData.language,
        };
        localStorage.setItem('shoutly_user', JSON.stringify(merged));
        window.dispatchEvent(new Event('auth-changed'));
        await refreshProfileFromBackend();
      } catch (error: unknown) {
        const errObj = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const msg =
          errObj?.response?.data?.message ||
          errObj?.message ||
          'Failed to save profile to backend';
        showToast(msg, 'red');
        return;
      }
    }

    if (name === 'Password') {
      if (!passwordFields.current.trim()) {
        showToast('Enter current password', 'red');
        return;
      }
      if (!passwordFields.new || passwordFields.new.length < 8) {
        showToast('New password must be at least 8 characters', 'red');
        return;
      }
      if (passwordFields.new !== passwordFields.confirm) {
        showToast('New password and confirmation do not match', 'red');
        return;
      }

      try {
        const raw = localStorage.getItem('shoutly_user');
        const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        const emailToSave =
          profileData.email ||
          (typeof existing.email === 'string' ? existing.email : '');

        if (!emailToSave) {
          showToast('Email is missing for password update', 'red');
          return;
        }

        await setAccountPassword(emailToSave, passwordFields.new);
        setPasswordFields({ current: '', new: '', confirm: '' });
        setPasswordStrength({ score: 0, label: '', color: '' });
        setPasswordMatch({ match: true, hint: '' });
      } catch (error: unknown) {
        const errObj = error as {
          response?: { data?: { message?: string } };
          message?: string;
        };
        const msg =
          errObj?.response?.data?.message ||
          errObj?.message ||
          'Failed to update password in backend';
        showToast(msg, 'red');
        return;
      }
    }

    if (!options?.silentSuccess) {
      showToast(`${name} settings saved!`, 'green');
    }
  };

  const saveAll = async () => {
    await saveSection('Profile', { silentSuccess: true });

    const shouldSavePassword =
      Boolean(passwordFields.current.trim()) ||
      Boolean(passwordFields.new.trim()) ||
      Boolean(passwordFields.confirm.trim());

    if (shouldSavePassword) {
      await saveSection('Password', { silentSuccess: true });
    }

    showToast('All settings saved!', 'green');
  };

  const discardAll = () => {
    setProfileData({
      fullName: user?.name || '',
      displayName: user?.name ? user.name.toLowerCase().replace(/\s+/g, '') : '',
      email: user?.email || '',
      jobTitle: '',
      timezone: 'America/New_York (EST, UTC-5)',
      language: 'English (US)',
    });
    setPasswordFields({ current: '', new: '', confirm: '' });
    setPasswordStrength({ score: 0, label: '', color: '' });
    setPasswordMatch({ match: true, hint: '' });
    showToast('Changes discarded', 'amber');
  };

  // --- Modal Functions ---
  const openModal = (content: React.ReactNode, size?: 'md') => {
    if (modalRef.current && modalContentRef.current) {
      modalRef.current.classList.add('open');
      modalContentRef.current.className = `mbox ${size || ''}`;
      // Ensure we can render React content properly
      if (typeof content === 'string') {
        modalContentRef.current.innerHTML = content;
      } else {
        // For React elements, we'd need to render them properly.
        // For simplicity, we'll use innerHTML for strings.
        // In a real app, use a proper modal system.
        modalContentRef.current.innerHTML = '';
        // This is a placeholder; full React modal rendering is complex.
      }
    }
  };

  const closeModal = () => {
    if (modalRef.current) {
      modalRef.current.classList.remove('open');
      setTimeout(() => {
        if (modalContentRef.current) {
          modalContentRef.current.innerHTML = '';
          modalContentRef.current.className = 'mbox';
        }
      }, 200);
    }
  };

  const openDisconnectAllModal = () => {
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--rd-l)"><i class="fa-solid fa-link-slash" style="color:var(--rd);font-size:17px"></i></div><div><div class="m-title">Disconnect All Platforms?</div><div class="m-sub">Removes access to every connected account</div></div></div>
      <div class="m-body"><div class="info-box red" style="margin-bottom:0"><i class="fa-solid fa-triangle-exclamation" style="color:var(--rd)"></i><div class="info-text">All scheduled posts across every platform will be <strong>cancelled</strong>. Your content library and brand assets are preserved.</div></div></div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn danger" onclick="window.dispatchEvent(new CustomEvent('do-disconnect-all'))"><i class="fa-solid fa-link-slash" style="margin-right:5px"></i>Disconnect All</button></div>`;
    openModal(modalHtml);
  };

  const doDisconnectAll = () => {
    closeModal();
    showToast('All social accounts disconnected', 'amber');
  };

  const openPauseModal = () => {
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--am-l)"><i class="fa-solid fa-pause" style="color:var(--am);font-size:17px"></i></div><div><div class="m-title">Pause Account</div><div class="m-sub">Temporarily stop all AI posting activity</div></div></div>
      <div class="m-body">
        <div class="m-form-group"><label class="m-label">Pause Duration</label><select class="m-input" style="cursor:pointer"><option>1 week</option><option selected>1 month</option><option>2 months</option><option>3 months</option></select></div>
        <div class="info-box amber" style="margin-bottom:0"><i class="fa-solid fa-circle-info" style="color:var(--am)"></i><div class="info-text">Your subscription is paused — no charges during this period. All data is preserved and you can resume anytime from Settings.</div></div>
      </div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn amber" onclick="window.dispatchEvent(new CustomEvent('close-modal')); window.dispatchEvent(new CustomEvent('toast-paused'))"><i class="fa-solid fa-pause" style="margin-right:5px"></i>Pause Account</button></div>`;
    openModal(modalHtml);
  };

  const openAvatarModal = () => {
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--brand-l)"><i class="fa-solid fa-camera" style="color:var(--brand);font-size:17px"></i></div><div><div class="m-title">Update Profile Photo</div><div class="m-sub">Upload a new photo — JPG, PNG or GIF · Max 5MB</div></div></div>
      <div class="m-body">
        <div style="display:flex;justify-content:center;margin-bottom:16px">
          <div style="width:88px;height:88px;border-radius:18px;background:linear-gradient(135deg,#F97316,#EA580C);display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#fff;font-family:'Sora',sans-serif;box-shadow:var(--glow)">JD</div>
        </div>
        <div onclick="window.dispatchEvent(new CustomEvent('close-modal')); window.dispatchEvent(new CustomEvent('toast-upload'))" style="border:2px dashed var(--bdr);border-radius:11px;padding:22px;text-align:center;cursor:pointer;transition:all .15s;background:var(--surf2)" onmouseover="this.style.borderColor='var(--brand)';this.style.background='var(--brand-l)'" onmouseout="this.style.borderColor='var(--bdr)';this.style.background='var(--surf2)'">
          <i class="fa-solid fa-cloud-arrow-up" style="font-size:26px;color:var(--t3);margin-bottom:8px;display:block"></i>
          <div style="font-size:13.5px;font-weight:700;color:var(--t2)">Click to upload or drag & drop</div>
        </div>
      </div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn confirm" onclick="window.dispatchEvent(new CustomEvent('close-modal')); window.dispatchEvent(new CustomEvent('toast-photo'))"><i class="fa-solid fa-check" style="margin-right:5px"></i>Save Photo</button></div>`;
    openModal(modalHtml);
  };

  // --- Render Helpers ---
  const renderNotifs = () => {
    return NOTIFS.map((n, i) => (
      <div key={i} className="toggle-row">
        <div><div className="tr-lbl">{n.name}</div><div className="tr-sub">{n.sub}</div></div>
        <div className={`toggle ${notifState[i] ? 'on' : ''}`} onClick={() => flipNotif(i)}></div>
      </div>
    ));
  };

  // --- Event Listeners for Custom Events ---
  useEffect(() => {
    const handleCloseModal = () => closeModal();
    const handleDoDisconnectAll = () => doDisconnectAll();
    const handleToastPaused = () => showToast('Account paused for 1 month. Resume anytime.', 'amber');
    const handleToastUpload = () => showToast('Photo uploaded!', 'green');
    const handleToastPhoto = () => showToast('Profile photo updated!', 'green');

    window.addEventListener('close-modal', handleCloseModal);
    window.addEventListener('do-disconnect-all', handleDoDisconnectAll);
    window.addEventListener('toast-paused', handleToastPaused);
    window.addEventListener('toast-upload', handleToastUpload);
    window.addEventListener('toast-photo', handleToastPhoto);

    return () => {
      window.removeEventListener('close-modal', handleCloseModal);
      window.removeEventListener('do-disconnect-all', handleDoDisconnectAll);
      window.removeEventListener('toast-paused', handleToastPaused);
      window.removeEventListener('toast-upload', handleToastUpload);
      window.removeEventListener('toast-photo', handleToastPhoto);
    };
  }, []);

  // --- Scroll to section ---
  const goToSection = (sectionId: string, el: HTMLElement) => {
    setActiveSection(sectionId);
    const target = document.getElementById(`sec-${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // --- JSX ---
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <style>{`
        :root { --bg:#F9FAFB; --surf:#FFFFFF; --surf2:#F3F4F6; --bdr:#E5E7EB; --bdr2:#F3F4F6; --t1:#111827; --t2:#374151; --t3:#6B7280; --t4:#9CA3AF; --brand:#F97316; --brand2:#EA580C; --brand-l:rgba(249,115,22,.1); --gr:#16A34A; --rd:#EF4444; --am:#D97706; --bl:#3B82F6; --rd-l:rgba(239,68,68,.08); --glow:0 8px 28px rgba(249,115,22,.28); }
        #main { min-width:0; background:var(--bg); color:var(--t1); }
        #topbar { height:56px; display:flex; align-items:center; gap:10px; padding:0 20px; background:var(--surf); border-bottom:1px solid var(--bdr); box-shadow:0 1px 4px rgba(0,0,0,.24); position:sticky; top:0; z-index:20; }
        .tb-bc { font-size:12.5px; color:var(--t3); display:flex; align-items:center; gap:6px; }
        .tb-bc a { color:var(--t3); text-decoration:none; }
        .tb-bc .cur { color:var(--t1); font-weight:700; font-family:'Sora',sans-serif; }
        .tb-flex { flex:1; }
        .tb-btn { display:flex; align-items:center; gap:6px; padding:8px 13px; border-radius:8px; font-size:12.5px; font-weight:700; border:1px solid var(--bdr); cursor:pointer; }
        .tb-btn.ghost { background:var(--surf2); color:var(--t2); }
        .tb-btn.solid { background:var(--brand); color:#fff; border-color:var(--brand); box-shadow:var(--glow); }
        .tb-icon { width:30px; height:30px; border-radius:7px; display:flex; align-items:center; justify-content:center; color:var(--t2); position:relative; background:var(--surf2); border:1px solid var(--bdr2); }
        .tb-dot { position:absolute; top:5px; right:5px; width:7px; height:7px; border-radius:50%; background:var(--rd); border:1.5px solid var(--surf); }
        .tb-ava { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,#F97316,#EA580C); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; }
        #content { padding:18px 20px 24px; height:calc(100vh - 56px); overflow:auto; display:flex; flex-direction:column; justify-content:safe center; }
        .settings-wrap { width:100%; display:grid; grid-template-columns:260px 1fr; gap:16px; align-items:start; }
        .settings-nav { position:sticky; top:74px; background:transparent; border:none; border-radius:12px; padding:12px; box-shadow:none; }
        .sn-hdr-label { font-size:11px; font-weight:800; letter-spacing:.5px; color:var(--t4); text-transform:uppercase; margin:4px 6px 8px; font-family:'Sora',sans-serif; }
        .sn-item { display:flex; align-items:center; gap:8px; border-radius:9px; padding:9px 10px; font-size:13px; font-weight:700; color:var(--t3); cursor:pointer; }
        .sn-item.active { background:var(--brand-l); color:var(--brand); }
        .sn-item i { width:14px; text-align:center; }
        .sn-sep { height:1px; background:var(--bdr2); margin:8px 2px; }
        .danger-nav.active { background:var(--rd-l); color:var(--rd); }
        .settings-content { display:flex; flex-direction:column; gap:14px; }
        .sec { background:var(--surf); border:1px solid var(--bdr); border-radius:12px; overflow:hidden; }
        .sec-hdr { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:14px 16px; border-bottom:1px solid var(--bdr2); }
        .sec-title { display:flex; align-items:center; gap:8px; font-size:15px; font-weight:800; color:var(--t1); font-family:'Sora',sans-serif; }
        .sec-sub { margin-top:4px; font-size:12.5px; color:var(--t3); }
        .sec-body { padding:14px 16px; }
        .form-row { display:grid; grid-template-columns:minmax(210px, 270px) 1fr; gap:14px; padding:12px 0; border-bottom:1px solid var(--bdr2); }
        .fr-lbl { font-size:11px; font-weight:800; color:var(--t4); text-transform:uppercase; letter-spacing:.4px; font-family:'Sora',sans-serif; }
        .fr-sub { margin-top:4px; color:var(--t3); font-size:12px; }
        .fr-ctrl { min-width:0; }
        .field { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--bdr); background:var(--surf2); color:var(--t1); font-size:13px; }
        .field.ok { border-color:rgba(16,185,129,.4); }
        .field.err { border-color:rgba(239,68,68,.5); }
        .char-ct, .field-hint { margin-top:6px; font-size:11px; color:var(--t4); }
        .field-hint.ok { color:var(--gr); } .field-hint.err { color:var(--rd); }
        .badge-row { margin-top:7px; display:flex; align-items:center; gap:10px; }
        .v-badge { padding:3px 8px; border-radius:999px; font-size:11px; font-weight:700; background:rgba(16,185,129,.14); color:var(--gr); }
        .text-link { color:var(--brand); font-size:12px; font-weight:700; cursor:pointer; }
        .ava-row { display:flex; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--bdr2); margin-bottom:6px; }
        .ava-big { position:relative; width:74px; height:74px; border-radius:14px; background:linear-gradient(135deg,#F97316,#EA580C); color:#fff; font-size:26px; font-weight:900; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:var(--glow); }
        .ava-overlay { position:absolute; inset:0; border-radius:14px; background:rgba(0,0,0,.5); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .14s; }
        .ava-big:hover .ava-overlay { opacity:1; }
        .ava-name { font-size:16px; font-weight:800; color:var(--t1); font-family:'Sora',sans-serif; }
        .ava-role { margin-top:3px; font-size:12px; color:var(--t3); }
        .ava-btns { margin-top:8px; display:flex; gap:8px; }
        .ava-btn { padding:7px 10px; border-radius:8px; border:1px solid var(--bdr); background:var(--surf2); font-size:12px; font-weight:700; color:var(--t2); cursor:pointer; }
        .input-wrap { position:relative; }
        .pw-eye { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:var(--t3); cursor:pointer; }
        .pw-bars { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; margin-top:8px; }
        .pw-bar { height:5px; border-radius:999px; background:var(--bdr2); }
        .pw-bar.weak { background:var(--rd); } .pw-bar.fair { background:var(--am); } .pw-bar.good { background:var(--bl); } .pw-bar.strong { background:var(--gr); }
        .sec-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; padding-top:10px; }
        .btn { padding:9px 12px; border-radius:8px; border:1px solid var(--bdr); background:var(--surf2); color:var(--t2); font-size:12.5px; font-weight:700; cursor:pointer; }
        .btn.primary { background:var(--brand); border-color:var(--brand); color:#fff; }
        .toggle-row { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid var(--bdr2); }
        .tr-lbl { font-size:13px; font-weight:700; color:var(--t2); } .tr-sub { margin-top:4px; font-size:12px; color:var(--t3); }
        .toggle { width:40px; height:22px; border-radius:999px; background:#D1D5DB; position:relative; cursor:pointer; transition:all .15s; }
        .toggle::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .15s; }
        .toggle.on { background:var(--brand); } .toggle.on::after { left:21px; }
        .danger-row { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:10px; border:1px solid var(--bdr2); border-radius:10px; background:var(--surf2); margin-bottom:8px; }
        .soc-icon, .dz-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .danger-btn { padding:8px 10px; border-radius:8px; border:none; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }
        .danger-btn.blue { background:rgba(59,130,246,.14); color:#60A5FA; } .danger-btn.amber { background:rgba(245,158,11,.14); color:#FBBF24; } .danger-btn.red { background:rgba(239,68,68,.14); color:#F87171; }
        .dr-title, .dz-title { font-size:13px; font-weight:700; color:var(--t2); }
        .dr-sub, .dz-sub { margin-top:3px; font-size:12px; color:var(--t3); line-height:1.45; }
        #modal-bg { position:fixed; inset:0; background:rgba(0,0,0,.6); backdrop-filter:blur(2px); display:none; align-items:center; justify-content:center; z-index:70; }
        #modal-bg.open { display:flex; }
        .mbox { width:min(560px, 92vw); max-height:90vh; overflow:auto; border-radius:14px; background:var(--surf); border:1px solid var(--bdr); box-shadow:0 20px 60px rgba(0,0,0,.5); }
        #toast-stack { position:fixed; top:84px; right:18px; z-index:99999; display:flex; flex-direction:column; gap:8px; }
        .toast { min-width:260px; max-width:360px; display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; background:var(--surf); border:1px solid var(--bdr); box-shadow:0 8px 26px rgba(0,0,0,.4); color:var(--t1); font-size:13px; font-weight:700; line-height:1.35; }
        .toast.green { background:rgba(16,185,129,.16); border-color:rgba(16,185,129,.4); color:#6EE7B7; }
        .toast.red { background:rgba(239,68,68,.16); border-color:rgba(239,68,68,.4); color:#FCA5A5; }
        .toast.brand { background:rgba(249,115,22,.12); border-color:rgba(249,115,22,.4); color:#EA580C; }
        .toast.amber { background:rgba(245,158,11,.16); border-color:rgba(245,158,11,.4); color:#FCD34D; }
        .toast .t-x { cursor:pointer; color:inherit; font-weight:900; opacity:.75; }
        @media (max-width: 1024px) { .settings-wrap { grid-template-columns:1fr; } .settings-nav { position:static; } .form-row { grid-template-columns:1fr; } }
        @keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
      `}</style>
        <div id="main" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <AdminHeader
          pageTitle="Account Settings"
          searchPlaceholder="Search settings…"
          userName={user?.name}
          userInitials={initials}
        />

        <div id="content">
          <div className="settings-wrap">
            {/* Settings Nav */}
            <div className="settings-nav">
              {NAV_GROUPS.map((group, gi) => {
                const items = group.items;
                return (
                  <React.Fragment key={group.label}>
                    {gi > 0 && <div className="sn-sep"></div>}
                    <div className="sn-hdr-label">{group.label}</div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`sn-item ${item.danger ? 'danger-nav' : ''} ${activeSection === item.id ? 'active' : ''}`}
                        onClick={(e) => goToSection(item.id, e.currentTarget)}
                      >
                        <i className={`fa-solid ${item.icon}`}></i>{item.label}
                      </div>
                    ))}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              {/* Profile Section */}
              <div className="sec" id="sec-profile" style={{ animationDelay: '0.04s', display: activeSection === 'profile' ? undefined : 'none' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-user"></i>Profile Information</div>
                    <div className="sec-sub">Your public profile displayed across Shoutly AI and team workspaces</div>
                  </div>
                </div>
                <div className="sec-body">
                  <div className="ava-row">
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAvatarUpload(file);
                      }}
                    />
                    <div className="ava-big" onClick={() => avatarInputRef.current?.click()}>
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={profileName}
                          style={{ width: '100%', height: '100%', borderRadius: 14, objectFit: 'cover' }}
                        />
                      ) : (
                        profileInitials
                      )}
                      <div className="ava-overlay"><i className="fa-solid fa-camera"></i></div>
                    </div>
                    <div>
                      <div className="ava-name">{profileName}</div>
                      <div className="ava-role">{profileRole} · {profilePlan} · Member</div>
                      <div className="ava-btns">
                        <button className="ava-btn up" onClick={() => avatarInputRef.current?.click()}><i className="fa-solid fa-upload" style={{ fontSize: '10px' }}></i> Upload new</button>
                        <button className="ava-btn rm" onClick={handleRemoveAvatar}><i className="fa-solid fa-trash" style={{ fontSize: '10px' }}></i> Remove</button>
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Full Name</div><div className="fr-sub">Shown on your profile and in team views</div></div>
                    <div className="fr-ctrl">
                      <input className="field" type="text" value={profileData.fullName} maxLength={60} onChange={(e) => handleProfileChange('fullName', e.target.value)} />
                      <div className="char-ct">{profileData.fullName.length} / 60</div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Display Name</div><div className="fr-sub">Your handle in shared workspaces</div></div>
                    <div className="fr-ctrl">
                      <input className="field" type="text" value={profileData.displayName} maxLength={30} onChange={(e) => handleProfileChange('displayName', e.target.value)} />
                      <div className="char-ct">{profileData.displayName.length} / 30</div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Email Address</div><div className="fr-sub">Used for login and billing alerts</div></div>
                    <div className="fr-ctrl">
                      <input className="field ok" type="email" value={profileData.email} onChange={(e) => handleProfileChange('email', e.target.value)} />
                      <div className="badge-row">
                        <span className="v-badge"><i className="fa-solid fa-circle-check" style={{ fontSize: '10px' }}></i> Verified</span>
                        <span className="text-link" onClick={() => showToast('Verification email sent!', 'green')}>Change email</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Job Title</div><div className="fr-sub">Your role in the organization</div></div>
                    <div className="fr-ctrl">
                      <input className="field" type="text" value={profileData.jobTitle} onChange={(e) => handleProfileChange('jobTitle', e.target.value)} placeholder="e.g. Marketing Manager" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">User ID</div><div className="fr-sub">Used by post scheduling APIs</div></div>
                    <div className="fr-ctrl">
                      <input className="field" type="text" value={profileUserId || 'Unavailable'} readOnly />
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Timezone</div><div className="fr-sub">For scheduling posts at the right local time</div></div>
                    <div className="fr-ctrl">
                      <select className="field" value={profileData.timezone} onChange={(e) => handleProfileChange('timezone', e.target.value)}>
                        <option>America/Los_Angeles (PST, UTC-8)</option>
                        <option>America/New_York (EST, UTC-5)</option>
                        <option>Europe/London (GMT, UTC+0)</option>
                        <option>Europe/Paris (CET, UTC+1)</option>
                        <option>Asia/Kolkata (IST, UTC+5:30)</option>
                        <option>Asia/Singapore (SGT, UTC+8)</option>
                        <option>Australia/Sydney (AEST, UTC+11)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Language</div><div className="fr-sub">Interface language preference</div></div>
                    <div className="fr-ctrl">
                      <select className="field" value={profileData.language} onChange={(e) => handleProfileChange('language', e.target.value)}>
                        <option value="English (US)">English (US)</option>
                        <option>English (UK)</option>
                        <option>Español</option>
                        <option>Français</option>
                        <option>Deutsch</option>
                        <option>Hindi</option>
                      </select>
                    </div>
                  </div>
                  <div className="sec-footer">
                    <button className="btn ghost" onClick={discardAll}>Cancel</button>
                    <button className="btn primary" onClick={() => saveSection('Profile')}><i className="fa-solid fa-check" style={{ fontSize: '10px' }}></i> Save Profile</button>
                  </div>
                </div>
              </div>

              {/* Industry Section */}
              <div className="sec" id="sec-industry" style={{ display: activeSection === 'industry' ? undefined : 'none' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-industry"></i>Industry &amp; Niche</div>
                    <div className="sec-sub">Select your industry and sub-industry to tailor AI content to your market</div>
                  </div>
                </div>
                <div className="sec-body">
                  {/* Search */}
                  <div style={{ marginBottom: 14, position: 'relative' }}>
                    <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--t4)', fontSize: 12, pointerEvents: 'none' }} />
                    <input
                      className="field"
                      type="text"
                      placeholder="Search industries…"
                      value={industrySearch}
                      onChange={e => { setIndustrySearch(e.target.value); }}
                      style={{ paddingLeft: 30 }}
                    />
                  </div>

                  {/* ── VIEW MODE: existing selection ── */}
                  {industryViewMode && selectedIndustry && selectedSubIndustry ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        {/* Selected industry card */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8, fontFamily: "'Sora',sans-serif" }}>Industry</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              flex: 1, padding: '14px 16px', borderRadius: 12,
                              border: '2px solid var(--brand)', background: 'var(--brand-l)',
                              display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--brand)', color: '#fff',
                                fontSize: 13, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {(industries.findIndex(i => i.id === selectedIndustry.id) + 1) || '✓'}
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>{selectedIndustry.name}</span>
                            </div>
                          </div>
                        </div>

                        {/* Selected sub-industry card */}
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 8, fontFamily: "'Sora',sans-serif" }}>Sub-category</div>
                          <div style={{
                            padding: '14px 16px', borderRadius: 12,
                            border: '2px solid var(--brand)', background: 'var(--brand-l)',
                            display: 'flex', alignItems: 'center', gap: 12,
                          }}>
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                              background: 'var(--brand)', color: '#fff',
                              fontSize: 13, fontWeight: 700,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              {(industries.find(i => i.id === selectedIndustry.id)?.subIndustries?.findIndex(s => s.id === selectedSubIndustry.id) ?? -1) + 1 || '✓'}
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>{selectedSubIndustry.name}</span>
                            <i className="fa-solid fa-circle-check" style={{ marginLeft: 'auto', color: 'var(--brand)', fontSize: 16 }} />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => { setIndustryViewMode(false); setSelectedIndustry(null); setSelectedSubIndustry(null); setIndustrySearch(''); }}
                        style={{
                          width: '100%', padding: '11px', borderRadius: 10,
                          border: '1.5px dashed var(--bdr)', background: 'var(--surf2)',
                          color: 'var(--t3)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        }}
                      >
                        <i className="fa-solid fa-pen" style={{ fontSize: 11 }} />
                        Change Selection
                      </button>
                    </>
                  ) : industriesLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t4)' }}>
                      <i className="fa-solid fa-spinner" style={{ fontSize: 22, animation: 'spin 1s linear infinite' }} />
                      <div style={{ marginTop: 10, fontSize: 13 }}>Loading industries…</div>
                    </div>
                  ) : industries.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t4)' }}>
                      <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: 22 }} />
                      <div style={{ marginTop: 10, fontSize: 13 }}>Could not load industries. Check your connection.</div>
                    </div>
                  ) : (
                    <>
                      {/* If no industry selected: show full scrollable grid */}
                      {!selectedIndustry ? (
                        <div style={{ maxHeight: 340, overflowY: 'auto', paddingRight: 4, scrollbarWidth: 'thin', marginBottom: 16 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {industries
                              .filter(ind => !industrySearch.trim() || ind.name.toLowerCase().includes(industrySearch.toLowerCase()))
                              .map((ind, idx) => (
                                <div
                                  key={ind.id || ind.name}
                                  onClick={() => { setSelectedIndustry({ id: ind.id, name: ind.name }); setSelectedSubIndustry(null); }}
                                  style={{
                                    padding: '14px 10px 12px', borderRadius: 12,
                                    border: '2px solid var(--bdr)', background: 'var(--surf)',
                                    cursor: 'pointer', textAlign: 'center',
                                    transition: 'border-color .15s, background .15s', userSelect: 'none',
                                  }}
                                >
                                  <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: 'var(--surf2)', color: 'var(--t3)',
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 8px',
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--t1)', lineHeight: 1.35 }}>
                                    {ind.name}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        /* Industry selected: show only that one card + change button */
                        <div style={{ marginBottom: 16 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{
                              flex: 1, padding: '12px 14px', borderRadius: 12,
                              border: '2px solid var(--brand)', background: 'var(--brand-l)',
                              display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: 'var(--brand)', color: '#fff',
                                fontSize: 13, fontWeight: 700,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                {(industries.findIndex(i => i.id === selectedIndustry.id) + 1) || '✓'}
                              </div>
                              <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--brand)' }}>{selectedIndustry.name}</span>
                            </div>
                            <button
                              onClick={() => { setSelectedIndustry(null); setSelectedSubIndustry(null); setIndustrySearch(''); }}
                              style={{ padding: '9px 13px', borderRadius: 9, border: '1px solid var(--bdr)', background: 'var(--surf2)', color: 'var(--t3)', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                              <i className="fa-solid fa-rotate-left" style={{ marginRight: 5, fontSize: 10 }} />Change
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sub-industries — only shown when an industry is selected */}
                      {selectedIndustry ? (
                        <div style={{ borderTop: '1px solid var(--bdr2)', paddingTop: 14 }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10, fontFamily: "'Sora',sans-serif" }}>
                            Sub-categories · <span style={{ color: 'var(--brand)' }}>{selectedIndustry.name}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                            {(industries.find(i => i.id === selectedIndustry.id)?.subIndustries ?? []).map((sub, si) => {
                              const subSel = selectedSubIndustry?.id === sub.id;
                              return (
                                <div
                                  key={sub.id || `sub-${si}`}
                                  onClick={() => setSelectedSubIndustry({ id: sub.id, name: sub.name })}
                                  style={{
                                    padding: '14px 10px 12px',
                                    borderRadius: 12,
                                    border: `2px solid ${subSel ? 'var(--brand)' : 'var(--bdr)'}`,
                                    background: subSel ? 'var(--brand-l)' : 'var(--surf)',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    transition: 'border-color .15s, background .15s',
                                    userSelect: 'none',
                                  }}
                                >
                                  <div style={{
                                    width: 28, height: 28, borderRadius: '50%',
                                    background: subSel ? 'var(--brand)' : 'var(--surf2)',
                                    color: subSel ? '#fff' : 'var(--t3)',
                                    fontSize: 11, fontWeight: 700,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 8px',
                                  }}>
                                    {si + 1}
                                  </div>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: subSel ? 'var(--brand)' : 'var(--t1)', lineHeight: 1.35 }}>
                                    {sub.name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: 'var(--t4)', fontSize: 13, padding: '14px 0 4px' }}>
                          Select an industry to see sub-categories
                        </div>
                      )}
                    </>
                  )}

                  {!industryViewMode && <div className="sec-footer">
                    <button className="btn" onClick={() => { setSelectedIndustry(null); setSelectedSubIndustry(null); }}>Clear</button>
                    <button className="btn primary" onClick={async () => {
                      if (!selectedIndustry) { showToast('Please select an industry first', 'amber'); return; }
                      if (!selectedSubIndustry) { showToast('Please select a sub-category', 'amber'); return; }
                      try {
                        const token = authToken();
                        const res = await fetch(`${API_BASE_URL}/api/users/me/industry-selection`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                          body: JSON.stringify({ subIndustryId: selectedSubIndustry.id }),
                        });
                        if (res.status === 401) { window.location.href = '/sign-in'; return; }
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          showToast(err?.message || 'Failed to save — try a different sub-category', 'red');
                          return;
                        }
                        showToast('Industry preferences saved!', 'green');
                        setIndustryViewMode(true);
                      } catch { showToast('Network error — could not save industry', 'red'); }
                    }}>
                      <i className="fa-solid fa-check" style={{ fontSize: 10 }}></i> Save Industry
                    </button>
                  </div>}
                </div>
              </div>

              {/* Security Section */}
              <div className="sec" id="sec-security" style={{ animationDelay: '0.08s', display: activeSection === 'security' ? undefined : 'none' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-shield-halved"></i>Password &amp; Security</div>
                    <div className="sec-sub">Manage your password, two-factor authentication, and active login sessions</div>
                  </div>
                </div>
                <div className="sec-body">
                  <div className="form-row">
                    <div><div className="fr-lbl">Current Password</div><div className="fr-sub">Required to make any password change</div></div>
                    <div className="fr-ctrl">
                      <div className="input-wrap">
                        <input className="field" id="inp-curpw" type="password" placeholder="Enter current password" value={passwordFields.current} onChange={(e) => handlePasswordChange('current', e.target.value)} />
                        <span className="pw-eye" onClick={(e) => togglePwVisibility('inp-curpw', e)}><i className="fa-solid fa-eye"></i></span>
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">New Password</div><div className="fr-sub">Min 12 chars — mix letters, numbers &amp; symbols</div></div>
                    <div className="fr-ctrl">
                      <div className="input-wrap">
                        <input className="field" id="inp-newpw" type="password" placeholder="Enter new password" value={passwordFields.new} onChange={(e) => handlePasswordChange('new', e.target.value)} />
                        <span className="pw-eye" onClick={(e) => togglePwVisibility('inp-newpw', e)}><i className="fa-solid fa-eye"></i></span>
                      </div>
                      {passwordFields.new && (
                        <div className="pw-str" style={{ display: 'block' }}>
                          <div className="pw-bars">
                            {[1, 2, 3, 4].map(i => (
                              <div key={i} className={`pw-bar ${i <= passwordStrength.score ? (passwordStrength.score === 1 ? 'weak' : passwordStrength.score === 2 ? 'fair' : passwordStrength.score === 3 ? 'good' : 'strong') : ''}`}></div>
                            ))}
                          </div>
                          <div className="pw-str-lbl" style={{ color: passwordStrength.color }}>{passwordStrength.label}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Confirm Password</div><div className="fr-sub">Re-enter to confirm</div></div>
                    <div className="fr-ctrl">
                      <div className="input-wrap">
                        <input className={`field ${!passwordMatch.match && passwordFields.confirm ? 'err' : passwordMatch.match && passwordFields.confirm ? 'ok' : ''}`} id="inp-confpw" type="password" placeholder="Confirm new password" value={passwordFields.confirm} onChange={(e) => handlePasswordChange('confirm', e.target.value)} />
                        <span className="pw-eye" onClick={(e) => togglePwVisibility('inp-confpw', e)}><i className="fa-solid fa-eye"></i></span>
                      </div>
                      {passwordMatch.hint && (
                        <div className={`field-hint ${passwordMatch.match ? 'ok' : 'err'}`}>{passwordMatch.hint}</div>
                      )}
                    </div>
                  </div>
                  <div className="sec-footer" style={{ borderBottom: '1px solid var(--bdr2)' }}>
                    <button className="btn primary" onClick={() => saveSection('Password')}><i className="fa-solid fa-lock" style={{ fontSize: '10px' }}></i> Update Password</button>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Two-Factor Authentication (2FA)</div><div className="tr-sub">Extra security layer — required for admin accounts on Enterprise.</div></div>
                    <div className={`toggle ${toggles.twoFA ? 'on' : ''}`} onClick={() => toggleSwitch('twoFA')}></div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Login Alerts</div><div className="tr-sub">Email notification when a new device signs into your account.</div></div>
                    <div className={`toggle ${toggles.loginAlerts ? 'on' : ''}`} onClick={() => toggleSwitch('loginAlerts')}></div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Require Re-authentication</div><div className="tr-sub">Prompt for password before billing changes or account deletion.</div></div>
                    <div className={`toggle ${toggles.reauth ? 'on' : ''}`} onClick={() => toggleSwitch('reauth')}></div>
                  </div>
                </div>
              </div>

              {/* Notifications Section */}
              <div className="sec" id="sec-notif" style={{ animationDelay: '0.16s', display: activeSection === 'notif' ? undefined : 'none' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-bell"></i>Notification Preferences</div>
                    <div className="sec-sub">Choose how and when Shoutly AI contacts you</div>
                  </div>
                </div>
                <div className="sec-body">
                  <div id="notifList">
                    {renderNotifs()}
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="sec" id="sec-appearance" style={{ animationDelay: '0.20s', display: activeSection === 'appearance' ? undefined : 'none' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title">
                      <i className="fa-solid fa-palette"></i>Appearance
                      <span style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 999, background: 'var(--brand-l)', color: 'var(--brand)', fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px' }}>Coming soon</span>
                    </div>
                    <div className="sec-sub">Customize the look and feel of your dashboard</div>
                  </div>
                </div>
                <div className="sec-body" style={{ opacity: 0.55, pointerEvents: 'auto' }}>
                  <div className="form-row">
                    <div><div className="fr-lbl">Theme</div><div className="fr-sub">Choose your preferred color theme</div></div>
                    <div className="fr-ctrl">
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div id="th-light" onClick={() => showToast('Appearance settings are coming soon!', 'brand')} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid var(--bdr)', background: 'var(--surf2)', cursor: 'not-allowed', textAlign: 'center', transition: 'all .15s' }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>☀️</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', fontFamily: "'Sora', sans-serif" }}>Light</div>
                        </div>
                        <div id="th-dark" onClick={() => showToast('Appearance settings are coming soon!', 'brand')} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid var(--bdr)', background: 'var(--surf2)', cursor: 'not-allowed', textAlign: 'center', transition: 'all .15s' }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>🌙</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', fontFamily: "'Sora', sans-serif" }}>Dark</div>
                        </div>
                        <div id="th-system" onClick={() => showToast('Appearance settings are coming soon!', 'brand')} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '2px solid var(--bdr)', background: 'var(--surf2)', cursor: 'not-allowed', textAlign: 'center', transition: 'all .15s' }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>🖥️</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--t2)', fontFamily: "'Sora', sans-serif" }}>System</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Sidebar Density</div><div className="fr-sub">How compact the sidebar navigation appears</div></div>
                    <div className="fr-ctrl">
                      <select className="field" defaultValue="Comfortable" style={{ cursor: 'not-allowed' }} onClick={(e) => { e.preventDefault(); (e.currentTarget as HTMLSelectElement).blur(); showToast('Appearance settings are coming soon!', 'brand'); }} onChange={(e) => e.preventDefault()}>
                        <option>Comfortable</option><option>Compact</option><option>Spacious</option>
                      </select>
                    </div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Animations &amp; Transitions</div><div className="tr-sub">Smooth animations when navigating the dashboard.</div></div>
                    <div className="toggle" style={{ cursor: 'not-allowed' }} onClick={() => showToast('Appearance settings are coming soon!', 'brand')}></div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Compact Calendar View</div><div className="tr-sub">Show more posts per row in the content calendar.</div></div>
                    <div className="toggle" style={{ cursor: 'not-allowed' }} onClick={() => showToast('Appearance settings are coming soon!', 'brand')}></div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Show AI Confidence Scores</div><div className="tr-sub">Display engagement prediction scores on post cards.</div></div>
                    <div className="toggle" style={{ cursor: 'not-allowed' }} onClick={() => showToast('Appearance settings are coming soon!', 'brand')}></div>
                  </div>
                </div>
              </div>

              {/* Danger Zone Section */}
              <div className="sec" id="sec-danger" style={{ animationDelay: '0.24s', display: activeSection === 'danger' ? undefined : 'none' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title" style={{ color: 'var(--rd)' }}><i className="fa-solid fa-triangle-exclamation" style={{ color: 'var(--rd)' }}></i>Danger Zone</div>
                    <div className="sec-sub">Irreversible actions — proceed with extreme caution</div>
                  </div>
                </div>
                <div className="sec-body danger">
                  <div className="dz-hdr">
                    <div className="dz-icon"><i className="fa-solid fa-triangle-exclamation"></i></div>
                    <div><div className="dz-title">Irreversible Actions</div><div className="dz-sub">These actions permanently affect your account and cannot be undone</div></div>
                  </div>
                  <div className="danger-row">
                    <div><div className="dr-title">Export All Data</div><div className="dr-sub">Download all your posts, reels, brand assets, and account data as a ZIP archive in JSON/CSV format.</div></div>
                    <button className="danger-btn blue" onClick={() => showToast('Preparing export… you will receive a download link by email shortly.', 'brand')}><i className="fa-solid fa-file-arrow-down" style={{ fontSize: '11px' }}></i> Export Data</button>
                  </div>
                  <div className="danger-row">
                    <div><div className="dr-title">Pause Account</div><div className="dr-sub">Temporarily stop all AI posting. Resume anytime without losing data or settings. Subscription is paused.</div></div>
                    <button className="danger-btn amber" onClick={openPauseModal}><i className="fa-solid fa-pause" style={{ fontSize: '11px' }}></i> Pause Account</button>
                  </div>
                  <div className="danger-row">
                    <div><div className="dr-title">Disconnect All Social Accounts</div><div className="dr-sub">Remove Shoutly AI access from all platforms. All scheduled posts will be cancelled immediately.</div></div>
                    <button className="danger-btn red" onClick={openDisconnectAllModal}><i className="fa-solid fa-link-slash" style={{ fontSize: '11px' }}></i> Disconnect All</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

      {/* Modal */}
      <div id="modal-bg" ref={modalRef} onClick={(e) => { if ((e.target as HTMLElement).id === 'modal-bg') closeModal(); }}>
        <div className="mbox" id="mbox" ref={modalContentRef}></div>
      </div>

      {/* Toast Container */}
      <div id="toast-stack"></div>

    </>
  );
};

export default SettingsPage;