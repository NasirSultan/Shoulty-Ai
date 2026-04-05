"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from '../Sidebar'; // Import the sidebar component
import AdminHeader from '../AdminHeader';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSidebarState } from '@/hooks/useSidebarState';
import { fetchIndustries } from '@/api/homeApi';
import { fetchProfile, setAccountPassword, setUserProfile } from '@/api/authApi';

// --- Types ---
interface SocialAccount {
  id: string;
  name: string;
  icon: string;
  grad: string;
  barClr: string;
  handle: string;
  followers: string;
  posts: string;
  eng: string;
  status: 'connected' | 'expired' | 'disconnected';
  sync: string;
}

interface NotificationItem {
  name: string;
  sub: string;
}

interface NotifState {
  [key: number]: {
    email: boolean;
    push: boolean;
  };
}

interface SubIndustryOption {
  id: string | number;
  name: string;
}

interface IndustryOption {
  id: string | number;
  name: string;
  subIndustries: SubIndustryOption[];
}

// --- Data ---
const SOCIALS: SocialAccount[] = [
  { id: 'instagram', name: 'Instagram', icon: 'fa-brands fa-instagram', grad: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', barClr: '#E1306C', handle: '@brandco.official', followers: '48.2K', posts: '892', eng: '4.8%', status: 'connected', sync: '2 min ago' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'fa-brands fa-linkedin', grad: 'linear-gradient(135deg,#0A66C2,#004182)', barClr: '#0A66C2', handle: 'Jordan Davis / BrandCo', followers: '12.1K', posts: '234', eng: '3.2%', status: 'connected', sync: '15 min ago' },
  { id: 'twitter', name: 'Twitter / X', icon: 'fa-brands fa-x-twitter', grad: 'linear-gradient(135deg,#111,#333)', barClr: '#111', handle: '@brandco_hq', followers: '22.7K', posts: '1,204', eng: '2.1%', status: 'expired', sync: 'Token expired 2 days ago' },
  { id: 'facebook', name: 'Facebook', icon: 'fa-brands fa-facebook', grad: 'linear-gradient(135deg,#1877F2,#0A4FC4)', barClr: '#1877F2', handle: 'BrandCo Page', followers: '9.4K', posts: '441', eng: '1.8%', status: 'connected', sync: '5 min ago' },
  { id: 'tiktok', name: 'TikTok', icon: 'fa-brands fa-tiktok', grad: 'linear-gradient(135deg,#010101,#69C9D0)', barClr: '#010101', handle: '@brandco', followers: '31.5K', posts: '187', eng: '7.4%', status: 'connected', sync: '1 hour ago' },
  { id: 'youtube', name: 'YouTube', icon: 'fa-brands fa-youtube', grad: 'linear-gradient(135deg,#FF0000,#CC0000)', barClr: '#FF0000', handle: 'BrandCo Channel', followers: '5.8K', posts: '64', eng: '5.1%', status: 'disconnected', sync: 'Never' },
  { id: 'threads', name: 'Threads', icon: 'fa-brands fa-threads', grad: 'linear-gradient(135deg,#222,#555)', barClr: '#333', handle: '@brandco.official', followers: '3.2K', posts: '89', eng: '3.6%', status: 'disconnected', sync: 'Never' },
];

const NOTIFS: NotificationItem[] = [
  { name: 'Post Published', sub: 'When a scheduled post goes live successfully' },
  { name: 'Post Failed', sub: 'When a post fails to publish on a platform' },
  { name: 'AI Content Ready', sub: 'When AI finishes generating new content' },
  { name: 'Weekly Performance Report', sub: 'Your weekly analytics summary every Monday' },
  { name: 'Billing & Invoices', sub: 'Subscription renewals and payment receipts' },
  { name: 'Team Activity', sub: 'When teammates edit or publish content' },
  { name: 'Account Security', sub: 'Login attempts and security alert notifications' },
  { name: 'Product Updates', sub: 'New features, improvements and release notes' },
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

const SOCIAL_ID_TO_BACKEND: Record<string, string> = {
  instagram: 'INSTAGRAM',
  facebook: 'FACEBOOK',
  linkedin: 'LINKEDIN',
  twitter: 'TWITTER',
  youtube: 'YOUTUBE',
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
  const { sidebarSlim, setSidebarSlim } = useSidebarState();
  const [socials, setSocials] = useState<SocialAccount[]>(SOCIALS);
  const [notifState, setNotifState] = useState<NotifState>(() => {
    const init: NotifState = {};
    NOTIFS.forEach((_, i) => {
      init[i] = { email: i < 6, push: i < 4 };
    });
    return init;
  });
  const [activeSection, setActiveSection] = useState<string>('profile');
  const [profileData, setProfileData] = useState({
    fullName: '',
    displayName: '',
    email: '',
    jobTitle: '',
    industryId: '',
    subIndustryId: '',
    timezone: 'America/New_York (EST, UTC-5)',
    language: 'English (US)',
  });
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
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

  const selectedIndustry = industries.find(
    (ind) => String(ind.id) === String(profileData.industryId)
  );
  const subIndustryOptions = selectedIndustry?.subIndustries || [];

  useEffect(() => {
    fetchIndustries()
      .then((data) => {
        setIndustries((data || []) as IndustryOption[]);
      })
      .catch(() => {
        setIndustries([]);
      });
  }, []);

  useEffect(() => {
    if (!user) return;
    setProfileData((prev) => ({
      ...prev,
      fullName: user.name || prev.fullName,
      displayName: user.name ? user.name.toLowerCase().replace(/\s+/g, '') : prev.displayName,
      email: user.email || prev.email,
      industryId: pickStringField((user as Record<string, unknown>), ['industryId', 'industry_id', 'selectedIndustryId']) || prev.industryId,
      subIndustryId: pickStringField((user as Record<string, unknown>), ['subIndustryId', 'sub_industry_id', 'selectedSubIndustryId']) || prev.subIndustryId,
    }));

    // Mark platforms as connected based on real connectedSocials from backend
    if (user.connectedSocials && user.connectedSocials.length > 0) {
      const connected = new Set(user.connectedSocials.map((s: string) => s.toLowerCase()));
      setSocials((prev) =>
        prev.map((plat) => ({
          ...plat,
          status: connected.has(plat.id) ? 'connected' : plat.status === 'connected' ? 'disconnected' : plat.status,
        }))
      );
    }

    const backendAvatar =
      typeof (user as Record<string, unknown>).profilePicture === 'string'
        ? ((user as Record<string, unknown>).profilePicture as string)
        : '';
    setAvatarUrl(backendAvatar || '');
  }, [user]);

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

  const flipNotif = (index: number, type: 'email' | 'push') => {
    setNotifState(prev => ({
      ...prev,
      [index]: { ...prev[index], [type]: !prev[index][type] }
    }));
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

  const revokeSession = (id: string, device: string) => {
    const row = document.getElementById(id);
    if (row) {
      row.style.transition = 'opacity .3s, max-height .4s';
      row.style.opacity = '0';
      setTimeout(() => {
        row.style.maxHeight = '0';
        row.style.overflow = 'hidden';
        setTimeout(() => row.remove(), 300);
      }, 300);
    }
    showToast(`${device} session revoked`, 'amber');
  };

  const revokeAll = () => {
    revokeSession('sess-iphone', 'iPhone');
    revokeSession('sess-win', 'Windows PC');
  };

  const handleAvatarUpload = async (file: File) => {
    try {
      const raw = localStorage.getItem('shoutly_user');
      const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
      const connectedSocialsFromUi = socials
        .filter((s) => s.status === 'connected')
        .map((s) => SOCIAL_ID_TO_BACKEND[s.id])
        .filter((s): s is string => Boolean(s) && ALLOWED_CONNECTED_SOCIALS.has(s));
      const connectedSocialsFromStore = Array.isArray(existing.connectedSocials)
        ? (existing.connectedSocials as unknown[])
            .map((s) => (typeof s === 'string' ? s.toUpperCase() : ''))
            .filter((s) => Boolean(s) && ALLOWED_CONNECTED_SOCIALS.has(s))
        : [];
      const connectedSocials = Array.from(
        new Set([...connectedSocialsFromUi, ...connectedSocialsFromStore])
      );

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
        industryId: profileData.industryId,
        subIndustryId: profileData.subIndustryId,
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
        industryId:
          pickStringField(merged, ['industryId', 'industry_id', 'selectedIndustryId']) ||
          prev.industryId,
        subIndustryId:
          pickStringField(merged, ['subIndustryId', 'sub_industry_id', 'selectedSubIndustryId']) ||
          prev.subIndustryId,
      }));
    } catch {
      // Keep current UI state if backend refresh fails.
    }
  };

  const saveSection = async (name: string, options?: { silentSuccess?: boolean }) => {
    if (name === 'Profile') {
      if (!profileData.industryId || !profileData.subIndustryId) {
        showToast('Select industry and sub-industry first', 'red');
        return;
      }

      try {
        const raw = localStorage.getItem('shoutly_user');
        const existing = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};

        const connectedSocialsFromUi = socials
          .filter((s) => s.status === 'connected')
          .map((s) => SOCIAL_ID_TO_BACKEND[s.id])
          .filter((s): s is string => Boolean(s) && ALLOWED_CONNECTED_SOCIALS.has(s));
        const connectedSocialsFromStore = Array.isArray(existing.connectedSocials)
          ? (existing.connectedSocials as unknown[])
              .map((s) => (typeof s === 'string' ? s.toUpperCase() : ''))
              .filter((s) => Boolean(s) && ALLOWED_CONNECTED_SOCIALS.has(s))
          : [];
        const connectedSocials = Array.from(
          new Set([...connectedSocialsFromUi, ...connectedSocialsFromStore])
        );

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
          industryId: profileData.industryId,
          subIndustryId: profileData.subIndustryId,
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
          industryId: profileData.industryId,
          subIndustryId: profileData.subIndustryId,
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
      industryId: pickStringField((user ?? null) as Record<string, unknown> | null, ['industryId', 'industry_id', 'selectedIndustryId']),
      subIndustryId: pickStringField((user ?? null) as Record<string, unknown> | null, ['subIndustryId', 'sub_industry_id', 'selectedSubIndustryId']),
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

  const openConnect = (id: string, name: string) => {
    const s = socials.find(x => x.id === id);
    if (!s) return;
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:${s.grad}"><i class="${s.icon}" style="color:#fff;font-size:18px"></i></div><div><div class="m-title">Connect ${name}</div><div class="m-sub">Authorize Shoutly AI to post on your behalf</div></div></div>
      <div class="m-body">
        <div class="oauth-steps">
          <div class="oauth-step"><div class="os-num">1</div><div class="os-text">You will be redirected to <strong>${name}</strong> to authorize access</div></div>
          <div class="oauth-step"><div class="os-num">2</div><div class="os-text">Grant permissions for publishing and reading analytics</div></div>
          <div class="oauth-step"><div class="os-num">3</div><div class="os-text">Return to Shoutly AI — your account links instantly</div></div>
        </div>
        <div class="info-box brand" style="margin-bottom:0"><i class="fa-solid fa-shield-halved" style="color:var(--brand)"></i><div class="info-text">We only request <strong>publish</strong> and <strong>read analytics</strong> permissions. We never access DMs or personal data.</div></div>
      </div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn confirm" onclick="window.dispatchEvent(new CustomEvent('do-connect', { detail: { id: '${id}', name: '${name}' } }))"><i class="fa-solid fa-arrow-up-right-from-square" style="margin-right:5px;font-size:11px"></i>Authorize ${name}</button></div>`;
    openModal(modalHtml);
  };

  const doConnect = (id: string, name: string) => {
    if (!modalContentRef.current) return;
    modalContentRef.current.innerHTML = `
      <div style="padding:48px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px">
        <div style="width:56px;height:56px;border-radius:14px;background:linear-gradient(135deg,var(--brand),var(--brand2));display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;box-shadow:var(--glow)"><i class="fa-solid fa-spinner" style="animation:spin 1s linear infinite"></i></div>
        <div style="font-size:15px;font-weight:800;color:var(--t1);font-family:'Sora',sans-serif">Connecting to ${name}…</div>
        <div style="font-size:13px;color:var(--t3)">Awaiting authorization</div>
      </div>`;
    setTimeout(() => {
      setSocials(prev => prev.map(s => s.id === id ? { ...s, status: 'connected', sync: 'Just now' } : s));
      if (modalContentRef.current) {
        const ov = document.createElement('div');
        ov.className = 'success-overlay';
        ov.innerHTML = `<div class="success-circle"><i class="fa-solid fa-check"></i></div><div class="success-title">${name} Connected!</div><div class="success-msg">Shoutly AI can now schedule and publish to your ${name} account.</div>`;
        modalContentRef.current.appendChild(ov);
      }
      setTimeout(() => { closeModal(); showToast(name + ' connected!', 'green'); }, 1600);
    }, 2000);
  };

  const openDisconnect = (id: string, name: string) => {
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--rd-l)"><i class="fa-solid fa-link-slash" style="color:var(--rd);font-size:17px"></i></div><div><div class="m-title">Disconnect ${name}?</div><div class="m-sub">Shoutly AI will lose access to this account</div></div></div>
      <div class="m-body"><div class="info-box red" style="margin-bottom:0"><i class="fa-solid fa-triangle-exclamation" style="color:var(--rd)"></i><div class="info-text">Disconnecting <strong>${name}</strong> will cancel all scheduled posts for this platform. Your content library is preserved.</div></div></div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn danger" onclick="window.dispatchEvent(new CustomEvent('do-disconnect', { detail: { id: '${id}', name: '${name}' } }))"><i class="fa-solid fa-link-slash" style="margin-right:5px"></i>Disconnect ${name}</button></div>`;
    openModal(modalHtml);
  };

  const doDisconnect = (id: string, name: string) => {
    setSocials(prev => prev.map(s => s.id === id ? { ...s, status: 'disconnected', sync: 'Never' } : s));
    closeModal();
    showToast(name + ' disconnected', 'amber');
  };

  const openSocSettings = (id: string) => {
    const s = socials.find(x => x.id === id);
    if (!s) return;
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:${s.grad}"><i class="${s.icon}" style="color:#fff;font-size:18px"></i></div><div><div class="m-title">${s.name} Settings</div><div class="m-sub">${s.handle}</div></div></div>
      <div class="m-body">
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px">
          <div style="padding:12px;border-radius:10px;background:var(--surf2);border:1px solid var(--bdr2);text-align:center"><div style="font-size:16px;font-weight:900;color:var(--t1);font-family:'Sora',sans-serif">${s.followers}</div><div style="font-size:11px;color:var(--t3);margin-top:2px">Followers</div></div>
          <div style="padding:12px;border-radius:10px;background:var(--surf2);border:1px solid var(--bdr2);text-align:center"><div style="font-size:16px;font-weight:900;color:var(--t1);font-family:'Sora',sans-serif">${s.posts}</div><div style="font-size:11px;color:var(--t3);margin-top:2px">Posts</div></div>
          <div style="padding:12px;border-radius:10px;background:var(--surf2);border:1px solid var(--bdr2);text-align:center"><div style="font-size:16px;font-weight:900;color:var(--t1);font-family:'Sora',sans-serif">${s.eng}</div><div style="font-size:11px;color:var(--t3);margin-top:2px">Engagement</div></div>
        </div>
        <div class="m-form-group"><label class="m-label">Posting Permissions</label><select class="m-input" style="cursor:pointer"><option selected>Allow auto-posting</option><option>Require approval before posting</option><option>Pause auto-posting</option></select></div>
        <div class="m-form-group" style="margin-bottom:0"><label class="m-label">Default Post Time</label><select class="m-input" style="cursor:pointer"><option>Use AI optimal time</option><option selected>09:00 AM (EST)</option><option>12:00 PM (EST)</option><option>06:00 PM (EST)</option></select></div>
      </div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn confirm" onclick="window.dispatchEvent(new CustomEvent('close-modal')); window.dispatchEvent(new CustomEvent('toast-saved'))"><i class="fa-solid fa-check" style="margin-right:5px"></i>Save Settings</button></div>`;
    openModal(modalHtml);
  };

  const openPickerModal = () => {
    const platforms = socials.map(s => {
      const isConn = s.status === 'connected';
      return `<div onclick="${isConn ? '' : `window.dispatchEvent(new CustomEvent('connect-from-picker', { detail: { id: '${s.id}', name: '${s.name}' } }))`}" style="display:flex;align-items:center;gap:12px;padding:11px 13px;border-radius:10px;background:var(--surf2);border:1.5px solid ${isConn ? 'rgba(16,185,129,.2)' : 'var(--bdr2)'};cursor:${isConn ? 'default' : 'pointer'};transition:all .14s;opacity:${isConn ? '.65' : '1'}" ${!isConn ? 'onmouseover="this.style.borderColor=\'rgba(91,91,214,.3)\';this.style.background=\'var(--brand-l)\'" onmouseout="this.style.borderColor=\'var(--bdr2)\';this.style.background=\'var(--surf2)\'"' : ''}>
        <div style="width:36px;height:36px;border-radius:9px;background:${s.grad};display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;flex-shrink:0"><i class="${s.icon}"></i></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--t1)">${s.name}</div><div style="font-size:11px;color:var(--t3)">${isConn ? '✓ Connected' : 'Click to connect'}</div></div>
        <i class="fa-solid fa-${isConn ? 'check-circle' : 'chevron-right'}" style="color:${isConn ? 'var(--gr)' : 'var(--t4)'};font-size:${isConn ? '14' : '11'}px"></i>
      </div>`;
    }).join('');
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--brand-l)"><i class="fa-solid fa-share-nodes" style="color:var(--brand);font-size:17px"></i></div><div><div class="m-title">Connect a Platform</div><div class="m-sub">Choose a social network to connect</div></div></div>
      <div class="m-body" style="display:flex;flex-direction:column;gap:7px">${platforms}</div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Close</button></div>`;
    openModal(modalHtml, 'md');
  };

  const openDisconnectAllModal = () => {
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--rd-l)"><i class="fa-solid fa-link-slash" style="color:var(--rd);font-size:17px"></i></div><div><div class="m-title">Disconnect All Platforms?</div><div class="m-sub">Removes access to every connected account</div></div></div>
      <div class="m-body"><div class="info-box red" style="margin-bottom:0"><i class="fa-solid fa-triangle-exclamation" style="color:var(--rd)"></i><div class="info-text">All scheduled posts across every platform will be <strong>cancelled</strong>. Your content library and brand assets are preserved.</div></div></div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn danger" onclick="window.dispatchEvent(new CustomEvent('do-disconnect-all'))"><i class="fa-solid fa-link-slash" style="margin-right:5px"></i>Disconnect All</button></div>`;
    openModal(modalHtml);
  };

  const doDisconnectAll = () => {
    setSocials(prev => prev.map(s => s.status !== 'disconnected' ? { ...s, status: 'disconnected', sync: 'Never' } : s));
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
          <div style="width:88px;height:88px;border-radius:18px;background:linear-gradient(135deg,var(--brand),var(--brand2));display:flex;align-items:center;justify-content:center;font-size:32px;font-weight:900;color:#fff;font-family:'Sora',sans-serif;box-shadow:var(--glow)">JD</div>
        </div>
        <div onclick="window.dispatchEvent(new CustomEvent('close-modal')); window.dispatchEvent(new CustomEvent('toast-upload'))" style="border:2px dashed var(--bdr);border-radius:11px;padding:22px;text-align:center;cursor:pointer;transition:all .15s;background:var(--surf2)" onmouseover="this.style.borderColor='var(--brand)';this.style.background='var(--brand-l)'" onmouseout="this.style.borderColor='var(--bdr)';this.style.background='var(--surf2)'">
          <i class="fa-solid fa-cloud-arrow-up" style="font-size:26px;color:var(--t3);margin-bottom:8px;display:block"></i>
          <div style="font-size:13.5px;font-weight:700;color:var(--t2)">Click to upload or drag & drop</div>
        </div>
      </div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Cancel</button><button class="mbtn confirm" onclick="window.dispatchEvent(new CustomEvent('close-modal')); window.dispatchEvent(new CustomEvent('toast-photo'))"><i class="fa-solid fa-check" style="margin-right:5px"></i>Save Photo</button></div>`;
    openModal(modalHtml);
  };

  const openDeleteModal = () => {
    const modalHtml = `
      <div class="m-hdr"><div class="m-icon" style="background:var(--rd-l)"><i class="fa-solid fa-trash" style="color:var(--rd);font-size:17px"></i></div><div><div class="m-title">Delete Account?</div><div class="m-sub">Permanent — cannot be undone under any circumstances</div></div></div>
      <div class="m-body">
        <div class="info-box red"><i class="fa-solid fa-triangle-exclamation" style="color:var(--rd)"></i><div class="info-text">This will <strong>permanently delete</strong> everything associated with your account.</div></div>
        <div class="del-checklist">
          ${['All AI-generated posts, reels and creatives','All connected social accounts and tokens','All brand kits, logos and assets','All billing history and invoices','All team members and permissions'].map(t => `<div class="del-check-item"><i class="fa-solid fa-xmark" style="color:var(--rd);font-size:11px;flex-shrink:0"></i>${t}</div>`).join('')}
        </div>
        <div class="m-form-group" style="margin-bottom:0">
          <label class="m-label">Type <span style="color:var(--rd);font-style:normal;font-weight:900">DELETE MY ACCOUNT</span> to confirm</label>
          <input class="m-input del" id="del-input" type="text" placeholder="DELETE MY ACCOUNT" oninput="window.dispatchEvent(new CustomEvent('check-del', { detail: { value: this.value } }))">
        </div>
      </div>
      <div class="m-footer"><button class="mbtn cancel" onclick="window.dispatchEvent(new CustomEvent('close-modal'))">Keep My Account</button><button class="mbtn danger" id="del-btn" disabled style="opacity:.4" onclick="window.dispatchEvent(new CustomEvent('do-delete'))"><i class="fa-solid fa-trash" style="margin-right:5px"></i>Delete Forever</button></div>`;
    openModal(modalHtml);
  };

  const checkDelInput = (value: string) => {
    const btn = document.getElementById('del-btn') as HTMLButtonElement;
    if (btn) {
      const ok = value === 'DELETE MY ACCOUNT';
      btn.disabled = !ok;
      btn.style.opacity = ok ? '1' : '.4';
    }
  };

  const doDelete = () => {
    if (modalContentRef.current) {
      modalContentRef.current.innerHTML = `
        <div style="padding:50px 24px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px">
          <div style="width:56px;height:56px;border-radius:14px;background:var(--rd-l);border:2px solid rgba(239,68,68,.25);display:flex;align-items:center;justify-content:center;font-size:22px;color:var(--rd)"><i class="fa-solid fa-spinner" style="animation:spin 1s linear infinite"></i></div>
          <div style="font-size:15px;font-weight:800;color:var(--t1);font-family:'Sora',sans-serif">Deleting account…</div>
          <div style="font-size:13px;color:var(--t3)">Securely removing all your data</div>
        </div>`;
    }
    setTimeout(() => { closeModal(); showToast('Account permanently deleted. Goodbye 👋', 'red'); }, 2500);
  };

  // --- Render Helpers ---
  const renderSocials = () => {
    return socials.map((s, i) => {
      const isConn = s.status === 'connected';
      const isExp = s.status === 'expired';

      let badgeHtml, actHtml;
      if (isConn) {
        badgeHtml = '<span class="conn-badge on"><span class="conn-dot"></span> Connected</span>';
        actHtml = `<button class="soc-btn settings" onclick="window.dispatchEvent(new CustomEvent('open-soc-settings', { detail: { id: '${s.id}' } }))" title="Settings"><i class="fa-solid fa-sliders" style="font-size:11px"></i></button><button class="soc-btn disconnect" onclick="window.dispatchEvent(new CustomEvent('open-disconnect', { detail: { id: '${s.id}', name: '${s.name}' } }))"><i class="fa-solid fa-link-slash" style="font-size:10px"></i> Disconnect</button>`;
      } else if (isExp) {
        badgeHtml = '<span class="conn-badge exp"><i class="fa-solid fa-triangle-exclamation" style="font-size:9px"></i> Token Expired</span>';
        actHtml = `<button class="soc-btn reconnect" onclick="window.dispatchEvent(new CustomEvent('open-connect', { detail: { id: '${s.id}', name: '${s.name}' } }))"><i class="fa-solid fa-rotate-right" style="font-size:10px"></i> Reconnect</button>`;
      } else {
        badgeHtml = '<span class="conn-badge off"><i class="fa-solid fa-circle-xmark" style="font-size:9px"></i> Not Connected</span>';
        actHtml = `<button class="soc-btn connect" onclick="window.dispatchEvent(new CustomEvent('open-connect', { detail: { id: '${s.id}', name: '${s.name}' } }))"><i class="fa-solid fa-plus" style="font-size:10px"></i> Connect</button>`;
      }

      const infoHtml = (isConn || isExp)
        ? `<div class="soc-handle">${s.handle}</div><div class="soc-stats"><span class="soc-stat"><strong>${s.followers}</strong> followers</span><span class="soc-stat"><strong>${s.posts}</strong> posts</span><span class="soc-stat"><strong>${s.eng}</strong> eng.</span></div>`
        : `<div class="soc-handle" style="color:var(--t4)">Not connected · Connect to start posting</div>`;

      return (
        <div key={s.id} className="social-row" id={`sr-${s.id}`} style={{ animationDelay: `${i * 0.04}s` }}>
          {isConn && <div className="social-bar" style={{ background: s.barClr }}></div>}
          <div className="soc-icon" style={{ background: s.grad }}><i className={s.icon}></i></div>
          <div className="soc-info">
            <div className="soc-name">{s.name}</div>
            <div dangerouslySetInnerHTML={{ __html: infoHtml }} />
          </div>
          <div className="soc-status">
            <span dangerouslySetInnerHTML={{ __html: badgeHtml }} />
            <div style={{ fontSize: '10.5px', color: 'var(--t4)', fontFamily: "'JetBrains Mono', monospace" }}>
              {isConn ? `↻ ${s.sync}` : isExp ? s.sync : ''}
            </div>
          </div>
          <div className="soc-actions" dangerouslySetInnerHTML={{ __html: actHtml }} />
        </div>
      );
    });
  };

  const renderNotifs = () => {
    return NOTIFS.map((n, i) => (
      <div key={i} className="notif-row">
        <div>
          <div className="notif-name">{n.name}</div>
          <div className="notif-sub">{n.sub}</div>
        </div>
        <div className="notif-toggle-cell">
          <div className={`toggle ${notifState[i]?.email ? 'on' : ''}`} onClick={() => flipNotif(i, 'email')}></div>
        </div>
        <div className="notif-toggle-cell">
          <div className={`toggle ${notifState[i]?.push ? 'on' : ''}`} onClick={() => flipNotif(i, 'push')}></div>
        </div>
      </div>
    ));
  };

  // --- Event Listeners for Custom Events ---
  useEffect(() => {
    const handleCloseModal = () => closeModal();
    const handleDoConnect = (e: CustomEvent) => doConnect(e.detail.id, e.detail.name);
    const handleDoDisconnect = (e: CustomEvent) => doDisconnect(e.detail.id, e.detail.name);
    const handleDoDisconnectAll = () => doDisconnectAll();
    const handleOpenConnect = (e: CustomEvent) => openConnect(e.detail.id, e.detail.name);
    const handleOpenDisconnect = (e: CustomEvent) => openDisconnect(e.detail.id, e.detail.name);
    const handleOpenSocSettings = (e: CustomEvent) => openSocSettings(e.detail.id);
    const handleConnectFromPicker = (e: CustomEvent) => {
      closeModal();
      openConnect(e.detail.id, e.detail.name);
    };
    const handleToastSaved = () => showToast('Settings saved!', 'green');
    const handleToastPaused = () => showToast('Account paused for 1 month. Resume anytime.', 'amber');
    const handleToastUpload = () => showToast('Photo uploaded!', 'green');
    const handleToastPhoto = () => showToast('Profile photo updated!', 'green');
    const handleCheckDel = (e: CustomEvent) => checkDelInput(e.detail.value);
    const handleDoDelete = () => doDelete();

    window.addEventListener('close-modal', handleCloseModal);
    window.addEventListener('do-connect', handleDoConnect as EventListener);
    window.addEventListener('do-disconnect', handleDoDisconnect as EventListener);
    window.addEventListener('do-disconnect-all', handleDoDisconnectAll);
    window.addEventListener('open-connect', handleOpenConnect as EventListener);
    window.addEventListener('open-disconnect', handleOpenDisconnect as EventListener);
    window.addEventListener('open-soc-settings', handleOpenSocSettings as EventListener);
    window.addEventListener('connect-from-picker', handleConnectFromPicker as EventListener);
    window.addEventListener('toast-saved', handleToastSaved);
    window.addEventListener('toast-paused', handleToastPaused);
    window.addEventListener('toast-upload', handleToastUpload);
    window.addEventListener('toast-photo', handleToastPhoto);
    window.addEventListener('check-del', handleCheckDel as EventListener);
    window.addEventListener('do-delete', handleDoDelete);

    return () => {
      window.removeEventListener('close-modal', handleCloseModal);
      window.removeEventListener('do-connect', handleDoConnect as EventListener);
      window.removeEventListener('do-disconnect', handleDoDisconnect as EventListener);
      window.removeEventListener('do-disconnect-all', handleDoDisconnectAll);
      window.removeEventListener('open-connect', handleOpenConnect as EventListener);
      window.removeEventListener('open-disconnect', handleOpenDisconnect as EventListener);
      window.removeEventListener('open-soc-settings', handleOpenSocSettings as EventListener);
      window.removeEventListener('connect-from-picker', handleConnectFromPicker as EventListener);
      window.removeEventListener('toast-saved', handleToastSaved);
      window.removeEventListener('toast-paused', handleToastPaused);
      window.removeEventListener('toast-upload', handleToastUpload);
      window.removeEventListener('toast-photo', handleToastPhoto);
      window.removeEventListener('check-del', handleCheckDel as EventListener);
      window.removeEventListener('do-delete', handleDoDelete);
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
        :root { --bg:#F5F6FA; --surf:#ffffff; --surf2:#F8F9FD; --bdr:#E2E4F0; --bdr2:#ECEEF6; --t1:#0B0C1A; --t2:#3D3F60; --t3:#8486AB; --t4:#A0A2BF; --brand:#5B5BD6; --brand2:#7C3AED; --brand-l:#EEEEFF; --gr:#10B981; --rd:#EF4444; --am:#F59E0B; --bl:#3B82F6; --rd-l:#FEF2F2; --glow:0 8px 28px rgba(91,91,214,.24); }
        #main { min-width:0; background:var(--bg); color:var(--t1); }
        #topbar { height:56px; display:flex; align-items:center; gap:10px; padding:0 20px; background:#fff; border-bottom:1px solid var(--bdr); box-shadow:0 1px 4px rgba(11,12,26,.06); position:sticky; top:0; z-index:20; }
        .tb-bc { font-size:12.5px; color:var(--t3); display:flex; align-items:center; gap:6px; }
        .tb-bc a { color:var(--t3); text-decoration:none; }
        .tb-bc .cur { color:var(--t1); font-weight:700; font-family:'Sora',sans-serif; }
        .tb-flex { flex:1; }
        .tb-btn { display:flex; align-items:center; gap:6px; padding:8px 13px; border-radius:8px; font-size:12.5px; font-weight:700; border:1px solid var(--bdr); cursor:pointer; }
        .tb-btn.ghost { background:#fff; color:var(--t2); }
        .tb-btn.solid { background:var(--brand); color:#fff; border-color:var(--brand); box-shadow:var(--glow); }
        .tb-icon { width:30px; height:30px; border-radius:7px; display:flex; align-items:center; justify-content:center; color:var(--t2); position:relative; background:#fff; border:1px solid var(--bdr2); }
        .tb-dot { position:absolute; top:5px; right:5px; width:7px; height:7px; border-radius:50%; background:var(--rd); border:1.5px solid #fff; }
        .tb-ava { width:30px; height:30px; border-radius:8px; background:linear-gradient(135deg,var(--brand),#EC4899); color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; }
        #content { padding:18px 20px 24px; height:calc(100vh - 56px); overflow:auto; }
        .settings-wrap { display:grid; grid-template-columns:260px 1fr; gap:16px; align-items:start; }
        .settings-nav { position:sticky; top:74px; background:#fff; border:1px solid var(--bdr); border-radius:12px; padding:12px; box-shadow:0 1px 4px rgba(11,12,26,.06); }
        .sn-hdr-label { font-size:11px; font-weight:800; letter-spacing:.5px; color:var(--t4); text-transform:uppercase; margin:4px 6px 8px; font-family:'Sora',sans-serif; }
        .sn-item { display:flex; align-items:center; gap:8px; border-radius:9px; padding:9px 10px; font-size:13px; font-weight:700; color:var(--t3); cursor:pointer; }
        .sn-item.active { background:var(--brand-l); color:var(--brand); }
        .sn-item i { width:14px; text-align:center; }
        .sn-sep { height:1px; background:var(--bdr2); margin:8px 2px; }
        .danger-nav.active { background:var(--rd-l); color:var(--rd); }
        .settings-content { display:flex; flex-direction:column; gap:14px; }
        .sph { background:#fff; border:1px solid var(--bdr); border-radius:12px; padding:14px 16px; }
        .sph-eye { font-size:11px; font-weight:700; color:var(--gr); display:inline-flex; align-items:center; gap:7px; }
        .sph-pulse { width:8px; height:8px; border-radius:50%; background:var(--gr); box-shadow:0 0 0 0 rgba(16,185,129,.4); animation:pulse 2s infinite; }
        .sph-title { margin-top:7px; font-size:20px; font-weight:900; color:var(--t1); font-family:'Sora',sans-serif; }
        .sph-sub { margin-top:5px; color:var(--t3); font-size:13px; line-height:1.5; }
        .sec { background:#fff; border:1px solid var(--bdr); border-radius:12px; overflow:hidden; }
        .sec-hdr { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; padding:14px 16px; border-bottom:1px solid var(--bdr2); }
        .sec-title { display:flex; align-items:center; gap:8px; font-size:15px; font-weight:800; color:var(--t1); font-family:'Sora',sans-serif; }
        .sec-sub { margin-top:4px; font-size:12.5px; color:var(--t3); }
        .sec-body { padding:14px 16px; }
        .form-row { display:grid; grid-template-columns:minmax(210px, 270px) 1fr; gap:14px; padding:12px 0; border-bottom:1px solid var(--bdr2); }
        .fr-lbl { font-size:11px; font-weight:800; color:var(--t4); text-transform:uppercase; letter-spacing:.4px; font-family:'Sora',sans-serif; }
        .fr-sub { margin-top:4px; color:var(--t3); font-size:12px; }
        .fr-ctrl { min-width:0; }
        .field { width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--bdr); background:var(--surf2); color:var(--t1); font-size:13px; }
        .field.ok { border-color:rgba(16,185,129,.35); }
        .field.err { border-color:rgba(239,68,68,.45); }
        .char-ct, .field-hint { margin-top:6px; font-size:11px; color:var(--t4); }
        .field-hint.ok { color:var(--gr); } .field-hint.err { color:var(--rd); }
        .badge-row { margin-top:7px; display:flex; align-items:center; gap:10px; }
        .v-badge { padding:3px 8px; border-radius:999px; font-size:11px; font-weight:700; background:#ECFDF5; color:var(--gr); }
        .text-link { color:var(--brand); font-size:12px; font-weight:700; cursor:pointer; }
        .ava-row { display:flex; gap:12px; padding-bottom:12px; border-bottom:1px solid var(--bdr2); margin-bottom:6px; }
        .ava-big { position:relative; width:74px; height:74px; border-radius:14px; background:linear-gradient(135deg,var(--brand),#EC4899); color:#fff; font-size:26px; font-weight:900; display:flex; align-items:center; justify-content:center; cursor:pointer; }
        .ava-overlay { position:absolute; inset:0; border-radius:14px; background:rgba(11,12,26,.35); display:flex; align-items:center; justify-content:center; opacity:0; transition:opacity .14s; }
        .ava-big:hover .ava-overlay { opacity:1; }
        .ava-name { font-size:16px; font-weight:800; color:var(--t1); font-family:'Sora',sans-serif; }
        .ava-role { margin-top:3px; font-size:12px; color:var(--t3); }
        .ava-btns { margin-top:8px; display:flex; gap:8px; }
        .ava-btn { padding:7px 10px; border-radius:8px; border:1px solid var(--bdr); background:#fff; font-size:12px; font-weight:700; color:var(--t2); cursor:pointer; }
        .input-wrap { position:relative; }
        .pw-eye { position:absolute; right:10px; top:50%; transform:translateY(-50%); color:var(--t3); cursor:pointer; }
        .pw-bars { display:grid; grid-template-columns:repeat(4,1fr); gap:5px; margin-top:8px; }
        .pw-bar { height:5px; border-radius:999px; background:var(--bdr2); }
        .pw-bar.weak { background:var(--rd); } .pw-bar.fair { background:var(--am); } .pw-bar.good { background:var(--bl); } .pw-bar.strong { background:var(--gr); }
        .sec-footer { display:flex; justify-content:flex-end; gap:8px; margin-top:12px; padding-top:10px; }
        .btn { padding:9px 12px; border-radius:8px; border:1px solid var(--bdr); background:#fff; color:var(--t2); font-size:12.5px; font-weight:700; cursor:pointer; }
        .btn.primary { background:var(--brand); border-color:var(--brand); color:#fff; }
        .toggle-row { display:flex; justify-content:space-between; gap:12px; align-items:center; padding:10px 0; border-bottom:1px solid var(--bdr2); }
        .tr-lbl { font-size:13px; font-weight:700; color:var(--t2); } .tr-sub { margin-top:4px; font-size:12px; color:var(--t3); }
        .toggle { width:40px; height:22px; border-radius:999px; background:#D7D9E9; position:relative; cursor:pointer; transition:all .15s; }
        .toggle::after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:#fff; transition:left .15s; }
        .toggle.on { background:var(--brand); } .toggle.on::after { left:21px; }
        .notif-col-hdr { display:grid; grid-template-columns:1fr 70px 70px; padding-bottom:8px; border-bottom:1px solid var(--bdr2); margin-bottom:6px; }
        .notif-col-lbl { font-size:11px; font-weight:800; color:var(--t4); text-transform:uppercase; letter-spacing:.4px; }
        .social-row, .notif-row, .session-item, .danger-row { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px; border:1px solid var(--bdr2); border-radius:10px; background:var(--surf2); margin-bottom:8px; }
        .danger-row { align-items:flex-start; }
        .soc-icon, .sess-icon, .dz-icon { width:36px; height:36px; border-radius:9px; display:flex; align-items:center; justify-content:center; color:#fff; flex-shrink:0; }
        .sess-icon { background:#EFF1FB; color:#4B4D6B; }
        .danger-btn { padding:8px 10px; border-radius:8px; border:none; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }
        .danger-btn.blue { background:#EAF2FF; color:#2563EB; } .danger-btn.amber { background:#FFF7E6; color:#B45309; } .danger-btn.red { background:#FEF2F2; color:#DC2626; }
        .dr-title, .dz-title { font-size:13px; font-weight:700; color:var(--t2); }
        .dr-sub, .dz-sub { margin-top:3px; font-size:12px; color:var(--t3); line-height:1.45; }
        #modal-bg { position:fixed; inset:0; background:rgba(11,12,26,.45); backdrop-filter:blur(2px); display:none; align-items:center; justify-content:center; z-index:70; }
        #modal-bg.open { display:flex; }
        .mbox { width:min(560px, 92vw); max-height:90vh; overflow:auto; border-radius:14px; background:#fff; border:1px solid var(--bdr); box-shadow:0 20px 60px rgba(11,12,26,.25); }
        #toast-stack { position:fixed; top:84px; right:18px; z-index:99999; display:flex; flex-direction:column; gap:8px; }
        .toast { min-width:260px; max-width:360px; display:flex; align-items:center; gap:8px; padding:10px 12px; border-radius:10px; background:#fff; border:1px solid var(--bdr); box-shadow:0 8px 26px rgba(11,12,26,.18); color:var(--t1); font-size:13px; font-weight:700; line-height:1.35; }
        .toast.green { background:#ECFDF5; border-color:rgba(16,185,129,.4); color:#065F46; }
        .toast.red { background:#FEF2F2; border-color:rgba(239,68,68,.38); color:#991B1B; }
        .toast.brand { background:#EEF2FF; border-color:rgba(91,91,214,.35); color:#3730A3; }
        .toast.amber { background:#FFF7ED; border-color:rgba(245,158,11,.42); color:#92400E; }
        .toast .t-x { cursor:pointer; color:inherit; font-weight:900; opacity:.75; }
        @keyframes pulse { 0%{box-shadow:0 0 0 0 rgba(16,185,129,.35)} 70%{box-shadow:0 0 0 10px rgba(16,185,129,0)} 100%{box-shadow:0 0 0 0 rgba(16,185,129,0)} }
        @media (max-width: 1024px) { .settings-wrap { grid-template-columns:1fr; } .settings-nav { position:static; } .form-row { grid-template-columns:1fr; } }
      `}</style>
      <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
        {/* Import the Sidebar component */}
        <Sidebar slim={sidebarSlim} onToggle={() => setSidebarSlim((s) => !s)} activePath="/dashboards/settings" />
        
        <div id="main" style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <AdminHeader
          pageTitle="Account Settings"
          slim={sidebarSlim}
          onToggle={() => setSidebarSlim((s) => !s)}
          searchPlaceholder="Search settings…"
          userName={user?.name}
          userInitials={initials}
          actionButton={
            <button
              onClick={saveAll}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 7, background: "#5B5BD6", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "Sora,sans-serif", boxShadow: "0 4px 20px rgba(91,91,214,.28)" }}
            >
              <i className="fa-solid fa-check" style={{ fontSize: 11 }} /> Save Changes
            </button>
          }
        />

        <div id="content">
          <div className="settings-wrap">
            {/* Settings Nav */}
            <div className="settings-nav">
              <div className="sn-hdr"><div className="sn-hdr-label">Settings</div></div>
              <div className={`sn-item ${activeSection === 'profile' ? 'active' : ''}`} onClick={(e) => goToSection('profile', e.currentTarget)}>
                <i className="fa-solid fa-user"></i>Profile
              </div>
              <div className={`sn-item ${activeSection === 'security' ? 'active' : ''}`} onClick={(e) => goToSection('security', e.currentTarget)}>
                <i className="fa-solid fa-shield-halved"></i>Security
              </div>
              <div className={`sn-item ${activeSection === 'social' ? 'active' : ''}`} onClick={(e) => goToSection('social', e.currentTarget)}>
                <i className="fa-solid fa-share-nodes"></i>Social Accounts
              </div>
              <div className={`sn-item ${activeSection === 'notif' ? 'active' : ''}`} onClick={(e) => goToSection('notif', e.currentTarget)}>
                <i className="fa-solid fa-bell"></i>Notifications
              </div>
              <div className={`sn-item ${activeSection === 'appearance' ? 'active' : ''}`} onClick={(e) => goToSection('appearance', e.currentTarget)}>
                <i className="fa-solid fa-palette"></i>Appearance
              </div>
              <div className="sn-sep"></div>
              <div className={`sn-item danger-nav ${activeSection === 'danger' ? 'active' : ''}`} onClick={(e) => goToSection('danger', e.currentTarget)}>
                <i className="fa-solid fa-triangle-exclamation"></i>Danger Zone
              </div>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              {/* Page Header */}
              <div className="sph">
                <div className="sph-eye"><div className="sph-pulse"></div>Account Settings</div>
                <div className="sph-title">Manage Your Account</div>
                <div className="sph-sub">Update your profile, secure your account, manage connected social platforms, and control notifications.</div>
              </div>

              {/* Profile Section */}
              <div className="sec" id="sec-profile" style={{ animationDelay: '0.04s' }}>
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
                        <button className="ava-btn up" onClick={() => avatarInputRef.current?.click()}><i className="fa-solid fa-upload" style={{ fontSize: '10px' }}></i> Upload Photo</button>
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
                    <div><div className="fr-lbl">Industry</div><div className="fr-sub">Required for AI post generation</div></div>
                    <div className="fr-ctrl">
                      <select
                        className="field"
                        value={profileData.industryId}
                        onChange={(e) => {
                          const value = e.target.value;
                          setProfileData((prev) => ({
                            ...prev,
                            industryId: value,
                            subIndustryId: '',
                          }));
                        }}
                      >
                        <option value="">Select industry</option>
                        {industries.map((ind) => (
                          <option key={String(ind.id)} value={String(ind.id)}>{ind.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Sub-industry</div><div className="fr-sub">Required for API post generation context</div></div>
                    <div className="fr-ctrl">
                      <select
                        className="field"
                        value={profileData.subIndustryId}
                        onChange={(e) => handleProfileChange('subIndustryId', e.target.value)}
                        disabled={!profileData.industryId || subIndustryOptions.length === 0}
                      >
                        <option value="">Select sub-industry</option>
                        {subIndustryOptions.map((sub) => (
                          <option key={String(sub.id)} value={String(sub.id)}>{sub.name}</option>
                        ))}
                      </select>
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

              {/* Security Section */}
              <div className="sec" id="sec-security" style={{ animationDelay: '0.08s' }}>
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
                  <div className="sec-subhdr"><div className="sec-subhdr-lbl">Active Sessions</div></div>
                  <div className="session-item">
                    <div className="sess-icon"><i className="fa-solid fa-laptop"></i></div>
                    <div className="sess-info"><div className="sess-device">MacBook Pro · Chrome 122</div><div className="sess-meta">San Francisco, CA · Active now</div></div>
                    <div className="sess-cur">Current</div>
                  </div>
                  <div className="session-item" id="sess-iphone">
                    <div className="sess-icon"><i className="fa-solid fa-mobile-screen"></i></div>
                    <div className="sess-info"><div className="sess-device">iPhone 15 Pro · Safari</div><div className="sess-meta">San Francisco, CA · 2 hours ago</div></div>
                    <button className="sess-revoke" onClick={() => revokeSession('sess-iphone', 'iPhone 15 Pro')}>Revoke</button>
                  </div>
                  <div className="session-item" id="sess-win">
                    <div className="sess-icon"><i className="fa-brands fa-windows"></i></div>
                    <div className="sess-info"><div className="sess-device">Windows PC · Firefox 121</div><div className="sess-meta">New York, NY · 3 days ago</div></div>
                    <button className="sess-revoke" onClick={() => revokeSession('sess-win', 'Windows PC')}>Revoke</button>
                  </div>
                  <div className="sec-footer">
                    <button className="btn ghost" style={{ color: 'var(--rd)', borderColor: 'rgba(239,68,68,.3)' }} onClick={revokeAll}>
                      <i className="fa-solid fa-right-from-bracket" style={{ fontSize: '10px' }}></i> Sign Out All Other Sessions
                    </button>
                  </div>
                </div>
              </div>

              {/* Social Accounts Section */}
              <div className="sec" id="sec-social" style={{ animationDelay: '0.12s' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-share-nodes"></i>Connected Social Accounts</div>
                    <div className="sec-sub">Manage which platforms Shoutly AI can post to on your behalf</div>
                  </div>
                  <button className="btn primary" onClick={openPickerModal}><i className="fa-solid fa-plus" style={{ fontSize: '10px' }}></i> Connect Account</button>
                </div>
                <div className="sec-body" id="socialGrid">
                  {renderSocials()}
                </div>
              </div>

              {/* Notifications Section */}
              <div className="sec" id="sec-notif" style={{ animationDelay: '0.16s' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-bell"></i>Notification Preferences</div>
                    <div className="sec-sub">Choose how and when Shoutly AI contacts you</div>
                  </div>
                </div>
                <div className="sec-body">
                  <div className="notif-col-hdr">
                    <div className="notif-col-lbl">Notification</div>
                    <div className="notif-col-lbl" style={{ textAlign: 'center' }}>Email</div>
                    <div className="notif-col-lbl" style={{ textAlign: 'center' }}>Push</div>
                  </div>
                  <div id="notifList">
                    {renderNotifs()}
                  </div>
                </div>
              </div>

              {/* Appearance Section */}
              <div className="sec" id="sec-appearance" style={{ animationDelay: '0.20s' }}>
                <div className="sec-hdr">
                  <div>
                    <div className="sec-title"><i className="fa-solid fa-palette"></i>Appearance</div>
                    <div className="sec-sub">Customize the look and feel of your dashboard</div>
                  </div>
                </div>
                <div className="sec-body">
                  <div className="form-row">
                    <div><div className="fr-lbl">Theme</div><div className="fr-sub">Choose your preferred color theme</div></div>
                    <div className="fr-ctrl">
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div id="th-light" onClick={() => setTheme('light')} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${theme === 'light' ? 'var(--brand)' : 'var(--bdr)'}`, background: theme === 'light' ? 'var(--brand-l)' : 'var(--surf2)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>☀️</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: theme === 'light' ? 'var(--brand)' : 'var(--t2)', fontFamily: "'Sora', sans-serif" }}>Light</div>
                        </div>
                        <div id="th-dark" onClick={() => setTheme('dark')} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${theme === 'dark' ? 'var(--brand)' : 'var(--bdr)'}`, background: theme === 'dark' ? 'var(--brand-l)' : 'var(--surf2)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>🌙</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: theme === 'dark' ? 'var(--brand)' : 'var(--t2)', fontFamily: "'Sora', sans-serif" }}>Dark</div>
                        </div>
                        <div id="th-system" onClick={() => setTheme('system')} style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `2px solid ${theme === 'system' ? 'var(--brand)' : 'var(--bdr)'}`, background: theme === 'system' ? 'var(--brand-l)' : 'var(--surf2)', cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                          <div style={{ fontSize: '20px', marginBottom: '5px' }}>🖥️</div>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: theme === 'system' ? 'var(--brand)' : 'var(--t2)', fontFamily: "'Sora', sans-serif" }}>System</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="form-row">
                    <div><div className="fr-lbl">Sidebar Density</div><div className="fr-sub">How compact the sidebar navigation appears</div></div>
                    <div className="fr-ctrl">
                      <select className="field" defaultValue="Comfortable" onChange={() => showToast('Density updated', 'brand')}>
                        <option>Comfortable</option><option>Compact</option><option>Spacious</option>
                      </select>
                    </div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Animations &amp; Transitions</div><div className="tr-sub">Smooth animations when navigating the dashboard.</div></div>
                    <div className={`toggle ${toggles.animations ? 'on' : ''}`} onClick={() => toggleSwitch('animations')}></div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Compact Calendar View</div><div className="tr-sub">Show more posts per row in the content calendar.</div></div>
                    <div className={`toggle ${toggles.compact ? 'on' : ''}`} onClick={() => toggleSwitch('compact')}></div>
                  </div>
                  <div className="toggle-row">
                    <div><div className="tr-lbl">Show AI Confidence Scores</div><div className="tr-sub">Display engagement prediction scores on post cards.</div></div>
                    <div className={`toggle ${toggles.scores ? 'on' : ''}`} onClick={() => toggleSwitch('scores')}></div>
                  </div>
                </div>
              </div>

              {/* Danger Zone Section */}
              <div className="sec" id="sec-danger" style={{ animationDelay: '0.24s' }}>
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
                  <div className="danger-row">
                    <div><div className="dr-title">Delete Account</div><div className="dr-sub">Permanently delete your account and <strong>all data</strong> — brands, posts, reels, billing history. <strong>Cannot be undone.</strong></div></div>
                    <button className="danger-btn red" onClick={openDeleteModal}><i className="fa-solid fa-trash" style={{ fontSize: '11px' }}></i> Delete Account</button>
                  </div>
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