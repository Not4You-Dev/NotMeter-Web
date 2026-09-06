(() => {
  const icons = {
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M8 7h8M8 11h2m4 0h2M8 15h2m4 0h2M8 18h2m4 0h2"/>',
    chart: '<path d="M4 19V9m5 10V5m5 14v-7m5 7V3"/><path d="M3 21h18"/>',
    book: '<path d="M4 5.5A3.5 3.5 0 0 1 7.5 4H11v15H7.5A3.5 3.5 0 0 0 4 20.5zM20 5.5A3.5 3.5 0 0 0 16.5 4H13v15h3.5a3.5 3.5 0 0 1 3.5 1.5z"/>',
    shield: '<path d="M12 3 20 6v5c0 5-3.2 8.3-8 10-4.8-1.7-8-5-8-10V6z"/><path d="m9 12 2 2 4-4"/>',
    trophy: '<path d="M8 4h8v4a4 4 0 0 1-8 0zM10 16h4m-2-4v4m-4 4h8"/><path d="M8 6H5v1a4 4 0 0 0 4 4m7-5h3v1a4 4 0 0 1-4 4"/>',
    swords: '<path d="m14.5 5.5 4-2-2 4L8 16l-3 3m0-4 4 4"/><path d="m9.5 5.5-4-2 2 4L16 16l3 3m0-4-4 4"/>',
    map: '<path d="m4 6 5-2 6 2 5-2v14l-5 2-6-2-5 2zM9 4v14m6-12v14"/><circle cx="15" cy="11" r="2"/>',
    sliders: '<path d="M4 7h8m4 0h4M4 17h3m4 0h9"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>',
    user: '<circle cx="12" cy="8" r="3"/><path d="M5.5 20c.8-4 3-6 6.5-6s5.7 2 6.5 6"/>',
    refresh: '<path d="M20 7v5h-5"/><path d="M19 12a7 7 0 1 0-2 5"/>',
    arrowLeft: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    medal: '<circle cx="12" cy="8" r="5"/><path d="m8.5 12-2 9 5.5-3 5.5 3-2-9"/>',
    pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
    camera: '<path d="M5 7h3l1.3-2h5.4L16 7h3a2 2 0 0 1 2 2v9H3V9a2 2 0 0 1 2-2z"/><circle cx="12" cy="12.5" r="3.5"/>',
    discord: '<path d="M8.2 8.3a10 10 0 0 1 7.6 0M9 15c2 1 4 1 6 0"/><circle cx="9" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="1" fill="currentColor" stroke="none"/><path d="M7 5.5 4.5 7c-1 2.2-1.5 4.8-1.5 7.5 1.3 1.5 2.8 2.6 4.5 3.2l1-1.7m8 0 1 1.7c1.7-.6 3.2-1.7 4.5-3.2 0-2.7-.5-5.3-1.5-7.5L17 5.5"/>',
    chevronDown: '<path d="m7 10 5 5 5-5"/>',
    clipboard: '<rect x="6" y="5" width="12" height="16" rx="2"/><path d="M9 5V3h6v2M9 10h6m-6 4h6"/>',
  };

  const svg = (name) => `<svg class="theme-line-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
  const replacements = [
    ['.stat-efficiency-link-icon', 'calculator'],
    ['.class-performance-link-icon', 'chart'],
    ['.contribution-link-icon', 'book'],
    ['.boss-resistance-link-icon', 'shield'],
    ['.class-top10-link-icon', 'trophy'],
    ['.optimization-link-icon', 'sliders'],
    ['.discord-icon', 'discord'],
    ['.download-icon', 'download'],
    ['.character-search-intro-mark', 'user'],
    ['.character-search-mark', 'search'],
    ['.ranking-back-button-icon', 'arrowLeft'],
    ['.contribution-heading-icon', 'book'],
    ['.boss-resistance-page-icon', 'shield'],
    ['.stat-efficiency-heading-icon', 'calculator'],
  ];

  const applyIcons = (root = document) => {
    replacements.forEach(([selector, name]) => {
      root.querySelectorAll(selector).forEach((element) => {
        if (element.dataset.themeIcon === name) return;
        element.innerHTML = svg(name);
        element.dataset.themeIcon = name;
      });
    });

    root.querySelectorAll('.refresh-glyph').forEach((element) => {
      element.innerHTML = svg('refresh');
      element.dataset.themeIcon = 'refresh';
    });

    root.querySelectorAll('[data-artifact-snapshot-icon]').forEach((element) => {
      element.innerHTML = svg('camera');
      element.dataset.themeIcon = 'camera';
    });

    root.querySelectorAll('.sample-basis-icon').forEach((element) => {
      element.innerHTML = svg('pulse');
      element.dataset.themeIcon = 'pulse';
    });

    root.querySelectorAll('.weekly-guide-icon').forEach((element) => {
      const name = element.closest('.ranker-dungeon-guide') ? 'medal' : 'info';
      element.innerHTML = svg(name);
      element.dataset.themeIcon = name;
    });

    root.querySelectorAll('.weekly-guide-toggle').forEach((element) => {
      element.innerHTML = svg('chevronDown');
      element.dataset.themeIcon = 'chevronDown';
    });

    root.querySelectorAll('.stat-import-step').forEach((element) => {
      element.innerHTML = svg('clipboard');
      element.dataset.themeIcon = 'clipboard';
    });

    root.querySelectorAll('.live-calculation-note > span[aria-hidden="true"], .test-notice > span[aria-hidden="true"]').forEach((element) => {
      element.innerHTML = svg('pulse');
      element.dataset.themeIcon = 'pulse';
    });
  };

  const applyLanguageFlags = (root = document) => {
    root.querySelectorAll('.language-select').forEach((element) => {
      const syncFlag = () => {
        element.dataset.language = element.value || 'ko';
        const wrapper = element.closest('.language-select-wrap');
        if (wrapper) wrapper.dataset.language = element.dataset.language;
      };
      syncFlag();
      if (element.dataset.themeFlagBound === 'true') return;
      element.addEventListener('change', syncFlag);
      element.dataset.themeFlagBound = 'true';
    });
  };

  const start = () => {
    applyIcons();
    applyLanguageFlags();
    if (!document.body) return;

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) applyIcons(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  };

  document.documentElement.classList.add('purchased-theme');
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
