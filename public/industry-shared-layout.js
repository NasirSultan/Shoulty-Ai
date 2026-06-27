(function () {
  var HOME_PATH = '/';
  var HEADER_HOST_ID = 'industry-shared-home-header-host';
  var FOOTER_HOST_ID = 'industry-shared-home-footer-host';
  var SHELL_CACHE_KEY = 'industry_shared_home_shell_v2';

  function getStoredUserProfile() {
    var token = null;
    var rawUser = null;

    try {
      token = window.localStorage.getItem('shoutly_token');
      rawUser = window.localStorage.getItem('shoutly_user');
    } catch (_err) {
      return null;
    }

    if (!token) {
      return null;
    }

    if (!rawUser) {
      return {};
    }

    try {
      return JSON.parse(rawUser) || {};
    } catch (_err) {
      return {};
    }
  }

  function getCompactName(name) {
    if (!name || typeof name !== 'string') {
      return 'Profile';
    }

    var first = name.trim().split(/\s+/)[0] || 'Profile';
    if (first.length <= 14) {
      return first;
    }
    return first.slice(0, 14) + '...';
  }

  function getInitial(name, email) {
    var source = '';
    if (typeof name === 'string' && name.trim()) {
      source = name.trim();
    } else if (typeof email === 'string' && email.trim()) {
      source = email.trim();
    }

    return source ? source.charAt(0).toUpperCase() : 'U';
  }

  function updateAuthContainerToLoggedIn(container, user) {
    if (!container) return;

    if (!container.dataset.industryAuthBackup) {
      container.dataset.industryAuthBackup = container.innerHTML;
    }

    container.dataset.industryAuthMode = 'logged-in';
    container.style.position = 'relative';
    container.innerHTML = '';

    var profileWrap = document.createElement('div');
    profileWrap.style.position = 'relative';

    var button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.gap = '8px';
    button.style.border = '0';
    button.style.background = 'transparent';
    button.style.cursor = 'pointer';
    button.style.padding = '0';

    if (user.picture) {
      var img = document.createElement('img');
      img.src = user.picture;
      img.alt = 'Profile';
      img.width = 36;
      img.height = 36;
      img.style.width = '36px';
      img.style.height = '36px';
      img.style.borderRadius = '9999px';
      img.style.objectFit = 'cover';
      img.style.border = '1px solid #e5e7eb';
      img.onerror = function () {
        this.style.display = 'none';
      };
      button.appendChild(img);
    } else {
      var fallback = document.createElement('div');
      fallback.textContent = getInitial(user.name, user.email);
      fallback.style.width = '36px';
      fallback.style.height = '36px';
      fallback.style.borderRadius = '9999px';
      fallback.style.background = '#111827';
      fallback.style.color = '#ffffff';
      fallback.style.display = 'inline-flex';
      fallback.style.alignItems = 'center';
      fallback.style.justifyContent = 'center';
      fallback.style.fontSize = '14px';
      fallback.style.fontWeight = '700';
      button.appendChild(fallback);
    }

    var name = document.createElement('span');
    name.textContent = getCompactName(user.name || user.email || 'Profile');
    name.style.fontSize = '14px';
    name.style.fontWeight = '600';
    name.style.color = '#111827';
    button.appendChild(name);

    var chevron = document.createElement('span');
    chevron.textContent = '▾';
    chevron.style.fontSize = '12px';
    chevron.style.color = '#6b7280';
    button.appendChild(chevron);

    var dropdown = document.createElement('div');
    dropdown.style.position = 'absolute';
    dropdown.style.right = '0';
    dropdown.style.top = 'calc(100% + 10px)';
    dropdown.style.minWidth = '210px';
    dropdown.style.background = '#ffffff';
    dropdown.style.border = '1px solid #e5e7eb';
    dropdown.style.borderRadius = '12px';
    dropdown.style.boxShadow = '0 12px 28px rgba(17,24,39,0.12)';
    dropdown.style.padding = '8px';
    dropdown.style.display = 'none';
    dropdown.style.zIndex = '1000';

    if (user.name || user.email) {
      var identity = document.createElement('div');
      identity.style.padding = '8px 10px 10px';
      identity.style.borderBottom = '1px solid #f3f4f6';
      identity.style.marginBottom = '6px';

      if (user.name) {
        var nameRow = document.createElement('div');
        nameRow.textContent = user.name;
        nameRow.style.fontSize = '13px';
        nameRow.style.fontWeight = '700';
        nameRow.style.color = '#111827';
        nameRow.style.whiteSpace = 'nowrap';
        nameRow.style.overflow = 'hidden';
        nameRow.style.textOverflow = 'ellipsis';
        identity.appendChild(nameRow);
      }

      if (user.email) {
        var emailRow = document.createElement('div');
        emailRow.textContent = user.email;
        emailRow.style.fontSize = '12px';
        emailRow.style.color = '#6b7280';
        emailRow.style.whiteSpace = 'nowrap';
        emailRow.style.overflow = 'hidden';
        emailRow.style.textOverflow = 'ellipsis';
        identity.appendChild(emailRow);
      }

      dropdown.appendChild(identity);
    }

    function createMenuLink(href, text) {
      var link = document.createElement('a');
      link.href = href;
      link.textContent = text;
      link.style.display = 'block';
      link.style.padding = '8px 10px';
      link.style.borderRadius = '8px';
      link.style.fontSize = '13px';
      link.style.color = '#374151';
      link.style.textDecoration = 'none';
      link.onmouseenter = function () {
        link.style.background = '#f9fafb';
      };
      link.onmouseleave = function () {
        link.style.background = 'transparent';
      };
      return link;
    }

    dropdown.appendChild(createMenuLink('/dashboards/settings', 'Profile'));
    dropdown.appendChild(createMenuLink('/dashboards', 'Dashboard'));

    var signOut = document.createElement('button');
    signOut.type = 'button';
    signOut.textContent = 'Sign Out';
    signOut.style.width = '100%';
    signOut.style.marginTop = '4px';
    signOut.style.textAlign = 'left';
    signOut.style.padding = '8px 10px';
    signOut.style.border = '0';
    signOut.style.borderRadius = '8px';
    signOut.style.background = 'transparent';
    signOut.style.color = '#dc2626';
    signOut.style.fontSize = '13px';
    signOut.style.cursor = 'pointer';
    signOut.onmouseenter = function () {
      signOut.style.background = '#fef2f2';
    };
    signOut.onmouseleave = function () {
      signOut.style.background = 'transparent';
    };
    signOut.onclick = function () {
      try {
        window.localStorage.removeItem('shoutly_token');
        window.localStorage.removeItem('shoutly_user');
      } catch (_err) {
        // Ignore storage errors and continue navigation.
      }
      window.dispatchEvent(new Event('auth-changed'));
      window.location.href = '/';
    };
    dropdown.appendChild(signOut);

    profileWrap.appendChild(button);
    profileWrap.appendChild(dropdown);
    container.appendChild(profileWrap);

    button.onclick = function (evt) {
      evt.stopPropagation();
      var isOpen = dropdown.style.display === 'block';
      dropdown.style.display = isOpen ? 'none' : 'block';
      button.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
    };

    if (!container.dataset.industryAuthDocListener) {
      document.addEventListener('click', function (evt) {
        if (!container.contains(evt.target)) {
          dropdown.style.display = 'none';
          button.setAttribute('aria-expanded', 'false');
        }
      });
      container.dataset.industryAuthDocListener = '1';
    }
  }

  function restoreAuthContainerToLoggedOut(container) {
    if (!container) return;
    if (container.dataset.industryAuthMode !== 'logged-in') return;
    if (!container.dataset.industryAuthBackup) return;

    container.innerHTML = container.dataset.industryAuthBackup;
    container.dataset.industryAuthMode = 'logged-out';
  }

  function getAuthContainers(root) {
    if (!root) return [];
    var containers = [];
    var signInLinks = root.querySelectorAll('a[href="/sign-in"]');

    for (var i = 0; i < signInLinks.length; i++) {
      var parent = signInLinks[i].parentElement;
      if (!parent) continue;
      if (parent.querySelector('a[href="/sign-up"]') && containers.indexOf(parent) === -1) {
        containers.push(parent);
      }
    }

    var transformed = root.querySelectorAll('[data-industry-auth-mode="logged-in"]');
    for (var j = 0; j < transformed.length; j++) {
      if (containers.indexOf(transformed[j]) === -1) {
        containers.push(transformed[j]);
      }
    }

    return containers;
  }

  function syncHeaderAuthState(headerHost) {
    if (!headerHost) return;

    var root = headerHost.shadowRoot || headerHost;
    if (!root) return;

    var user = getStoredUserProfile();
    var containers = getAuthContainers(root);

    for (var k = 0; k < containers.length; k++) {
      if (user) {
        updateAuthContainerToLoggedIn(containers[k], user);
      } else {
        restoreAuthContainerToLoggedOut(containers[k]);
      }
    }

    if (!user) return;

    var signInLinks = root.querySelectorAll('a[href="/sign-in"]');
    var signUpLinks = root.querySelectorAll('a[href="/sign-up"]');

    for (var i = 0; i < signInLinks.length; i++) {
      signInLinks[i].setAttribute('href', '/dashboards/settings');
      signInLinks[i].textContent = getCompactName(user.name);
      signInLinks[i].setAttribute('title', user.name || 'Profile');
    }

    for (var j = 0; j < signUpLinks.length; j++) {
      signUpLinks[j].setAttribute('href', '/dashboards');
      signUpLinks[j].textContent = 'Dashboard';
      signUpLinks[j].setAttribute('title', 'Dashboard');
    }
  }

  function getCachedShell() {
    try {
      var raw = window.localStorage.getItem(SHELL_CACHE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (!parsed || !parsed.headerHtml || !parsed.footerHtml || !parsed.stylesheetHrefs) {
        return null;
      }
      return parsed;
    } catch (_err) {
      return null;
    }
  }

  function setCachedShell(shellData) {
    try {
      window.localStorage.setItem(SHELL_CACHE_KEY, JSON.stringify(shellData));
    } catch (_err) {
      // Ignore cache write errors.
    }
  }

  function parseHomeShell(html) {
    var parser = new DOMParser();
    var homeDoc = parser.parseFromString(html, 'text/html');

    var homeHeader = homeDoc.querySelector('header');
    var homeFooter = homeDoc.querySelector('footer');
    if (!homeHeader || !homeFooter) return null;

    return {
      headerHtml: homeHeader.outerHTML,
      footerHtml: homeFooter.outerHTML,
      stylesheetHrefs: getHomeStylesheetHrefs(homeDoc),
      cachedAt: Date.now()
    };
  }

  function mountShell(shellData) {
    var headerHost = mountHomeFragmentInShadow(
      HEADER_HOST_ID,
      'header',
      shellData.headerHtml,
      shellData.stylesheetHrefs
    );
    var footerHost = mountHomeFragmentInShadow(
      FOOTER_HOST_ID,
      'footer',
      shellData.footerHtml,
      shellData.stylesheetHrefs
    );

    replaceOrInsertElement('header, #' + HEADER_HOST_ID, headerHost, 'afterbegin');
    replaceOrInsertElement('footer, #' + FOOTER_HOST_ID, footerHost, 'beforeend');

    syncHeaderAuthState(headerHost);
    removeDuplicates('header');
    removeDuplicates('footer');

    window.addEventListener('storage', function () {
      syncHeaderAuthState(headerHost);
    });
    window.addEventListener('auth-changed', function () {
      syncHeaderAuthState(headerHost);
    });
  }

  function hideExistingShellUntilMounted() {
    var style = document.createElement('style');
    style.setAttribute('data-industry-shell-hide', '1');
    style.textContent = 'body > header, body > footer { visibility: hidden !important; }';
    document.head.appendChild(style);

    return function showExistingShell() {
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }

  function toAbsoluteUrl(url) {
    try {
      return new URL(url, window.location.origin).toString();
    } catch (_err) {
      return url;
    }
  }

  function getHomeStylesheetHrefs(homeDoc) {
    var stylesheetLinks = homeDoc.querySelectorAll('link[rel="stylesheet"]');
    var hrefs = [];
    for (var i = 0; i < stylesheetLinks.length; i++) {
      var href = stylesheetLinks[i].getAttribute('href');
      if (!href) continue;
      hrefs.push(toAbsoluteUrl(href));
    }
    return hrefs;
  }

  function replaceOrInsertElement(selector, element, position) {
    var existing = document.querySelector(selector);
    if (existing) {
      existing.replaceWith(element);
      return;
    }
    if (position === 'afterbegin') {
      document.body.prepend(element);
      return;
    }
    document.body.appendChild(element);
  }

  function removeDuplicates(tagName) {
    var nodes = document.querySelectorAll(tagName);
    for (var i = 1; i < nodes.length; i++) {
      nodes[i].remove();
    }
  }

  function mountHomeFragmentInShadow(hostId, tagName, html, stylesheetHrefs) {
    var existingHost = document.getElementById(hostId);
    if (existingHost) {
      existingHost.remove();
    }

    var host = document.createElement('div');
    host.id = hostId;

    if (!host.attachShadow) {
      host.innerHTML = html;
      return host;
    }

    var shadow = host.attachShadow({ mode: 'open' });
    var frag = document.createDocumentFragment();

    // Isolate from page styles while preserving normal document flow.
    var reset = document.createElement('style');
    reset.textContent = ':host{all:initial;display:block;}';
    frag.appendChild(reset);

    for (var i = 0; i < stylesheetHrefs.length; i++) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = stylesheetHrefs[i];
      frag.appendChild(link);
    }

    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    var fragmentNode = wrapper.querySelector(tagName);
    if (fragmentNode) {
      frag.appendChild(fragmentNode);
    }

    shadow.appendChild(frag);
    return host;
  }

  async function applyExactHomeShell() {
    var revealExistingShell = hideExistingShellUntilMounted();
    var mounted = false;

    try {
      var cachedShell = getCachedShell();
      if (cachedShell) {
        mountShell(cachedShell);
        mounted = true;
      }

      var response = await fetch(HOME_PATH, {
        credentials: 'same-origin',
        cache: 'no-store'
      });
      if (!response.ok) {
        if (mounted) return;
        revealExistingShell();
        return;
      }

      var html = await response.text();
      var parsedShell = parseHomeShell(html);
      if (!parsedShell) {
        if (!mounted) {
          revealExistingShell();
        }
        return;
      }

      setCachedShell(parsedShell);
      mountShell(parsedShell);
      mounted = true;
    } catch (_err) {
      // Silent fail keeps page functional even if home shell cannot be fetched.
      if (!mounted) {
        revealExistingShell();
      }
      return;
    }

    revealExistingShell();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyExactHomeShell);
  } else {
    applyExactHomeShell();
  }
})();
