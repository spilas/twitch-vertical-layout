(() => {
  const ROOT_CLASS = "tvl-portrait-layout";
  const WATCH_ROOT_SELECTORS = [
    ".channel-root",
    "[data-a-target='channel-root']",
    "main"
  ];

  const hasWatchLayout = () => {
    const chat = document.querySelector(
      ".channel-root__right-column, [data-a-target='right-column-chat-bar'], [data-a-target='chat-room-component-layout']"
    );
    const player = document.querySelector(
      ".channel-root__player, [data-a-target='video-player'], .persistent-player"
    );

    return Boolean(chat && player);
  };

  const syncClass = () => {
    const shouldEnable =
      window.matchMedia("(orientation: portrait)").matches &&
      hasWatchLayout();

    document.documentElement.classList.toggle(ROOT_CLASS, shouldEnable);

    for (const selector of WATCH_ROOT_SELECTORS) {
      const element = document.querySelector(selector);
      if (element) {
        element.classList.toggle(ROOT_CLASS, shouldEnable);
      }
    }
  };

  const observer = new MutationObserver(syncClass);

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });

  window.addEventListener("resize", syncClass, { passive: true });
  window.addEventListener("orientationchange", syncClass, { passive: true });

  syncClass();
})();
