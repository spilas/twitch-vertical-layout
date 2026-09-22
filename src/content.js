(() => {
  const ROOT_CLASS = "tvl-portrait-layout";
  const CHAT_FILL_CLASS = "tvl-chat-fill";
  const CHAT_COLUMN_SELECTOR =
    ".channel-root__right-column, [data-a-target='right-column-chat-bar']";
  const WATCH_ROOT_SELECTORS = [
    ".channel-root",
    "[data-a-target='channel-root']",
    "main"
  ];

  const clearChatFillClasses = () => {
    document.querySelectorAll(`.${CHAT_FILL_CLASS}`).forEach((element) => {
      element.classList.remove(CHAT_FILL_CLASS);
    });
  };

  const markChatContainers = () => {
    const chatColumn = document.querySelector(CHAT_COLUMN_SELECTOR);
    if (!chatColumn) {
      return;
    }

    for (const child of chatColumn.children) {
      child.classList.add(CHAT_FILL_CLASS);
    }

    const chatElements = chatColumn.querySelectorAll(
      "[data-a-target='chat-room-component-layout'], .chat-room, .stream-chat, .chat-shell, [data-a-target='chat-input'], [contenteditable='true']"
    );

    for (const chatElement of chatElements) {
      let container = chatElement.matches(
        "[data-a-target='chat-input'], [contenteditable='true']"
      )
        ? chatElement.parentElement
        : chatElement;

      while (container && container !== chatColumn) {
        container.classList.add(CHAT_FILL_CLASS);
        container = container.parentElement;
      }
    }
  };

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

    clearChatFillClasses();
    if (shouldEnable) {
      markChatContainers();
    }

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
