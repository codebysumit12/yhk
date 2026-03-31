import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext(null);

// ── Messages rotate during full-page loads ───────────────────────────────────
const COOKING_MESSAGES = [
  'Firing up the kitchen…',
  'Chopping fresh ingredients…',
  'Simmering with love…',
  'Plating your experience…',
  'Seasoning to perfection…',
  'Almost ready to serve…',
  'Adding the finishing touch…',
  'Bringing flavours together…',
];

export const LoadingProvider = ({ children }) => {
  // Full-page loading (page transitions)
  const [isPageLoading, setIsPageLoading]     = useState(false);
  const [pageMessage, setPageMessage]         = useState(COOKING_MESSAGES[0]);
  const [loadingVariant, setLoadingVariant]   = useState('default'); // 'default' | 'menu' | 'cart' | 'order'

  // Inline spinner (small areas inside cards/sections)
  const [inlineLoaders, setInlineLoaders]     = useState({}); // { [id]: boolean }

  const messageIndexRef = useRef(0);
  const messageTimerRef = useRef(null);

  // ── Rotate cooking messages while loading ─────────────────────────────────
  const startMessageRotation = useCallback(() => {
    messageTimerRef.current = setInterval(() => {
      messageIndexRef.current = (messageIndexRef.current + 1) % COOKING_MESSAGES.length;
      setPageMessage(COOKING_MESSAGES[messageIndexRef.current]);
    }, 1800);
  }, []);

  const stopMessageRotation = useCallback(() => {
    if (messageTimerRef.current) {
      clearInterval(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    messageIndexRef.current = 0;
    setPageMessage(COOKING_MESSAGES[0]);
  }, []);

  // ── Full-page loading controls ────────────────────────────────────────────
  const showPageLoader = useCallback((variant = 'default') => {
    setLoadingVariant(variant);
    setIsPageLoading(true);
    startMessageRotation();
  }, [startMessageRotation]);

  const hidePageLoader = useCallback(() => {
    stopMessageRotation();
    // Small delay so the exit animation plays
    setTimeout(() => setIsPageLoading(false), 300);
  }, [stopMessageRotation]);

  // ── Inline loader controls ────────────────────────────────────────────────
  const showInlineLoader = useCallback((id) => {
    setInlineLoaders(prev => ({ ...prev, [id]: true }));
  }, []);

  const hideInlineLoader = useCallback((id) => {
    setInlineLoaders(prev => ({ ...prev, [id]: false }));
  }, []);

  const isInlineLoading = useCallback((id) => !!inlineLoaders[id], [inlineLoaders]);

  // ── Convenience wrapper: run async fn with full-page loader ───────────────
  const withPageLoader = useCallback(async (fn, variant = 'default') => {
    showPageLoader(variant);
    try {
      return await fn();
    } finally {
      hidePageLoader();
    }
  }, [showPageLoader, hidePageLoader]);

  // ── Convenience wrapper: run async fn with inline loader ──────────────────
  const withInlineLoader = useCallback(async (id, fn) => {
    showInlineLoader(id);
    try {
      return await fn();
    } finally {
      hideInlineLoader(id);
    }
  }, [showInlineLoader, hideInlineLoader]);

  return (
    <LoadingContext.Provider value={{
      // Page loading
      isPageLoading,
      pageMessage,
      loadingVariant,
      showPageLoader,
      hidePageLoader,
      withPageLoader,

      // Inline loading
      showInlineLoader,
      hideInlineLoader,
      isInlineLoading,
      withInlineLoader,
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used inside <LoadingProvider>');
  return ctx;
};

export default LoadingContext;